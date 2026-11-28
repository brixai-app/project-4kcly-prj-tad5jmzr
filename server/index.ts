import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { initDb, inspectTables, getTableData, getProducts, getReviews, getOrders } from './db';

const app = new Hono();

const json = (data: unknown, status = 200) => app.json(data, status);

const safeString = (value: unknown, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);
const safeNumber = (value: unknown, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const safeArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
const now = () => new Date().toISOString();

const createId = () => globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'OPTIONS'] }));

app.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

app.get('/api/health', (c) => c.json({ ok: true, timestamp: now() }));

app.get('/api/products', async (c) => {
  await initDb();
  return c.json({ data: await getProducts() });
});

app.get('/api/products/:slug', async (c) => {
  await initDb();
  const slug = safeString(c.req.param('slug'));
  const products = await getProducts();
  const product = products.find((item) => item?.slug === slug || item?.id === slug);
  return product ? c.json({ data: product }) : c.json({ error: 'Product not found' }, 404);
});

app.get('/api/products/:productId/reviews', async (c) => {
  await initDb();
  return c.json({ data: await getReviews(c.req.param('productId')) });
});

app.post('/api/products/:productId/reviews', async (c) => {
  await initDb();
  const productId = safeString(c.req.param('productId'));
  const body = await c.req.json().catch(() => ({}));
  const userName = safeString(body?.userName, 'Anonymous');
  const rating = Math.min(5, Math.max(1, Math.round(safeNumber(body?.rating, 5))));
  const title = safeString(body?.title);
  const reviewBody = safeString(body?.body);
  if (!productId || !reviewBody) return c.json({ error: 'Invalid review payload' }, 400);
  const review = { id: createId(), productId, userName, rating, title, body: reviewBody, createdAt: now(), updatedAt: now() };
  await db.execute({
    sql: 'INSERT INTO reviews (id, productId, userName, rating, title, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [review.id, review.productId, review.userName, review.rating, review.title ?? null, review.body, review.createdAt, review.updatedAt],
  });
  return c.json({ data: review }, 201);
});

app.get('/api/orders', async (c) => {
  await initDb();
  const email = safeString(c.req.query('email'));
  return c.json({ data: await getOrders(email || undefined) });
});

app.post('/api/orders', async (c) => {
  await initDb();
  const body = await c.req.json().catch(() => ({}));
  const email = safeString(body?.email);
  const items = safeArray<any>(body?.items);
  const shippingAddress = safeString(body?.shippingAddress);
  const notes = safeString(body?.notes);
  if (!email || !shippingAddress || items.length === 0) return c.json({ error: 'Invalid order payload' }, 400);

  const normalizedItems = items.map((item) => ({
    productId: safeString(item?.productId),
    name: safeString(item?.product?.name ?? item?.name),
    price: safeNumber(item?.product?.price ?? item?.price),
    quantity: Math.max(1, Math.round(safeNumber(item?.quantity, 1))),
    size: safeString(item?.size),
    color: safeString(item?.color),
    image: safeString(item?.product?.image ?? item?.image),
  })).filter((item) => item.productId && item.name);

  if (normalizedItems.length === 0) return c.json({ error: 'No valid order items' }, 400);

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 25000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const order = { id: createId(), email, items: normalizedItems, subtotal, shipping, tax, total, status: 'pending', shippingAddress, notes: notes || undefined, createdAt: now(), updatedAt: now() };

  await db.execute({
    sql: 'INSERT INTO orders (id, email, items, subtotal, shipping, tax, total, status, shippingAddress, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [order.id, order.email, JSON.stringify(order.items), order.subtotal, order.shipping, order.tax ?? null, order.total, order.status, order.shippingAddress ?? null, order.notes ?? null, order.createdAt, order.updatedAt],
  });

  return c.json({ data: order }, 201);
});

app.get('/api/admin/tables', async (c) => {
  await initDb();
  const tables = await inspectTables();
  return c.json({ data: tables });
});

app.get('/api/admin/tables/:table', async (c) => {
  await initDb();
  const table = safeString(c.req.param('table'));
  const allowed = new Set(['products', 'reviews', 'orders', 'users', 'sessions', 'accounts', 'verification']);
  if (!allowed.has(table)) return c.json({ error: 'Table access denied' }, 403);
  return c.json({ data: await getTableData(table) });
});

app.get('/api/admin/inspect', async (c) => {
  await initDb();
  const tables = await inspectTables();
  const data: Record<string, unknown[]> = {};
  for (const table of tables) data[table] = await getTableData(table);
  return c.json({ data });
});

app.get('/api/debug/db', async (c) => {
  await initDb();
  return c.json({ data: { tables: await inspectTables() } });
});

export default app;