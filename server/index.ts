import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { initDb, inspectTables, getTableData } from './db';

const app = new Hono();
const json = (success: boolean, data: unknown, message?: string, status = 200) => app.json({ success, data, message }, status);
const err = (message: string, status = 400) => app.json({ success: false, data: null, message }, status);
const isTableName = (v: string) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v ?? '');
const num = (v: string | null, d: number) => {
  const n = Number(v ?? '');
  return Number.isFinite(n) ? n : d;
};
const parseJson = async <T,>(c: any): Promise<T | null> => {
  try {
    return (await c.req.json()) as T;
  } catch {
    return null;
  }
};

initDb();

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));
app.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

app.get('/api/health', (c) => json(true, { ok: true, timestamp: new Date().toISOString() }, 'ok'));

app.get('/api/products', async (c) => {
  const q = (c.req.query('q') ?? '').trim().toLowerCase();
  const category = (c.req.query('category') ?? '').trim().toLowerCase();
  const collection = (c.req.query('collection') ?? '').trim().toLowerCase();
  const sortBy = c.req.query('sortBy') ?? 'featured';
  const page = Math.max(1, num(c.req.query('page'), 1));
  const limit = Math.min(100, Math.max(1, num(c.req.query('limit'), 12)));
  const offset = (page - 1) * limit;
  const rows = await getTableData('products');
  const items = (rows ?? []).filter((p: any) => {
    const hay = `${p?.name ?? ''} ${p?.description ?? ''} ${p?.category ?? ''} ${p?.collection ?? ''} ${(p?.tags ?? []).join(' ')}`.toLowerCase();
    return (!q || hay.includes(q)) && (!category || `${p?.category ?? ''}`.toLowerCase() === category) && (!collection || `${p?.collection ?? ''}`.toLowerCase() === collection);
  }).sort((a: any, b: any) => {
    if (sortBy === 'price-asc') return (a?.price ?? 0) - (b?.price ?? 0);
    if (sortBy === 'price-desc') return (b?.price ?? 0) - (a?.price ?? 0);
    if (sortBy === 'rating') return (b?.rating ?? 0) - (a?.rating ?? 0);
    if (sortBy === 'newest') return new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime();
    return Number(!!b?.featured) - Number(!!a?.featured) || new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime();
  });
  return json(true, { items: items.slice(offset, offset + limit), page, limit, total: items.length }, 'products');
});

app.get('/api/products/:slug', async (c) => {
  const slug = c.req.param('slug') ?? '';
  const rows = await getTableData('products');
  const product = (rows ?? []).find((p: any) => `${p?.slug ?? ''}` === slug);
  return product ? json(true, product, 'product') : err('Product not found', 404);
});

app.get('/api/products/:productId/reviews', async (c) => {
  const productId = c.req.param('productId') ?? '';
  const rows = await getTableData('reviews');
  const reviews = (rows ?? []).filter((r: any) => `${r?.productId ?? ''}` === productId).sort((a: any, b: any) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime());
  return json(true, reviews, 'reviews');
});

app.get('/api/orders', async (c) => {
  const userId = c.req.query('userId') ?? '';
  const rows = await getTableData('orders');
  const orders = userId ? (rows ?? []).filter((o: any) => `${o?.userId ?? ''}` === userId) : (rows ?? []);
  return json(true, orders, 'orders');
});

app.post('/api/orders', async (c) => {
  const body = await parseJson<any>(c);
  if (!body?.items?.length || !body?.shippingAddress?.fullName || !body?.shippingAddress?.line1 || !body?.shippingAddress?.city || !body?.shippingAddress?.postalCode || !body?.shippingAddress?.country || !body?.email || !body?.paymentMethod) return err('Invalid order payload', 422);
  return json(true, { id: crypto.randomUUID(), ...body, status: 'pending', createdAt: new Date().toISOString() }, 'order created', 201);
});

app.get('/api/profile', (c) => json(true, { user: null }, 'profile'));
app.put('/api/profile', async (c) => {
  const body = await parseJson<any>(c);
  if (!body) return err('Invalid profile payload', 422);
  return json(true, { ...body, updatedAt: new Date().toISOString() }, 'profile updated');
});

app.get('/api/address', (c) => json(true, { address: null }, 'address'));
app.put('/api/address', async (c) => {
  const body = await parseJson<any>(c);
  if (!body?.fullName || !body?.line1 || !body?.city || !body?.postalCode || !body?.country) return err('Invalid address payload', 422);
  return json(true, { ...body, updatedAt: new Date().toISOString() }, 'address updated');
});

app.get('/api/admin/tables', () => json(true, inspectTables(), 'tables'));
app.get('/api/admin/tables/:tableName', async (c) => {
  const tableName = c.req.param('tableName') ?? '';
  if (!isTableName(tableName)) return err('Invalid table name', 400);
  return json(true, await getTableData(tableName), 'table data');
});

app.all('/api/*', (c) => err('Not found', 404));

export default app;