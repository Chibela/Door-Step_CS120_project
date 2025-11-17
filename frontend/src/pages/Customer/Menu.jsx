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

  const categories = ['all', 'burgers', 'sandwiches', 'tacos', 'appetizers', 'healthy', 'sides', 'drinks'];

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
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
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-6xl">🍔</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
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
