export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminMessagesTable from "@/components/AdminMessagesTable";

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}`);
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <AdminMessagesTable />
    </div>
  );
}
