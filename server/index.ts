import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { db, initializeDatabase, inspectTables, getTableData } from './db';

const index = new Hono();

const json = (data: unknown, success = true, message?: string) => ({ success, message, data });
const num = (v: unknown, d = 0) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : d;
};
const str = (v: unknown, d = '') => (typeof v === 'string' ? v.trim() : d);
const safeTable = (t: string) => /^[a-zA-Z0-9_]+$/.test(t) ? t : '';
const now = () => new Date().toISOString();

initializeDatabase();

index.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
index.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

index.get('/api/health', (c) => c.json(json({ ok: true, time: now() }, true, 'healthy')));

index.get('/api/products', async (c) => {
  const q = str(c.req.query('query')).toLowerCase();
  const category = str(c.req.query('category')).toLowerCase();
  const collection = str(c.req.query('collection')).toLowerCase();
  const sort = str(c.req.query('sort'), 'featured');
  const page = Math.max(1, num(c.req.query('page'), 1));
  const limit = Math.min(100, Math.max(1, num(c.req.query('limit'), 12)));
  const offset = (page - 1) * limit;
  const rows = await db.query('SELECT * FROM products ORDER BY createdAt DESC');
  let items = (rows?.rows ?? []).map((r: any) => ({ ...r, images: JSON.parse(r.images ?? '[]'), sizes: JSON.parse(r.sizes ?? '[]') }));
  if (q) items = items.filter((p: any) => `${p.name ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.collection ?? ''}`.toLowerCase().includes(q));
  if (category) items = items.filter((p: any) => str(p.category).toLowerCase() === category);
  if (collection) items = items.filter((p: any) => str(p.collection).toLowerCase() === collection);
  items.sort((a: any, b: any) => {
    if (sort === 'price-asc') return num(a.price) - num(b.price);
    if (sort === 'price-desc') return num(b.price) - num(a.price);
    if (sort === 'newest') return String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''));
    return Number(!!b.featured) - Number(!!a.featured) || String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''));
  });
  const total = items.length;
  return c.json(json({ data: items.slice(offset, offset + limit), page, limit, total, hasMore: offset + limit < total }, true, 'products'));
});

index.get('/api/products/:slug', async (c) => {
  const slug = str(c.req.param('slug'));
  const row = await db.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
  const product = row?.rows?.[0] ? { ...row.rows[0], images: JSON.parse((row.rows[0] as any).images ?? '[]'), sizes: JSON.parse((row.rows[0] as any).sizes ?? '[]') } : null;
  if (!product) return c.json(json(null, false, 'Product not found'), 404);
  const reviews = await db.query('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC', [product.id]);
  return c.json(json({ product, reviews: reviews?.rows ?? [] }, true, 'product'));
});

index.post('/api/reviews', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const productId = str(body?.productId);
  const rating = Math.max(1, Math.min(5, Math.round(num(body?.rating, 0))));
  const title = str(body?.title);
  const reviewBody = str(body?.body);
  const userName = str(body?.userName, 'Guest');
  const userId = str(body?.userId, 'guest');
  if (!productId || !reviewBody || !rating) return c.json(json(null, false, 'Invalid review payload'), 400);
  const id = crypto.randomUUID();
  await db.query('INSERT INTO reviews (id, productId, userId, userName, rating, title, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, productId, userId, userName, rating, title || null, reviewBody, now(), now()]);
  return c.json(json({ id, productId, userId, userName, rating, title, body: reviewBody }, true, 'Review created'), 201);
});

index.post('/api/orders', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  const shippingAddress = body?.shippingAddress ?? {};
  const fullName = str(shippingAddress?.fullName);
  const line1 = str(shippingAddress?.line1);
  const city = str(shippingAddress?.city);
  const postalCode = str(shippingAddress?.postalCode);
  const country = str(shippingAddress?.country);
  if (!items.length || !fullName || !line1 || !city || !postalCode || !country) return c.json(json(null, false, 'Invalid order payload'), 400);
  const subtotal = items.reduce((sum: number, item: any) => sum + num(item?.price) * Math.max(1, num(item?.quantity, 1)), 0);
  const shippingFee = subtotal > 15000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee + tax;
  const id = crypto.randomUUID();
  await db.query('INSERT INTO orders (id, userId, items, shippingAddress, subtotal, shippingFee, tax, total, currency, status, paymentMethod, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, str(body?.userId) || null, JSON.stringify(items), JSON.stringify(shippingAddress), subtotal, shippingFee, tax, total, str(body?.currency, 'INR'), 'pending', str(body?.paymentMethod, 'card') || null, now(), now()]);
  return c.json(json({ id, subtotal, shippingFee, tax, total, status: 'pending' }, true, 'Order created'), 201);
});

index.get('/api/orders', async (c) => {
  const userId = str(c.req.query('userId'));
  const rows = await db.query(userId ? 'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC' : 'SELECT * FROM orders ORDER BY createdAt DESC', userId ? [userId] : []);
  const orders = (rows?.rows ?? []).map((r: any) => ({ ...r, items: JSON.parse(r.items ?? '[]'), shippingAddress: JSON.parse(r.shippingAddress ?? '{}') }));
  return c.json(json(orders, true, 'orders'));
});

index.get('/api/admin/tables', (c) => c.json(json(inspectTables(), true, 'tables')));
index.get('/api/admin/tables/:table', (c) => {
  const table = safeTable(str(c.req.param('table')));
  if (!table) return c.json(json(null, false, 'Invalid table name'), 400);
  return getTableData(table).then((data) => c.json(json(data, true, 'table data')));
});

index.get('/api/cart/:userId', async (c) => {
  const userId = str(c.req.param('userId'));
  const rows = await db.query('SELECT * FROM cart_items WHERE userId = ? ORDER BY addedAt DESC', [userId]);
  return c.json(json(rows?.rows ?? [], true, 'cart'));
});

index.post('/api/cart', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const userId = str(body?.userId);
  const productId = str(body?.productId);
  const quantity = Math.max(1, num(body?.quantity, 1));
  if (!userId || !productId) return c.json(json(null, false, 'Invalid cart payload'), 400);
  const id = crypto.randomUUID();
  await db.query('INSERT INTO cart_items (id, userId, productId, quantity, size, color, price, addedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, userId, productId, quantity, str(body?.size) || null, str(body?.color) || null, num(body?.price), now()]);
  return c.json(json({ id }, true, 'Cart item added'), 201);
});

index.delete('/api/cart/:id', async (c) => {
  const id = str(c.req.param('id'));
  await db.query('DELETE FROM cart_items WHERE id = ?', [id]);
  return c.json(json({ id }, true, 'Cart item removed'));
});

export { index };
export default index;