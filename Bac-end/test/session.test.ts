import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool } from "../src/db/client.js";
import { users } from "../src/db/schema.js";
import { createSession, deleteSession, getSessionUser } from "../src/utils/session.js";
import { hashPassword } from "../src/utils/password.js";
import { resetDb } from "./helpers/reset-db.js";

async function createTestUser() {
  const [user] = await db
    .insert(users)
    .values({
      login: "instrutor1",
      senhaHash: await hashPassword("senha123"),
      tipo: "professor",
      cargo: "instrutor",
    })
    .returning();
  return user;
}

describe("session utils", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates a session and resolves the owning user", async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);

    const resolved = await getSessionUser(session.id);

    expect(resolved?.id).toBe(user.id);
  });

  it("returns null for a deleted session", async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);

    await deleteSession(session.id);

    expect(await getSessionUser(session.id)).toBeNull();
  });

  it("returns null for an unknown session id", async () => {
    expect(await getSessionUser("does-not-exist")).toBeNull();
  });
});
