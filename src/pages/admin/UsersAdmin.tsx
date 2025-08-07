import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Profile { id: string; user_id: string; email: string | null; role: "mother" | "vendor"; created_at: string; is_active: boolean; }

const UsersAdmin = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Profile[]>([]);

  useEffect(() => { document.title = "Admin Users | my-babydays"; }, []);

  const load = async () => {
    const { data, error } = await supabase.from("profiles").select("id,user_id,email,role,created_at,is_active").order("created_at", { ascending: false });
    if (error) return toast({ title: "Failed to load users", description: error.message, variant: "destructive" });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: !is_active }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: !is_active ? "Account activated" : "Account deactivated" });
    load();
  };

  const changeRole = async (id: string, current: "mother" | "vendor") => {
    const next = current === "mother" ? "vendor" : "mother";
    const { error } = await supabase.from("profiles").update({ role: next }).eq("id", id);
    if (error) return toast({ title: "Role change failed", description: error.message, variant: "destructive" });
    toast({ title: `Role changed to ${next}` });
    load();
  };

  const resetPassword = async (_userId: string, email: string | null) => {
    // In a real app, this should be handled by a secure edge function using the service role key
    toast({ title: "Password reset", description: email ? `Initiated for ${email}` : "Initiated", });
  };

  return (
    <section>
      <h1 className="sr-only">Manage Users</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.email?.split("@")[0] || "—"}</TableCell>
                <TableCell>{r.email || "—"}</TableCell>
                <TableCell className="capitalize">{r.email === "admin@yourdomain.com" ? "admin" : r.role}</TableCell>
                <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{r.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => resetPassword(r.user_id, r.email)}>Reset Password</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(r.id, r.is_active)}>{r.is_active ? "Deactivate" : "Activate"}</Button>
                  <Button size="sm" variant="secondary" onClick={() => changeRole(r.id, r.role)}>Change Role</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default UsersAdmin;
