import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const hasMockUser =
    typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");

  const itemId = id ? parseInt(id) : 0;

  const { data: apiItem, isLoading: isApiLoading } = trpc.menu.getById.useQuery(
    { id: itemId },
    { enabled: !!id && itemId > 0 }
  );

  // Always check mock menu items from localStorage (regardless of login status)
  const mockItem = useMemo(() => {
    if (!id || typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("mockMenuItems");
    if (!raw) return null;
    try {
      const items = JSON.parse(raw);
      const found = items.find((item: { id: number | string }) => {
        // Handle both string and number IDs
        const itemIdNum = typeof item.id === "string" ? parseInt(item.id) : item.id;
        return itemIdNum === itemId;
      });
      return found || null;
    } catch (error) {
      console.error("Error parsing mock menu items:", error);
      return null;
    }
  }, [id, itemId]);

  const item = apiItem || mockItem || null;
  // Stop loading if we found a mock item, or if API query is done
  const isLoading = isApiLoading && !mockItem && !apiItem;

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add item to cart");
    },
  });

  const handleAddToCart = () => {
    // If backend auth is not available but we have a mock user (local login),
    // store cart items locally instead of calling the API.
    const hasMockUser =
      typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");

    if (!user && !hasMockUser) {
      toast.error("Please login to add items to cart");
      window.location.href = getLoginUrl();
      return;
    }

    if (!item) return;

    if (hasMockUser) {
      try {
        const raw = window.localStorage.getItem("mockCart");
        const cart: Record<number, number> = raw ? JSON.parse(raw) : {};
        cart[item.id] = (cart[item.id] || 0) + quantity;
        window.localStorage.setItem("mockCart", JSON.stringify(cart));
        toast.success(`Added ${quantity} item(s) to cart!`);
        setQuantity(1);
      } catch {
        toast.error("Failed to update local cart");
      }
      return;
    }

    addToCart.mutate({ menuItemId: item.id, quantity });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-24 bg-muted rounded" />
                <div className="h-12 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container py-8">
          <Button variant="ghost" onClick={() => setLocation("/menu")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Item not found</p>
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
          <Link href="/cart">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <Button variant="ghost" onClick={() => setLocation("/menu")} className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden shadow-lg">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover max-h-[500px]"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <span className="text-9xl">🍽️</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-900">{item.name}</h1>
                {item.category && (
                  <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>

              <p className="text-3xl font-bold text-orange-600 mb-6">{formatPrice(item.price)}</p>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description || "A book item with low price and best quality"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - {formatPrice(item.price * quantity)}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
