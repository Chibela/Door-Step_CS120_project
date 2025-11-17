#!/usr/bin/env python3
"""
Fetch food menu data from Free Food Menus API and cache locally
This script fetches data from the API and saves it to a JSON file for the backend to use
"""

import requests
import json
import os
from datetime import datetime

# API Configuration
FOOD_API_BASE = "https://free-food-menus-api-two.vercel.app"

# Categories to fetch (we'll select 20 items total)
CATEGORIES = {
    'burgers': {'count': 6, 'display': 'Burgers'},
    'pizzas': {'count': 6, 'display': 'Pizzas'},
    'fried-chicken': {'count': 4, 'display': 'Fried Chicken'},
    'desserts': {'count': 4, 'display': 'Desserts'}
}

# Output file
DATA_DIR = "data"
MENU_CACHE_FILE = os.path.join(DATA_DIR, "menu_cache.json")


def fetch_category_items(category):
    """Fetch items from a specific category"""
    try:
        url = f"{FOOD_API_BASE}/{category}"
        print(f"Fetching {category}...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching {category}: {e}")
        return []


def process_menu_items():
    """Fetch and process menu items from API"""
    all_items = []
    item_id = 1
    seen_names = set()
    
    for category, config in CATEGORIES.items():
        items = fetch_category_items(category)
        added = 0
        
        for item in items:
            name = item.get('name', '').strip()
            if not name:
                continue
            
            normalized_name = name.lower()
            if normalized_name in seen_names:
                continue
            
            # Map API data to our menu structure
            menu_item = {
                'id': str(item_id),
                'name': name,
                'description': item.get('dsc', 'Delicious food item'),
                'price': float(item.get('price', 9.99)),
                'category': category.replace('-', '_'),  # Use underscores for consistency
                'image': item.get('img', ''),
                'rating': float(item.get('rate', 4.5)),
                'cuisine': item.get('country', 'International')
            }
            all_items.append(menu_item)
            seen_names.add(normalized_name)
            item_id += 1
            added += 1
            
            if added >= config['count']:
                break
    
    return all_items


def save_menu_cache(menu_items):
    """Save menu items to cache file"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    cache_data = {
        'timestamp': datetime.now().isoformat(),
        'items': menu_items,
        'total_items': len(menu_items)
    }
    
    with open(MENU_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully cached {len(menu_items)} menu items to {MENU_CACHE_FILE}")
    print(f"📅 Cache timestamp: {cache_data['timestamp']}")


def main():
    """Main function to fetch and cache menu data"""
    print("🚀 Fetching menu data from Free Food Menus API...")
    print("=" * 60)
    
    menu_items = process_menu_items()
    
    if menu_items:
        save_menu_cache(menu_items)
        print("\n📊 Menu Summary:")
        for category, config in CATEGORIES.items():
            count = sum(1 for item in menu_items if item['category'] == category.replace('-', '_'))
            print(f"  - {config['display']}: {count} items")
        print(f"\n✨ Total: {len(menu_items)} items")
    else:
        print("❌ No items fetched. Please check your internet connection and try again.")


if __name__ == "__main__":
    main()

