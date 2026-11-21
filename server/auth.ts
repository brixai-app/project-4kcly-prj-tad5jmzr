import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import db from './db';

const trustedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://*.webcontainer-api.io',
  'https://*.brixai.app',
];

const sha256 = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value ?? '');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const resilientMemoryAdapter = () => {
  const adapter = memoryAdapter();
  const safe = <T,>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  return new Proxy(adapter as Record<string, unknown>, {
    get(target, prop) {
      const value = target?.[prop as keyof typeof target];
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => safe(() => (value as (...a: unknown[]) => unknown)(...args), undefined);
    },
  });
};

const syncUser = async (user: { id?: string; name?: string; email?: string; image?: string; role?: string } | null | undefined) => {
  if (!user?.id || !user?.email) return null;
  const now = new Date().toISOString();
  const payload = {
    id: user.id,
    name: user.name ?? user.email.split('@')?.[0] ?? 'Customer',
    email: user.email,
    image: user.image ?? null,
    role: user.role ?? 'customer',
    updatedAt: now,
  };
  try {
    await db.execute({
      sql: 'INSERT INTO users (id, name, email, image, role, updatedAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, image=excluded.image, role=excluded.role, updatedAt=excluded.updatedAt',
      args: [payload.id, payload.name, payload.email, payload.image, payload.role, payload.updatedAt],
    });
  } catch {
    return payload;
  }
  return payload;
};

const auth = betterAuth({
  appName: 'NDDN Store',
  baseURL: '/',
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    password: {
      hash: sha256,
      verify: async ({ password, hash }: { password: string; hash: string }) => (await sha256(password)) === hash,
    },
  },
  database: resilientMemoryAdapter(),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  hooks: {
    after: async (ctx: { user?: { id?: string; name?: string; email?: string; image?: string; role?: string } | null }) => {
      await syncUser(ctx?.user ?? null);
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'customer' },
      image: { type: 'string', required: false },
    },
  },
});

export { auth, trustedOrigins, sha256, syncUser, resilientMemoryAdapter };
export default auth;