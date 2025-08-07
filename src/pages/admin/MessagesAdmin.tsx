import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface Message { id: string; name: string; email: string; subject: string | null; message: string; created_at: string; is_read: boolean; }

const MessagesAdmin = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Message[]>([]);

  useEffect(() => { document.title = "Admin Messages | my-babydays"; }, []);

  const load = async () => {
    const { data, error } = await supabase.from("contact_messages").select("id,name,email,subject,message,created_at,is_read").order("created_at", { ascending: false });
    if (error) return toast({ title: "Failed to load messages", description: error.message, variant: "destructive" });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: !is_read }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <section>
      <h1 className="sr-only">Messages Inbox</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Read</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(m => (
              <TableRow key={m.id} className={m.is_read ? "opacity-70" : ""}>
                <TableCell>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </TableCell>
                <TableCell>{m.subject || "—"}</TableCell>
                <TableCell className="max-w-md truncate" title={m.message}>{m.message}</TableCell>
                <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Switch checked={m.is_read} onCheckedChange={() => toggleRead(m.id, m.is_read)} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No messages</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default MessagesAdmin;
