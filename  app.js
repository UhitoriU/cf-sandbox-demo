const out = document.querySelector("#out");

function show(obj) {
  out.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

document.querySelector("#btnHello").onclick = async () => {
  const r = await fetch("/api/hello");
  show({ status: r.status, data: await r.json() });
};

document.querySelector("#btnEcho").onclick = async () => {
  const payload = { t: Date.now(), msg: "hello from browser" };
  const r = await fetch("/api/echo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  show({ status: r.status, data: await r.json() });
};

document.querySelector("#btnError").onclick = async () => {
  const r = await fetch("/api/hello?error=1");
  show({ status: r.status, text: await r.text() });
};
