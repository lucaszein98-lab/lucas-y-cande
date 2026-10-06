import { supabase } from "@/lib/supabase";

const BUCKET = "archivos";
const cache = new Map<string, { url: string; exp: number }>();

/** Sube un archivo y devuelve su ruta interna "storage:<path>". */
export async function uploadFile(coupleId: string, folder: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 40);
  const path = `${coupleId}/${folder}/${Date.now()}-${safe}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return `storage:${path}`;
}

export function isStored(v?: string | null) {
  return !!v && v.startsWith("storage:");
}

/** Devuelve una URL usable para mostrar/abrir: externa tal cual, o firmada si está en Storage. */
export async function resolveUrl(v?: string | null): Promise<string> {
  if (!v) return "";
  if (!isStored(v)) return v;
  const path = v.slice("storage:".length);
  const hit = cache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6);
  if (error || !data) return "";
  cache.set(path, { url: data.signedUrl, exp: Date.now() + 1000 * 60 * 60 * 5 });
  return data.signedUrl;
}

export async function removeStored(v?: string | null) {
  if (!isStored(v)) return;
  await supabase.storage.from(BUCKET).remove([v!.slice("storage:".length)]);
}
