import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/utils/password.js";

describe("password utils", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("senha123");

    expect(hash).not.toBe("senha123");
    expect(await verifyPassword("senha123", hash)).toBe(true);
    expect(await verifyPassword("senhaErrada", hash)).toBe(false);
  });
});
