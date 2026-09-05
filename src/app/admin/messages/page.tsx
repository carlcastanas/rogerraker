import { AdminShell } from "@/components/admin/shell";
import { MessageReader } from "@/components/admin/message-reader";
import { getMessages } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getMessages(200);
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <AdminShell
      title="Messages"
      description={
        unread
          ? `${unread} enquir${unread === 1 ? "y" : "ies"} still waiting on a reply.`
          : "Every enquiry from the contact page. Nothing is waiting."
      }
    >
      <MessageReader messages={messages} />
    </AdminShell>
  );
}
