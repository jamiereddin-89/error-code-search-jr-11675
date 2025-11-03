import { useEffect } from "react";
import { trackEvent, log } from "@/lib/tracking";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    const trackPV = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await trackEvent("page_view", undefined, location.pathname + location.hash, session?.user?.id || null);
    };
    trackPV();
  }, [location]);

  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".nav-button, button, a") as HTMLElement | null;
      if (btn) {
        const label = (btn.getAttribute("aria-label") || btn.textContent || "").trim().slice(0, 100);
        await trackEvent("element_click", { label });
      }
    };
    document.addEventListener("click", onClick);

    const onError = (event: ErrorEvent) => {
      log("Error", event.message, { filename: event.filename, lineno: event.lineno, colno: event.colno });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      log("Error", String(event.reason));
    };

    // Capture console.error/warn/info to app logs as well
    const origConsoleError = console.error;
    const origConsoleWarn = console.warn;
    const origConsoleInfo = console.info;

    console.error = (...args: any[]) => {
      try {
        const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
        log('Error', msg);
      } catch (e) {
        // ignore
      }
      origConsoleError.apply(console, args as any);
    };
    console.warn = (...args: any[]) => {
      try {
        const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
        log('Urgent', msg);
      } catch (e) {}
      origConsoleWarn.apply(console, args as any);
    };
    console.info = (...args: any[]) => {
      try {
        const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
        log('Info', msg);
      } catch (e) {}
      origConsoleInfo.apply(console, args as any);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      // restore console
      console.error = origConsoleError;
      console.warn = origConsoleWarn;
      console.info = origConsoleInfo;
    };
  }, []);

  return null;
}
