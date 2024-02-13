import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { validateFormData } from "$lib/validation";
import vine from "@vinejs/vine";
import { db } from "$lib/server/db";
import { passwordReset, users } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import { createPasswordResetToken, lucia } from "$lib/server/auth";
import { sendEmailPasswordReset } from "$lib/server/mail";
import { dev } from "$app/environment";

const schema = vine.object({
  email: vine.string().email(),
});

const passwordSchema = vine.object({
  code: vine.string().minLength(40).maxLength(40),
  password: vine.string().minLength(4).maxLength(32),
});

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) redirect(302, "/profile");

  const code = url.searchParams.get("code");
  if (code) {
    const [token] = await db
      .select()
      .from(passwordReset)
      .where(eq(passwordReset.id, code))
      .limit(1);
    if (!token) {
      error(400, "Invalid token");
    }
    if (token.expiresAt < new Date()) {
      error(400, "Token expired, send a new one");
    }
  }

  return {
    code: code,
  };
};

export const actions: Actions = {
  requestReset: async ({ request }) => {
    const form = await request.formData();
    const { data, errors } = await validateFormData(form, schema);

    if (errors.length > 0) {
      return fail(400, {
        email: form.get("email"),
        error: errors[0].message,
      });
    }

    if (!data) {
      return fail(500, {
        email: form.get("email"),
        error: "Unknown error happend, try later",
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user || !user.isEmailVerified) {
      return fail(500, {
        email: form.get("email"),
        error: "Invalid email",
      });
    }

    const verificationToken = await createPasswordResetToken(user.id);
    const resetEmail = await sendEmailPasswordReset(
      data.email,
      verificationToken
    );
    if (dev) console.log(resetEmail);

    return { success: true, email: data.email };
  },
  verifyReset: async ({ request, url, cookies }) => {
    let form = await request.formData();
    const { data, errors } = await validateFormData(form, passwordSchema);
    if (errors.length > 0) {
      return fail(400, {
        errors: errors,
      });
    }

    if (!data) {
      return fail(500, {
        message: "Unknown error happend, try later",
      });
    }

    const [token] = await db
      .select()
      .from(passwordReset)
      .where(eq(passwordReset.id, data.code))
      .limit(1);
    await db.delete(passwordReset).where(eq(passwordReset.id, data.code));
    if (!token) {
      error(400, "Invalid token");
    }
    if (token.expiresAt < new Date()) {
      error(400, "Token expired, send a new one");
    }

    await lucia.invalidateUserSessions(token.userId);

    const hashedPassword = await Bun.password.hash(data.password);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, token.userId));

    const session = await lucia.createSession(token.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    redirect(302, "/profile");
  },
};
