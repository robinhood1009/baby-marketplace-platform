import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Vendor { id: string; name: string | null; suspended: boolean; }

const VendorsAdmin = () => {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [offerCounts, setOfferCounts] = useState<Record<string, number>>({});
  const [adCounts, setAdCounts] = useState<Record<string, number>>({});

  useEffect(() => { document.title = "Admin Vendors | my-babydays"; }, []);

  const load = async () => {
    const { data, error } = await supabase.from("vendors").select("id,name,suspended").order("name");
    if (error) return toast({ title: "Failed to load vendors", description: error.message, variant: "destructive" });
    setVendors(data || []);

    // naive counts (ok for small datasets)
    const offerCountsRes: Record<string, number> = {};
    const adCountsRes: Record<string, number> = {};
    await Promise.all((data || []).map(async (v) => {
      const [{ count: oc }, { count: ac }] = await Promise.all([
        supabase.from("offers").select("id", { count: "exact", head: true }).eq("vendor_id", v.id).eq("status", "approved"),
        supabase.from("ads").select("id", { count: "exact", head: true }).eq("vendor_id", v.id).eq("paid", true),
      ]);
      offerCountsRes[v.id] = oc || 0;
      adCountsRes[v.id] = ac || 0;
    }));
    setOfferCounts(offerCountsRes);
    setAdCounts(adCountsRes);
  };

  useEffect(() => { load(); }, []);

  const toggleSuspend = async (id: string, suspended: boolean) => {
    const { error } = await supabase.from("vendors").update({ suspended: !suspended }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: !suspended ? "Vendor suspended" : "Vendor reinstated" });
    load();
  };

  return (
    <section>
      <h1 className="sr-only">Manage Vendors</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Active Offers</TableHead>
              <TableHead>Active Ads</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map(v => (
              <TableRow key={v.id}>
                <TableCell>{v.name || v.id}</TableCell>
                <TableCell>{offerCounts[v.id] ?? 0}</TableCell>
                <TableCell>{adCounts[v.id] ?? 0}</TableCell>
                <TableCell>{v.suspended ? "Suspended" : "Active"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => toggleSuspend(v.id, v.suspended)}>
                    {v.suspended ? "Reinstate" : "Suspend"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No vendors found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default VendorsAdmin;
