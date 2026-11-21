import { createClient } from "@libsql/client";

export const db = createClient({ url: "file:local.db" });
export default db;

const productSeed = [
  {
    id: "prod-1",
    slug: "ivory-tailored-coat",
    name: "Ivory Tailored Coat",
    description: "A sculpted outer layer in brushed wool with a clean shoulder and elongated line.",
    category: "Outerwear",
    collection: "Winter Atelier",
    price: 18900,
    compareAtPrice: 22900,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"],
    variants: [
      { id: "v1", name: "S", sku: "IVC-S", price: 18900, stock: 4, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85" },
      { id: "v2", name: "M", sku: "IVC-M", price: 18900, stock: 6, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85" },
    ],
    featured: 1,
    inStock: 1,
    tags: ["tailored", "wool", "editorial"],
  },
  {
    id: "prod-2",
    slug: "charcoal-drape-shirt",
    name: "Charcoal Drape Shirt",
    description: "Fluid cotton-silk shirting with a softened collar and asymmetric fall.",
    category: "Shirts",
    collection: "Core Wardrobe",
    price: 7900,
    compareAtPrice: 9400,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85"],
    variants: [
      { id: "v3", name: "M", sku: "CDS-M", price: 7900, stock: 8, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85" },
      { id: "v4", name: "L", sku: "CDS-L", price: 7900, stock: 5, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85" },
    ],
    featured: 1,
    inStock: 1,
    tags: ["shirt", "silk", "minimal"],
  },
  {
    id: "prod-3",
    slug: "taupe-wide-leg-trouser",
    name: "Taupe Wide-Leg Trouser",
    description: "High-rise tailoring with a relaxed drape and precise pressed crease.",
    category: "Trousers",
    collection: "Core Wardrobe",
    price: 11200,
    compareAtPrice: 13200,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85"],
    variants: [
      { id: "v5", name: "30", sku: "TWT-30", price: 11200, stock: 7, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85" },
      { id: "v6", name: "32", sku: "TWT-32", price: 11200, stock: 3, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85" },
    ],
    featured: 0,
    inStock: 1,
    tags: ["tailoring", "wide-leg", "neutral"],
  },
  {
    id: "prod-4",
    slug: "crimson-satin-slip-dress",
    name: "Crimson Satin Slip Dress",
    description: "A liquid satin silhouette cut close to the body with a luminous finish.",
    category: "Dresses",
    collection: "Evening Edit",
    price: 15400,
    compareAtPrice: 17900,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v7", name: "S", sku: "CSD-S", price: 15400, stock: 2, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80" },
      { id: "v8", name: "M", sku: "CSD-M", price: 15400, stock: 4, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80" },
    ],
    featured: 1,
    inStock: 1,
    tags: ["satin", "evening", "crimson"],
  },
  {
    id: "prod-5",
    slug: "stone-knit-polo",
    name: "Stone Knit Polo",
    description: "A compact knit polo with a refined hand feel and softly structured body.",
    category: "Knitwear",
    collection: "Transitional",
    price: 8600,
    compareAtPrice: 9900,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v9", name: "M", sku: "SKP-M", price: 8600, stock: 9, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80" },
      { id: "v10", name: "L", sku: "SKP-L", price: 8600, stock: 6, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80" },
    ],
    featured: 0,
    inStock: 1,
    tags: ["knit", "polo", "stone"],
  },
  {
    id: "prod-6",
    slug: "black-leather-shoulder-bag",
    name: "Black Leather Shoulder Bag",
    description: "A compact leather carry with a sharp profile and polished hardware.",
    category: "Accessories",
    collection: "Signature Objects",
    price: 22100,
    compareAtPrice: 24900,
    currency: "INR",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v11", name: "One Size", sku: "BLSB-OS", price: 22100, stock: 5, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80" },
    ],
    featured: 1,
    inStock: 1,
    tags: ["leather", "bag", "signature"],
  },
];

const tableNames = ["products", "orders", "user", "session", "account", "verification"];

const schema = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    collection TEXT,
    price INTEGER NOT NULL,
    compareAtPrice INTEGER,
    currency TEXT DEFAULT 'INR',
    images TEXT NOT NULL,
    variants TEXT,
    featured INTEGER DEFAULT 0,
    inStock INTEGER DEFAULT 1,
    tags TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL CHECK(status IN ('pending','paid','fulfilled','cancelled')),
    shippingAddress TEXT,
    billingAddress TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatarUrl TEXT,
    role TEXT DEFAULT 'customer',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(providerId, accountId)
  )`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
];

export async function initializeDatabase() {
  for (const statement of schema) await db.execute(statement);
  const existing = await db.execute(`SELECT COUNT(*) AS count FROM products`);
  const count = Number(existing.rows?.[0]?.count ?? 0);
  if (count === 0) {
    for (const product of productSeed) {
      await db.execute({
        sql: `INSERT INTO products (id, slug, name, description, category, collection, price, compareAtPrice, currency, images, variants, featured, inStock, tags)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          product.id,
          product.slug,
          product.name,
          product.description ?? null,
          product.category ?? null,
          product.collection ?? null,
          product.price,
          product.compareAtPrice ?? null,
          product.currency ?? "INR",
          JSON.stringify(product.images ?? []),
          JSON.stringify(product.variants ?? []),
          product.featured ?? 0,
          product.inStock ?? 1,
          JSON.stringify(product.tags ?? []),
        ],
      });
    }
  }
  return true;
}

export async function inspectTables() {
  const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
  return result.rows?.map((row) => String(row?.name ?? "")).filter((name) => tableNames.includes(name)) ?? [];
}

export async function getTableData(tableName: string) {
  const safeTable = tableNames.includes(tableName) ? tableName : "";
  if (!safeTable) return [];
  const result = await db.execute(`SELECT * FROM ${safeTable}`);
  return result.rows ?? [];
}

void initializeDatabase();