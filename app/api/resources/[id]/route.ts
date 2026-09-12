import { getCurrentUser } from "@/app/auth-session";
import { getResource } from "@/db/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in required", { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });
  const resource = await getResource(user.userId, id);
  if (!resource) return new Response("Not found", { status: 404 });
  const supabase = await createClient();
  const { data: object, error } = await supabase.storage.from("study-resources").download(resource.object_key);
  if (error || !object) return new Response("Not found", { status: 404 });
  const safeName = resource.file_name.replace(/["\\\r\n]/g, "_");
  return new Response(await object.arrayBuffer(), { headers: { "Content-Type": resource.mime_type, "Content-Disposition": `attachment; filename="${safeName}"`, "Cache-Control": "private, no-store" } });
}
