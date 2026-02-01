function tryRequire(moduleName) {
  try {
    if (typeof require === "undefined") {
      return { ok: false, reason: "require is undefined" };
    }
    require(moduleName);
    return { ok: true, note: "require succeeded (unexpected in most CF runtimes)" };
  } catch (e) {
    return { ok: false, error: { name: e?.name, message: e?.message } };
  }
}

export async function onRequest(context) {
  const hasProcess = typeof process !== "undefined";
  const hasRequire = typeof require !== "undefined";

  let processEnvKeys = null;
  try {
    processEnvKeys = hasProcess && process?.env
      ? Object.keys(process.env).slice(0, 20)
      : null;
  } catch (e) {
    processEnvKeys = { error: { name: e?.name, message: e?.message } };
  }

  const result = {
    runtime: "cloudflare-pages-functions",
    now: new Date().toISOString(),
    webApis: {
      hasFetch: typeof fetch === "function",
      hasCrypto: typeof crypto !== "undefined",
      hasSubtle: typeof crypto?.subtle !== "undefined",
    },
    nodeLike: {
      hasProcess,
      hasRequire,
      processEnvKeys,
      requireNodeFs: tryRequire("node:fs"),
      requireChildProcess: tryRequire("node:child_process"),
    },
    cf: {
      colo: context.request.cf?.colo ?? null,
      country: context.request.cf?.country ?? null,
      tlsVersion: context.request.cf?.tlsVersion ?? null,
    },
  };

  return Response.json(result);
}
