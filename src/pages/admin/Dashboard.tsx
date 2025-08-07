import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";

interface OfferLite { id: string; title: string; created_at: string; }

const Dashboard = () => {
  const { toast } = useToast();
  const [counts, setCounts] = useState({ offers: 0, pending: 0, activeAds: 0, vendors: 0 });
  const [recent, setRecent] = useState<OfferLite[]>([]);

  useEffect(() => { document.title = "Admin Dashboard | my-babydays"; }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [offersTotal, offersPending, vendorsCount, adsActive, recentPending] = await Promise.all([
          supabase.from("offers").select("id", { count: "exact", head: true }),
          supabase.from("offers").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("vendors").select("id", { count: "exact", head: true }),
          supabase
            .from("ads")
            .select("id", { count: "exact", head: true })
            .eq("paid", true),
          supabase
            .from("offers")
            .select("id,title,created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
        setCounts({
          offers: offersTotal.count || 0,
          pending: offersPending.count || 0,
          activeAds: adsActive.count || 0,
          vendors: vendorsCount.count || 0,
        });
        setRecent(recentPending.data || []);
      } catch (e: any) {
        toast({ title: "Failed to load stats", description: e.message, variant: "destructive" });
      }
    };
    load();
  }, [toast]);

  const cards = useMemo(() => [
    { label: "Total Offers", value: counts.offers },
    { label: "Pending Offers", value: counts.pending },
    { label: "Active Ads", value: counts.activeAds },
    { label: "Vendors", value: counts.vendors },
  ], [counts]);

  return (
    <section>
      <h1 className="sr-only">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Newest Pending Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="secondary">
                        <NavLink to={`/admin/offers?review=${r.id}`}>Review</NavLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No pending items</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Dashboard;
