/**
 * storage.js — Supabase-backed shared storage for the deployed web app
 *
 * Uses your Supabase project directly (no Cloudflare proxy needed — CORS
 * works fine from a deployed web app, only Claude artifact iframes are blocked).
 *
 * Set these in your .env file:
 *   VITE_SUPABASE_URL=https://vhqlobpzrlfaecyvykwv.supabase.co
 *   VITE_SUPABASE_KEY=eyJhbGci...
 *
 * Table setup (run once in Supabase SQL Editor):
 *   create table acrf_cases (
 *     id text primary key,
 *     data jsonb not null,
 *     created_at timestamptz default now()
 *   );
 *   alter table acrf_cases enable row level security;
 *   create policy "Allow all" on acrf_cases
 *     for all to anon, authenticated
 *     using (true) with check (true);
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const TABLE = "acrf_cases";

const headers = () => ({
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
});

export async function dbReadAll() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Supabase credentials not set — using localStorage fallback");
    return localFallbackRead();
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*&order=created_at.desc`, {
      headers: headers()
    });
    if (!res.ok) { console.warn("Supabase read failed:", res.status); return localFallbackRead(); }
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map(r => r.data) : [];
  } catch(e) {
    console.warn("Supabase read error, using localStorage:", e);
    return localFallbackRead();
  }
}

export async function dbWriteEntry(entry) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return localFallbackWrite(entry);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: entry.id, data: entry, created_at: entry.savedAt })
    });
    if (!res.ok) { console.warn("Supabase write failed:", res.status, await res.text()); return false; }
    return true;
  } catch(e) { console.warn("Supabase write error:", e); return false; }
}

export async function dbDeleteEntry(id) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const all = localFallbackRead();
    localStorage.setItem("acrf_cases_local", JSON.stringify(all.filter(e => e.id !== id)));
    return true;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}`, {
      method: "DELETE",
      headers: headers()
    });
    return res.ok;
  } catch(e) { return false; }
}

export async function dbUpdateEntry(entry) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return localFallbackWrite(entry);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${entry.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ data: entry })
    });
    return res.ok;
  } catch(e) { return false; }
}

// localStorage fallback (single-device only) when Supabase creds not configured
function localFallbackRead() {
  try {
    const raw = localStorage.getItem("acrf_cases_local");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function localFallbackWrite(entry) {
  try {
    const all = localFallbackRead();
    const updated = [entry, ...all.filter(e => e.id !== entry.id)];
    localStorage.setItem("acrf_cases_local", JSON.stringify(updated));
    return true;
  } catch { return false; }
}
