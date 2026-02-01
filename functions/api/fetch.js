function isAllowedUrl(u) {
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  return host === "example.com" || host === "httpbin.org";
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = url.searchParams.get("url") ?? "https://example.com";

  let u;
  try {
    u = new URL(target);
  } catch {
    return Response.json({ ok: false, error: "invalid url" }, { status: 400 });
  }

  if (!isAllowedUrl(u)) {
    return Response.json(
      {
        ok: false,
        error: "url not allowed",
        allowed: ["https://example.com", "https://httpbin.org"],
      },
      { status: 400 }
    );
  }

  const t0 = Date.now();
  const res = await fetch(u.toString(), {
    method: "GET",
    headers: { "user-agent": "cf-sandbox-demo" },
  });
  const t1 = Date.now();

  // 只取少量内容，避免拉大包
  const text = await res.text();
  const snippet = text.slice(0, 400);

  return Response.json({
    ok: true,
    route: "/api/fetch",
    target: u.toString(),
    status: res.status,
    elapsedMs: t1 - t0,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    snippet,
  });
}
