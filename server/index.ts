import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { db, initializeDatabase, inspectTables, getTableData } from './db';

const index = new Hono();

initializeDatabase().catch(() => undefined);

index.use('/api/*', cors({ origin: 'http://localhost:5173', credentials: true }));

const json = (data: unknown, message?: string, success = true) => ({ data, message, success });

const rows = (result: any) => result?.rows ?? result ?? [];
const first = (result: any) => rows(result)?.[0] ?? null;
const q = (sql: string, params: unknown[] = []) => db.execute({ sql, args: params });

index.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

index.get('/api/health', (c) => c.json(json({ ok: true })));

index.get('/api/products', async (c) => {
  const category = c.req.query('category') ?? '';
  const featured = c.req.query('featured') === 'true';
  const search = c.req.query('search') ?? '';
  const sql = `SELECT * FROM products WHERE (? = '' OR category = ?) AND (? = '' OR name LIKE ? OR description LIKE ?) ${featured ? 'AND featured = 1' : ''} ORDER BY COALESCE(featured,0) DESC, createdAt DESC`;
  const data = rows(await q(sql, [category, category, search, `%${search}%`, `%${search}%`]));
  c.header('Content-Type', 'application/json');
  return c.json(json(data));
});

index.get('/api/products/:slug', async (c) => {
  const slug = c.req.param('slug');
  const product = first(await q('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]));
  if (!product) return c.json(json(null, 'Product not found', false), 404);
  const reviews = rows(await q('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC', [product.id]));
  return c.json(json({ ...product, reviews }));
});

index.get('/api/cart', async (c) => c.json(json(rows(await q('SELECT * FROM cart_items ORDER BY createdAt DESC')))));

index.post('/api/cart', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const productId = body?.productId ?? '';
  const quantity = Math.max(1, Number(body?.quantity ?? 1));
  const size = body?.size ?? null;
  const color = body?.color ?? null;
  const product = first(await q('SELECT * FROM products WHERE id = ? LIMIT 1', [productId]));
  if (!product) return c.json(json(null, 'Product not found', false), 404);
  const existing = first(await q('SELECT * FROM cart_items WHERE productId = ? AND COALESCE(size,"") = COALESCE(?, "") AND COALESCE(color,"") = COALESCE(?, "") LIMIT 1', [productId, size, color]));
  if (existing) {
    await q('UPDATE cart_items SET quantity = quantity + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [quantity, existing.id]);
  } else {
    await q('INSERT INTO cart_items (id, productId, name, image, price, quantity, size, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [crypto.randomUUID(), product.id, product.name, product?.images?.[0]?.url ?? '', product.price, quantity, size, color]);
  }
  return c.json(json(rows(await q('SELECT * FROM cart_items ORDER BY createdAt DESC')), 'Cart updated'));
});

index.patch('/api/cart/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const quantity = body?.quantity != null ? Math.max(1, Number(body.quantity)) : null;
  const size = body?.size ?? null;
  const color = body?.color ?? null;
  await q('UPDATE cart_items SET quantity = COALESCE(?, quantity), size = COALESCE(?, size), color = COALESCE(?, color), updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [quantity, size, color, id]);
  return c.json(json(rows(await q('SELECT * FROM cart_items ORDER BY createdAt DESC')), 'Cart item updated'));
});

index.delete('/api/cart/:id', async (c) => {
  await q('DELETE FROM cart_items WHERE id = ?', [c.req.param('id')]);
  return c.json(json(rows(await q('SELECT * FROM cart_items ORDER BY createdAt DESC')), 'Cart item removed'));
});

index.post('/api/orders', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  const shippingAddress = body?.shippingAddress ?? null;
  const email = body?.email ?? '';
  if (!items.length || !shippingAddress || !email) return c.json(json(null, 'Invalid checkout payload', false), 400);
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price ?? 0) * Number(item?.quantity ?? 0), 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const orderId = crypto.randomUUID();
  await q('INSERT INTO orders (id, userId, items, subtotal, shipping, tax, total, currency, status, shippingAddress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [orderId, body?.userId ?? email, JSON.stringify(items), subtotal, shipping, tax, total, body?.currency ?? 'INR', 'pending', JSON.stringify(shippingAddress)]);
  await q('DELETE FROM cart_items');
  return c.json(json({ id: orderId, subtotal, shipping, tax, total }, 'Order created'));
});

index.get('/api/orders', async (c) => {
  const userId = c.req.query('userId') ?? '';
  const sql = userId ? 'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC' : 'SELECT * FROM orders ORDER BY createdAt DESC';
  const data = rows(await q(sql, userId ? [userId] : []));
  return c.json(json(data));
});

index.patch('/api/profile', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = body?.email ?? '';
  if (!email) return c.json(json(null, 'Email is required', false), 400);
  const existing = first(await q('SELECT * FROM users WHERE email = ? LIMIT 1', [email]));
  const id = existing?.id ?? crypto.randomUUID();
  await q('INSERT INTO users (id, email, name, avatarUrl, role, phone, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET name = excluded.name, avatarUrl = excluded.avatarUrl, role = excluded.role, phone = excluded.phone, address = excluded.address, updatedAt = CURRENT_TIMESTAMP', [id, email, body?.name ?? existing?.name ?? null, body?.avatarUrl ?? existing?.avatarUrl ?? null, body?.role ?? existing?.role ?? 'customer', body?.phone ?? existing?.phone ?? null, body?.address ? JSON.stringify(body.address) : existing?.address ?? null, existing?.createdAt ?? null]);
  const user = first(await q('SELECT * FROM users WHERE email = ? LIMIT 1', [email]));
  return c.json(json(user, 'Profile updated'));
});

index.get('/api/inspect/tables', async (c) => c.json(json(await inspectTables())));
index.get('/api/inspect/:table', async (c) => c.json(json(await getTableData(c.req.param('table')))));

export default index;