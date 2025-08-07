import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSearchParams } from "react-router-dom";

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  vendor_id: string | null;
  category: string;
}

interface Vendor { id: string; name: string | null; }
interface Category { id: string; name: string; }

const OffersAdmin = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({ status: "", vendor: "", category: "", q: "" });
  const [selected, setSelected] = useState<Offer | null>(null);

  useEffect(() => { document.title = "Admin Offers | my-babydays"; }, []);

  useEffect(() => {
    const preselect = searchParams.get("review");
    if (preselect && offers.length) {
      const found = offers.find(o => o.id === preselect);
      if (found) setSelected(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, offers.length]);

  const load = async () => {
    try {
      const [{ data: offersData, error }, { data: vendorsData }, { data: catsData }] = await Promise.all([
        supabase.from("offers").select("id,title,description,image_url,status,created_at,vendor_id,category").order("created_at", { ascending: false }),
        supabase.from("vendors").select("id,name"),
        supabase.from("categories").select("id,name").order("name"),
      ]);
      if (error) throw error;
      setOffers(offersData || []);
      setVendors(vendorsData || []);
      setCategories(catsData || []);
    } catch (e: any) {
      toast({ title: "Failed to load offers", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return offers.filter(o =>
      (!filters.status || o.status === filters.status) &&
      (!filters.vendor || o.vendor_id === filters.vendor) &&
      (!filters.category || o.category === filters.category) &&
      (!filters.q || o.title.toLowerCase().includes(filters.q.toLowerCase()))
    );
  }, [offers, filters]);

  const vendorName = (id: string | null) => vendors.find(v => v.id === id)?.name || "—";

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("offers").update({ status }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: `Offer ${status}` });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Offer deleted" });
    load();
  };

  return (
    <section>
      <h1 className="sr-only">Manage Offers</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Search title…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["pending", "approved", "rejected"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.vendor} onValueChange={(v) => setFilters({ ...filters, vendor: v })}>
            <SelectTrigger><SelectValue placeholder="Vendor" /></SelectTrigger>
            <SelectContent>
              {vendors.map(v => (<SelectItem key={v.id} value={v.id}>{v.name || v.id}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelected(o)}>
                <TableCell className="font-medium">{o.title}</TableCell>
                <TableCell>{vendorName(o.vendor_id)}</TableCell>
                <TableCell className="capitalize">{o.status}</TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(o.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(o.id, "rejected")}>Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelected(o)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => remove(o.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No offers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selected?.title}</SheetTitle>
            <SheetDescription>Offer preview</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {selected?.image_url && (
              <img src={selected.image_url} alt={selected.title} className="w-full rounded-md shadow" loading="lazy" />
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-line">{selected?.description}</p>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={() => selected && updateStatus(selected.id, "approved")}>Approve</Button>
              <Button variant="destructive" onClick={() => selected && updateStatus(selected.id, "rejected")}>Reject</Button>
            </div>
          </div>
        </SheetContent>
        <SheetTrigger asChild></SheetTrigger>
      </Sheet>
    </section>
  );
};

export default OffersAdmin;
