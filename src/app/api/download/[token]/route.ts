import { queryOne } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DownloadRow {
  reference: string | null;
  customer_email: string;
  customer_name: string | null;
  amount: number;
  created_at: string;
  product_title: string | null;
  product_slug: string | null;
  product_format: string | null;
  product_software: string | null;
  product_file_url: string | null;
}

function safeFileName(slug: string) {
  const cleaned = slug.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned : "roger-raker-download";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // download_token is a UUID column — bail before Postgres tries to cast.
  if (!UUID.test(token)) {
    return new Response("Not found", { status: 404 });
  }

  const order = await queryOne<DownloadRow>(
    `SELECT o.reference, o.customer_email, o.customer_name, o.amount, o.created_at,
            p.title AS product_title, p.slug AS product_slug,
            p.format AS product_format, p.software AS product_software,
            p.file_url AS product_file_url
     FROM orders o LEFT JOIN products p ON p.id = o.product_id
     WHERE o.download_token = $1`,
    [token]
  );

  if (!order) {
    return new Response("Not found", { status: 404 });
  }

  // In production this handler would verify the token's age, then redirect to a
  // short-lived signed URL on object storage (order.product_file_url) instead of
  // generating a placeholder. The receipt below stands in for that asset.
  const title = order.product_title ?? "Roger Raker pack";
  const purchased = new Date(order.created_at).toISOString().slice(0, 10);
  const amount = Number(order.amount).toFixed(2);

  const body = [
    "ROGER RAKER TOOLKIT",
    "=================================================",
    "",
    `Pack:        ${title}`,
    `Reference:   ${order.reference ?? "none on file"}`,
    `Purchased:   ${purchased}`,
    `Licensed to: ${order.customer_name ?? order.customer_email}`,
    `Email:       ${order.customer_email}`,
    `Paid:        PHP ${amount}`,
    "",
    order.product_format ? `Formats:     ${order.product_format}` : null,
    order.product_software ? `Software:    ${order.product_software}` : null,
    "",
    "INSTALL NOTES",
    "-------------------------------------------------",
    "1. Unzip the pack somewhere you won't delete it later. Resolve reads the",
    "   LUTs off the disk every time you open a project, so don't leave it",
    "   sitting in your Downloads folder.",
    "2. Resolve: copy the .cube files into",
    "   macOS   ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT",
    "   Windows C:/ProgramData/Blackmagic Design/DaVinci Resolve/Support/LUT",
    "   then Project Settings > Color Management > Update Lists.",
    "3. For the .drx files: right-click inside the Resolve Gallery, choose",
    "   Import, and pick the folder.",
    "4. Balance your shot first, then drop the LUT on top of it and start at",
    "   full strength. Pull it back from there if it's too much.",
    "",
    "LICENCE",
    "-------------------------------------------------",
    "You can use these on your own uploads and on paid work. There's no fee",
    "per project and you don't have to credit me. Please don't resell or",
    "re-upload the files themselves.",
    "",
    "ABOUT THIS FILE",
    "-------------------------------------------------",
    "This is a demo build of the store. No payment was processed and the real",
    "files aren't attached. This receipt stands in for them so the download",
    "flow can be tested end to end.",
    "",
    "hello@rogerraker.com",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFileName(order.product_slug ?? "roger-raker")}-receipt.txt"`,
      "Content-Length": String(new TextEncoder().encode(body).length),
      "Cache-Control": "no-store",
    },
  });
}
