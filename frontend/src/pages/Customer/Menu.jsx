import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import { getMenu } from '../../services/api';
import { useToast } from '../../components/Toast';

const CustomerMenu = () => {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    filterMenu();
  }, [menu, selectedCategory, searchTerm]);

  const loadMenu = async () => {
    try {
      const data = await getMenu();
      setMenu(data);
      setFilteredMenu(data);
    } catch (error) {
      console.error('Error loading menu:', error);
      showToast('Failed to load menu', 'error');
    }
  };

  const filterMenu = () => {
    let filtered = menu;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMenu(filtered);
  };

  const addToCart = (item, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...item, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`${item.name} added to cart`, 'success');
  };

  // Get unique categories from menu items
  const categories = ['all', ...new Set(menu.map(item => item.category))];

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-gradient text-white shadow-md'
                      : 'bg-dust-grey text-text-dark hover:bg-primary hover:text-white'
                  }`}
                >
                  {category === 'all' ? 'All' : category.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No items found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-100">
      <div className="w-full h-48 rounded-xl mb-4 overflow-hidden bg-dust-grey/30 relative">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.image-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="image-fallback w-full h-full flex items-center justify-center absolute inset-0"
          style={{ display: item.image ? 'none' : 'flex' }}
        >
          <span className="text-6xl">🍔</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-dark mb-2">{item.name}</h3>
      <p className="text-sm text-text-light mb-4 line-clamp-2">{item.description}</p>
      {item.rating && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500">★</span>
          <span className="text-sm text-text-light">{item.rating.toFixed(1)}</span>
        </div>
      )}
      {item.allergies && item.allergies.length > 0 && (
        <div className="mb-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">May contain:</p>
          <p>{item.allergies.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 bg-dust-grey rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold text-text-dark">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 bg-dust-grey rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
      >
        <Plus className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
};

export default CustomerMenu;
