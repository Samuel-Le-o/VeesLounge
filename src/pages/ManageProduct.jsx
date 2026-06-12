import React, { useState, useEffect, useRef } from 'react';
import '../ManageProduct.css';
import { 
  FiSearch, FiBell, FiChevronDown, FiFilter, FiDownload, 
  FiChevronLeft, FiChevronRight, FiShoppingBag, FiX,
  FiPlus
} from 'react-icons/fi';
import SideBar from '../components/SideBar';
import { useNavigate } from "react-router";
import toast from 'react-hot-toast'; 
import axios from 'axios';
import { useAdminBackButton } from '../hooks/useAdminBackButton.jsx';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return windowSize;
}

function ManageProduct() {
  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Prevent unauthorized navigation and warn on browser back/forward
  useAdminBackButton();

  // Interactive UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedEditPreview, setSelectedEditPreview] = useState(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // --- NOTIFICATION BELL INTERACTIVE UI STATES ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // --- NOTIFICATION STORE STATES ---
  const [notifMetrics, setNotifMetrics] = useState({
    lowStockItems: [],
    outOfStockItems: [],
    totalAlertsCount: 0
  });

  // --- DYNAMIC PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; 

  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  // Load backend database and handle outside click triggers
  useEffect(() => {
    loadProducts();
    
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // --- LIVE BACKEND REFRESH ENGINE ---
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/all`);
      
      const storedItems = response.data || [];
      
      const outOfStock = storedItems.filter(item => (parseInt(item.stock) || 0) === 0);
      const lowStock = storedItems.filter(item => {
        const stockVal = parseInt(item.stock) || 0;
        return stockVal < 50 && stockVal > 0;
      });

      setNotifMetrics({
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        totalAlertsCount: outOfStock.length + lowStock.length
      });

      const dynamicProducts = storedItems.map((item, idx) => {
        let resolvedThumb = "https://via.placeholder.com/100?text=No+Media";
        if (item.images && item.images.length > 0) {
          resolvedThumb = item.images[0];
        } else if (item.media && item.media.length > 0) {
          resolvedThumb = item.media[item.mainIndex || 0];
        }
        
        return {
          id: item.id || item._id || `product-${idx}`,
          name: item.name || "",
          description: item.description || "",
          category: item.category || "",
          WholesaleMOQ: item.WholesaleMOQ || item.minimumOrder || item.moq || "1",
          stock: item.stock || "0",
          wholesalePrice: parseFloat(item.wholesalePrice || 0).toFixed(2),
          retailPrice: parseFloat(item.retailPrice || item.price || 0).toFixed(2),
          price: parseFloat(item.retailPrice || item.price || 0).toFixed(2), // for table visualization
          status: parseInt(item.stock) > 0 ? 'Active' : 'Inactive',
          image: resolvedThumb,
          tag: item.tag || '',
          colors: Array.isArray(item.colors) ? item.colors : [],
          media: item.images || item.media || []
        };
      });
      
      setProductList(dynamicProducts);
    } catch (error) {
      console.error("Database connection failure:", error);
      toast.error("Failed to synchronize inventory database.");
    } finally {
      setLoading(false);
    }
  };

  const goToAddProduct = () => navigate("/addproduct");

  const filteredProducts = productList.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ["All", ...new Set(productList.map(p => p.category))];

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [searchQuery, selectedCategory, totalPages, currentPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPaginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportToCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const headers = ["Product ID", "Name", "Category", "Description", "Wholesale MOQ", "Stock Level", "Wholesale Price (GHC)", "Retail Price (GHC)", "Colors", "Status", "Tags"];
    const csvRows = filteredProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      p.WholesaleMOQ,
      p.stock,
      p.wholesalePrice,
      p.retailPrice,
      `"${p.colors.join(', ')}"`,
      p.status,
      `"${p.tag}"`
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventory_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported successfully!");
  };

  const handleDeleteProduct = async (id) => {
    setActiveDropdownId(null);
    
    const confirmed = window.confirm("Are you sure you want to permanently remove this product?");
    if (!confirmed) return;

    const loadId = toast.loading("Purging product records...");
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/product/delete/${id}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });
      
      toast.dismiss(loadId);
      toast.success("Product successfully removed from live database.");
      setProductList(prev => prev.filter(item => item.id !== id));
      
      setNotifMetrics(prev => {
        const remainingLow = prev.lowStockItems.filter(item => item._id !== id && item.id !== id);
        const remainingOut = prev.outOfStockItems.filter(item => item._id !== id && item.id !== id);
        return {
          lowStockItems: remainingLow,
          outOfStockItems: remainingOut,
          totalAlertsCount: remainingLow.length + remainingOut.length
        };
      });
    } catch (error) {
      toast.dismiss(loadId);
      toast.error(error.response?.data?.message || "Could not completely erase database record.");
    }
  };

  const getUniqueFiles = (files) => {
    const uniqueKeys = new Set();
    return files.filter((file) => {
      const key = `${file.name}-${file.size}-${file.type}`;
      if (uniqueKeys.has(key)) return false;
      uniqueKeys.add(key);
      return true;
    });
  };

  const handleOpenEditModal = (product) => {
    setActiveDropdownId(null);

    const existingImages = [];
    const existingSet = new Set();

    if (product.image && !existingSet.has(product.image)) {
      existingImages.push(product.image);
      existingSet.add(product.image);
    }

    if (product.media && Array.isArray(product.media)) {
      product.media.forEach((url) => {
        if (!existingSet.has(url)) {
          existingImages.push(url);
          existingSet.add(url);
        }
      });
    }

    setEditingProduct({
      ...product,
      media: [],
      existingImages
    });
    setIsModalOpen(true);
    setSelectedEditPreview(null);
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    if (!editingProduct || !editingProduct.existingImages) return;
    const removedUrl = editingProduct.existingImages[indexToRemove];
    const updatedExistingImages = editingProduct.existingImages.filter((_, index) => index !== indexToRemove);
    setEditingProduct({
      ...editingProduct,
      existingImages: updatedExistingImages,
      image: removedUrl === editingProduct.image ? updatedExistingImages[0] || '' : editingProduct.image
    });
  };

  const handleRemoveEditMedia = (indexToRemove) => {
    if (!editingProduct || !editingProduct.media) return;
    const updatedMedia = editingProduct.media.filter((_, index) => index !== indexToRemove);
    setEditingProduct({ ...editingProduct, media: updatedMedia });
  };

  // --- SYNCED DATABASE UPDATE CONTROLLER MATCHING THE SCREENSHOT SPEC ---
  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();

    const loadId = toast.loading("Synchronizing updates with backend database...");

    try {
      const formData = new FormData();

      // Form payload mappings precisely aligned to the documentation in Screenshot_21_2.png
      formData.append('name', editingProduct.name);
      formData.append('description', editingProduct.description);
      formData.append('category', editingProduct.category);
      formData.append('WholesaleMOQ', parseInt(editingProduct.WholesaleMOQ));
      formData.append('stock', parseInt(editingProduct.stock));
      formData.append('wholesalePrice', parseFloat(editingProduct.wholesalePrice));
      formData.append('retailPrice', parseFloat(editingProduct.retailPrice));

      // Appending multi-value color form parameters sequentially to match the endpoint schema
      const colors = editingProduct.colors || [];
      const updatedColors = colors.filter((color) => color.trim() !== "");

      // Handle raw multimedia file uploads
      const newFileUploads = editingProduct.media || [];
      const existingImages = editingProduct.existingImages;

      if (existingImages.length === 0 && newFileUploads.length === 0) {
        toast.dismiss(loadId);
        toast.error('Images required', {duration: 2000});
        return;
      }
      
      const targetId = editingProduct.id;
      
      if (editingProduct.tag !== '') {
        formData.append('tag', editingProduct.tag);
      }

      colors.forEach(color => {
        formData.append("colors[]", color);
      });

      existingImages.forEach((url) => {
        formData.append('existingImages[]', url)
      });

      newFileUploads.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/product/update/${targetId}`,
        formData,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.dismiss(loadId);
      toast.success("Product parameters updated successfully.");
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts();

    } catch (error) {
      console.log(error)
      toast.dismiss(loadId);
      toast.error(error.response?.data?.message || "Failed to save updated parameters.");
    }
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const toggleProductStatus = async (id) => {
    setActiveDropdownId(null);
    const targetProduct = productList.find(p => p.id === id);
    if (!targetProduct) return;

    const currentStock = parseInt(targetProduct.stock) || 0;
    const targetStock = currentStock === 0 ? 10 : 0;
    
    const loadId = toast.loading("Updating visibility states...");
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/product/update/${id}`,
        { stock: targetStock },
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
          }
        }
      );
      
      toast.dismiss(loadId);
      if (targetStock > 0) {
        toast.success("Product is now Active (Defaulted to 10 units).");
      } else {
        toast.error("Product is now Inactive (Stock set to 0).");
      }
      loadProducts();
    } catch (error) {
      toast.dismiss(loadId);
      toast.error("Failed to alter product status config.");
    }
  };

  const lowStockItems = filteredProducts.filter(p => {
    const s = parseInt(p.stock) || 0;
    return s <= 5 && s > 0;
  });
  const outOfStockItems = filteredProducts.filter(p => (parseInt(p.stock) || 0) === 0);

  return (
    <div className="admin-layout">
      <SideBar isModalOpen={isModalOpen} editingProduct={editingProduct} />

      <main className="inventory-main">
        {/* Header Section */}
        <header className="inventory-header">
          <h1>Manage Products</h1>
          <div className="header-actions" ref={notifRef}>
            <button 
              className={`icon-btn badge-btn ${isNotifOpen ? 'active-bell' : ''}`}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' }}
            >
              <FiBell className="header-icon" style={{ margin: 0 }} /> 
              {notifMetrics.totalAlertsCount > 0 && (
                <span className="badge" style={badgeNotifStyle}>
                  {notifMetrics.totalAlertsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="notification-dropdown-panel" style={notifPanelStyle}>
                <div style={notifHeaderStyle}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>Inventory Stock Alerts</span>
                  <button onClick={() => setIsNotifOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><FiX /></button>
                </div>
                
                <div className="notification-scroll-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifMetrics.totalAlertsCount === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                      All items have healthy stock configurations.
                    </div>
                  ) : (
                    <>
                      {notifMetrics.outOfStockItems.map(item => (
                        <div key={`notif-out-${item._id || item.id}`} style={notifItemStyle}>
                          <div style={{ ...statusIndicatorStyle, backgroundColor: '#ef4444' }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{item.name} is empty!</span>
                            <small style={{ fontSize: '11px', color: '#64748b' }}>Stock dropped to absolute 0 units.</small>
                          </div>
                        </div>
                      ))}

                      {notifMetrics.lowStockItems.map(item => (
                        <div key={`notif-low-${item._id || item.id}`} style={notifItemStyle}>
                          <div style={{ ...statusIndicatorStyle, backgroundColor: '#f97316' }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{item.name} running low</span>
                            <small style={{ fontSize: '11px', color: '#64748b' }}>Critical Level: {item.stock} items left in store.</small>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Toolbar Controls */}
        <section className="inventory-toolbar">
          <button className="add-product-btn" onClick={goToAddProduct}>
            <span className="plus-sign">+</span> Add New Product
          </button>

          <div className="search-bar-wrapper">
            <FiSearch className="input-search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, category, tags..." 
              className="toolbar-search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ border: 'none', background: 'none', position: 'absolute', right: '45px', cursor: 'pointer', color: '#94a3b8' }}><FiX /></button>
            )}
          </div>

          <div className="filter-button-container" style={{ position: 'relative' }} ref={filterRef}>
            <button 
              className={`toolbar-action-btn ${selectedCategory !== 'All' ? 'active-filter' : ''}`}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <FiFilter /> Filter: {selectedCategory}
            </button>
            
            {isFilterDropdownOpen && (
              <div className="filter-dropdown-select" style={filterDropdownStyle}>
                <span style={{ fontSize: '11px', padding: '6px 12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Filter By Category</span>
                {uniqueCategories.map((cat, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setSelectedCategory(cat); setIsFilterDropdownOpen(false); }}
                    style={{ ...dropdownItemStyle, backgroundColor: selectedCategory === cat ? '#f1f5f9' : 'transparent', fontWeight: selectedCategory === cat ? '600' : '400' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="toolbar-action-btn export-csv-btn" onClick={handleExportToCSV}>
            <FiDownload /> Export CSV
          </button>
        </section>

        {/* Table Panel Grid */}
        <section className="table-panel">
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '8px', color: '#64748b' }}>
              <h3>Synchronizing item configurations with live backend database...</h3>
            </div>
          ) : productList.length === 0 ? (
            <div className="empty-state-wrapper" style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '8px' }}>
              <FiShoppingBag style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '16px' }} />
              <h3 style={{ color: '#334155', marginBottom: '8px', fontSize: '18px' }}>Your Catalog Database is Empty</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>You haven't added a product yet.</p>
              <button className="add-product-btn" onClick={goToAddProduct}><FiPlus /> Add Your First Product</button>
            </div>
          ) : currentPaginatedProducts.length === 0 ? (
            <div className="empty-state-wrapper" style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '8px' }}>
              <FiSearch style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px' }} />
              <h3 style={{ color: '#334155', marginBottom: '8px' }}>No Products Matching Criteria</h3>
              <button className="add-product-btn" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>Clear Active Filters</button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Retail Price</th>
                      <th>Wholesale Price</th>
                      <th>Status</th>
                      <th className="center-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPaginatedProducts.map((product, index) => {
                      const stockValue = parseInt(product.stock) || 0;
                      const isOutOfStock = stockValue === 0;
                      const displayRowNumber = indexOfFirstItem + index + 1;

                      return (
                        <tr key={product.id}>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>{displayRowNumber}.</td>
                          <td>
                            <div className="product-identity-cell">
                              <img src={product.image} alt={product.name} className="product-thumb" />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="product-title-text">{product.name}</span>
                                {product.tag && <span className="meta-hash-tag" style={{ fontSize: '11px', color: '#e11d48', fontWeight: '500' }}>#{product.tag}</span>}
                              </div>
                            </div>
                          </td>
                          <td><span className="category-tag">{product.category}</span></td>
                          <td className="stock-cell-data">
                            <span className={isOutOfStock ? 'danger-text' : ''}>
                              {isOutOfStock ? 'Out of Stock' : `${stockValue} units`}
                            </span>
                          </td>
                          <td className="price-text-bold">GHC {product.retailPrice}</td>
                          <td className="price-text-bold text-slate-600">GHC {product.wholesalePrice}</td>
                          <td>
                            <span className={`status-pill ${!isOutOfStock ? 'pill-active' : 'pill-inactive'}`}>
                              {isOutOfStock ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-button-cluster" style={{ position: 'relative' }}>
                              <button className="row-btn edit-row-btn" onClick={() => handleOpenEditModal(product)}>Edit</button>
                              <button className="row-btn delete-row-btn" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                              
                              {/* <div style={{ display: 'inline-block' }} ref={activeDropdownId === product.id ? dropdownRef : null}>
                                <button className="row-dropdown-toggle" onClick={(e) => toggleDropdown(product.id, e)}><FiChevronDown /></button>
                                {activeDropdownId === product.id && (
                                  <div className="custom-dropdown-menu" style={actionDropdownMenuStyle}>
                                    <button onClick={() => toggleProductStatus(product.id)} style={dropdownItemStyle}>Toggle Stock Status</button>
                                  </div>
                                )}
                              </div> */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="table-pagination-footer">
                <span className="entries-count">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries</span>
                <div className="pagination-controls">
                  <button className="page-arrow-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i+1} className={`page-num-btn ${currentPage === i+1 ? 'active-page' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="page-arrow-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><FiChevronRight /></button>
                </div>
              </footer>
            </>
          )}
        </section>
      </main>

      {/* --- EDITED OVERLAY MODAL TO ACCURATELY MIMIC ADDPRODUCT FIELDS --- */}
      {isModalOpen && editingProduct && (
        <div className="modal-overlay-backdrop p-5" style={modalOverlayStyle}>
          <div className="modal-content-car w-full md:w-1/2 h-full" style={modalContentStyle}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#1a202c', margin: 0 }}>Edit Product Parameters</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#718096' }}><FiX /></button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* input: name */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Product Name (name)</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={inputStyle} required
                />
              </div>

              {/* input: description */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Description (description)</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} required
                />
              </div>

              {/* input: category */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Category (category)</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  style={inputStyle} required
                />
              </div>

              {/* input: WholesaleMOQ & stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Wholesale MOQ (WholesaleMOQ)</label>
                  <input
                    type="number"
                    readOnly
                    value={editingProduct.WholesaleMOQ}
                    onChange={(e) => setEditingProduct({ ...editingProduct, WholesaleMOQ: e.target.value })}
                    style={inputStyle} required
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Stock Level (stock)</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    style={inputStyle} required
                  />
                </div>
              </div>

              {/* input: wholesalePrice & retailPrice */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Wholesale Price (wholesalePrice)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.wholesalePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: e.target.value })}
                    style={inputStyle} required
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Retail Price (retailPrice)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.retailPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: e.target.value })}
                    style={inputStyle} required
                  />
                </div>
              </div>

              {/* input: tag */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Tag (tag)</label>
                <input
                  type="text"
                  value={editingProduct.tag}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* input: colors array configuration */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Colors (comma-separated list for payload arrays)</label>
                <input
                  type="text"
                  value={editingProduct.colors.join(', ')}
                  placeholder="e.g. gold, silver, black"
                  onChange={(e) => setEditingProduct({ 
                    ...editingProduct, 
                    colors: e.target.value.split(',').map(s => s.trim())
                  })}
                  style={inputStyle}
                />
              </div>

              {/* input: images uploads mapping */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Product Images (images)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const addedFiles = Array.from(e.target.files);
                      setEditingProduct((prev) => ({
                        ...prev,
                        media: getUniqueFiles([...(prev.media || []), ...addedFiles])
                      }));
                    }
                  }}
                  style={inputStyle}
                />

                {/* Saved Existing Database Image Previews */}
                {editingProduct.existingImages && editingProduct.existingImages.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                    {editingProduct.existingImages.map((url, idx) => (
                      <div key={`exist-${idx}`} style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={url} alt="existing" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => setSelectedEditPreview({ url, type: 'image' })} />
                        <button type="button" onClick={() => handleRemoveExistingImage(idx)} style={removeImageBadgeStyle}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Staged New Additions Upload Previews */}
                {editingProduct.media && editingProduct.media.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                    {editingProduct.media.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-${idx}`} style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={objectUrl} alt="staged preview" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => setSelectedEditPreview({ url: objectUrl, type: 'image' })} />
                          <button type="button" onClick={() => handleRemoveEditMedia(idx)} style={removeImageBadgeStyle}>×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Discard Changes</button>
                <button type="submit" style={saveBtnStyle}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN MEDIA PREVIEW */}
      {selectedEditPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }} onClick={() => setSelectedEditPreview(null)}>
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <img src={selectedEditPreview.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }} />
            <button onClick={() => setSelectedEditPreview(null)} style={{ position: 'absolute', top: '-40px', right: '-40px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Layout styles configurations
const badgeNotifStyle = { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#e11d48', color: '#fff', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', minWidth: '16px', height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2px' };
const notifPanelStyle = { position: 'absolute', right: '40px', top: '45px', backgroundColor: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '8px', width: '290px', zIndex: 1000, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const notifHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' };
const notifItemStyle = { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #f8fafc', lineHeight: '1.3' };
const statusIndicatorStyle = { width: '8px', height: '8px', borderRadius: '50%', marginTop: '4px', flexShrink: 0 };
const dropdownItemStyle = { padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '13px', color: '#4a5568', display: 'flex', alignItems: 'center' };
const filterDropdownStyle = { position: 'absolute', left: 0, top: '45px', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '6px', padding: '6px 0', zIndex: 110, minWidth: '180px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' };
const actionDropdownMenuStyle = { position: 'absolute', right: 0, top: '35px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '6px', padding: '6px 0', zIndex: 100, minWidth: '160px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', zIndex: 1001 };

const modalContentStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflowY: 'auto' };

const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#334155' };
const inputStyle = { padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' };
const cancelBtnStyle = { padding: '10px 16px', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const saveBtnStyle = { padding: '10px 16px', background: '#e11d48', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const removeImageBadgeStyle = { position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', padding: 0 };

export default ManageProduct;