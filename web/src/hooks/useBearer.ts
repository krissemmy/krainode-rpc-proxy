import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useBearer() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setToken(session?.access_token || null);
      } catch (error) {
        console.error("Error getting session:", error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    getToken();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setToken(session?.access_token || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { token, loading };
}
