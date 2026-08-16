import { AuthShell } from "@/components/auth/auth-shell";
import { AuthScreen } from "@/components/auth/auth-screen";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthScreen initialMode="login" />
    </AuthShell>
  );
}
