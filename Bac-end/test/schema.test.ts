import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool } from "../src/db/client.js";
import { users } from "../src/db/schema.js";
import { resetDb } from "./helpers/reset-db.js";

describe("database schema", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates and reads a professor user row", async () => {
    const [inserted] = await db
      .insert(users)
      .values({ login: "encarregado1", senhaHash: "hash", tipo: "professor", cargo: "encarregado" })
      .returning();

    expect(inserted.id).toBeDefined();
    expect(inserted.tipo).toBe("professor");
    expect(inserted.cargo).toBe("encarregado");
  });
});
