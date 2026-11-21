import { createClient, type Client } from '@libsql/client';

export const db: Client = createClient({ url: 'file:local.db' });
export default db;

const tableStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    image TEXT,
    role TEXT DEFAULT 'customer',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    expiresAt INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    collection TEXT,
    price REAL NOT NULL,
    compareAtPrice REAL,
    currency TEXT DEFAULT 'INR',
    stock INTEGER NOT NULL DEFAULT 0,
    rating REAL,
    reviewCount INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    images TEXT NOT NULL,
    variants TEXT,
    tags TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    authorName TEXT NOT NULL,
    authorAvatarUrl TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    verifiedPurchase INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    userId TEXT,
    fullName TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postalCode TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT NOT NULL,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending',
    shippingAddress TEXT NOT NULL,
    billingAddress TEXT,
    notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT NOT NULL,
    size TEXT,
    color TEXT,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
  )`
];

const seedProducts = [
  {
    id: 'prod-001',
    slug: 'ivory-atelier-trench',
    name: 'Ivory Atelier Trench',
    description: 'A fluid, tailored trench in a luminous ivory finish with a sculpted shoulder and restrained gold hardware.',
    category: 'Outerwear',
    collection: 'Resort 2026',
    price: 18990,
    compareAtPrice: 22990,
    currency: 'INR',
    stock: 8,
    rating: 4.9,
    reviewCount: 24,
    featured: 1,
    images: [{ src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85', alt: 'Ivory trench coat editorial fashion image' }],
    variants: [{ id: 'v1', label: 'S', sku: 'IVT-S', stock: 2 }, { id: 'v2', label: 'M', sku: 'IVT-M', stock: 4 }, { id: 'v3', label: 'L', sku: 'IVT-L', stock: 2 }],
    tags: ['editorial', 'tailored', 'ivory']
  },
  {
    id: 'prod-002',
    slug: 'charcoal-silk-column-dress',
    name: 'Charcoal Silk Column Dress',
    description: 'A floor-skimming silk column dress with a clean neckline and a liquid drape designed for evening movement.',
    category: 'Dresses',
    collection: 'Nocturne',
    price: 15990,
    compareAtPrice: 18990,
    currency: 'INR',
    stock: 6,
    rating: 4.8,
    reviewCount: 18,
    featured: 1,
    images: [{ src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85', alt: 'Charcoal dress editorial fashion image' }],
    variants: [{ id: 'v4', label: 'XS', sku: 'CSD-XS', stock: 1 }, { id: 'v5', label: 'S', sku: 'CSD-S', stock: 3 }, { id: 'v6', label: 'M', sku: 'CSD-M', stock: 2 }],
    tags: ['evening', 'silk', 'minimal']
  },
  {
    id: 'prod-003',
    slug: 'gold-thread-pleated-skirt',
    name: 'Gold Thread Pleated Skirt',
    description: 'A sharp pleated skirt with a subtle metallic thread that catches light without breaking the palette.',
    category: 'Skirts',
    collection: 'Archive Gold',
    price: 10990,
    compareAtPrice: 12990,
    currency: 'INR',
    stock: 10,
    rating: 4.7,
    reviewCount: 12,
    featured: 0,
    images: [{ src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85', alt: 'Pleated skirt editorial fashion image' }],
    variants: [{ id: 'v7', label: 'S', sku: 'GTS-S', stock: 4 }, { id: 'v8', label: 'M', sku: 'GTS-M', stock: 4 }, { id: 'v9', label: 'L', sku: 'GTS-L', stock: 2 }],
    tags: ['pleated', 'gold', 'tailored']
  },
  {
    id: 'prod-004',
    slug: 'crimson-signature-blazer',
    name: 'Crimson Signature Blazer',
    description: 'A sharply cut blazer in deep crimson with a longline silhouette and a precise, modern shoulder.',
    category: 'Blazers',
    collection: 'Signature',
    price: 19990,
    compareAtPrice: 23990,
    currency: 'INR',
    stock: 5,
    rating: 4.9,
    reviewCount: 31,
    featured: 1,
    images: [{ src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80', alt: 'Crimson blazer editorial fashion image' }],
    variants: [{ id: 'v10', label: 'S', sku: 'CSB-S', stock: 2 }, { id: 'v11', label: 'M', sku: 'CSB-M', stock: 2 }, { id: 'v12', label: 'L', sku: 'CSB-L', stock: 1 }],
    tags: ['blazer', 'crimson', 'structured']
  },
  {
    id: 'prod-005',
    slug: 'ivory-satin-blouse',
    name: 'Ivory Satin Blouse',
    description: 'A softly luminous satin blouse with a relaxed collar and a refined, editorial finish.',
    category: 'Tops',
    collection: 'Studio Light',
    price: 7990,
    compareAtPrice: 9990,
    currency: 'INR',
    stock: 14,
    rating: 4.6,
    reviewCount: 9,
    featured: 0,
    images: [{ src: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80', alt: 'Ivory blouse editorial fashion image' }],
    variants: [{ id: 'v13', label: 'XS', sku: 'ISB-XS', stock: 3 }, { id: 'v14', label: 'S', sku: 'ISB-S', stock: 6 }, { id: 'v15', label: 'M', sku: 'ISB-M', stock: 5 }],
    tags: ['satin', 'ivory', 'studio']
  },
  {
    id: 'prod-006',
    slug: 'black-veil-evening-gown',
    name: 'Black Veil Evening Gown',
    description: 'A dramatic evening gown with a fluid black veil overlay and a sculpted, elongated silhouette.',
    category: 'Evening',
    collection: 'After Dark',
    price: 24990,
    compareAtPrice: 28990,
    currency: 'INR',
    stock: 4,
    rating: 5,
    reviewCount: 16,
    featured: 1,
    images: [{ src: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', alt: 'Black evening gown editorial fashion image' }],
    variants: [{ id: 'v16', label: 'S', sku: 'BVG-S', stock: 2 }, { id: 'v17', label: 'M', sku: 'BVG-M', stock: 1 }, { id: 'v18', label: 'L', sku: 'BVG-L', stock: 1 }],
    tags: ['evening', 'black', 'veil']
  }
];

const tableMeta = {
  users: ['id', 'name', 'email', 'image', 'role', 'createdAt'],
  sessions: ['id', 'userId', 'expiresAt', 'token', 'createdAt'],
  accounts: ['id', 'userId', 'provider', 'providerAccountId', 'accessToken', 'refreshToken', 'idToken', 'expiresAt', 'createdAt'],
  verifications: ['id', 'identifier', 'token', 'expiresAt', 'createdAt'],
  products: ['id', 'slug', 'name', 'description', 'category', 'collection', 'price', 'compareAtPrice', 'currency', 'stock', 'rating', 'reviewCount', 'featured', 'images', 'variants', 'tags', 'createdAt', 'updatedAt'],
  reviews: ['id', 'productId', 'authorName', 'authorAvatarUrl', 'rating', 'title', 'body', 'verifiedPurchase', 'createdAt'],
  addresses: ['id', 'userId', 'fullName', 'line1', 'line2', 'city', 'state', 'postalCode', 'country', 'phone', 'createdAt'],
  carts: ['id', 'userId', 'items', 'updatedAt'],
  orders: ['id', 'userId', 'items', 'subtotal', 'shipping', 'tax', 'total', 'currency', 'status', 'shippingAddress', 'billingAddress', 'notes', 'createdAt', 'updatedAt'],
  order_items: ['id', 'orderId', 'productId', 'name', 'price', 'quantity', 'image', 'size', 'color']
} as const;

export async function initDb() {
  for (const statement of tableStatements) await db.execute(statement);
  for (const product of seedProducts) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO products (id, slug, name, description, category, collection, price, compareAtPrice, currency, stock, rating, reviewCount, featured, images, variants, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.id, product.slug, product.name, product.description ?? null, product.category, product.collection ?? null, product.price,
        product.compareAtPrice ?? null, product.currency ?? 'INR', product.stock, product.rating ?? null, product.reviewCount ?? 0,
        product.featured ?? 0, JSON.stringify(product.images ?? []), JSON.stringify(product.variants ?? []), JSON.stringify(product.tags ?? [])
      ]
    });
  }
  return db;
}

export async function inspectTables() {
  return Object.keys(tableMeta);
}

export async function getTableData(tableName: string) {
  const allowed = Object.keys(tableMeta);
  if (!allowed.includes(tableName)) return { table: tableName, columns: [], rows: [] };
  const result = await db.execute(`SELECT * FROM ${tableName} ORDER BY createdAt DESC`);
  return { table: tableName, columns: tableMeta[tableName as keyof typeof tableMeta], rows: result.rows ?? [] };
}