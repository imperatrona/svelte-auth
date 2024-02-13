import { redirect } from "@sveltejs/kit";
import { github, lucia } from "$lib/server/auth";
import { generateState, OAuth2RequestError } from "arctic";
import { generateId } from "lucia";

import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import { oauthAccounts, users } from "$lib/server/schema";
import { and, eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.get("github_oauth_state");

  if (!code || !state || !storedState || state !== storedState) {
    const state = generateState();
    const url = await github.createAuthorizationURL(state, {
      scopes: ["read:user", "user:email"],
    });

    cookies.set("github_oauth_state", state, {
      path: "/",
      secure: !dev,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    redirect(302, url.toString());
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    console.log(githubUserResponse.status);
    const githubUser: GitHubUser = await githubUserResponse.json();
    const [existingUser] = await db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.providerId, "github"),
          eq(oauthAccounts.providerUserId, githubUser.id.toString())
        )
      )
      .limit(1);

    if (existingUser) {
      const session = await lucia.createSession(existingUser.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });
      redirect(302, "/profile");
    }

    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      email: githubUser.email ?? "",
      isEmailVerified: true,
      password: "",
    });

    await db.insert(oauthAccounts).values({
      userId,
      providerId: "github",
      providerUserId: githubUser.id.toString(),
      rawUserData: githubUser,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
  } catch (e) {
    // invalid code
    if (e instanceof Error) {
      console.log(e);
    }
    if (e instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
  redirect(302, "/profile");
};

type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: any;
  blog: string;
  location: any;
  email: string;
  hireable: any;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
  };
};
