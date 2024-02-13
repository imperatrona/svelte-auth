import { lucia } from "$lib/server/auth";
import { redirect, error } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { emailVerificationCodes, users, type User } from "$lib/server/schema";

export const GET: RequestHandler = async ({ params, locals, cookies }) => {
  if (!locals.user) redirect(302, "/signin");
  console.log(locals.user, params.token);
  const validCode = await verifyVerificationCode(locals.user, params.token);
  if (!validCode) {
    error(400, "Code is invalid or expired. Request a new one");
  }

  await lucia.invalidateUserSessions(locals.user.id);
  await db
    .update(users)
    .set({ isEmailVerified: true })
    .where(eq(users.id, locals.user.id));

  const session = await lucia.createSession(locals.user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes,
  });

  redirect(302, "/profile");
};

async function verifyVerificationCode(
  user: User,
  code: string
): Promise<boolean> {
  const [databaseCode] = await db
    .select()
    .from(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, user.id))
    .limit(1);

  if (!databaseCode || databaseCode.code !== code) {
    return false;
  }

  await db
    .delete(emailVerificationCodes)
    .where(eq(emailVerificationCodes.id, databaseCode.id));

  if (databaseCode.expiresAt < new Date()) {
    return false;
  }
  if (databaseCode.email !== user.email) {
    return false;
  }

  return true;
}
