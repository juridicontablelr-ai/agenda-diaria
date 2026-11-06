// Función de Vercel que guarda la Agenda Activa de Power Fit en Upstash Redis.
// Variables de entorno en Vercel:
//   KV_REST_API_URL y KV_REST_API_TOKEN  -> las crea la integración "Upstash for Redis" (Storage)
//   (también sirven UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN)
//   AGENDA_PIN                           -> tu clave de sincronización; nunca la escribas en el código
const crypto = require("crypto");

const REDIS_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const PIN = process.env.AGENDA_PIN || "";
const DOCS = "powerfit:agenda:docs"; // hash: actividades y dia-AAAA-MM-DD
const REV = "powerfit:agenda:rev";   // contador que sube con cada cambio
const KEY_RE = /^(actividades|dia-\d{4}-\d{2}-\d{2})$/;
const MAX_BYTES = 256 * 1024;

async function redis(commands) {
  const r = await fetch(REDIS_URL + "/multi-exec", {
    method: "POST",
    headers: { Authorization: "Bearer " + REDIS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error("redis_http_" + r.status);
  const out = await r.json();
  return out.map((x) => {
    if (x && x.error) throw new Error(x.error);
    return x ? x.result : null;
  });
}

function samePin(given) {
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(PIN).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const missing = [];
  if (!REDIS_URL || !REDIS_TOKEN) missing.push("storage");
  if (!PIN) missing.push("AGENDA_PIN");
  if (missing.length) return res.status(503).json({ error: "not_configured", missing });

  let given = "";
  try { given = decodeURIComponent(req.headers["x-agenda-pin"] || ""); } catch (e) {}
  if (!samePin(given)) {
    await new Promise((r) => setTimeout(r, 700));
    return res.status(401).json({ error: "bad_pin" });
  }

  try {
    if (req.method === "GET") {
      if (req.query && req.query.only === "rev") {
        const [rev] = await redis([["GET", REV]]);
        return res.status(200).json({ rev: Number(rev || 0) });
      }
      const [flat, rev] = await redis([["HGETALL", DOCS], ["GET", REV]]);
      const docs = {};
      const list = Array.isArray(flat) ? flat : [];
      for (let i = 0; i + 1 < list.length; i += 2) {
        try { docs[list[i]] = JSON.parse(list[i + 1]); } catch (e) {}
      }
      return res.status(200).json({ docs, rev: Number(rev || 0) });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
      if (!body || !KEY_RE.test(String(body.key || ""))) return res.status(400).json({ error: "bad_key" });
      if (body.value === null) {
        const [, rev] = await redis([["HDEL", DOCS, body.key], ["INCR", REV]]);
        return res.status(200).json({ rev: Number(rev) });
      }
      if (!body.value || typeof body.value !== "object") return res.status(400).json({ error: "bad_value" });
      const json = JSON.stringify(body.value);
      if (Buffer.byteLength(json) > MAX_BYTES) return res.status(413).json({ error: "too_big" });
      const [, rev] = await redis([["HSET", DOCS, body.key, json], ["INCR", REV]]);
      return res.status(200).json({ rev: Number(rev) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    return res.status(502).json({ error: "storage_error" });
  }
};
