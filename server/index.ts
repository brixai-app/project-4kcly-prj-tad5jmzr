import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { db, initializeDatabase, inspectTables, getTableData } from './db';

const app = new Hono();
const json = (data: unknown, status = 200) => app.json(data, status);
const ok = <T,>(data: T, message?: string) => json({ data, message });
const fail = (error: string, status = 400) => json({ data: null, error }, status);
const isTableName = (name: string) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name ?? '');
const parseBody = async <T,>(c: any): Promise<T | null> => {
  try {
    return (await c.req.json()) as T;
  } catch {
    return null;
  }
};
const now = () => new Date().toISOString();

await initializeDatabase();

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));
app.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

app.get('/api/health', (c) => c.json({ data: { ok: true, timestamp: now() } }));

app.get('/api/admin/tables', async (c) => ok(await inspectTables()));
app.get('/api/admin/table/:name', async (c) => {
  const name = c.req.param('name') ?? '';
  if (!isTableName(name)) return fail('Invalid table name', 400);
  return ok(await getTableData(name));
});

app.get('/api/products', async (c) => {
  const rows = await getTableData('products');
  return ok(Array.isArray(rows) ? rows : []);
});

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id') ?? '';
  const rows = (await getTableData('products')) as any[];
  const product = rows?.find((row) => String(row?.id ?? '') === id || String(row?.slug ?? '') === id) ?? null;
  if (!product) return fail('Product not found', 404);
  return ok(product);
});

app.get('/api/products/:id/reviews', async (c) => {
  const productId = c.req.param('id') ?? '';
  const rows = (await getTableData('reviews')) as any[];
  return ok((rows ?? []).filter((row) => String(row?.productId ?? '') === productId));
});

app.post('/api/products/:id/reviews', async (c) => {
  const productId = c.req.param('id') ?? '';
  const body = await parseBody<any>(c);
  const rating = Number(body?.rating ?? 0);
  if (!productId || !Number.isFinite(rating) || rating < 1 || rating > 5) return fail('Invalid review payload', 400);
  const id = crypto.randomUUID();
  const createdAt = now();
  await db.execute({
    sql: 'INSERT INTO reviews (id, productId, userId, userName, rating, title, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, productId, body?.userId ?? null, body?.userName ?? null, rating, body?.title ?? null, body?.body ?? null, createdAt, createdAt],
  });
  return ok({ id, productId, userId: body?.userId ?? null, userName: body?.userName ?? null, rating, title: body?.title ?? null, body: body?.body ?? null, createdAt, updatedAt: createdAt }, 'Review saved');
});

app.get('/api/orders', async (c) => {
  const userId = c.req.query('userId') ?? '';
  const rows = (await getTableData('orders')) as any[];
  const data = userId ? (rows ?? []).filter((row) => String(row?.userId ?? '') === userId) : (rows ?? []);
  return ok(data);
});

app.get('/api/orders/:id', async (c) => {
  const id = c.req.param('id') ?? '';
  const rows = (await getTableData('orders')) as any[];
  const order = rows?.find((row) => String(row?.id ?? '') === id) ?? null;
  if (!order) return fail('Order not found', 404);
  return ok(order);
});

app.post('/api/orders', async (c) => {
  const body = await parseBody<any>(c);
  const items = Array.isArray(body?.items) ? body.items : [];
  const shippingAddress = body?.shippingAddress ?? null;
  const email = String(body?.email ?? '').trim();
  if (!items.length || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country || !email) return fail('Invalid order payload', 400);
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price ?? 0) * Number(item?.quantity ?? 0), 0);
  const shipping = Number(body?.shipping ?? 0);
  const tax = Number(body?.tax ?? 0);
  const total = subtotal + shipping + tax;
  const id = crypto.randomUUID();
  const createdAt = now();
  await db.execute({
    sql: 'INSERT INTO orders (id, userId, items, subtotal, shipping, tax, total, status, paymentStatus, shippingAddress, billingAddress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, body?.userId ?? null, JSON.stringify(items), subtotal, shipping, tax, total, body?.status ?? 'pending', body?.paymentStatus ?? 'unpaid', JSON.stringify(shippingAddress), JSON.stringify(body?.billingAddress ?? null), createdAt, createdAt],
  });
  return ok({ id, userId: body?.userId ?? null, items, subtotal, shipping, tax, total, status: body?.status ?? 'pending', paymentStatus: body?.paymentStatus ?? 'unpaid', shippingAddress, billingAddress: body?.billingAddress ?? null, createdAt, updatedAt: createdAt }, 'Order created');
});

app.get('/api/users/:id/orders', async (c) => {
  const userId = c.req.param('id') ?? '';
  const rows = (await getTableData('orders')) as any[];
  return ok((rows ?? []).filter((row) => String(row?.userId ?? '') === userId));
});

app.all('*', (c) => c.json({ data: null, error: 'Not found' }, 404));

export default app;