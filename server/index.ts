import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./auth";
import { initializeDatabase, inspectTables, getTableData, db } from "./db";

type Env = { Variables: { user?: { id?: string; email?: string; role?: string } } };

const index = new Hono<Env>();
initializeDatabase();

index.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

index.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

const json = (data: unknown, message?: string, error?: string, status = 200) =>
  Response.json({ data, message, error }, { status });

const toNum = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const isId = (v: unknown) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(v);
const isStatus = (v: unknown) => ["pending", "paid", "fulfilled", "cancelled"].includes(String(v ?? ""));
const safeText = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const now = () => new Date().toISOString();

index.get("/api/health", (c) => json({ ok: true, timestamp: now() }, "ok"));

index.get("/api/products", (c) => {
  const rows = db
    .query(
      "SELECT id, slug, name, description, category, collection, price, compareAtPrice, currency, images, variants, featured, inStock, tags, createdAt, updatedAt FROM products ORDER BY COALESCE(featured, 0) DESC, datetime(COALESCE(updatedAt, createdAt, CURRENT_TIMESTAMP)) DESC"
    )
    .all() as any[];
  const data = rows.map((r) => ({
    ...r,
    price: toNum(r?.price),
    compareAtPrice: r?.compareAtPrice == null ? null : toNum(r?.compareAtPrice),
    images: Array.isArray(r?.images) ? r.images : JSON.parse(r?.images ?? "[]"),
    variants: Array.isArray(r?.variants) ? r.variants : JSON.parse(r?.variants ?? "[]"),
    tags: Array.isArray(r?.tags) ? r.tags : JSON.parse(r?.tags ?? "[]"),
    featured: Boolean(r?.featured),
    inStock: r?.inStock == null ? true : Boolean(r?.inStock),
  }));
  return json(data);
});

index.get("/api/products/:slug", (c) => {
  const slug = safeText(c.req.param("slug"));
  if (!slug) return json(null, "Invalid slug", "INVALID_SLUG", 400);
  const row = db
    .query(
      "SELECT id, slug, name, description, category, collection, price, compareAtPrice, currency, images, variants, featured, inStock, tags, createdAt, updatedAt FROM products WHERE slug = ? LIMIT 1"
    )
    .get(slug) as any;
  if (!row) return json(null, "Product not found", "NOT_FOUND", 404);
  return json({
    ...row,
    price: toNum(row?.price),
    compareAtPrice: row?.compareAtPrice == null ? null : toNum(row?.compareAtPrice),
    images: Array.isArray(row?.images) ? row.images : JSON.parse(row?.images ?? "[]"),
    variants: Array.isArray(row?.variants) ? row.variants : JSON.parse(row?.variants ?? "[]"),
    tags: Array.isArray(row?.tags) ? row.tags : JSON.parse(row?.tags ?? "[]"),
    featured: Boolean(row?.featured),
    inStock: row?.inStock == null ? true : Boolean(row?.inStock),
  });
});

index.get("/api/orders", (c) => {
  const userId = c.get("user")?.id ?? null;
  const rows = db
    .query(
      userId
        ? "SELECT * FROM orders WHERE userId = ? ORDER BY datetime(createdAt) DESC"
        : "SELECT * FROM orders ORDER BY datetime(createdAt) DESC"
    )
    .all(userId ? [userId] : []) as any[];
  const data = rows.map((o) => ({
    ...o,
    items: Array.isArray(o?.items) ? o.items : JSON.parse(o?.items ?? "[]"),
    subtotal: toNum(o?.subtotal),
    shipping: toNum(o?.shipping),
    tax: toNum(o?.tax),
    total: toNum(o?.total),
  }));
  return json(data);
});

index.post("/api/orders", async (c) => {
  const body = await c.req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return json(null, "Order items are required", "INVALID_PAYLOAD", 400);

  const normalized = items
    .map((item: any) => ({
      productId: safeText(item?.productId),
      variantId: item?.variantId == null ? null : safeText(item?.variantId),
      name: safeText(item?.name),
      price: toNum(item?.price),
      quantity: Math.floor(toNum(item?.quantity, 0)),
      image: item?.image == null ? null : safeText(item?.image),
    }))
    .filter((item: any) => isId(item.productId) && item.name && item.price >= 0 && item.quantity > 0);

  if (!normalized.length) return json(null, "Invalid order items", "INVALID_ITEMS", 400);

  const subtotal = normalized.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const shipping = Math.max(0, toNum(body?.shipping, subtotal > 0 ? 250 : 0));
  const tax = Math.max(0, toNum(body?.tax, Math.round(subtotal * 0.05)));
  const total = Math.max(0, toNum(body?.total, subtotal + shipping + tax));
  if (Math.abs(total - (subtotal + shipping + tax)) > 0.01) return json(null, "Total mismatch", "INVALID_TOTAL", 400);

  const status = isStatus(body?.status) ? body.status : "pending";
  const id = crypto.randomUUID();
  const userId = c.get("user")?.id ?? null;
  const createdAt = now();
  const shippingAddress = body?.shippingAddress ?? null;
  const billingAddress = body?.billingAddress ?? null;

  db.query(
    "INSERT INTO orders (id, userId, items, subtotal, shipping, tax, total, currency, status, shippingAddress, billingAddress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    userId,
    JSON.stringify(normalized),
    subtotal,
    shipping,
    tax,
    total,
    safeText(body?.currency) || "INR",
    status,
    shippingAddress ? JSON.stringify(shippingAddress) : null,
    billingAddress ? JSON.stringify(billingAddress) : null,
    createdAt,
    createdAt
  );

  return json({ orderId: id, paymentUrl: null }, "Order created", undefined, 201);
});

index.get("/api/admin/tables", (c) => {
  const user = c.get("user") ?? null;
  if (user?.role !== "admin") return json(null, "Forbidden", "FORBIDDEN", 403);
  return json(inspectTables());
});

index.get("/api/admin/tables/:tableName", (c) => {
  const user = c.get("user") ?? null;
  if (user?.role !== "admin") return json(null, "Forbidden", "FORBIDDEN", 403);
  const tableName = safeText(c.req.param("tableName"));
  if (!isId(tableName)) return json(null, "Invalid table name", "INVALID_TABLE", 400);
  return json(getTableData(tableName));
});

export default index;