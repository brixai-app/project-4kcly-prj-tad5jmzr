import { createClient } from "@libsql/client";
import type { Product, Review, Order, UserProfile } from "../src/types";

export const db = createClient({ url: "file:local.db" });
export default db;

const products: Product[] = [
  { id: "p1", slug: "atelier-wool-coat", name: "Atelier Wool Coat", description: "Tailored longline wool coat with a sharp shoulder and fluid drape.", price: 24900, currency: "INR", category: "Outerwear", collection: "Winter Atelier", material: "Wool blend", color: "Charcoal", sizes: ["XS", "S", "M", "L"], images: [{ url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85", alt: "Model in a tailored wool coat" }], featured: true, inStock: true, rating: 4.8, reviewCount: 18 },
  { id: "p2", slug: "silk-column-dress", name: "Silk Column Dress", description: "Bias-cut silk column dress with a clean neckline and subtle sheen.", price: 18900, currency: "INR", category: "Dresses", collection: "Evening Edit", material: "Silk", color: "Ivory", sizes: ["XS", "S", "M"], images: [{ url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85", alt: "Model in a silk dress" }], featured: true, inStock: true, rating: 4.9, reviewCount: 24 },
  { id: "p3", slug: "tailored-trouser", name: "Tailored Trouser", description: "High-rise tailored trouser with a straight leg and pressed crease.", price: 12900, currency: "INR", category: "Trousers", collection: "Core Tailoring", material: "Virgin wool", color: "Stone", sizes: ["S", "M", "L", "XL"], images: [{ url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85", alt: "Tailored trousers on a model" }], featured: false, inStock: true, rating: 4.7, reviewCount: 12 },
  { id: "p4", slug: "crimson-knit-top", name: "Crimson Knit Top", description: "Fine-gauge knit top with a close fit and refined rib finish.", price: 8900, currency: "INR", category: "Knitwear", collection: "Signature Red", material: "Merino wool", color: "Crimson", sizes: ["XS", "S", "M", "L"], images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", alt: "Knit top editorial portrait" }], featured: false, inStock: true, rating: 4.6, reviewCount: 9 },
  { id: "p5", slug: "leather-shoulder-bag", name: "Leather Shoulder Bag", description: "Structured leather shoulder bag with a minimal clasp and soft lining.", price: 15900, currency: "INR", category: "Accessories", collection: "Objects", material: "Leather", color: "Black", sizes: ["One Size"], images: [{ url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80", alt: "Leather shoulder bag on neutral background" }], featured: true, inStock: true, rating: 4.8, reviewCount: 31 },
  { id: "p6", slug: "minimal-satin-shirt", name: "Minimal Satin Shirt", description: "Relaxed satin shirt with a soft handfeel and concealed placket.", price: 10900, currency: "INR", category: "Shirts", collection: "Studio Essentials", material: "Satin", color: "Pearl", sizes: ["S", "M", "L"], images: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Satin shirt editorial image" }], featured: false, inStock: true, rating: 4.5, reviewCount: 14 }
];

const reviews: Review[] = [
  { id: "r1", productId: "p1", userId: "u1", userName: "Aanya", rating: 5, title: "Exceptional tailoring", body: "The cut is immaculate and the fabric feels substantial without being heavy.", createdAt: new Date().toISOString() },
  { id: "r2", productId: "p2", userId: "u2", userName: "Meera", rating: 5, title: "Elegant and fluid", body: "The silhouette is clean and the drape is exactly what I wanted for evening wear.", createdAt: new Date().toISOString() }
];

const users: UserProfile[] = [
  { id: "u1", name: "Aanya Rao", email: "aanya@example.com", role: "customer" },
  { id: "u2", name: "Meera Kapoor", email: "meera@example.com", role: "customer" },
  { id: "admin", name: "NDDN Admin", email: "admin@nddn.store", role: "admin" }
];

const orders: Order[] = [];

const schema = [
  `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, price INTEGER NOT NULL, currency TEXT DEFAULT 'INR', category TEXT NOT NULL, collection TEXT, material TEXT, color TEXT, sizes TEXT, images TEXT NOT NULL, featured INTEGER DEFAULT 0, inStock INTEGER DEFAULT 1, rating REAL DEFAULT 0, reviewCount INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, productId TEXT NOT NULL, userId TEXT NOT NULL, userName TEXT NOT NULL, rating INTEGER NOT NULL, title TEXT, body TEXT NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, userId TEXT, items TEXT NOT NULL, shippingAddress TEXT NOT NULL, subtotal INTEGER NOT NULL, shippingFee INTEGER NOT NULL, tax INTEGER NOT NULL, total INTEGER NOT NULL, currency TEXT DEFAULT 'INR', status TEXT NOT NULL DEFAULT 'pending', paymentMethod TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER DEFAULT 0, image TEXT, phone TEXT, role TEXT DEFAULT 'customer', createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, expiresAt TEXT NOT NULL, token TEXT NOT NULL UNIQUE, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP, userId TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY, accountId TEXT NOT NULL, providerId TEXT NOT NULL, userId TEXT NOT NULL, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt TEXT, refreshTokenExpiresAt TEXT, scope TEXT, password TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt TEXT NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP)`
];

const seed = async () => {
  for (const statement of schema) await db.execute(statement);
  const existing = await db.execute(`SELECT COUNT(*) as count FROM products`);
  const count = Number(existing.rows?.[0]?.count ?? 0);
  if (count > 0) return;
  for (const p of products) await db.execute({ sql: `INSERT INTO products (id, slug, name, description, price, currency, category, collection, material, color, sizes, images, featured, inStock, rating, reviewCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [p.id, p.slug, p.name, p.description, p.price, p.currency ?? "INR", p.category, p.collection ?? null, p.material ?? null, p.color ?? null, JSON.stringify(p.sizes ?? []), JSON.stringify(p.images ?? []), p.featured ? 1 : 0, p.inStock === false ? 0 : 1, p.rating ?? 0, p.reviewCount ?? 0] });
  for (const u of users) await db.execute({ sql: `INSERT INTO user (id, name, email, image, phone, role) VALUES (?, ?, ?, ?, ?, ?)`, args: [u.id, u.name, u.email, u.avatarUrl ?? null, u.phone ?? null, u.role ?? "customer"] });
  for (const r of reviews) await db.execute({ sql: `INSERT INTO reviews (id, productId, userId, userName, rating, title, body) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [r.id, r.productId, r.userId, r.userName, r.rating, r.title ?? null, r.body] });
  for (const o of orders) await db.execute({ sql: `INSERT INTO orders (id, userId, items, shippingAddress, subtotal, shippingFee, tax, total, currency, status, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [o.id, o.userId ?? null, JSON.stringify(o.items ?? []), JSON.stringify(o.shippingAddress ?? {}), o.subtotal, o.shippingFee, o.tax, o.total, o.currency ?? "INR", o.status, o.paymentMethod ?? null] });
};

export async function initializeDatabase() { await seed(); return db; }

export async function inspectTables() {
  const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products','reviews','orders','user','session','account','verification') ORDER BY name`);
  return result.rows?.map((row) => String(row?.name ?? "")) ?? [];
}

export async function getTableData(table: string) {
  const allowed = new Set(["products", "reviews", "orders", "user", "session", "account", "verification"]);
  if (!allowed.has(table)) return [];
  const result = await db.execute(`SELECT * FROM ${table}`);
  return result.rows ?? [];
}

void initializeDatabase();