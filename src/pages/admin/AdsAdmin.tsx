import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Ad { id: string; image_url: string | null; vendor_id: string | null; start_date: string; end_date: string; paid: boolean; }

const AdsAdmin = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => { document.title = "Admin Ads | my-babydays"; }, []);
  const load = async () => {
    const { data, error } = await supabase.from("ads").select("id,image_url,vendor_id,start_date,end_date,paid").order("created_at", { ascending: false });
    if (error) return toast({ title: "Failed to load ads", description: error.message, variant: "destructive" });
    setAds(data || []);
  };
  useEffect(() => { load(); }, []);

  const setPaid = async (id: string, paid: boolean) => {
    const { error } = await supabase.from("ads").update({ paid }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: paid ? "Ad approved" : "Ad rejected/deactivated" });
    load();
  };

  return (
    <section>
      <h1 className="sr-only">Manage Ads</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map(ad => (
          <Card key={ad.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Vendor: {ad.vendor_id || "—"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ad.image_url ? (
                <img src={ad.image_url} alt={`Ad ${ad.id}`} className="w-full h-40 object-cover rounded-md" loading="lazy" />
              ) : (
                <div className="w-full h-40 rounded-md bg-muted" />
              )}
              <div className="text-sm text-muted-foreground">
                {new Date(ad.start_date).toLocaleDateString()} — {new Date(ad.end_date).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPaid(ad.id, true)}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setPaid(ad.id, false)}>Reject</Button>
                {ad.paid && (
                  <Button size="sm" variant="outline" onClick={() => setPaid(ad.id, false)}>Deactivate</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {ads.length === 0 && (
          <div className="text-muted-foreground">No ads submitted.</div>
        )}
      </div>
    </section>
  );
};

export default AdsAdmin;
