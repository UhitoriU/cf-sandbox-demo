globalThis.__counter ??= 0;

export async function onRequest(context) {
  globalThis.__counter += 1;

  return Response.json({
    ok: true,
    route: "/api/counter",
    counter: globalThis.__counter,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    tip: "If counter sometimes resets or jumps, that's normal in multi-isolate serverless runtimes. Use KV/DO/DB for durable state.",
  });
}
