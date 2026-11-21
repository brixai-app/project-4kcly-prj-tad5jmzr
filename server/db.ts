import { createClient } from '@libsql/client';

export const db = createClient({ url: 'file:local.db' });
export default db;

const productSeed = [
  {
    id: 'prod_001',
    name: 'Atelier Wool Overcoat',
    slug: 'atelier-wool-overcoat',
    description: 'Double-faced wool overcoat with a clean shoulder, deep lapel, and fluid drape.',
    price: 28900,
    compareAtPrice: 34900,
    category: 'outerwear',
    collection: 'Winter Issue',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85'],
    color: 'Charcoal',
    size: ['S', 'M', 'L'],
    material: 'Wool blend',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: 'prod_002',
    name: 'Silk Collar Shirt',
    slug: 'silk-collar-shirt',
    description: 'Fluid silk shirt with a sharp collar and a luminous finish for evening layering.',
    price: 12400,
    compareAtPrice: 14900,
    category: 'shirts',
    collection: 'Evening Line',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
    images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85'],
    color: 'Ivory',
    size: ['XS', 'S', 'M'],
    material: 'Silk',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: 'prod_003',
    name: 'Tailored Pleat Trouser',
    slug: 'tailored-pleat-trouser',
    description: 'High-rise trouser with a pressed front crease and a precise, elongated silhouette.',
    price: 15900,
    compareAtPrice: 18900,
    category: 'trousers',
    collection: 'Core Tailoring',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'],
    color: 'Stone',
    size: ['S', 'M', 'L', 'XL'],
    material: 'Virgin wool',
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 12,
  },
  {
    id: 'prod_004',
    name: 'Cashmere Knit Polo',
    slug: 'cashmere-knit-polo',
    description: 'Soft cashmere knit polo with a compact collar and a refined, close fit.',
    price: 17900,
    compareAtPrice: 21900,
    category: 'knitwear',
    collection: 'Soft Structure',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85'],
    color: 'Oat',
    size: ['S', 'M', 'L'],
    material: 'Cashmere',
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 9,
  },
  {
    id: 'prod_005',
    name: 'Leather Buckle Belt',
    slug: 'leather-buckle-belt',
    description: 'Minimal leather belt finished with a brushed buckle and subtle edge paint.',
    price: 6900,
    compareAtPrice: 8500,
    category: 'accessories',
    collection: 'Signature Objects',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    color: 'Black',
    size: ['S', 'M', 'L'],
    material: 'Leather',
    inStock: true,
    featured: true,
    rating: 4.6,
    reviewCount: 15,
  },
];

const authTables = ['user', 'session', 'account', 'verification'];
const appTables = ['products', 'orders', 'order_items', 'addresses', 'reviews'];

const schema = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price INTEGER NOT NULL,
    compareAtPrice INTEGER,
    category TEXT NOT NULL,
    collection TEXT,
    image TEXT NOT NULL,
    images TEXT,
    color TEXT,
    size TEXT,
    material TEXT,
    inStock INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    shippingAddress TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    productId TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT,
    color TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    userId TEXT,
    fullName TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postalCode TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    isDefault INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    userId TEXT,
    userName TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY)`,
];

export async function initializeDatabase() {
  for (const statement of schema) await db.execute(statement);
  const existing = await db.execute(`SELECT slug FROM products`);
  const rows = (existing?.rows ?? []) as Array<{ slug?: string }>;
  const existingSlugs = new Set(rows.map((row) => row?.slug).filter(Boolean) as string[]);
  for (const product of productSeed) {
    if (existingSlugs.has(product.slug)) continue;
    await db.execute({
      sql: `INSERT INTO products (id, name, slug, description, price, compareAtPrice, category, collection, image, images, color, size, material, inStock, featured, rating, reviewCount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.id,
        product.name,
        product.slug,
        product.description ?? null,
        product.price,
        product.compareAtPrice ?? null,
        product.category,
        product.collection ?? null,
        product.image,
        JSON.stringify(product.images ?? [product.image]),
        product.color ?? null,
        JSON.stringify(product.size ?? []),
        product.material ?? null,
        product.inStock ? 1 : 0,
        product.featured ? 1 : 0,
        product.rating ?? 0,
        product.reviewCount ?? 0,
      ],
    });
  }
  return true;
}

