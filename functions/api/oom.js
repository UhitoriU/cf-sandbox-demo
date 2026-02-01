function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const mb = clampInt(url.searchParams.get("mb"), 1, 512, 64); // 最多尝试 512MB
  const chunkMb = 8; // 每块 8MB，逐步分配
  const chunks = [];
  let allocatedMb = 0;

  const start = Date.now();
  try {
    const target = mb;
    while (allocatedMb < target) {
      // Uint8Array 占用接近真实内存
      chunks.push(new Uint8Array(chunkMb * 1024 * 1024));
      allocatedMb += chunkMb;
    }
    const elapsed = Date.now() - start;

    // 防止 V8 把数组优化掉，简单读一下
    const checksum = chunks[0][0] + chunks[chunks.length - 1][0];

    return Response.json({
      ok: true,
      route: "/api/oom",
      requestedMb: mb,
      allocatedMb,
      checksum,
      elapsedMs: elapsed,
      note: "If this succeeds, it doesn't mean unlimited memory—try larger values to find the boundary.",
    });
  } catch (e) {
    const elapsed = Date.now() - start;
    return Response.json(
      {
        ok: false,
        route: "/api/oom",
        requestedMb: mb,
        allocatedMb,
        elapsedMs: elapsed,
        error: { name: e?.name, message: e?.message, stack: e?.stack },
      },
      { status: 500 }
    );
  } finally {
    // 尽量释放引用
    chunks.length = 0;
  }
}
