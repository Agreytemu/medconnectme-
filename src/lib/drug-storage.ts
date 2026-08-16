"use client";

export interface StoredDrug {
  id: string;
  brand: string;
  generic: string;
  route: string;
  manufacturer: string | null;
  productType: string | null;
}

const FAV_KEY = "med_formulary_favorites";
const RECENT_KEY = "med_formulary_recent";
const NOTE_PREFIX = "med_formulary_note_";

function readList(key: string): StoredDrug[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: StoredDrug[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list.slice(0, 60)));
  } catch {
    /* storage full or unavailable */
  }
}

export function getFavorites(): StoredDrug[] {
  return readList(FAV_KEY);
}

export function isFavorite(id: string): boolean {
  return readList(FAV_KEY).some((d) => d.id === id);
}

export function toggleFavorite(drug: StoredDrug): boolean {
  const list = readList(FAV_KEY);
  const exists = list.some((d) => d.id === drug.id);
  if (exists) {
    writeList(FAV_KEY, list.filter((d) => d.id !== drug.id));
    return false;
  }
  writeList(FAV_KEY, [drug, ...list]);
  return true;
}

export function getRecent(): StoredDrug[] {
  return readList(RECENT_KEY);
}

export function addRecent(drug: StoredDrug): StoredDrug[] {
  const list = readList(RECENT_KEY).filter((d) => d.id !== drug.id);
  const next = [drug, ...list].slice(0, 60);
  writeList(RECENT_KEY, next);
  return next;
}

export function getNote(id: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NOTE_PREFIX + id) ?? "";
  } catch {
    return "";
  }
}

export function saveNote(id: string, text: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTE_PREFIX + id, text);
  } catch {
    /* storage full or unavailable */
  }
}