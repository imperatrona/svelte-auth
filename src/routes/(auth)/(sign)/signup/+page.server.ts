import { fail, redirect } from "@sveltejs/kit";
import { generateEmailVerificationCode, lucia } from "$lib/server/auth";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import type { PageServerLoad, Actions } from "./$types";
import { sendEmailVerificationEmail } from "$lib/server/mail";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { dev } from "$app/environment";

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/profile");
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
      return fail(400);
    }

    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId(15);

    try {
      await db.insert(users).values({
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });

      const token = await generateEmailVerificationCode(userId, email);
      const verifiactionEmail = await sendEmailVerificationEmail(
        email,
        token.toString()
      );

      if (dev) console.log(verifiactionEmail);

      redirect(302, "/profile");
    } catch (e) {
      if (e instanceof Error) {
        console.error("at sendEmailVerificationEmail", e.message);
        if (e.message.includes("duplicate key")) {
          return fail(400, { email, missing: true });
        }
        throw e;
      }
    }
    return fail(400, { email, missing: true });
  },
};
