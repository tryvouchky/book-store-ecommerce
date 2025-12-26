import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useMemo, useState } from "react";

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const [localCartVersion, setLocalCartVersion] = useState(0);
  const hasMockUser =
    typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");
  const utils = trpc.useUtils();

  const { data: apiCartItems, isLoading: isCartLoading } = trpc.cart.list.useQuery(undefined, {
    enabled: !!user && !hasMockUser,
  });

  const { data: apiMenuItems } = trpc.menu.list.useQuery(undefined, {
    enabled: hasMockUser,
  });

  // Combine API menu items with mock menu items from localStorage
  const menuItems = useMemo(() => {
    const apiItems = apiMenuItems || [];
    if (!hasMockUser || typeof window === "undefined") {
      return apiItems;
    }
    
    const raw = window.localStorage.getItem("mockMenuItems");
    if (!raw) return apiItems;
    
    try {
      const mockItems = JSON.parse(raw);
      // Merge mock items with API items, avoiding duplicates
      const apiIds = new Set(apiItems.map((item) => item.id));
      const uniqueMockItems = mockItems.filter(
        (item: { id: number }) => !apiIds.has(item.id)
      );
      return [...apiItems, ...uniqueMockItems];
    } catch {
      return apiItems;
    }
  }, [apiMenuItems, hasMockUser]);

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onMutate: async ({ cartItemId, quantity }) => {
      await utils.cart.list.cancel();
      const previousCart = utils.cart.list.getData();

      utils.cart.list.setData(undefined, (old) => {
        if (!old) return old;
        if (quantity === 0) {
          return old.filter((item) => item.id !== cartItemId);
        }
        return old.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        utils.cart.list.setData(undefined, context.previousCart);
      }
      toast.error("Failed to update quantity");
    },
    onSettled: () => {
      utils.cart.list.invalidate();
    },
  });

  const removeItem = trpc.cart.remove.useMutation({
    onMutate: async ({ cartItemId }) => {
      await utils.cart.list.cancel();
      const previousCart = utils.cart.list.getData();

      utils.cart.list.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== cartItemId);
      });

      return { previousCart };
    },
    onSuccess: () => {
      toast.success("Item removed from cart");
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        utils.cart.list.setData(undefined, context.previousCart);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      utils.cart.list.invalidate();
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });

  const cartItems = useMemo(() => {
    if (hasMockUser) {
      if (typeof window === "undefined" || !menuItems) return [];
      const raw = window.localStorage.getItem("mockCart");
      if (!raw) return [];
      let cart: Record<number, number>;
      try {
        cart = JSON.parse(raw);
      } catch {
        return [];
      }

      return Object.entries(cart)
        .map(([idStr, quantity]) => {
          const id = Number(idStr);
          const menuItem = menuItems.find((m) => m.id === id);
          if (!menuItem) return null;
          return {
            id,
            quantity: Number(quantity),
            menuItem,
          };
        })
        .filter((x): x is { id: number; quantity: number; menuItem: (typeof menuItems)[number] } => Boolean(x));
    }

    return apiCartItems ?? [];
  }, [hasMockUser, menuItems, apiCartItems, localCartVersion]);

  const isLoading = hasMockUser ? !menuItems : isCartLoading;

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.menuItem?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (hasMockUser) {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("mockCart");
      const cart: Record<number, number> = raw ? JSON.parse(raw) : {};

      if (newQuantity <= 0) {
        delete cart[cartItemId];
      } else {
        cart[cartItemId] = newQuantity;
      }

      window.localStorage.setItem("mockCart", JSON.stringify(cart));
      setLocalCartVersion((v) => v + 1);
      return;
    }

    updateQuantity.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId: number) => {
    if (hasMockUser) {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("mockCart");
      const cart: Record<number, number> = raw ? JSON.parse(raw) : {};
      delete cart[cartItemId];
      window.localStorage.setItem("mockCart", JSON.stringify(cart));
      toast.success("Item removed from cart");
      setLocalCartVersion((v) => v + 1);
      return;
    }

    removeItem.mutate({ cartItemId });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <header className="bg-white shadow-sm">
          <div className="container py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-orange-600 cursor-pointer">THE BOOK BINDERY</h1>
            </Link>
          </div>
        </header>
        <main className="container py-16 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Login
          </Button>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <header className="bg-white shadow-sm">
          <div className="container py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-orange-600 cursor-pointer">FoodHub</h1>
            </Link>
          </div>
        </header>
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-orange-600 cursor-pointer">THE BOOK BINDERY</h1>
          </Link>
          <Link href="/menu">
            <Button variant="outline">Browse Menu</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h2>
            <p className="text-gray-600">
              {isEmpty ? "Your cart is empty" : `${cartItems.length} item(s) in cart`}
            </p>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              onClick={() => {
                if (hasMockUser) {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem("mockCart");
                    toast.success("Cart cleared");
                    setLocalCartVersion((v) => v + 1);
                  }
                } else {
                  clearCart.mutate();
                }
              }}
              disabled={!hasMockUser && clearCart.isPending}
            >
              Clear Cart
            </Button>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <Link href="/menu">
              <Button className="bg-orange-600 hover:bg-orange-700">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const menuItem = item.menuItem;
                if (!menuItem) return null;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Link href={`/menu/${menuItem.id}`}>
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                            {menuItem.imageUrl ? (
                              <img
                                src={menuItem.imageUrl}
                                alt={menuItem.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                                <span className="text-3xl">🍽️</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Link href={`/menu/${menuItem.id}`}>
                              <h3 className="font-semibold text-lg cursor-pointer hover:text-orange-600 transition-colors">
                                {menuItem.name}
                              </h3>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          {menuItem.category && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              {menuItem.category}
                            </span>
                          )}

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-lg font-semibold w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {formatPrice(menuItem.price)} each
                              </p>
                              <p className="text-xl font-bold text-orange-600">
                                {formatPrice(menuItem.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(Math.round(calculateTotal() * 0.1))}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">
                        {formatPrice(Math.round(calculateTotal() * 1.1))}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6">
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
