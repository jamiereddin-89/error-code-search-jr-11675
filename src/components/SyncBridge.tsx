import { useEffect } from "react";
import { syncAll } from "@/lib/supabaseSync";
import { supabase } from "@/integrations/supabase/client";

export default function SyncBridge() {
  useEffect(() => {
    let timer: number | undefined;
    const kick = async () => {
      try {
        await supabase.auth.getSession();
        await syncAll();
      } catch {}
    };
    kick();
    timer = window.setInterval(kick, 15000);
    const onVis = () => { if (document.visibilityState === "hidden") { kick(); } };
    const onOnline = () => kick();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, []);
  return null;
}
