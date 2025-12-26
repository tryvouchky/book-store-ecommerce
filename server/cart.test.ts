import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("cart procedures", () => {
  it("should add item to cart", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get a menu item first
    const menuItems = await caller.menu.list();
    expect(menuItems.length).toBeGreaterThan(0);
    const menuItemId = menuItems[0]!.id;

    // Add to cart
    const result = await caller.cart.add({ menuItemId, quantity: 2 });
    expect(result.success).toBe(true);

    // Verify it's in the cart
    const cartItems = await caller.cart.list();
    const addedItem = cartItems.find((item) => item.menuItemId === menuItemId);
    expect(addedItem).toBeDefined();
    expect(addedItem?.quantity).toBeGreaterThanOrEqual(2);
  });

  it("should list cart items with menu item details", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.list();

    expect(Array.isArray(result)).toBe(true);
    
    // Check structure if cart has items
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("userId");
      expect(item).toHaveProperty("menuItemId");
      expect(item).toHaveProperty("quantity");
      expect(item).toHaveProperty("menuItem");
      
      // Check menu item is joined
      if (item.menuItem) {
        expect(item.menuItem).toHaveProperty("name");
        expect(item.menuItem).toHaveProperty("price");
      }
    }
  });

  it("should update cart item quantity", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get cart items
    const cartItems = await caller.cart.list();
    if (cartItems.length === 0) {
      // Add an item first
      const menuItems = await caller.menu.list();
      await caller.cart.add({ menuItemId: menuItems[0]!.id, quantity: 1 });
      const newCartItems = await caller.cart.list();
      expect(newCartItems.length).toBeGreaterThan(0);
    }

    const refreshedCart = await caller.cart.list();
    const cartItemId = refreshedCart[0]!.id;

    // Update quantity
    const result = await caller.cart.updateQuantity({
      cartItemId,
      quantity: 5,
    });
    expect(result.success).toBe(true);

    // Verify update
    const updatedCart = await caller.cart.list();
    const updatedItem = updatedCart.find((item) => item.id === cartItemId);
    expect(updatedItem?.quantity).toBe(5);
  });

  it("should remove item from cart", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Ensure there's at least one item in cart
    const cartItems = await caller.cart.list();
    if (cartItems.length === 0) {
      const menuItems = await caller.menu.list();
      await caller.cart.add({ menuItemId: menuItems[0]!.id, quantity: 1 });
    }

    const refreshedCart = await caller.cart.list();
    const cartItemId = refreshedCart[0]!.id;
    const initialCount = refreshedCart.length;

    // Remove item
    const result = await caller.cart.remove({ cartItemId });
    expect(result.success).toBe(true);

    // Verify removal
    const updatedCart = await caller.cart.list();
    expect(updatedCart.length).toBe(initialCount - 1);
    expect(updatedCart.find((item) => item.id === cartItemId)).toBeUndefined();
  });

  it("should clear entire cart", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add some items first
    const menuItems = await caller.menu.list();
    await caller.cart.add({ menuItemId: menuItems[0]!.id, quantity: 1 });
    if (menuItems.length > 1) {
      await caller.cart.add({ menuItemId: menuItems[1]!.id, quantity: 1 });
    }

    // Clear cart
    const result = await caller.cart.clear();
    expect(result.success).toBe(true);

    // Verify cart is empty
    const cartItems = await caller.cart.list();
    expect(cartItems.length).toBe(0);
  });
});
