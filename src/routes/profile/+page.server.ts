import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { type Actions, fail } from "@sveltejs/kit";
import { sendEmailVerificationEmail } from "$lib/server/mail";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import { emailVerificationCodes, users } from "$lib/server/schema";
import { and, eq, lt } from "drizzle-orm";
import { generateEmailVerificationCode, lucia } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/signin");

  const [u] = await db
    .select({ passwordHash: users.password })
    .from(users)
    .where(eq(users.id, locals.user.id))
    .limit(1);

  return {
    user: locals.user,
    hasPassword: u.passwordHash !== "",
  };
};

export const actions: Actions = {
  sendVerificationEmail: async ({ locals }) => {
    if (!locals.user) return fail(401);

    let token: string;

    const [activeCode] = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.userId, locals.user.id),
          eq(emailVerificationCodes.email, locals.user.email),
          lt(emailVerificationCodes.expiresAt, new Date(Date.now() + 60000))
        )
      )
      .limit(1);

    if (activeCode?.code) {
      token = activeCode.code;
    } else {
      token = await generateEmailVerificationCode(
        locals.user.id,
        locals.user.email
      );
    }

    const verifiactionEmail = await sendEmailVerificationEmail(
      locals.user.email,
      token
    );

    if (dev) console.log(verifiactionEmail);
    return { success: true, email: locals.user.email };
  },
  signout: async ({ locals, cookies }) => {
    if (!locals.user) return fail(401);
    await lucia.invalidateUserSessions(locals.user.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
    redirect(302, "/signin");
  },
};
