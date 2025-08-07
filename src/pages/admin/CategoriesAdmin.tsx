import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Category { id: string; name: string; }

const CategoriesAdmin = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");

  useEffect(() => { document.title = "Admin Categories | my-babydays"; }, []);

  const load = async () => {
    const { data, error } = await supabase.from("categories").select("id,name").order("name");
    if (error) return toast({ title: "Failed to load categories", description: error.message, variant: "destructive" });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({ name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    if (error) return toast({ title: "Add failed", description: error.message, variant: "destructive" });
    setName("");
    load();
  };

  const rename = async (id: string, current: string) => {
    const next = prompt("Rename category", current);
    if (!next || next === current) return;
    const { error } = await supabase.from("categories").update({ name: next, slug: next.toLowerCase().replace(/\s+/g, "-") }).eq("id", id);
    if (error) return toast({ title: "Rename failed", description: error.message, variant: "destructive" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <section>
      <h1 className="sr-only">Manage Categories</h1>
      <div className="flex gap-2 mb-4 max-w-md">
        <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="secondary" onClick={add}>Add</Button>
      </div>
      <div className="overflow-x-auto max-w-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => rename(i.id, i.name)}>Rename</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(i.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">No categories</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default CategoriesAdmin;
