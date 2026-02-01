export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.searchParams.get("error") === "1") {
    return new Response("boom", { status: 500 });
  }
  return Response.json({
    ok: true,
    route: "/api/hello",
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    country: context.request.cf?.country ?? null,
    asn: context.request.cf?.asn ?? null,
  });
}
