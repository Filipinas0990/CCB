import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { db, pool } from "../src/db/client.js";
import { users } from "../src/db/schema.js";
import { hashPassword } from "../src/utils/password.js";
import { resetDb } from "./helpers/reset-db.js";

async function createProfessor(login: string, senha: string) {
  await db.insert(users).values({
    login,
    senhaHash: await hashPassword(senha),
    tipo: "professor",
    cargo: "instrutor",
  });
}

function extractCookie(setCookieHeader: string | string[] | undefined): string {
  const raw = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  if (!raw) throw new Error("no set-cookie header");
  return raw.split(";")[0];
}

describe("auth routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects login with wrong password", async () => {
    await createProfessor("instrutor1", "senha123");
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { login: "instrutor1", senha: "errada" },
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects login with missing fields", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { login: "instrutor1" },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("logs in and sets a session cookie", async () => {
    await createProfessor("instrutor1", "senha123");
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { login: "instrutor1", senha: "senha123" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ login: "instrutor1", tipo: "professor", cargo: "instrutor" });
    expect(response.headers["set-cookie"]).toBeDefined();
    await app.close();
  });

  it("rejects logout without a session", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "POST", url: "/auth/logout" });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("logs out and invalidates the session", async () => {
    await createProfessor("instrutor1", "senha123");
    const app = await buildApp();

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { login: "instrutor1", senha: "senha123" },
    });
    const cookie = extractCookie(loginResponse.headers["set-cookie"]);

    const logoutResponse = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie },
    });
    expect(logoutResponse.statusCode).toBe(204);

    const secondLogoutResponse = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie },
    });
    expect(secondLogoutResponse.statusCode).toBe(401);

    await app.close();
  });

  it("rejects GET /auth/me without a session", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/auth/me" });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("returns the current user for GET /auth/me", async () => {
    await createProfessor("instrutor1", "senha123");
    const app = await buildApp();

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { login: "instrutor1", senha: "senha123" },
    });
    const cookie = extractCookie(loginResponse.headers["set-cookie"]);

    const meResponse = await app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toMatchObject({ login: "instrutor1", tipo: "professor", cargo: "instrutor" });

    await app.close();
  });
});
