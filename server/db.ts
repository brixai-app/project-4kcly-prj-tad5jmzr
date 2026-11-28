import { createClient } from "@libsql/client";

export const db = createClient({ url: "file:local.db" });
export default db;

const products = [
  {
    id: "prod_1",
    slug: "atelier-tailored-coat",
    name: "Atelier Tailored Coat",
    description: "A sharply cut wool coat with a fluid drape and a clean, architectural shoulder.",
    category: "Outerwear",
    collection: "Winter Atelier",
    price: 18900,
    compareAtPrice: 22900,
    currency: "INR",
    images: [{ url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85", alt: "Tailored coat editorial look", order: 1 }],
    sizes: ["S", "M", "L"],
    colors: ["Charcoal", "Ivory"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "prod_2",
    slug: "silk-column-dress",
    name: "Silk Column Dress",
    description: "A minimal column silhouette in luminous silk with a restrained evening finish.",
    category: "Dresses",
    collection: "Evening Line",
    price: 22400,
    compareAtPrice: 25900,
    currency: "INR",
    images: [{ url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85", alt: "Silk dress editorial look", order: 1 }],
    sizes: ["XS", "S", "M"],
    colors: ["Black", "Bone"],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: "prod_3",
    slug: "structured-leather-bag",
    name: "Structured Leather Bag",
    description: "A compact leather carryall with a polished edge and precise hardware detailing.",
    category: "Accessories",
    collection: "Signature Objects",
    price: 14900,
    compareAtPrice: 16900,
    currency: "INR",
    images: [{ url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85", alt: "Leather bag editorial still life", order: 1 }],
    colors: ["Espresso", "Black"],
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 31,
  },
  {
    id: "prod_4",
    slug: "tailored-trouser",
    name: "Tailored Trouser",
    description: "A high-rise trouser with a long line, pressed crease, and refined movement.",
    category: "Trousers",
    collection: "Core Tailoring",
    price: 11900,
    compareAtPrice: 13900,
    currency: "INR",
    images: [{ url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80", alt: "Tailored trouser fashion image", order: 1 }],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Stone", "Black"],
    inStock: true,
    featured: false,
    rating: 4.6,
    reviewCount: 12,
  },
  {
    id: "prod_5",
    slug: "ribbed-knit-top",
    name: "Ribbed Knit Top",
    description: "A close-fitting knit top with a soft hand feel and a clean, versatile neckline.",
    category: "Knitwear",
    collection: "Daily Edit",
    price: 6900,
    compareAtPrice: 7900,
    currency: "INR",
    images: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Ribbed knit top editorial image", order: 1 }],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Cream", "Mocha"],
    inStock: true,
    featured: true,
    rating: 4.5,
    reviewCount: 9,
  },
];

const tables = [
  `create table if not exists products (
    id text primary key, slug text unique, name text not null, description text, category text not null, collection text,
    price integer not null, compareAtPrice integer, currency text default 'INR', images text not null, sizes text, colors text,
    inStock integer default 1, featured integer default 0, rating real, reviewCount integer default 0, createdAt text default current_timestamp, updatedAt text default current_timestamp
  )`,
  `create table if not exists reviews (
    id text primary key, productId text not null, userId text, userName text not null, rating integer not null, title text, body text not null, createdAt text not null
  )`,
  `create table if not exists cart_items (
    id text primary key, userId text, productId text not null, name text not null, image text, price integer not null, quantity integer not null, size text, color text
  )`,
  `create table if not exists orders (
    id text primary key, userId text not null, items text not null, subtotal integer not null, shipping integer not null, tax integer default 0, total integer not null,
    currency text default 'INR', status text not null, shippingAddress text not null, createdAt text not null, updatedAt text
  )`,
  `create table if not exists user (
    id text primary key, email text unique not null, name text, avatarUrl text, role text default 'customer', phone text, address text, createdAt text default current_timestamp, updatedAt text default current_timestamp
  )`,
  `create table if not exists session (id text primary key, userId text not null, expiresAt text not null, token text unique not null, createdAt text default current_timestamp, updatedAt text default current_timestamp)`,
  `create table if not exists account (id text primary key, userId text not null, providerId text not null, accountId text not null, accessToken text, refreshToken text, idToken text, createdAt text default current_timestamp, updatedAt text default current_timestamp)`,
  `create table if not exists verification (id text primary key, identifier text not null, value text not null, expiresAt text not null, createdAt text default current_timestamp, updatedAt text default current_timestamp)`,
];

export async function initializeDatabase() {
  for (const sql of tables) await db.execute(sql);
  const existing = await db.execute(`select count(*) as count from products`);
  if ((existing.rows?.[0]?.count ?? 0) === 0) {
    for (const p of products) {
      await db.execute({
        sql: `insert into products (id, slug, name, description, category, collection, price, compareAtPrice, currency, images, sizes, colors, inStock, featured, rating, reviewCount) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.slug, p.name, p.description ?? null, p.category, p.collection ?? null, p.price, p.compareAtPrice ?? null, p.currency ?? "INR", JSON.stringify(p.images ?? []), JSON.stringify(p.sizes ?? []), JSON.stringify(p.colors ?? []), p.inStock ? 1 : 0, p.featured ? 1 : 0, p.rating ?? null, p.reviewCount ?? 0],
      });
    }
  }
  return { success: true };
}

export async function inspectTables() {
  const names = ["products", "reviews", "cart_items", "orders", "user", "session", "account", "verification"];
  const result: Record<string, { exists: boolean; count: number }> = {};
  for (const name of names) {
    const rows = await db.execute(`select count(*) as count from sqlite_master where type='table' and name='${name}'`);
    const countRows = await db.execute(`select count(*) as count from ${name}`);
    result[name] = { exists: (rows.rows?.[0]?.count ?? 0) > 0, count: countRows.rows?.[0]?.count ?? 0 };
  }
  return result;
}

export async function getTableData(tableName: string) {
  const allowlist = new Set(["products", "reviews", "cart_items", "orders", "user", "session", "account", "verification"]);
  if (!allowlist.has(tableName)) return { columns: [], rows: [] };
  const info = await db.execute(`pragma table_info(${tableName})`);
  const rows = await db.execute(`select * from ${tableName}`);
  return {
    columns: info.rows?.map((r: any) => r?.name ?? "") ?? [],
    rows: rows.rows ?? [],
  };
}