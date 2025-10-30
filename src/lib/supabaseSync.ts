import { supabase } from "@/integrations/supabase/client";
import { getEvents, getLogs } from "@/lib/tracking";

const LS_EVENTS = "jr_user_events";
const LS_FIX_STEPS = "jr_fix_steps";
const LS_ERROR_META = "jr_error_metadata";

function readLS<T>(key: string): T[] { try { const raw = localStorage.getItem(key); return raw? JSON.parse(raw): []; } catch { return []; } }
function writeLS<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

export async function syncEvents() {
  const events = readLS<any>(LS_EVENTS);
  if (!events.length) return;
  try {
    const payload = events.map(e => ({
      id: e.id,
      user_id: e.userId || null,
      device_id: e.deviceId,
      type: e.type,
      path: e.path,
      ts: new Date(e.ts).toISOString(),
      geo_lat: e.geo?.lat ?? null,
      geo_lon: e.geo?.lon ?? null,
      meta: e.meta || null,
    }));
    await (supabase as any).from("user_events" as any).insert(payload);
    writeLS(LS_EVENTS, []);
  } catch (err) {
    // keep in queue on failure
  }
}

export async function syncLogs() {
  const logs = getLogs();
  if (!logs.length) return;
  try {
    const payload = logs.map(l => ({
      id: l.id,
      level: l.level,
      message: l.message,
      ts: new Date(l.ts).toISOString(),
      stack: l.stack || null,
      meta: l.meta || null,
    }));
    await (supabase as any).from("app_logs" as any).insert(payload);
    // clear after successful insert
    localStorage.setItem("jr_app_logs", JSON.stringify([]));
  } catch (err) {
    // keep local
  }
}

export async function syncFixSteps() {
  const steps = readLS<any>(LS_FIX_STEPS);
  if (!steps.length) return;
  try {
    await (supabase as any).from("fix_steps" as any).upsert(steps.map((s: any) => ({
      id: s.id,
      brand: s.brand || null,
      model: s.model || null,
      error_code: s.error_code || null,
      title: s.title || null,
      content: s.content || null,
      tags: s.tags || [],
      media_urls: s.mediaUrls || [],
    })));
  } catch (err) {
    // ignore
  }
}

export async function syncErrorInfo() {
  const infos = readLS<any>(LS_ERROR_META);
  if (!infos.length) return;
  try {
    await (supabase as any).from("error_metadata" as any).upsert(infos.map((i:any)=>({
      id: i.id,
      brand: i.brand||null,
      model: i.model||null,
      category: i.category||null,
      error_code: i.error_code||null,
      meaning: i.meaning||null,
      solution: i.solution||null,
    })));
  } catch (err) {
    // ignore
  }
}

export async function syncAll() {
  await syncEvents();
  await syncLogs();
  await syncFixSteps();
  await syncErrorInfo();
}