export async function inspectTables() {
  const tables = [...appTables, ...authTables];
  const result = [];
  for (const name of tables) {
    const countRes = await db.execute(`SELECT COUNT(*) AS count FROM ${name}`);
    const count = Number((countRes?.rows?.[0] as { count?: number } | undefined)?.count ?? 0);
    result.push({ name, count, isAuth: authTables.includes(name) });
  }
  return result;
}

export async function getTableData(tableName: string) {
  const allowed = new Set([...appTables, ...authTables]);
  if (!allowed.has(tableName)) throw new Error('Table not allowed');
  const info = await db.execute(`PRAGMA table_info(${tableName})`);
  const columns = (info?.rows ?? []).map((row: any) => String(row?.name ?? ''));
  const data = await db.execute(`SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT 100`);
  return { columns, rows: data?.rows ?? [] };
}

// ── BRIX AI Resilient Database Compatibility Polyfill (query, all, get, run, prepare) ──
function wrapDbClient(client) {
  if (!client || typeof client.execute !== 'function' || client.__brix_wrapped) return client;
  try {
    Object.defineProperty(client, '__brix_wrapped', { value: true, enumerable: false, configurable: true, writable: true });
  } catch { client.__brix_wrapped = true; }
  const origExec = client.execute.bind(client);

  const executeNormalized = async (sqlOrObj, args) => {
    let stmt;
    if (typeof sqlOrObj === 'string') {
      stmt = { sql: sqlOrObj, args: Array.isArray(args) ? args : args !== undefined ? [args] : [] };
    } else if (sqlOrObj && typeof sqlOrObj === 'object') {
      stmt = {
        sql: sqlOrObj.sql || sqlOrObj.text || '',
        args: Array.isArray(sqlOrObj.args) ? sqlOrObj.args : Array.isArray(sqlOrObj.values) ? sqlOrObj.values : [],
      };
    } else {
      stmt = { sql: String(sqlOrObj || ''), args: [] };
    }
    return await origExec(stmt);
  };

  const queryFn = async (sqlOrObj, args) => {
    const res = await executeNormalized(sqlOrObj, args);
    const rows = res && res.rows ? [...res.rows] : [];
    try {
      Object.defineProperties(rows, {
        rows: { value: rows, enumerable: false, writable: true },
        columns: { value: res && res.columns ? res.columns : [], enumerable: false, writable: true },
        rowsAffected: { value: res && res.rowsAffected !== undefined ? res.rowsAffected : 0, enumerable: false, writable: true },
        lastInsertRowid: { value: res && res.lastInsertRowid !== undefined ? res.lastInsertRowid : null, enumerable: false, writable: true },
        toJSON: { value: () => rows, enumerable: false, writable: true },
      });
    } catch {}
    return rows;
  };

  const queryProxy = new Proxy(queryFn, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && !(prop in target)) {
        const tableName = prop;
        return {
          findMany: async () => queryFn('SELECT * FROM "' + tableName + '"'),
          findFirst: async () => {
            const rows = await queryFn('SELECT * FROM "' + tableName + '" LIMIT 1');
            return rows && rows.length > 0 ? rows[0] : null;
          },
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  if (!client.query) client.query = queryProxy;
  if (!client.all) client.all = async (sqlOrObj, args) => {
    const res = await executeNormalized(sqlOrObj, args);
    return res && res.rows ? [...res.rows] : [];
  };
  if (!client.get) client.get = async (sqlOrObj, args) => {
    const res = await executeNormalized(sqlOrObj, args);
    return res && res.rows && res.rows.length > 0 ? res.rows[0] : null;
  };
  if (!client.run) client.run = async (sqlOrObj, args) => executeNormalized(sqlOrObj, args);
  if (!client.exec) client.exec = async (sql) => {
    if (typeof client.executeMultiple === 'function') return await client.executeMultiple(sql);
    return await origExec(sql);
  };
  if (!client.prepare) {
    client.prepare = (sql) => ({
      all: async (...args) => {
        const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args.flat();
        const res = await origExec({ sql, args: flat });
        return res && res.rows ? [...res.rows] : [];
      },
      get: async (...args) => {
        const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args.flat();
        const res = await origExec({ sql, args: flat });
        return res && res.rows && res.rows.length > 0 ? res.rows[0] : null;
      },
      run: async (...args) => {
        const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args.flat();
        return await origExec({ sql, args: flat });
      },
    });
  }
  return client;
}

// Auto-wrap database client instances
if (typeof db !== 'undefined') { wrapDbClient(db); }
if (typeof client !== 'undefined') { wrapDbClient(client); }
