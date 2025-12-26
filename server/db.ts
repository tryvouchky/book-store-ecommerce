import { and, eq } from "drizzle-orm";
import { InsertUser, users, MenuItem, CartItem } from "../drizzle/schema";
import { ENV } from './_core/env';

// In-memory mock database for development
let mockUsers: (InsertUser & { id: number })[] = [];
let mockMenuItems: (MenuItem)[] = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop",
    category: "Burgers",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on thin crust",
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop",
    category: "Pizza",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan and croutons",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=600&fit=crop",
    category: "Salads",
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with lemon butter sauce",
    price: 1899,
    imageUrl: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800&h=600&fit=crop",
    category: "Seafood",
    createdAt: new Date(),
  },
  {
    id: 5,
    name: "Chicken Tacos",
    description: "Three soft tacos with grilled chicken and fresh toppings",
    price: 1099,
    imageUrl: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=800&h=600&fit=crop",
    category: "Mexican",
    createdAt: new Date(),
  },
  {
    id: 6,
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake with ganache frosting",
    price: 699,
    imageUrl: "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=800&h=600&fit=crop",
    category: "Desserts",
    createdAt: new Date(),
  },
  {
    id: 7,
    name: "Iced Coffee",
    description: "Cold brew coffee served over ice",
    price: 499,
    imageUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&h=600&fit=crop",
    category: "Beverages",
    createdAt: new Date(),
  },
  {
    id: 8,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with bacon and creamy sauce",
    price: 1399,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop",
    category: "Pasta",
    createdAt: new Date(),
  },
];
let mockCartItems: (CartItem & { id: number })[] = [];

let _db: any = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    _db = {};
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const existingIndex = mockUsers.findIndex(u => u.openId === user.openId);
  
  if (existingIndex >= 0) {
    // Update existing user
    mockUsers[existingIndex] = {
      ...mockUsers[existingIndex],
      ...user,
    };
  } else {
    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      loginMethod: user.loginMethod || null,
      role: user.role || 'user',
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      lastSignedIn: user.lastSignedIn || new Date(),
    };
    mockUsers.push(newUser);
  }
}

export async function getUserByOpenId(openId: string) {
  return mockUsers.find(u => u.openId === openId);
}

// Menu Items queries
export async function getAllMenuItems() {
  return mockMenuItems;
}

export async function getMenuItemById(id: number) {
  return mockMenuItems.find(item => item.id === id);
}

export async function createMenuItem(data: { name: string; description?: string; price: number; imageUrl?: string; category?: string }) {
  const newItem: MenuItem = {
    id: mockMenuItems.length + 1,
    name: data.name,
    description: data.description || null,
    price: data.price,
    imageUrl: data.imageUrl || null,
    category: data.category || null,
    createdAt: new Date(),
  };
  mockMenuItems.push(newItem);
  return newItem;
}

// Cart queries
export async function getCartItemsByUserId(userId: number) {
  return mockCartItems.filter(item => item.userId === userId).map(cartItem => ({
    ...cartItem,
    menuItem: mockMenuItems.find(m => m.id === cartItem.menuItemId),
  }));
}

export async function addToCart(userId: number, menuItemId: number, quantity: number = 1) {
  const existingIndex = mockCartItems.findIndex(
    item => item.userId === userId && item.menuItemId === menuItemId
  );
  
  if (existingIndex >= 0) {
    // Update quantity
    mockCartItems[existingIndex]!.quantity += quantity;
  } else {
    // Insert new cart item
    const newCartItem: CartItem & { id: number } = {
      id: mockCartItems.length + 1,
      userId,
      menuItemId,
      quantity,
      createdAt: new Date(),
    };
    mockCartItems.push(newCartItem);
  }
}

export async function updateCartItemQuantity(cartItemId: number, userId: number, quantity: number) {
  const index = mockCartItems.findIndex(item => item.id === cartItemId && item.userId === userId);
  
  if (index >= 0) {
    if (quantity <= 0) {
      mockCartItems.splice(index, 1);
    } else {
      mockCartItems[index]!.quantity = quantity;
    }
  }
}

export async function removeFromCart(cartItemId: number, userId: number) {
  const index = mockCartItems.findIndex(item => item.id === cartItemId && item.userId === userId);
  if (index >= 0) {
    mockCartItems.splice(index, 1);
  }
}

export async function clearCart(userId: number) {
  mockCartItems = mockCartItems.filter(item => item.userId !== userId);
}
