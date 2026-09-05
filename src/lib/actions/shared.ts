export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const idleState: ActionState = { ok: false };

export function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function optionalStr(fd: FormData, key: string) {
  const v = str(fd, key);
  return v.length ? v : null;
}

export function num(fd: FormData, key: string, fallback = 0) {
  const v = Number(str(fd, key));
  return Number.isFinite(v) ? v : fallback;
}

export function optionalNum(fd: FormData, key: string) {
  const raw = str(fd, key);
  if (!raw) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

export function bool(fd: FormData, key: string) {
  const v = str(fd, key);
  return v === "true" || v === "on" || v === "1";
}

/** Newline- or comma-separated textarea into a clean array. */
export function list(fd: FormData, key: string) {
  return str(fd, key)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Repeated inputs named `feature_title` / `feature_detail`. */
export function features(fd: FormData) {
  const titles = fd.getAll("feature_title").map(String);
  const details = fd.getAll("feature_detail").map(String);
  return titles
    .map((title, i) => ({ title: title.trim(), detail: (details[i] ?? "").trim() }))
    .filter((f) => f.title.length > 0);
}
