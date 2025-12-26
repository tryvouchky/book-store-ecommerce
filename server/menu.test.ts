import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("menu procedures", () => {
  it("should list all menu items", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.menu.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check structure of first item
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("price");
      expect(typeof item.id).toBe("number");
      expect(typeof item.name).toBe("string");
      expect(typeof item.price).toBe("number");
    }
  });

  it("should get a single menu item by id", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get all items to get a valid ID
    const items = await caller.menu.list();
    expect(items.length).toBeGreaterThan(0);

    const firstItemId = items[0]!.id;
    const result = await caller.menu.getById({ id: firstItemId });

    expect(result).toBeDefined();
    expect(result?.id).toBe(firstItemId);
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("price");
  });

  it("should return undefined for non-existent menu item", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.menu.getById({ id: 999999 });

    expect(result).toBeUndefined();
  });
});
