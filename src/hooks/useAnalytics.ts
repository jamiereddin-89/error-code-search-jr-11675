import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  const trackSearch = async (systemName: string, errorCode: string, userId?: string) => {
    try {
      await (supabase as any).from("search_analytics" as any).insert({
        system_name: systemName,
        error_code: errorCode,
        user_id: userId || null,
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };

  return { trackSearch };
};
