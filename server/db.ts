import { createClient } from "@libsql/client";

export const db = createClient({ url: "file:local.db" });
export default db;

const productSeed = [
  {
    id: "prod_001",
    name: "Atelier Wool Coat",
    slug: "atelier-wool-coat",
    description: "A sharply tailored wool coat with a clean shoulder, fluid drape, and a deep crimson lining.",
    price: 24900,
    currency: "INR",
    category: { id: "cat_outerwear", name: "Outerwear", slug: "outerwear" },
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Stone", "Charcoal"],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: "prod_002",
    name: "Silk Bias Dress",
    slug: "silk-bias-dress",
    description: "A liquid silk dress cut on the bias for a close, elegant fall and a quiet evening sheen.",
    price: 18900,
    currency: "INR",
    category: { id: "cat_dresses", name: "Dresses", slug: "dresses" },
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["XS", "S", "M"],
    colors: ["Ivory", "Black"],
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: "prod_003",
    name: "Tailored Trousers",
    slug: "tailored-trousers",
    description: "High-rise trousers with a precise crease, softened waistband, and a long, lean silhouette.",
    price: 12900,
    currency: "INR",
    category: { id: "cat_bottoms", name: "Bottoms", slug: "bottoms" },
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Sand"],
    featured: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 14,
  },
  {
    id: "prod_004",
    name: "Minimal Knit Top",
    slug: "minimal-knit-top",
    description: "A refined knit top with a close neckline and a soft hand feel for layered dressing.",
    price: 7900,
    currency: "INR",
    category: { id: "cat_tops", name: "Tops", slug: "tops" },
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Bone", "Black"],
    featured: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 11,
  },
  {
    id: "prod_005",
    name: "Structured Shirt",
    slug: "structured-shirt",
    description: "A crisp shirt with a sculpted collar, elongated cuff, and a polished editorial finish.",
    price: 9900,
    currency: "INR",
    category: { id: "cat_shirts", name: "Shirts", slug: "shirts" },
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["S", "M", "L"],
    colors: ["White", "Stone"],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 22,
  },
  {
    id: "prod_006",
    name: "Leather Shoulder Bag",
    slug: "leather-shoulder-bag",
    description: "A compact leather shoulder bag with a clean profile, subtle hardware, and daily utility.",
    price: 15900,
    currency: "INR",
    category: { id: "cat_accessories", name: "Accessories", slug: "accessories" },
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["One Size"],
    colors: ["Black", "Espresso"],
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 16,
  },
];

const tables = [
  `create table if not exists categories (id text primary key, name text not null, slug text not null unique)`,
  `create table if not exists products (id text primary key, name text not null, slug text not null unique, description text not null, price integer not null, currency text not null, category_id text not null, category_name text not null, category_slug text not null, image text not null, gallery text, sizes text, colors text, featured integer default 0, in_stock integer default 1, rating real default 0, review_count integer default 0, created_at text default current_timestamp)`,
  `create table if not exists reviews (id text primary key, product_id text not null, author text not null, rating integer not null, title text, body text not null, created_at text not null)`,
  `create table if not exists orders (id text primary key, user_id text, email text not null, items text not null, subtotal integer not null, shipping integer not null, total integer not null, status text not null, created_at text not null)`,
  `create table if not exists user (id text primary key, name text, email text unique, email_verified integer default 0, image text, created_at text default current_timestamp, updated_at text default current_timestamp)`,
  `create table if not exists session (id text primary key, expires_at integer not null, token text not null unique, created_at text default current_timestamp, updated_at text default current_timestamp, ip_address text, user_agent text, user_id text not null)`,
  `create table if not exists account (id text primary key, account_id text not null, provider_id text not null, user_id text not null, access_token text, refresh_token text, id_token text, access_token_expires_at integer, refresh_token_expires_at integer, scope text, password text, created_at text default current_timestamp, updated_at text default current_timestamp)`,
  `create table if not exists verification (id text primary key, identifier text not null, value text not null, expires_at integer not null, created_at text default current_timestamp, updated_at text default current_timestamp)`,
];

export async function initializeDatabase() {
  for (const statement of tables) await db.execute(statement);
  const count = await db.execute(`select count(*) as count from products`);
  const existing = Number(count.rows?.[0]?.count ?? 0);
  if (existing > 0) return;
  for (const product of productSeed) {
    await db.execute({
      sql: `insert into categories (id, name, slug) values (?, ?, ?) on conflict(id) do update set name=excluded.name, slug=excluded.slug`,
      args: [product.category.id, product.category.name, product.category.slug],
    });
    await db.execute({
      sql: `insert into products (id, name, slug, description, price, currency, category_id, category_name, category_slug, image, gallery, sizes, colors, featured, in_stock, rating, review_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.id,
        product.name,
        product.slug,
        product.description,
        product.price,
        product.currency,
        product.category.id,
        product.category.name,
        product.category.slug,
        product.image,
        JSON.stringify(product.gallery ?? []),
        JSON.stringify(product.sizes ?? []),
        JSON.stringify(product.colors ?? []),
        product.featured ? 1 : 0,
        product.inStock ? 1 : 0,
        product.rating ?? 0,
        product.reviewCount ?? 0,
      ],
    });
  }
}

export async function inspectTables() {
  const names = ["products", "reviews", "categories", "orders", "user", "session", "account", "verification"];
  const results = await Promise.all(
    names.map(async (name) => {
      const count = await db.execute(`select count(*) as count from ${name}`);
      return { name, count: Number(count.rows?.[0]?.count ?? 0), isAuth: ["user", "session", "account", "verification"].includes(name) };
    }),
  );
  return results;
}

export async function getTableData(tableName: string) {
  const allowed = new Set(["products", "reviews", "categories", "orders", "user", "session", "account", "verification"]);
  if (!allowed.has(tableName)) throw new Error("Invalid table name");
  const info = await db.execute(`pragma table_info(${tableName})`);
  const rows = await db.execute(`select * from ${tableName}`);
  return {
    columns: info.rows?.map((row) => String(row.name ?? "")) ?? [],
    rows: rows.rows ?? [],
  };
}

initializeDatabase().catch(() => undefined);