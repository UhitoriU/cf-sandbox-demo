export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.searchParams.get("error") === "1") {
    return new Response("boom", { status: 500 });
  }
  return Response.json({
    ok: true,
    route: "/api/hello",
    colo: context.request.cf?.colo,     // 观察边缘节点信息（可能为空，取决于请求与环境）
    now: new Date().toISOString(),
  });
}
