import { createClient } from '@libsql/client';

const db = createClient({ url: 'file:local.db' });

const productSeed = [
  {
    id: 'prod_001',
    name: 'Noir Atelier Coat',
    slug: 'noir-atelier-coat',
    description: 'A sculptural wool coat cut with a long line and quiet authority.',
    price: 18900,
    compareAtPrice: 22900,
    currency: 'INR',
    category: 'Outerwear',
    collection: 'Atelier Noir',
    material: 'Virgin wool',
    color: 'Charcoal',
    sizes: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
    featured: 1,
    inStock: 1,
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: 'prod_002',
    name: 'Stone Silk Shirt',
    slug: 'stone-silk-shirt',
    description: 'Fluid silk with a restrained sheen, tailored for day-to-evening dressing.',
    price: 12400,
    compareAtPrice: 14900,
    currency: 'INR',
    category: 'Shirts',
    collection: 'Stone Edit',
    material: 'Mulberry silk',
    color: 'Ivory',
    sizes: ['XS', 'S', 'M'],
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    featured: 1,
    inStock: 1,
    rating: 4.8,
    reviewCount: 12,
  },
  {
    id: 'prod_003',
    name: 'Crimson Tailored Trouser',
    slug: 'crimson-tailored-trouser',
    description: 'Precision tailoring with a deep crimson finish and a clean, elongated break.',
    price: 9800,
    compareAtPrice: 11900,
    currency: 'INR',
    category: 'Trousers',
    collection: 'Runway Tailoring',
    material: 'Wool blend',
    color: 'Crimson',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
    featured: 0,
    inStock: 1,
    rating: 4.7,
    reviewCount: 9,
  },
  {
    id: 'prod_004',
    name: 'Gallery Knit Dress',
    slug: 'gallery-knit-dress',
    description: 'A refined knit silhouette with soft structure and a gallery-ready drape.',
    price: 15600,
    compareAtPrice: 17900,
    currency: 'INR',
    category: 'Dresses',
    collection: 'Gallery Line',
    material: 'Merino knit',
    color: 'Stone',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    featured: 0,
    inStock: 1,
    rating: 4.9,
    reviewCount: 14,
  },
  {
    id: 'prod_005',
    name: 'Monograph Leather Bag',
    slug: 'monograph-leather-bag',
    description: 'A compact leather bag with architectural lines and polished hardware.',
    price: 11200,
    compareAtPrice: 12900,
    currency: 'INR',
    category: 'Accessories',
    collection: 'Monograph',
    material: 'Full-grain leather',
    color: 'Black',
    sizes: ['One Size'],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    featured: 1,
    inStock: 1,
    rating: 4.8,
    reviewCount: 21,
  },
];

const tables = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    price INTEGER NOT NULL,
    compareAtPrice INTEGER,
    currency TEXT DEFAULT 'INR',
    category TEXT,
    collection TEXT,
    material TEXT,
    color TEXT,
    sizes TEXT,
    images TEXT,
    image TEXT,
    featured INTEGER DEFAULT 0,
    inStock INTEGER DEFAULT 1,
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    userId TEXT,
    userName TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    body TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    paymentStatus TEXT DEFAULT 'unpaid',
    shippingAddress TEXT,
    billingAddress TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    image TEXT,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    bio TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
];

export async function initializeDatabase() {
  for (const statement of tables) await db.execute(statement);
  const existing = await db.execute('SELECT COUNT(*) as count FROM products');
  const count = Number(existing?.rows?.[0]?.count ?? 0);
  if (count === 0) {
    for (const product of productSeed) {
      await db.execute({
        sql: `INSERT INTO products (id, name, slug, description, price, compareAtPrice, currency, category, collection, material, color, sizes, image, featured, inStock, rating, reviewCount)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          product.id,
          product.name,
          product.slug,
          product.description,
          product.price,
          product.compareAtPrice,
          product.currency,
          product.category,
          product.collection,
          product.material,
          product.color,
          JSON.stringify(product.sizes ?? []),
          product.image,
          product.featured ?? 0,
          product.inStock ?? 1,
          product.rating ?? 0,
          product.reviewCount ?? 0,
        ],
      });
    }
  }
  return db;
}

export async function inspectTables() {
  const names = ['products', 'reviews', 'orders', 'user', 'session', 'account', 'verification'];
  const results = [];
  for (const name of names) {
    const row = await db.execute(`SELECT COUNT(*) as count FROM ${name}`);
    results.push({
      name,
      count: Number(row?.rows?.[0]?.count ?? 0),
      isAuth: ['user', 'session', 'account', 'verification'].includes(name),
    });
  }
  return results;
}

const allowedTables = new Set(['products', 'reviews', 'orders', 'user', 'session', 'account', 'verification']);

export async function getTableData(tableName = 'products') {
  const name = allowedTables.has(tableName) ? tableName : 'products';
  const columnsResult = await db.execute(`PRAGMA table_info(${name})`);
  const dataResult = await db.execute(`SELECT * FROM ${name} LIMIT 200`);
  return {
    columns: (columnsResult?.rows ?? []).map((row) => row?.name ?? ''),
    rows: dataResult?.rows ?? [],
  };
}

await initializeDatabase();

export { db };
export default db;