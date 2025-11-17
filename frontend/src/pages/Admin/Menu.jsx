import React, { useState, useEffect } from 'react';
import { Search, Filter, Utensils } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getMenu } from '../../services/api';
import { useToast } from '../../components/Toast';

const AdminMenu = () => {
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
    let filtered = [...menu];

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

  const categories = ['all', ...new Set(menu.map(item => item.category))];

  const getCategoryLabel = (category) => {
    if (category === 'all') return 'All';
    return category.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <p className="text-sm text-text-light mb-1">Total Items</p>
              <p className="text-3xl font-bold text-text-dark">{menu.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <p className="text-sm text-text-light mb-1">Categories</p>
              <p className="text-3xl font-bold text-text-dark">{categories.length - 1}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-text-light" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{getCategoryLabel(category)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                <div className="w-full h-48 rounded-xl mb-4 overflow-hidden bg-dust-grey/30 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.admin-image-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="admin-image-fallback w-full h-full flex items-center justify-center absolute inset-0"
                    style={{ display: item.image ? 'none' : 'flex' }}
                  >
                    <Utensils className="w-8 h-8 text-text-light" />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-dust-grey text-text-dark rounded-full text-xs font-semibold">
                    {getCategoryLabel(item.category)}
                  </span>
                  {item.rating && (
                    <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                      <span>★</span>
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-text-dark mb-2">{item.name}</h3>
                <p className="text-sm text-text-light mb-3 line-clamp-2">{item.description}</p>
                {item.cuisine && (
                  <p className="text-xs text-text-light mb-4">Cuisine: {item.cuisine}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
                  <div className="text-sm text-text-light">{item.id.padStart(3, '0')}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 mt-6">
              <p className="text-text-light text-lg">No items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;

