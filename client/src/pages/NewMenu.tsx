import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewMenu() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const hasMockUser =
    typeof window !== "undefined" && !!window.localStorage.getItem("mockUser");
  
  const utils = trpc.useUtils();
  const createMenu = trpc.menu.create.useMutation({
    onSuccess: (item) => {
      toast.success("Menu item created");
      utils.menu.list.invalidate();
      setLocation(`/menu/${item.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create menu item");
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useImageUrl, setUseImageUrl] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Login required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              You need to be logged in as a user or admin to create new menu items.
            </p>
            <Button
              className="bg-orange-600 hover:bg-orange-700 w-full"
              onClick={() => setLocation("/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Price must be a positive number");
      return;
    }

    // If using mock user, store in localStorage and update menu list
    if (hasMockUser) {
      try {
        const raw = window.localStorage.getItem("mockMenuItems");
        const items: Array<{
          id: number;
          name: string;
          description: string | null;
          price: number;
          imageUrl: string | null;
          category: string | null;
          createdAt: Date;
        }> = raw ? JSON.parse(raw) : [];
        
        // Get existing menu items from API to find next ID
        const existingItems = utils.menu.list.getData() || [];
        const maxId = Math.max(
          ...existingItems.map((item) => item.id),
          ...items.map((item) => item.id),
          0
        );
        
        const finalImageUrl = getFinalImageUrl();
        
        const newItem = {
          id: maxId + 1,
          name: name.trim(),
          description: description.trim() || null,
          price: Math.round(numericPrice * 100),
          imageUrl: finalImageUrl,
          category: category.trim() || null,
          createdAt: new Date().toISOString(),
        };
        
        items.push(newItem);
        window.localStorage.setItem("mockMenuItems", JSON.stringify(items));
        
        // Invalidate and refetch menu list
        utils.menu.list.invalidate();
        
        toast.success("Menu item created");
        
        // Small delay to ensure localStorage is written and menu list updates
        setTimeout(() => {
          setLocation(`/menu/${newItem.id}`);
        }, 100);
      } catch (error) {
        console.error("Failed to create mock menu item:", error);
        toast.error("Failed to create menu item");
      }
      return;
    }

    // Use real API for authenticated users
    const finalImageUrl = getFinalImageUrl();
    createMenu.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Math.round(numericPrice * 100),
      imageUrl: finalImageUrl || undefined,
      category: category.trim() || undefined,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setUseImageUrl(false);
    setImageUrl(""); // Clear URL when uploading file

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
    setImageUrl("");
  };

  const getFinalImageUrl = (): string | null => {
    if (useImageUrl && imageUrl.trim()) {
      return imageUrl.trim();
    }
    if (uploadedImage) {
      return uploadedImage; // base64 data URL
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <button
            className="text-2xl font-bold text-orange-600"
            onClick={() => setLocation("/")}
          >
            THE BOOK BINDERY
          </button>
          <Button variant="outline" onClick={() => setLocation("/menu")}>
            Back to books item
          </Button>
        </div>
      </header>

      <main className="container py-10 flex justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Create New Book Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Harry Potter and the Sorcerer's Stone"
                  disabled={createMenu.isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="price">
                  Price (USD)
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="12.99"
                  disabled={createMenu.isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="category">
                  Category
                </label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Horror, Romance, Fiction..."
                  disabled={createMenu.isPending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image (optional)</label>
                
                {/* Toggle between upload and URL */}
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={!useImageUrl ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseImageUrl(false);
                      setImageUrl("");
                    }}
                    className={!useImageUrl ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant={useImageUrl ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseImageUrl(true);
                      setUploadedImage(null);
                      setImageFile(null);
                    }}
                    className={useImageUrl ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    Use URL
                  </Button>
                </div>

                {!useImageUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={createMenu.isPending}
                        className="cursor-pointer"
                      />
                    </div>
                    {uploadedImage && (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={createMenu.isPending}
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the book"
                  disabled={createMenu.isPending}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={createMenu.isPending}
              >
                {createMenu.isPending ? "Creating..." : "Create Book Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


