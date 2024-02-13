import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    email: text("email").unique().notNull(),
    isEmailVerified: integer("email_verified", { mode: "boolean" })
      .default(false)
      .notNull(),
    password: text("hashed_password").notNull(),
  },
  (users) => ({
    userIdIdx: uniqueIndex("userIdIdx").on(users.id),
    userEmailIdx: uniqueIndex("userEmailIdx").on(users.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
  },
  (sessions) => ({
    sessionUserIdIdx: uniqueIndex("sessionUserIdIdx").on(sessions.userId),
  })
);

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const emailVerificationCodes = sqliteTable(
  "email_verification_code",
  {
    id: integer("id").primaryKey(),
    code: text("code"),
    userId: text("user_id").references(() => users.id),
    email: text("email"),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (emailVerificationCode) => ({
    emailVerificationCodeIdx: uniqueIndex("emailVerificationCodeIdx").on(
      emailVerificationCode.code
    ),
    emailVerificationUserIdIdx: uniqueIndex("emailVerificationUserIdIdx").on(
      emailVerificationCode.userId
    ),
  })
);

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode =
  typeof emailVerificationCodes.$inferInsert;

export const oauthAccounts = sqliteTable(
  "oauth_account",
  {
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    rawUserData: text("raw_user_data", { mode: "json" }),
  },
  (oauthAccount) => ({
    pk: primaryKey({
      columns: [oauthAccount.providerId, oauthAccount.providerUserId],
    }),
    oauthUserIdIdx: uniqueIndex("oauthUserIdIdx").on(oauthAccount.userId),
  })
);

export type OauthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOauthAccount = typeof oauthAccounts.$inferInsert;

export const passwordReset = sqliteTable("password_reset_token", {
  id: text("text").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type PasswordReset = typeof passwordReset.$inferSelect;
export type InsertPasswordReset = typeof passwordReset.$inferInsert;
