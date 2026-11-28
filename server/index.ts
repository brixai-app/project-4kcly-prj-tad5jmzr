import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./auth";
import { db, initializeDatabase, inspectTables, getTableData } from "./db";

const index = new Hono();

initializeDatabase();

index.use("/api/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization"], allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));

const json = (c: any, data: any, message?: string, status = 200) => c.json(message ? { data, message } : { data }, status);

index.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

index.get("/api/products", async (c) => {
  const result = await db.execute("SELECT * FROM products ORDER BY featured DESC, createdAt DESC");
  return json(c, result.rows ?? []);
});

index.get("/api/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await db.execute("SELECT * FROM products WHERE slug = ? LIMIT 1", [slug]);
  const product = result.rows?.[0] ?? null;
  return product ? json(c, product) : c.json({ data: null, message: "Product not found" }, 404);
});

index.get("/api/products/:slug/reviews", async (c) => {
  const slug = c.req.param("slug");
  const result = await db.execute(
    "SELECT r.* FROM reviews r INNER JOIN products p ON p.id = r.productId WHERE p.slug = ? ORDER BY r.createdAt DESC",
    [slug]
  );
  return json(c, result.rows ?? []);
});

index.post("/api/reviews", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { productId, author, rating, title, body: reviewBody } = body ?? {};
  if (!productId || !author || !rating || !reviewBody) return c.json({ data: null, message: "Invalid review payload" }, 400);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.execute("INSERT INTO reviews (id, productId, author, rating, title, body, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    id,
    productId,
    author,
    Number(rating),
    title ?? null,
    reviewBody,
    createdAt,
  ]);
  return json(c, { id, productId, author, rating: Number(rating), title: title ?? null, body: reviewBody, createdAt }, "Review created", 201);
});

index.get("/api/orders", async (c) => {
  const result = await db.execute("SELECT * FROM orders ORDER BY createdAt DESC");
  return json(c, result.rows ?? []);
});

index.post("/api/orders", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, items, shippingAddress, paymentMethod } = body ?? {};
  if (!email || !Array.isArray(items) || !shippingAddress || !paymentMethod) return c.json({ data: null, message: "Invalid order payload" }, 400);
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price ?? 0) * Number(item?.quantity ?? 0), 0);
  const shipping = subtotal > 15000 ? 0 : 499;
  const total = subtotal + shipping;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.execute("INSERT INTO orders (id, email, items, subtotal, shipping, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    id,
    email,
    JSON.stringify(items),
    subtotal,
    shipping,
    total,
    "pending",
    createdAt,
  ]);
  return json(c, { id, email, items, subtotal, shipping, total, status: "pending", createdAt }, "Order created", 201);
});

index.get("/api/_admin/db/tables", async (c) => json(c, await inspectTables()));
index.get("/api/_admin/db/table/:name", async (c) => json(c, await getTableData(c.req.param("name"))));
index.get("/api/_admin/db/table/:name/rows", async (c) => json(c, await getTableData(c.req.param("name"))));

export default index;