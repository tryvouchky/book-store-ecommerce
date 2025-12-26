import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useMemo } from "react";

export default function Menu() {
  const { data: apiMenuItems, isLoading } = trpc.menu.list.useQuery();
  const { user } = useAuth();
  const hasMockUser =
    typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");
  
  // Combine API menu items with mock menu items from localStorage
  // Always check localStorage for mock items, regardless of login status
  const menuItems = useMemo(() => {
    const apiItems = apiMenuItems || [];
    
    // Always check localStorage for mock menu items (created by users)
    if (typeof window === "undefined") return apiItems;
    
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
    } catch (error) {
      console.error("Error parsing mock menu items:", error);
      return apiItems;
    }
  }, [apiMenuItems]);
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Item added to cart!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add item to cart");
    },
  });

  const handleAddToCart = (menuItemId: number) => {
    // If backend auth is not available but we have a mock user (local login),
    // store cart items locally instead of calling the API.
    const hasMockUser =
      typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");

    if (!user && !hasMockUser) {
      toast.error("Please login to add items to cart");
      window.location.href = getLoginUrl();
      return;
    }

    if (hasMockUser) {
      try {
        const raw = window.localStorage.getItem("mockCart");
        const cart: Record<number, number> = raw ? JSON.parse(raw) : {};
        cart[menuItemId] = (cart[menuItemId] || 0) + 1;
        window.localStorage.setItem("mockCart", JSON.stringify(cart));
        toast.success("Item added to cart!");
      } catch {
        toast.error("Failed to update local cart");
      }
      return;
    }

    addToCart.mutate({ menuItemId, quantity: 1 });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-orange-600 cursor-pointer">THE BOOK BINDERY</h1>
          </Link>
          <div className="flex gap-2 items-center">
            {user && (
              <Link href="/menu/new">
                <Button variant="outline" className="bg-orange-50 hover:bg-orange-100">
                  + Create New Book
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Our Books</h2>
          <p className="text-gray-600">Discover our book with low price and bext quality</p>
        </div>

        {!menuItems || menuItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No book items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/menu/${item.id}`}>
                  <div className="h-48 overflow-hidden bg-muted cursor-pointer">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/menu/${item.id}`}>
                      <CardTitle className="cursor-pointer hover:text-orange-600 transition-colors">
                        {item.name}
                      </CardTitle>
                    </Link>
                    {item.category && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.description || "Delicious food item"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">{formatPrice(item.price)}</span>
                  <Button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={addToCart.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
