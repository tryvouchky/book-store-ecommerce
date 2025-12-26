# E-Commerce Menu & Cart TODO

## Database Schema
- [x] Create menu items table (id, name, description, price, image_url, category, created_at)
- [x] Create cart items table (id, user_id, menu_item_id, quantity, created_at)

## Backend API
- [x] Create tRPC procedure to list all menu items
- [x] Create tRPC procedure to get single menu item by ID
- [x] Create tRPC procedure to add item to cart
- [x] Create tRPC procedure to get user's cart items
- [x] Create tRPC procedure to update cart item quantity
- [x] Create tRPC procedure to remove item from cart
- [x] Create tRPC procedure to clear cart

## Frontend Pages
- [x] Create menu page with item grid/list view
- [x] Create product detail page with full item information
- [x] Create cart page with items list and total price
- [x] Add navigation between pages

## UI Components
- [x] Design and implement menu item card component
- [x] Design and implement product detail layout
- [x] Design and implement cart item row component
- [x] Add loading states for all data fetching
- [x] Add empty states for cart and menu

## Testing
- [x] Write vitest tests for menu item procedures
- [x] Write vitest tests for cart procedures
- [x] Test complete user flow in browser
