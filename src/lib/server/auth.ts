import { Lucia, generateId } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";

import { dev } from "$app/environment";
import { db, sqlite } from "$lib/server/db";
import { emailVerificationCodes, passwordReset } from "./schema";
import { eq } from "drizzle-orm";

import { generateRandomString, alphabet } from "oslo/crypto";

import { GitHub } from "arctic";
import { SECRET_GITHUB_KEY, SECRET_GITHUB_SECRET } from "$env/static/private";

const adapter = new BetterSqlite3Adapter(sqlite, {
  user: "user",
  session: "session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      emailVerified: attributes.email_verified,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  email: string;
  email_verified: boolean;
}

export async function generateEmailVerificationCode(
  userId: string,
  email: string
): Promise<string> {
  await db
    .delete(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId));
  const code = generateRandomString(8, alphabet("0-9"));
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  return code;
}

export async function createPasswordResetToken(
  userId: string
): Promise<string> {
  await db.delete(passwordReset).where(eq(passwordReset.userId, userId));
  const tokenId = generateId(40);
  await db.insert(passwordReset).values({
    id: tokenId,
    userId,
    expiresAt: new Date(Date.now() + 60 * 60 * 2000), // 2 hours
  });
  return tokenId;
}

export const github = new GitHub(SECRET_GITHUB_KEY, SECRET_GITHUB_SECRET);
