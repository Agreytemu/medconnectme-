import {
  buildMockDb,
  type Db,
  type Row,
} from "@/lib/demo/mock-data";
import {
  DEMO_SESSION_STORAGE,
  demoCredentials,
} from "@/lib/demo/config";

export interface MockResult {
  data: unknown;
  error: { message: string } | null;
  count: number | null;
}

type Filter = {
  op: "eq" | "neq" | "in" | "like" | "gte" | "lte";
  col: string;
  val: unknown;
};

interface MockSession {
  access_token: string;
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
}

export interface MockClientOptions {
  readSession?: () => MockSession | null;
  writeSession?: (session: MockSession | null) => void;
}

function genId(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

function applyFilters(rows: Row[], filters: Filter[]): Row[] {
  return rows.filter((row) =>
    filters.every((f) => {
      const actual = row[f.col];
      switch (f.op) {
        case "eq":
          return actual === f.val;
        case "neq":
          return actual !== f.val;
        case "in":
          return Array.isArray(f.val) && f.val.includes(actual);
        case "like":
          return (
            typeof actual === "string" &&
            typeof f.val === "string" &&
            actual.startsWith(f.val.replace(/%$/, ""))
          );
        case "gte":
          return String(actual ?? "") >= String(f.val);
        case "lte":
          return String(actual ?? "") <= String(f.val);
        default:
          return true;
      }
    })
  );
}

function sortValue(row: Row, col: string): unknown {
  const nested = /^([a-zA-Z_]+)\(([a-zA-Z_]+)\)$/.exec(col);
  if (nested) {
    const obj = row[nested[1]];
    if (obj && typeof obj === "object") {
      return (obj as Row)[nested[2]];
    }
    return undefined;
  }
  return row[col];
}

interface RelationSpec {
  alias: string;
  relTable: string;
  inner: string;
}

function parseRelations(select: string): { rels: RelationSpec[]; plain: string } {
  const rels: RelationSpec[] = [];
  const regex = /([a-zA-Z_]+):([a-zA-Z_]+)\(((?:[^()]|\([^()]*\))*)\)/g;
  const plain = select.replace(regex, (_m, alias, relTable, inner) => {
    rels.push({ alias, relTable, inner });
    return "";
  });
  return { rels, plain };
}

function resolveRelation(row: Row, rel: RelationSpec, db: Db): Row | Row[] | null {
  const fk = `${rel.alias}_id`;
  if (row[fk]) {
    const parent = (db[rel.relTable] ?? []).find((r) => r.id === row[fk]);
    return parent ?? null;
  }
  return null;
}

function projectRow(row: Row, select: string, table: string, db: Db): Row {
  const { rels, plain } = parseRelations(select);
  const colList = plain
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const out: Row = {};
  if (colList.length === 0 || colList.includes("*")) {
    Object.assign(out, row);
  } else {
    for (const col of colList) {
      if (col in row) out[col] = row[col];
    }
  }

  for (const rel of rels) {
    const child = resolveRelation(row, rel, db);
    if (Array.isArray(child)) {
      out[rel.alias] = child.map((c) => projectRow(c, rel.inner, rel.relTable, db));
    } else if (child && typeof child === "object") {
      out[rel.alias] = projectRow(child, rel.inner, rel.relTable, db);
    } else {
      out[rel.alias] = child;
    }
  }
  return out;
}

class QueryBuilder {
  private table: string;
  private db: Db;
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private limitN: number | null = null;
  private singleMode = false;
  private selectCols = "*";
  private countMode = false;
  private writeOp: "insert" | "update" | "upsert" | "delete" | null = null;
  private writeData: unknown = null;
  private writeConflict = "";

  constructor(table: string, db: Db) {
    this.table = table;
    this.db = db;
  }

  select(cols?: string, opts?: { count?: "exact" }): QueryBuilder {
    if (cols !== undefined) this.selectCols = cols;
    if (opts?.count === "exact") this.countMode = true;
    return this;
  }

  eq(col: string, val: unknown): QueryBuilder {
    this.filters.push({ op: "eq", col, val });
    return this;
  }

  neq(col: string, val: unknown): QueryBuilder {
    this.filters.push({ op: "neq", col, val });
    return this;
  }

  in(col: string, vals: unknown[]): QueryBuilder {
    this.filters.push({ op: "in", col, val: vals });
    return this;
  }

  like(col: string, pattern: string): QueryBuilder {
    this.filters.push({ op: "like", col, val: pattern });
    return this;
  }

  gte(col: string, val: unknown): QueryBuilder {
    this.filters.push({ op: "gte", col, val });
    return this;
  }

  lte(col: string, val: unknown): QueryBuilder {
    this.filters.push({ op: "lte", col, val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): QueryBuilder {
    this.orders.push({ col, asc: opts?.ascending ?? true });
    return this;
  }

  limit(n: number): QueryBuilder {
    this.limitN = n;
    return this;
  }

  single(): QueryBuilder {
    this.singleMode = true;
    return this;
  }

  insert(rows: Row | Row[]): QueryBuilder {
    this.writeOp = "insert";
    this.writeData = rows;
    return this;
  }

  update(payload: Row): QueryBuilder {
    this.writeOp = "update";
    this.writeData = payload;
    return this;
  }

  upsert(rows: Row | Row[], opts?: { onConflict?: string }): QueryBuilder {
    this.writeOp = "upsert";
    this.writeData = rows;
    this.writeConflict = opts?.onConflict ?? "";
    return this;
  }

  delete(): QueryBuilder {
    this.writeOp = "delete";
    return this;
  }

  private execute(): MockResult {
    if (this.writeOp) return this.executeWrite();
    return this.executeRead();
  }

  private executeRead(): MockResult {
    let rows = (this.db[this.table] ?? []).slice();
    rows = applyFilters(rows, this.filters);

    for (const order of this.orders) {
      rows.sort((a, b) => {
        const va = sortValue(a, order.col);
        const vb = sortValue(b, order.col);
        const cmp =
          va === vb
            ? 0
            : va === undefined || va === null
              ? 1
              : vb === undefined || vb === null
                ? -1
                : va < vb
                  ? -1
                  : 1;
        return order.asc ? cmp : -cmp;
      });
    }

    const count = rows.length;

    if (this.limitN !== null) {
      rows = rows.slice(0, this.limitN);
    }

    const projected = rows.map((r) =>
      projectRow(r, this.selectCols, this.table, this.db)
    );

    if (this.singleMode) {
      return { data: projected[0] ?? null, error: null, count: this.countMode ? count : null };
    }

    return { data: projected, error: null, count: this.countMode ? count : null };
  }

  private executeWrite(): MockResult {
    const table = this.db[this.table];
    if (!table) return { data: null, error: { message: `Table ${this.table} not found` }, count: null };

    if (this.writeOp === "insert" || this.writeOp === "upsert") {
      const incoming = Array.isArray(this.writeData)
        ? (this.writeData as Row[])
        : [this.writeData as Row];
      const created: Row[] = [];
      for (const row of incoming) {
        const target = { ...row };
        if (this.writeOp === "upsert" && this.writeConflict) {
          const keys = this.writeConflict.split(",").map((k) => k.trim());
          const idx = table.findIndex((r) =>
            keys.every((k) => r[k] === target[k])
          );
          if (idx !== -1) {
            table[idx] = { ...table[idx], ...target };
            created.push(table[idx]);
            continue;
          }
        }
        if (!target.id) target.id = genId();
        if (!target.created_at) target.created_at = new Date().toISOString();
        table.push(target);
        created.push(target);
      }
      return { data: created, error: null, count: null };
    }

    if (this.writeOp === "update") {
      const matches = applyFilters(table, this.filters);
      const payload = this.writeData as Row;
      for (const match of matches) {
        const idx = table.indexOf(match);
        if (idx !== -1) table[idx] = { ...match, ...payload };
      }
      return { data: matches, error: null, count: null };
    }

    if (this.writeOp === "delete") {
      const matches = applyFilters(table, this.filters);
      const ids = new Set(matches.map((m) => m.id));
      this.db[this.table] = table.filter((r) => !ids.has(r.id));
      return { data: matches, error: null, count: null };
    }

    return { data: null, error: null, count: null };
  }

  then<TResult1 = MockResult, TResult2 = never>(
    onfulfilled?: ((value: MockResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ): Promise<MockResult | TResult> {
    return Promise.resolve(this.execute()).catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<MockResult> {
    return Promise.resolve(this.execute()).finally(onfinally);
  }
}

export function createMockClient(options?: MockClientOptions) {
  const db = buildMockDb();
  const readSession = options?.readSession ?? (() => {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(DEMO_SESSION_STORAGE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MockSession;
    } catch {
      return null;
    }
  });
  const writeSession = options?.writeSession ?? ((session: MockSession | null) => {
    if (typeof localStorage === "undefined") return;
    if (session) {
      localStorage.setItem(DEMO_SESSION_STORAGE, JSON.stringify(session));
    } else {
      localStorage.removeItem(DEMO_SESSION_STORAGE);
    }
  });

  const auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const creds = demoCredentials();
      let profile: Row | null = null;
      if (email.toLowerCase() === creds.student.email.toLowerCase() && password === creds.student.password) {
        profile = db.profiles.find((p) => p.id === "stu-demo") ?? null;
      } else if (email.toLowerCase() === creds.admin.email.toLowerCase() && password === creds.admin.password) {
        profile = db.profiles.find((p) => p.id === "adm-demo") ?? null;
      }

      if (!profile) {
        return {
          data: { user: null, session: null },
          error: { message: "Invalid login credentials" },
        };
      }

      const session: MockSession = {
        access_token: "demo-access-token",
        user: {
          id: String(profile.id),
          email: String(profile.email),
          user_metadata: {
            full_name: profile.full_name,
            role: profile.role,
          },
        },
      };
      writeSession(session);
      return { data: { user: session.user, session }, error: null };
    },

    getUser: async () => {
      const session = readSession();
      return { data: { user: session?.user ?? null }, error: null };
    },

    signOut: async () => {
      writeSession(null);
      return { error: null };
    },

    signUp: async ({
      email,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) => {
      const id = genId();
      const meta = options?.data ?? {};
      db.profiles.push({
        id,
        role: meta.role ?? "student",
        full_name: meta.full_name ?? email,
        email,
        phone: meta.phone ?? null,
        reg_no: meta.reg_no ?? null,
        college: meta.college ?? null,
        program_id: meta.program_id ?? null,
        year_of_study: meta.year_of_study ?? 1,
        gender: null,
        dob: null,
        address: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      });
      const session: MockSession = {
        access_token: "demo-access-token",
        user: { id, email, user_metadata: meta },
      };
      writeSession(session);
      return { data: { user: session.user, session }, error: null };
    },

    admin: {
      createUser: async ({
        email,
        user_metadata,
      }: {
        email: string;
        password: string;
        email_confirm?: boolean;
        user_metadata?: Record<string, unknown>;
      }) => {
        const meta = user_metadata ?? {};
        const id = genId();
        db.profiles.push({
          id,
          role: meta.role ?? "student",
          full_name: meta.full_name ?? email,
          email,
          phone: null,
          reg_no: meta.reg_no ?? null,
          college: meta.college ?? null,
          program_id: meta.program_id ?? null,
          year_of_study: meta.year_of_study ?? 1,
          gender: null,
          dob: null,
          address: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
        return {
          data: { user: { id, email, user_metadata: meta } },
          error: null,
        };
      },

      deleteUser: async (id: string) => {
        db.profiles = db.profiles.filter((p) => p.id !== id);
        return { data: { user: {} }, error: null };
      },
    },
  };

  return {
    auth,
    from: (table: string) => new QueryBuilder(table, db),
  };
}
