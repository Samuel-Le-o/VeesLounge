import React, { useState, useEffect, useRef } from 'react';
import '../ManageProduct.css'; 
import { 
  FiSearch, FiBell, FiChevronDown, FiFilter, FiDownload, 
  FiChevronLeft, FiChevronRight, FiShoppingBag, FiX,
  FiCopy, FiCheck, FiPlus, FiTrash2, FiTag, FiLayers, FiInfo, FiSliders
} from 'react-icons/fi';
import SideBar from '../components/SideBar';
import { useNavigate } from "react-router";
import { useAdminBackButton } from '../hooks/useAdminBackButton.jsx';

function Inventory() {
  const navigate = useNavigate();
  useAdminBackButton();
  const [productList, setProductList] = useState([]);
  
  // Modals & Action Menus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Permanent Active Inspection Focus
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Search & Filter Channels
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Stock Alert Metric Aggregations
  const [notifMetrics, setNotifMetrics] = useState({
    lowStockItems: [],
    outOfStockItems: [],
    totalAlertsCount: 0
  });

  // Pagination Channels
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    loadProducts();
    
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const loadProducts = () => {
    const storedItems = JSON.parse(localStorage.getItem("inventoryProducts")) || [];
    
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

    const dynamicProducts = storedItems.map((item) => {
      let resolvedThumb = "https://via.placeholder.com/100?text=No+Media";
      if (item.media && item.media.length > 0) {
        resolvedThumb = item.media[item.mainIndex || 0];
      }
      return {
        id: item.id,
        name: item.name || "Unnamed Product",
        category: item.category || 'General',
        stock: item.stock || '0',
        price: parseFloat(item.price || 0).toFixed(2),
        status: parseInt(item.stock) > 0 ? 'Active' : 'Inactive',
        image: resolvedThumb,
        tag: item.tag || '',
        description: item.description || 'No additional description provided.',
        moq: item.moq || '1',
        colors: item.colors || [],
        media: item.media || []
      };
    });

    setProductList(dynamicProducts);
    
    // Auto-focus first product if none selected to keep the workspace filled
    if (dynamicProducts.length > 0) {
      setSelectedPreviewProduct(dynamicProducts[0]);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPaginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportToCSV = () => {
    if (filteredProducts.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Product ID", "Name", "Category", "Stock Level", "Price (GHC)", "Status", "Tags"];
    const csvRows = filteredProducts.map(p => [
      p.id, `"${p.name.replace(/"/g, '""')}"`, `"${p.category}"`, p.stock, p.price, p.status, `"${p.tag}"`
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventory_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteProduct = (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const storedItems = JSON.parse(localStorage.getItem("inventoryProducts")) || [];
    const filteredItems = storedItems.filter(item => item.id !== id);
    localStorage.setItem("inventoryProducts", JSON.stringify(filteredItems));
    loadProducts();
  };

  const handleOpenEditModal = (product, e) => {
    if (e) e.stopPropagation();
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleUpdateProductSubmit = (e) => {
    e.preventDefault();
    const storedItems = JSON.parse(localStorage.getItem("inventoryProducts")) || [];
    const updatedItems = storedItems.map(item => {
      if (item.id === editingProduct.id) {
        return {
          ...item,
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          tag: editingProduct.tag,
        };
      }
      return item;
    });
    localStorage.setItem("inventoryProducts", JSON.stringify(updatedItems));
    setIsModalOpen(false);
    loadProducts();
  };

  const toggleProductStatus = (id, e) => {
    if (e) e.stopPropagation();
    const storedItems = JSON.parse(localStorage.getItem("inventoryProducts")) || [];
    const updatedItems = storedItems.map(item => {
      if (item.id === id) {
        const currentStock = parseInt(item.stock) || 0;
        return { ...item, stock: currentStock === 0 ? '45' : '0' };
      }
      return item;
    });
    localStorage.setItem("inventoryProducts", JSON.stringify(updatedItems));
    loadProducts();
  };

  const duplicateProduct = (product, e) => {
    if (e) e.stopPropagation();
    const storedItems = JSON.parse(localStorage.getItem("inventoryProducts")) || [];
    const baseItem = storedItems.find(item => item.id === product.id);
    if (baseItem) {
      const clone = { ...baseItem, id: `prod_${Date.now()}`, name: `${baseItem.name} (Copy)` };
      localStorage.setItem("inventoryProducts", JSON.stringify([...storedItems, clone]));
      loadProducts();
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SideBar />

      {/* WORKSPACE SECTION */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        
        {/* TOP ROW: Title & Dashboard Meta */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Inventory Operations Control Center</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Real-time product metrics, live catalog updates, and presentation analytics.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Store Administrator</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Active Session</span>
            </div>
            <img src="https://i.pravatar.cc/150?img=47" alt="Admin avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e11d48' }} />
          </div>
        </header>

        {/* SECTION 1: LIVE ALERTS AND METRICS BAR */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#ef4444' }}><FiShoppingBag size={24} /></div>
            <div>
              <span style={{ block: 'span', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Display Items</span>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>{productList.length} Products</h3>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '10px', color: '#f97316' }}><FiInfo size={24} /></div>
            <div>
              {/* <span style={{ block: 'span', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Stock Warnings (< 50 units)</span> */}
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#f97316', margin: '2px 0 0 0' }}>{notifMetrics.lowStockItems.length} Warnings</h3>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#ef4444' }}><FiX size={24} /></div>
            <div>
              <span style={{ block: 'span', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Depleted Out-Of-Stock</span>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '2px 0 0 0' }}>{notifMetrics.outOfStockItems.length} Dormant</h3>
            </div>
          </div>
        </section>

        {/* SECTION 2: SEARCH, FILTER & DATA MANIPULATION TOOLBAR */}
        <section style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={goToAddProduct} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e11d48', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            <FiPlus /> Create New Listing
          </button>

          <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search table by product name, tags, or fields..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
            />
          </div>

          {/* Filter Component Selector */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}
            >
              <FiFilter /> Category: {selectedCategory}
            </button>
            {isFilterDropdownOpen && (
              <div style={filterDropdownStyle}>
                {uniqueCategories.map((cat, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setSelectedCategory(cat); setIsFilterDropdownOpen(false); }}
                    style={{ ...dropdownItemStyle, backgroundColor: selectedCategory === cat ? '#f1f5f9' : 'transparent' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleExportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <FiDownload /> Export CSV Sheet
          </button>
        </section>

        {/* TWO COLUMN GRID SHOWING BOTH THE CORE TABLE AND LIVE WORKBENCH AT THE SAME TIME */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT CONTAINER: CENTRAL DATA TABLE */}
          <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfe' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Active Store Inventory Directory</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>
                    <th style={{ padding: '14px' }}>Item</th>
                    <th style={{ padding: '14px' }}>Stock State</th>
                    <th style={{ padding: '14px' }}>Price</th>
                    <th style={{ padding: '14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPaginatedProducts.map((product) => {
                    const isSelected = selectedPreviewProduct && selectedPreviewProduct.id === product.id;
                    const stockNum = parseInt(product.stock) || 0;
                    
                    return (
                      <tr 
                        key={product.id}
                        onClick={() => { setSelectedPreviewProduct(product); setActiveMediaIndex(0); }}
                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: isSelected ? '#fff1f2' : 'transparent', transition: 'background-color 0.15s' }}
                      >
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={product.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#f1f5f9' }} />
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{product.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', backgroundColor: stockNum === 0 ? '#fef2f2' : stockNum < 50 ? '#fff7ed' : '#f0fdf4', color: stockNum === 0 ? '#ef4444' : stockNum < 50 ? '#f97316' : '#22c55e' }}>
                            {stockNum === 0 ? 'Depleted' : `${stockNum} Available`}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                          GHC {product.price}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button onClick={(e) => handleOpenEditModal(product, e)} style={{ padding: '6px 10px', background: '#f1f5f9', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: '#475569' }}>Edit</button>
                            <div style={{ position: 'relative' }}>
                              <button onClick={(e) => { e.stopPropagation(); setActiveDropdownId(activeDropdownId === product.id ? null : product.id); }} style={{ padding: '6px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><FiChevronDown /></button>
                              {activeDropdownId === product.id && (
                                <div style={actionDropdownMenuStyle} ref={dropdownRef}>
                                  <button onClick={(e) => toggleProductStatus(product.id, e)} style={dropdownItemStyle}><FiCheck style={{ marginRight: '8px', color: '#22c55e' }} /> Switch Status</button>
                                  <button onClick={(e) => duplicateProduct(product, e)} style={dropdownItemStyle}><FiCopy style={{ marginRight: '8px', color: '#3b82f6' }} /> Duplicate</button>
                                  <button onClick={(e) => handleDeleteProduct(product.id, e)} style={{ ...dropdownItemStyle, color: '#ef4444' }}><FiTrash2 style={{ marginRight: '8px' }} /> Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Page {currentPage} of {totalPages || 1}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><FiChevronLeft /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><FiChevronRight /></button>
              </div>
            </div>
          </section>

          {/* RIGHT CONTAINER: LIVE INSPECTION WORKBENCH (ALWAYS SHOWN) */}
          <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSliders style={{ color: '#e11d48' }} size={18} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Live Design & Client Variant Inspector</h3>
            </div>

            {selectedPreviewProduct ? (
              <>
                {/* Media Showcase Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ width: '100%', height: '240px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={selectedPreviewProduct.media && selectedPreviewProduct.media.length > 0 ? selectedPreviewProduct.media[activeMediaIndex] : selectedPreviewProduct.image} 
                      alt="" 
                      style={{ maxWith: '100%', maxHeight: '100%', objectFit: 'contain', padding: '12px' }}
                    />
                    {selectedPreviewProduct.tag && (
                      <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>#{selectedPreviewProduct.tag}</span>
                    )}
                  </div>

                  {/* Carousel Thumbnails */}
                  {selectedPreviewProduct.media && selectedPreviewProduct.media.length > 1 && (
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {selectedPreviewProduct.media.map((img, mIdx) => (
                        <img 
                          key={mIdx} 
                          src={img} 
                          alt="" 
                          onClick={() => setActiveMediaIndex(mIdx)}
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: activeMediaIndex === mIdx ? '2px solid #e11d48' : '1px solid #cbd5e1' }} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Identity Information Details */}
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>{selectedPreviewProduct.name}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>System SKU Ref: <span style={{ fontFamily: 'monospace', color: '#334155' }}>{selectedPreviewProduct.id}</span></p>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: 0, backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>{selectedPreviewProduct.description}</p>
                </div>

                {/* Live Variant Swatches */}
                <div>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Active Client Color Variants:</span>
                  {selectedPreviewProduct.colors && selectedPreviewProduct.colors.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedPreviewProduct.colors.map((color, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#334155', border: '1px solid #e2e8f0' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }}></span>
                          {color}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>No unique color values flagged on this template.</p>
                  )}
                </div>

                {/* Direct Action Commands */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button onClick={(e) => handleOpenEditModal(selectedPreviewProduct, e)} style={{ flex: 1, padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Modify Details</button>
                  <button onClick={(e) => handleDeleteProduct(selectedPreviewProduct.id, e)} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #f1f5f9', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}><FiTrash2 /></button>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <FiLayers size={32} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Select any row from the directory to inspect deep files here simultaneously.</p>
              </div>
            )}
          </section>
        </div>

        {/* SECTION 4: PERMANENT LOWER COMPONENT BLOCK FOR STOCK ALERTS */}
        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FiBell style={{ color: '#f59e0b' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Real-Time Threshold Warning Stream</h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {notifMetrics.totalAlertsCount === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>All inventory databases currently balance above healthy operational minimums.</p>
            ) : (
              <>
                {notifMetrics.outOfStockItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                    <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500' }}>{item.name}: Stock completely depleted.</span>
                  </div>
                ))}
                {notifMetrics.lowStockItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: '#fff7ed', border: '1px solid #ffedd5' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
                    <span style={{ fontSize: '13px', color: '#9a3412', fontWeight: '500' }}>{item.name}: Diminishing stock level ({item.stock} left).</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

      </div>

      {/* PARAMETER MODAL FORM */}
      {isModalOpen && editingProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Edit Catalog Metadata</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Product Title</label>
                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} style={inputStyle} required />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tag</label>
                  <input type="text" value={editingProduct.tag} onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Price (GHC)</label>
                  <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} style={inputStyle} required />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Stock</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} style={inputStyle} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={saveBtnStyle}>Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed Visual Layout Constants
const filterDropdownStyle = { position: 'absolute', right: 0, top: '48px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '6px', padding: '4px 0', zIndex: 110, minWidth: '160px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const actionDropdownMenuStyle = { position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '6px', padding: '4px 0', zIndex: 120, minWidth: '150px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const dropdownItemStyle = { padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569' };
const inputStyle = { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' };
const cancelBtnStyle = { padding: '8px 14px', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };
const saveBtnStyle = { padding: '8px 14px', background: '#e11d48', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };

export default Inventory;