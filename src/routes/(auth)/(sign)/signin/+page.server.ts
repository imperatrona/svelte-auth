import { fail, redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { eq } from "drizzle-orm";

import vine, { errors } from "@vinejs/vine";
import type { InputError } from "$lib/validation/errors";

const schema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(4).maxLength(32),
});

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/profile");
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();

    let email: string;
    let password: string;

    try {
      const user = await vine.validate({
        schema,
        data: Object.fromEntries(form.entries()),
      });
      email = user.email;
      password = user.password;
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.error(error.messages);
        return fail(400, {
          email: form.get("email"),
          errors: error.messages as InputError[],
        });
      }
      return fail(500, {
        email: form.get("email"),
        message: "Unknown error happend, try later",
      });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!existingUser) {
      return fail(400, {
        message: "Incorrect username or password",
      });
    }

    const validPassword = await Bun.password.verify(
      password,
      existingUser.password
    );
    if (!validPassword) {
      return fail(400, {
        message: "Incorrect username or password",
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    redirect(302, "/");
  },
};
