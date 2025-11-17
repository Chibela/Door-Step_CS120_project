# Menu API Integration Guide

## Overview

ServeDash now uses the **Free Food Menus API** to fetch real food items with images, prices, and descriptions. The data is cached locally for fast access.

## Setup Instructions

### 1. Install Dependencies

Make sure `requests` is installed:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Fetch Menu Data

Run the fetch script to get menu data from the API:

```bash
cd backend
python fetch_menu_data.py
```

This will:
- Fetch 20 items total from 4 categories:
  - 6 Burgers
  - 6 Pizzas
  - 4 Fried Chicken
  - 4 Desserts
- Save the data to `data/menu_cache.json`

### 3. Start the Backend

The backend will automatically load menu data from the cache:

```bash
python app.py
```

## Menu Data Structure

Each menu item includes:

```json
{
  "id": "1",
  "name": "Classic Cheeseburger",
  "description": "Juicy beef patty with cheese",
  "price": 12.99,
  "category": "burgers",
  "image": "https://example.com/image.jpg",
  "rating": 4.5,
  "cuisine": "American"
}
```

## Updating Menu Data

To refresh the menu data:

1. Run the fetch script again:
   ```bash
   python fetch_menu_data.py
   ```

2. Restart the backend server (or it will reload on next API call)

## Categories

The menu supports these categories:
- `burgers` - Burger items
- `pizzas` - Pizza items
- `fried_chicken` - Fried chicken items
- `desserts` - Dessert items

## API Endpoints

- `GET /api/menu` - Returns all menu items from cache

## Fallback Behavior

If the cache file doesn't exist, the backend will use a default menu with 5 items. Always run the fetch script first!

## Troubleshooting

**No images showing?**
- Check that `menu_cache.json` exists in `backend/data/`
- Verify image URLs in the cache file
- Check browser console for CORS or image loading errors

**Menu not updating?**
- Delete `data/menu_cache.json` and run fetch script again
- Restart the backend server

**API errors?**
- Check your internet connection
- Verify the API is accessible: `https://free-food-menus-api-two.vercel.app/burgers`
- The script will show errors if the API is unavailable

