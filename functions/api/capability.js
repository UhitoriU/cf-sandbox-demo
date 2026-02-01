export async function onRequest(context) {
  const result = {
    runtime: "cloudflare-pages-functions",
    now: new Date().toISOString(),
    webApis: {
      hasFetch: typeof fetch === "function",
      hasCrypto: typeof crypto !== "undefined",
      hasSubtle: typeof crypto?.subtle !== "undefined",
    },
    nodeApis: {
      // 在 Workers/Pages 通常是 undefined
      hasProcess: typeof process !== "undefined",
      hasRequire: typeof require !== "undefined",
      hasFsGlobal: typeof globalThis?.fs !== "undefined",
    },
    cf: {
      colo: context.request.cf?.colo ?? null,
      country: context.request.cf?.country ?? null,
      tlsVersion: context.request.cf?.tlsVersion ?? null,
    },
  };

  // 尝试访问 process.env（不 import node 模块）
  try {
    result.nodeApis.processEnvKeys =
      typeof process !== "undefined" && process?.env
        ? Object.keys(process.env).slice(0, 20)
        : null;
  } catch (e) {
    result.nodeApis.processEnvKeys = { error: String(e) };
  }

  return Response.json(result);
}
