export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => null);
  return Response.json({
    ok: true,
    route: "/api/echo",
    got: body,
    now: new Date().toISOString(),
  });
}
