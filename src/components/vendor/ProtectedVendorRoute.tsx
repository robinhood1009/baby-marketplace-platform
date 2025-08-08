import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Profile {
  role: string;
  vendor_id: string | null;
}

export function ProtectedVendorRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role, vendor_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
          setError("Failed to load profile");
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || profile.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Access denied. Vendor access required.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}