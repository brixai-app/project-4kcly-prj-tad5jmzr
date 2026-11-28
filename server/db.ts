import { createClient, type Client } from '@libsql/client';
import type { Product, Review, Order } from '../src/types';

type TableName = 'products' | 'reviews' | 'orders' | 'user' | 'session' | 'account' | 'verification';
type Row = Record<string, unknown>;

const dbUrl = 'file:local.db';
export const db: Client = createClient({ url: dbUrl });
export default db;

const allowedTables = new Set<TableName>(['products', 'reviews', 'orders', 'user', 'session', 'account', 'verification']);

const seedProducts: Product[] = [
  { id: 'prod_1', slug: 'atelier-wool-coat', name: 'Atelier Wool Coat', category: 'Outerwear', price: 28900, currency: 'INR', description: 'Double-faced wool coat with a sculpted shoulder and clean concealed closure.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85', gallery: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85'], sizes: ['XS', 'S', 'M', 'L'], colors: ['Oat', 'Espresso'], material: 'Virgin wool', inStock: true, featured: true, rating: 4.9, reviewCount: 18 },
  { id: 'prod_2', slug: 'silk-column-dress', name: 'Silk Column Dress', category: 'Dresses', price: 21900, currency: 'INR', description: 'Fluid silk column dress with a soft drape and elongated silhouette.', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'], sizes: ['XS', 'S', 'M'], colors: ['Ivory', 'Black'], material: 'Silk crepe', inStock: true, featured: true, rating: 4.8, reviewCount: 12 },
  { id: 'prod_3', slug: 'tailored-linen-blazer', name: 'Tailored Linen Blazer', category: 'Tailoring', price: 24900, currency: 'INR', description: 'Relaxed tailoring in breathable linen with a precise, narrow lapel.', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'], sizes: ['S', 'M', 'L'], colors: ['Stone', 'Charcoal'], material: 'Linen blend', inStock: true, featured: false, rating: 4.7, reviewCount: 9 },
  { id: 'prod_4', slug: 'cashmere-rib-knit', name: 'Cashmere Rib Knit', category: 'Knitwear', price: 15900, currency: 'INR', description: 'Fine-rib cashmere knit with a close fit and feather-soft hand feel.', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80', gallery: [], sizes: ['XS', 'S', 'M', 'L'], colors: ['Sand', 'Ink'], material: 'Cashmere', inStock: true, featured: false, rating: 4.9, reviewCount: 21 },
  { id: 'prod_5', slug: 'leather-ankle-boot', name: 'Leather Ankle Boot', category: 'Footwear', price: 26900, currency: 'INR', description: 'Polished leather ankle boot with a squared toe and low stacked heel.', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85', gallery: [], sizes: ['36', '37', '38', '39', '40'], colors: ['Black'], material: 'Leather', inStock: true, featured: false, rating: 4.6, reviewCount: 14 },
];

const tableSql: Record<TableName, string> = {
  products: `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
    price INTEGER NOT NULL, currency TEXT DEFAULT 'INR', description TEXT, image TEXT NOT NULL,
    gallery TEXT, sizes TEXT, colors TEXT, material TEXT, inStock INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0, rating REAL, reviewCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  reviews: `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, productId TEXT NOT NULL, userId TEXT, userName TEXT NOT NULL,
    rating INTEGER NOT NULL, title TEXT, body TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT,
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  )`,
  orders: `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, userId TEXT, email TEXT NOT NULL, items TEXT NOT NULL,
    subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, tax INTEGER DEFAULT 0, total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', shippingAddress TEXT, notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  user: `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, image TEXT, phone TEXT, address TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  session: `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, expiresAt INTEGER NOT NULL, token TEXT UNIQUE NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  account: `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, providerId TEXT NOT NULL, accountId TEXT NOT NULL,
    accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt INTEGER, refreshTokenExpiresAt INTEGER,
    scope TEXT, password TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  verification: `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
};

const toJson = (value: unknown) => JSON.stringify(value ?? null);
const fromJson = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string' || !value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

const normalizeProduct = (row: Row): Product => ({
  id: String(row?.id ?? ''),
  slug: String(row?.slug ?? ''),
  name: String(row?.name ?? ''),
  category: String(row?.category ?? ''),
  price: Number(row?.price ?? 0),
  currency: String(row?.currency ?? 'INR'),
  description: typeof row?.description === 'string' ? row.description : undefined,
  image: String(row?.image ?? ''),
  gallery: fromJson<string[]>(row?.gallery, []),
  sizes: fromJson<string[]>(row?.sizes, []),
  colors: fromJson<string[]>(row?.colors, []),
  material: typeof row?.material === 'string' ? row.material : undefined,
  inStock: Boolean(row?.inStock ?? 1),
  featured: Boolean(row?.featured ?? 0),
  rating: typeof row?.rating === 'number' ? row.rating : undefined,
  reviewCount: typeof row?.reviewCount === 'number' ? row.reviewCount : undefined,
  createdAt: typeof row?.createdAt === 'string' ? row.createdAt : undefined,
  updatedAt: typeof row?.updatedAt === 'string' ? row.updatedAt : undefined,
});

export async function initDb(): Promise<void> {
  for (const [name, sql] of Object.entries(tableSql) as [TableName, string][]) {
    if (!allowedTables.has(name)) throw new Error(`Invalid table name: ${name}`);
    await db.execute(sql);
  }
  const existing = await db.execute(`SELECT COUNT(*) AS count FROM products`);
  const count = Number(existing.rows?.[0]?.count ?? 0);
  if (count > 0) return;
  for (const product of seedProducts) {
    await db.execute({
      sql: `INSERT INTO products (id, slug, name, category, price, currency, description, image, gallery, sizes, colors, material, inStock, featured, rating, reviewCount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.id, product.slug, product.name, product.category, product.price, product.currency ?? 'INR',
        product.description ?? null, product.image, toJson(product.gallery ?? []), toJson(product.sizes ?? []),
        toJson(product.colors ?? []), product.material ?? null, product.inStock ? 1 : 0, product.featured ? 1 : 0,
        product.rating ?? null, product.reviewCount ?? 0,
      ],
    });
  }
}

export async function inspectTables(): Promise<string[]> {
  const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
  return (result.rows ?? []).map((row) => String(row?.name ?? '')).filter(Boolean);
}

export async function getTableData(table: string): Promise<Row[]> {
  if (!allowedTables.has(table as TableName)) throw new Error(`Invalid table name: ${table}`);
  const result = await db.execute(`SELECT * FROM ${table}`);
  return result.rows ?? [];
}

export async function getProducts(): Promise<Product[]> {
  const result = await db.execute(`SELECT * FROM products ORDER BY featured DESC, createdAt DESC`);
  return (result.rows ?? []).map(normalizeProduct);
}

export async function getReviews(productId?: string): Promise<Review[]> {
  const sql = productId ? `SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC` : `SELECT * FROM reviews ORDER BY createdAt DESC`;
  const result = await db.execute(productId ? { sql, args: [productId] } : sql);
  return (result.rows ?? []).map((row) => ({
    id: String(row?.id ?? ''),
    productId: String(row?.productId ?? ''),
    userId: typeof row?.userId === 'string' ? row.userId : undefined,
    userName: String(row?.userName ?? ''),
    rating: Number(row?.rating ?? 0),
    title: typeof row?.title === 'string' ? row.title : undefined,
    body: String(row?.body ?? ''),
    createdAt: String(row?.createdAt ?? ''),
    updatedAt: typeof row?.updatedAt === 'string' ? row.updatedAt : undefined,
  }));
}

export async function getOrders(email?: string): Promise<Order[]> {
  const sql = email ? `SELECT * FROM orders WHERE email = ? ORDER BY createdAt DESC` : `SELECT * FROM orders ORDER BY createdAt DESC`;
  const result = await db.execute(email ? { sql, args: [email] } : sql);
  return (result.rows ?? []).map((row) => ({
    id: String(row?.id ?? ''),
    userId: typeof row?.userId === 'string' ? row.userId : undefined,
    email: String(row?.email ?? ''),
    items: fromJson(row?.items, []),
    subtotal: Number(row?.subtotal ?? 0),
    shipping: Number(row?.shipping ?? 0),
    tax: typeof row?.tax === 'number' ? row.tax : undefined,
    total: Number(row?.total ?? 0),
    status: (row?.status as Order['status']) ?? 'pending',
    shippingAddress: typeof row?.shippingAddress === 'string' ? row.shippingAddress : undefined,
    notes: typeof row?.notes === 'string' ? row.notes : undefined,
    createdAt: String(row?.createdAt ?? ''),
    updatedAt: typeof row?.updatedAt === 'string' ? row.updatedAt : undefined,
  }));
}