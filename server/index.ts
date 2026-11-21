import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';
import { db, initializeDatabase, inspectTables, getTableData } from './db';

const index = new Hono();

const json = (data: unknown, status = 200) => index.json(data, status);

const parseBody = async (c: any) => {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
};

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const safeText = (value: unknown) => String(value ?? '').trim();

const productWhere = (q: Record<string, unknown>) => {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};
  if (q.query) {
    clauses.push('(name LIKE @query OR description LIKE @query OR collection LIKE @query OR category LIKE @query)');
    params.query = `%${safeText(q.query)}%`;
  }
  if (q.category) {
    clauses.push('category = @category');
    params.category = safeText(q.category);
  }
  if (q.collection) {
    clauses.push('collection = @collection');
    params.collection = safeText(q.collection);
  }
  if (q.minPrice !== undefined) {
    clauses.push('price >= @minPrice');
    params.minPrice = toNumber(q.minPrice);
  }
  if (q.maxPrice !== undefined) {
    clauses.push('price <= @maxPrice');
    params.maxPrice = toNumber(q.maxPrice);
  }
  if (q.inStock !== undefined) {
    clauses.push('inStock = @inStock');
    params.inStock = q.inStock === true || q.inStock === 'true' ? 1 : 0;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
};

index.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));

index.all('/api/auth/*', (c) => typeof auth !== 'undefined' && auth && auth.handler ? auth.handler(c.req.raw) : (typeof auth === 'function' ? auth(c.req.raw) : c.json({ error: 'Auth handler unavailable' }, 500)));

index.get('/api/health', (c) => c.json({ ok: true, service: 'nddn-store' }));

index.get('/api/products', async (c) => {
  const q = c.req.query();
  const { where, params } = productWhere(q);
  const sortMap: Record<string, string> = {
    featured: 'featured DESC, createdAt DESC',
    newest: 'createdAt DESC',
    'price-asc': 'price ASC',
    'price-desc': 'price DESC',
    rating: 'rating DESC, reviewCount DESC',
  };
  const sort = sortMap[q.sort ?? 'featured'] ?? sortMap.featured;
  const result = await db.execute(`SELECT * FROM products ${where} ORDER BY ${sort}`, params);
  return c.json({ data: result.rows ?? [] });
});

index.get('/api/products/:slug', async (c) => {
  const slug = safeText(c.req.param('slug'));
  const result = await db.execute('SELECT * FROM products WHERE slug = @slug LIMIT 1', { slug });
  const product = result.rows?.[0] ?? null;
  if (!product) return c.json({ error: 'Product not found' }, 404);
  return c.json({ data: product });
});

index.get('/api/products/:slug/reviews', async (c) => {
  const slug = safeText(c.req.param('slug'));
  const product = await db.execute('SELECT id FROM products WHERE slug = @slug LIMIT 1', { slug });
  const productId = product.rows?.[0]?.id ?? null;
  if (!productId) return c.json({ data: [] });
  const reviews = await db.execute('SELECT * FROM reviews WHERE productId = @productId ORDER BY createdAt DESC', { productId });
  return c.json({ data: reviews.rows ?? [] });
});

index.post('/api/reviews', async (c) => {
  const body = await parseBody(c);
  const productId = safeText(body?.productId);
  const rating = Math.max(1, Math.min(5, Math.round(toNumber(body?.rating, 5))));
  const bodyText = safeText(body?.body);
  if (!productId || !bodyText) return c.json({ error: 'Invalid review payload' }, 400);
  const id = crypto.randomUUID();
  await db.execute(
    'INSERT INTO reviews (id, productId, userId, userName, rating, title, body, createdAt) VALUES (@id, @productId, @userId, @userName, @rating, @title, @body, @createdAt)',
    { id, productId, userId: body?.userId ?? null, userName: body?.userName ?? null, rating, title: body?.title ?? null, body: bodyText, createdAt: new Date().toISOString() }
  );
  return c.json({ data: { id, productId, rating, body: bodyText } }, 201);
});

