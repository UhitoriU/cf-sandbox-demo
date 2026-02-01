function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const maxReadMb = clampInt(url.searchParams.get("maxReadMb"), 1, 50, 10); // 防止你误测太大
  const limitBytes = maxReadMb * 1024 * 1024;

  const t0 = Date.now();
  const buf = await context.request.arrayBuffer(); // 若超限，通常会在平台层直接报错/被拒
  const t1 = Date.now();

  const size = buf.byteLength;
  const ok = size <= limitBytes;

  return Response.json({
    ok,
    route: "/api/payload",
    receivedBytes: size,
    maxReadMb,
    elapsedMs: t1 - t0,
    note: "Use this to empirically find request body limits. Platform may reject before reaching handler.",
  }, { status: ok ? 200 : 413 });
}
