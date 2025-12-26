import { drizzle } from "drizzle-orm/mysql2";
import { menuItems } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleMenuItems = [
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 1299, // $12.99 in cents
    imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop",
    category: "Burgers"
  },
  {
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on thin crust",
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop",
    category: "Pizza"
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan and croutons",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=600&fit=crop",
    category: "Salads"
  },
  {
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with lemon butter sauce",
    price: 1899,
    imageUrl: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800&h=600&fit=crop",
    category: "Seafood"
  },
  {
    name: "Chicken Tacos",
    description: "Three soft tacos with grilled chicken and fresh toppings",
    price: 1099,
    imageUrl: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=800&h=600&fit=crop",
    category: "Mexican"
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake with ganache frosting",
    price: 699,
    imageUrl: "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=800&h=600&fit=crop",
    category: "Desserts"
  },
  {
    name: "Iced Coffee",
    description: "Cold brew coffee served over ice",
    price: 499,
    imageUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&h=600&fit=crop",
    category: "Beverages"
  },
  {
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with bacon and creamy sauce",
    price: 1399,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop",
    category: "Pasta"
  }
];

async function seed() {
  console.log("Seeding menu items...");
  
  for (const item of sampleMenuItems) {
    await db.insert(menuItems).values(item);
    console.log(`Added: ${item.name}`);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