index.get('/api/orders', async (c) => {
  const userId = c.req.query('userId');
  const where = userId ? 'WHERE userId = @userId' : '';
  const orders = await db.execute(`SELECT * FROM orders ${where} ORDER BY createdAt DESC`, userId ? { userId } : {});
  return c.json({ data: orders.rows ?? [] });
});

index.post('/api/orders', async (c) => {
  const body = await parseBody(c);
  const items = Array.isArray(body?.items) ? body.items : [];
  const address = body?.address ?? null;
  const email = safeText(body?.email);
  if (!items.length || !address || !email) return c.json({ error: 'Invalid checkout payload' }, 400);
  const subtotal = items.reduce((sum: number, item: any) => sum + toNumber(item?.price) * Math.max(1, toNumber(item?.quantity, 1)), 0);
  const shipping = subtotal > 25000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.execute('BEGIN');
  try {
    await db.execute(
      'INSERT INTO orders (id, userId, subtotal, shipping, tax, total, status, shippingAddress, createdAt, updatedAt) VALUES (@id, @userId, @subtotal, @shipping, @tax, @total, @status, @shippingAddress, @createdAt, @updatedAt)',
      { id: orderId, userId: body?.userId ?? null, subtotal, shipping, tax, total, status: 'pending', shippingAddress: JSON.stringify(address), createdAt, updatedAt: createdAt }
    );
    for (const item of items) {
      const orderItemId = crypto.randomUUID();
      await db.execute(
        'INSERT INTO order_items (id, orderId, productId, name, image, price, quantity, size, color) VALUES (@id, @orderId, @productId, @name, @image, @price, @quantity, @size, @color)',
        { id: orderItemId, orderId, productId: safeText(item?.productId), name: safeText(item?.name), image: safeText(item?.image), price: toNumber(item?.price), quantity: Math.max(1, toNumber(item?.quantity, 1)), size: item?.size ?? null, color: item?.color ?? null }
      );
    }
    await db.execute('COMMIT');
    return c.json({ data: { id: orderId, subtotal, shipping, tax, total, status: 'pending' } }, 201);
  } catch (error) {
    await db.execute('ROLLBACK');
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

index.get('/api/profile', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ data: null });
  const users = await db.execute('SELECT * FROM users WHERE id = @userId LIMIT 1', { userId });
  const addresses = await db.execute('SELECT * FROM addresses WHERE userId = @userId ORDER BY isDefault DESC, createdAt DESC', { userId });
  return c.json({ data: { user: users.rows?.[0] ?? null, addresses: addresses.rows ?? [] } });
});

index.post('/api/addresses', async (c) => {
  const body = await parseBody(c);
  const fullName = safeText(body?.fullName);
  const line1 = safeText(body?.line1);
  const city = safeText(body?.city);
  const state = safeText(body?.state);
  const postalCode = safeText(body?.postalCode);
  const country = safeText(body?.country);
  if (!fullName || !line1 || !city || !state || !postalCode || !country) return c.json({ error: 'Invalid address payload' }, 400);
  const id = crypto.randomUUID();
  await db.execute(
    'INSERT INTO addresses (id, userId, fullName, line1, line2, city, state, postalCode, country, phone, isDefault, createdAt) VALUES (@id, @userId, @fullName, @line1, @line2, @city, @state, @postalCode, @country, @phone, @isDefault, @createdAt)',
    { id, userId: body?.userId ?? null, fullName, line1, line2: body?.line2 ?? null, city, state, postalCode, country, phone: body?.phone ?? null, isDefault: body?.isDefault ? 1 : 0, createdAt: new Date().toISOString() }
  );
  return c.json({ data: { id } }, 201);
});

index.get('/api/admin/tables', async (c) => c.json({ data: await inspectTables() }));
index.get('/api/admin/table/:name', async (c) => c.json({ data: await getTableData(safeText(c.req.param('name'))) }));

index.onError((err, c) => c.json({ error: err?.message ?? 'Internal server error' }, 500));

initializeDatabase().catch(() => undefined);

export default index;