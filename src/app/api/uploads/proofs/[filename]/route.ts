import { serveStorageImage } from "@/lib/uploads";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return serveStorageImage("proofs", filename);
}
