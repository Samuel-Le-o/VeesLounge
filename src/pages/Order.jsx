import React, { useState, useEffect, useRef } from 'react';
import '../Order.css';
import axios from 'axios';
import {
  FiSearch, FiBell, FiChevronDown, FiDownload, FiX, FiAlertTriangle, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import SideBar from '../components/SideBar';
import { useAdminBackButton } from '../hooks/useAdminBackButton.jsx';

// FONTAWESOME ICON SYSTEM INTEGRATION
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons"; 

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // PAGINATION ENGINE STATES
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 25;
  
  // Track hover status for buttons dynamically
  const [hoveredBtn, setHoveredBtn] = useState(null);
  
  useAdminBackButton();

  // Interactive Dropdown States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const bellRef = useRef(null);

  // Modal State for viewing details
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch real-time data from backend database API on component mount
  const fetchBackendOrders = async () => {
    try {
      setLoading(true);
      
      const storedAuth = localStorage.getItem('token') || localStorage.getItem('ACCESS_TOKEN'); 
      let token = '';

      if (storedAuth) {
        if (storedAuth.startsWith('{')) {
          const parsed = JSON.parse(storedAuth);
          token = parsed.token || parsed.adminToken || storedAuth;
        } else {
          token = storedAuth.replace(/^["']|["']$/g, '');
        }
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/order/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = response.data;
      console.log(data)

      const formattedOrders = data.map((order, index) => {
        let currentStatus = 'Pending';
        if (order.isDelivered) {
          currentStatus = 'Delivered';
        } else if (order.isOutForDelivery) {
          currentStatus = 'Out For Delivery';
        } else if (order.isProcessing) {
          currentStatus = 'Processing';
        }

        return {
          dbId: order._id || order.id || order.order_id || "", 
          rawOrderId: order.orderId || "", 
          id: order.orderId ? `#${order.orderId}` : (order._id ? `#ORD-${order._id.slice(-5).toUpperCase()}` : `#ORD-${1023 + index}`),
          customer: order.recipient || "Unknown Recipient",
          items: `${order.products?.length || 0} item${order.products?.length === 1 ? '' : 's'}`,
          total: order.totalCost || order.subtotal || "0",
          status: currentStatus,
          isProcessing: order.isProcessing || false,
          isOutForDelivery: order.isOutForDelivery || false,
          isDelivered: order.isDelivered || false,
          date: order.createdAt 
            ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'null',
          customerDetails: {
            phone: order.phone || 'N/A',
            email: order.email || 'N/A',
            address: order.address ? `${order.address}, ${order.city || ''} (${order.region || ''})` : 'N/A'
          },
          paymentMethod: order.paymentMethod || 'Mobile Money / Card',
          itemBreakdown: (order.products || []).map(p => ({
            name: p.name || 'Unnamed Product',
            qty: p.quantity || 1,
            price: p.price || '0'
          }))
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Database alignment error:", error);
      const serverErrorMessage = error.response?.data?.message || error.message;
      toast.error(`Sync Failed: ${serverErrorMessage}`, { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendOrders();

    const handleOutsideClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset pagination indexes whenever filters clean or shift queries
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Update Status directly on backend utilizing Postman Schema Configuration mapping
  const handleUpdateStatus = async (orderItem, targetStep) => {
    try {
      const storedAuth = localStorage.getItem('token') || localStorage.getItem('ACCESS_TOKEN');
      let token = storedAuth ? storedAuth.replace(/^["']|["']$/g, '') : '';

      // INTEGRATED REQ BODY VALIDATION IDS REQUIREMENT
      const payload = {
        id: orderItem.dbId,
        orderId: orderItem.rawOrderId, 
        isProcessing: targetStep === 'Processing' || targetStep === 'Out For Delivery' || targetStep === 'Delivered',
        isOutForDelivery: targetStep === 'Out For Delivery' || targetStep === 'Delivered',
        isDelivered: targetStep === 'Delivered'
      };

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/order/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Order set to ${targetStep} successfully!`);
      setSelectedOrder(null);
      fetchBackendOrders(); 
    } catch (error) {
      console.error("Status modification error:", error);
      toast.error(error.response?.data?.message || "Failed to update status parameters.", { duration: 2000 });
    }
  };

  // Delete Order completely from API Endpoint
  const handleDeleteOrder = (orderItem) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#1e293b' }}>
          Permanently remove entry <strong>{orderItem.id}</strong> from backend database ledger?
        </span>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ padding: '4px 8px', background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const storedAuth = localStorage.getItem('token') || localStorage.getItem('ACCESS_TOKEN');
                let token = storedAuth ? storedAuth.replace(/^["']|["']$/g, '') : '';

                // CORRECTED PARAM ROUTE MATCHING LOCAL CONFIG: /api/order/delete/:id
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/order/delete/${orderItem.dbId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                toast.success(`Entry ${orderItem.id} permanently cleared.`, { duration: 2000 });
                setSelectedOrder(null);
                fetchBackendOrders();
              } catch (err) {
                console.error("Deletion route error:", err);
                const exactError = err.response?.data?.message || "Failed to execute data deletion channel request.";
                toast.error(exactError,{ duration: 2000 });
              }
            }}
            style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // PAGINATION ARRAY CALCULATION PIPELINES
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrdersSlice = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPagesCount = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPagesCount) {
      setCurrentPage(pageNumber);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `order_ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Ledger logs exported successfully!");
  };

  const getStatusButtonStyle = (buttonName, isActive, activeColor, hoverColor) => {
    const isHovered = hoveredBtn === buttonName;
    return {
      padding: '10px 16px', border: 'none', borderRadius: '25px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      transition: 'all 0.25s ease-in-out', boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
      backgroundColor: isActive ? activeColor : (isHovered ? hoverColor : '#f1f5f9'),
      color: isActive ? '#fff' : (isHovered ? '#0f172a' : '#64748b'), transform: isHovered ? 'translateY(-1px)' : 'none'
    };
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <SideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="orders-main-area">
        <header className="orders-header-bar">
          <div className="header-title-container">
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            />
            <h1>Orders Overview</h1>
          </div>

          <div className="header-actions">
            <div ref={bellRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <FiBell
                className="header-icon"
                style={{ cursor: 'pointer', color: isNotificationOpen ? '#d6336c' : 'inherit' }}
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              />
              {pendingOrdersCount > 0 && (
                <span style={badgeCountStyle}>{pendingOrdersCount}</span>
              )}

              {isNotificationOpen && (
                <div style={dropdownAlertStyle}>
                  <div style={dropdownHeaderStyle}>Awaiting Fulfillment</div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {pendingOrdersCount === 0 ? (
                      <div style={{ padding: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>No new actions needed.</div>
                    ) : (
                      orders.filter(o => o.status === 'Pending').map(o => (
                        <div key={`alert-${o.id}`} style={dropdownItemStyle} onClick={() => { setSelectedOrder(o); setIsNotificationOpen(false); }} className="dropdown-alert-item-clickable">
                          <FiAlertTriangle style={{ color: '#f59e0b', marginRight: '8px', flexShrink: 0 }} />
                          <span><strong>{o.customer}</strong> created {o.id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div >
              
            </div>
          </div>
        </header>

        {/* Analytic Counter Cards Grid */}
        <section className="counters-summary-grid">
          <div className="counter-card card-pink">
            <div className="counter-icon-box">🛒</div>
            <div className="counter-data">
              <span>Total Orders</span>
              <h3>{totalOrdersCount}</h3>
            </div>
          </div>

          <div className="counter-card card-yellow">
            <div className="counter-icon-box">🪙</div>
            <div className="counter-data">
              <span>Pending Orders</span>
              <h3>{pendingOrdersCount}</h3>
            </div>
          </div>

          <div className="counter-card card-green">
            <div className="counter-icon-box">✓</div>
            <div className="counter-data">
              <span>Completed Orders</span>
              <h3>{completedOrdersCount}</h3>
            </div>
          </div>
        </section>

        {/* Toolbar Strip */}
        <section className="orders-toolbar-strip">
          <div className="toolbar-search-input-wrapper">
            <FiSearch className="search-embedded-icon" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="toolbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={clearSearchBtnStyle}><FiX /></button>
            )}
          </div>

          <div className="toolbar-select-wrapper">
            <select
              className="toolbar-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="outfordelivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <FiChevronDown className="dropdown-arrow-embedded" />
          </div>

          <div className="toolbar-select-wrapper export-wrapper">
            <button className="btn-export-trigger" onClick={handleExportData}>
              <FiDownload /> Export Logs
            </button>
          </div>
        </section>

        {/* Master Data Ledger Panel */}
        <section className="ledger-table-panel">
          <div className="table-responsive-wrapper">
            <table className="orders-dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', paddingLeft: '16px' }}>No.</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total (₵)</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="actions-column-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <span style={{ display: 'inline-block', marginRight: '8px' }}>🔄</span> 
                      Synchronizing pipeline logs...
                    </td>
                  </tr>
                ) : currentOrdersSlice.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No matching order invoice logs found.
                    </td>
                  </tr>
                ) : (
                  currentOrdersSlice.map((order, index) => (
                    <tr key={order.id}>
                      {/* CONTINUOUS COUNTING INDEX */}
                      <td style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', paddingLeft: '16px' }}>
                        {indexOfFirstOrder + index + 1}
                      </td>
                      <td className="order-id-bold">{order.id}</td>
                      <td>
                        <div className="customer-profile-cell">
                          <div style={tableAvatarFallbackStyle}>
                            <FontAwesomeIcon icon={faUser} style={{ fontSize: '12px' }} />
                          </div>
                          <span className="customer-name-text">{order.customer}</span>
                        </div>
                      </td>
                      <td className="item-count-text">{order.items}</td>
                      <td className="total-price-text">₵ {order.total}</td>
                      <td>
                        <span className={`status-badge-pill pill-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="date-cell-text">{order.date}</td>
                      <td>
                        <div className="row-action-buttons-cluster">
                          <button
                            className="btn-row-main view-action-trigger"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View & Manage
                          </button>
                          
                          {/* EMBEDDED UPDATE: Delete action evaluates only after marking completed/delivered */}
                          {order.status === 'Delivered' && (
                            <button
                              className="btn-row-alt alt-delete"
                              onClick={() => handleDeleteOrder(order)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC PAGINATION CONTROLLER FOOTER BLOCK */}
          {totalPagesCount > 1 && (
            <footer className="ledger-pagination-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span className="entries-counter-label" style={{ fontSize: '13px', color: '#64748b' }}>
                Showing <strong>{indexOfFirstOrder + 1}</strong> to <strong>{Math.min(indexOfLastOrder, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> entries
              </span>
              <div className="pagination-action-cluster" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  style={{ ...paginationArrowBtnStyle, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <FiChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPagesCount }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={`page-idx-${pageNum}`}
                    onClick={() => paginate(pageNum)}
                    className={`page-index-btn ${currentPage === pageNum ? 'active-idx' : ''}`}
                    style={{
                      padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      backgroundColor: currentPage === pageNum ? '#d6336c' : '#fff',
                      color: currentPage === pageNum ? '#fff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPagesCount}
                  style={{ ...paginationArrowBtnStyle, opacity: currentPage === totalPagesCount ? 0.4 : 1, cursor: currentPage === totalPagesCount ? 'not-allowed' : 'pointer' }}
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </footer>
          )}
        </section>
      </main>

      {/* INSPECTION DIALOG OVERLAY (MODAL) */}
      {selectedOrder && (
        <div className="modal-overlay-container" style={modalOverlayStyle} onClick={() => setSelectedOrder(null)}>
          <div className="modal-content-card" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Invoice Inspection Details</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Order Identifier: {selectedOrder.id}</span>
              </div>
              <button style={closeModalBtnStyle} onClick={() => setSelectedOrder(null)}><FiX size={18} /></button>
            </div>

            <div className="modal-scrollable-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={profileIconContainerStyle}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>{selectedOrder.customer}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Logged on {selectedOrder.date}</p>
                  </div>
                </div>
                <span className={`status-badge-pill pill-${selectedOrder.status.toLowerCase().replace(/\s+/g, '-')}`}>{selectedOrder.status}</span>
              </div>

              <div>
                <h2 style={panelSectionHeadingStyle}>Customer & Fulfillment Details</h2>
                <div style={panelCardStyle}>
                  <p style={dataRowStyle}><strong>Phone:</strong> <span>{selectedOrder.customerDetails?.phone || 'N/A'}</span></p>
                  <p style={dataRowStyle}><strong>Email:</strong> <span>{selectedOrder.customerDetails?.email || 'N/A'}</span></p>
                  <p style={dataRowStyle} className="address-row">
                    <strong>Fulfillment Address:</strong> 
                    <span style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{selectedOrder.customerDetails?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div>
                <h2 style={panelSectionHeadingStyle}>Pipeline Progress Actions</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0' }}>
                  <button 
                    onMouseEnter={() => setHoveredBtn('processing')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleUpdateStatus(selectedOrder, 'Processing')}
                    style={getStatusButtonStyle('processing', selectedOrder.isProcessing, '#3b82f6', '#dbeafe')}
                  >
                    {selectedOrder.isProcessing ? '✓ Processing Active' : 'Mark Processing'}
                  </button>
                  
                  <button 
                    onMouseEnter={() => setHoveredBtn('shipping')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleUpdateStatus(selectedOrder, 'Out For Delivery')}
                    style={getStatusButtonStyle('shipping', selectedOrder.isOutForDelivery, '#f59e0b', '#fef3c7')}
                  >
                    {selectedOrder.isOutForDelivery ? '✓ Out for Delivery' : 'Mark Out for Delivery'}
                  </button>
                  
                  <button 
                    onMouseEnter={() => setHoveredBtn('delivered')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleUpdateStatus(selectedOrder, 'Delivered')}
                    style={getStatusButtonStyle('delivered', selectedOrder.isDelivered, '#10b981', '#d1fae5')}
                  >
                    {selectedOrder.isDelivered ? '✓ Delivered Complete' : 'Mark Delivered'}
                  </button>
                </div>
              </div>

              <div>
                <h2 style={panelSectionHeadingStyle}>Product Itemized Breakdown</h2>
                <div style={{ ...panelCardStyle, padding: '8px 0' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '280px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '8px 16px' }}>Product Unit</th>
                          <th style={{ padding: '8px 16px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px 16px', textAlign: 'right' }}>Unit Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.itemBreakdown?.map((item, idx) => (
                          <tr key={`item-${idx}`} style={{ borderBottom: idx !== selectedOrder.itemBreakdown.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                            <td style={{ padding: '8px 16px', color: '#334155', fontWeight: '500' }}>{item.name}</td>
                            <td style={{ padding: '8px 16px', textAlign: 'center', color: '#64748b' }}>{item.qty}</td>
                            <td style={{ padding: '8px 16px', textAlign: 'right', color: '#0f172a' }}>₵{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ borderTop: '2px dashed #e2e8f0', marginTop: '8px', padding: '12px 16px 4px 16px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>
                    <span>Total Bill:</span>
                    <span style={{ color: '#d6336c' }}>₵ {selectedOrder.total}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Object Assets
const profileIconContainerStyle = {
  width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0'
};
const tableAvatarFallbackStyle = {
  width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f8fafc',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginRight: '10px', border: '1px solid #f1f5f9'
};
const paginationArrowBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px',
  border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#fff', color: '#64748b', transition: 'all 0.15s ease'
};

const badgeCountStyle = { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#d6336c', color: '#fff', fontSize: '10px', borderRadius: '9999px', padding: '2px 6px', fontWeight: 'bold' };
const dropdownAlertStyle = { position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '260px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100 };
const dropdownHeaderStyle = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: '13px', color: '#1e293b' };
const dropdownItemStyle = { display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f8fafc', fontSize: '12px', color: '#334155', cursor: 'pointer' };
const clearSearchBtnStyle = { border: 'none', background: 'none', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 };
const modalContentStyle = { width: '100%', maxWidth: '460px', height: '100%', backgroundColor: '#fff', boxShadow: '-4px 0 25px -5px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' };
const modalHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' };
const closeModalBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' };
const panelSectionHeadingStyle = { margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' };
const panelCardStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#f8fafc' };
const dataRowStyle = { display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontSize: '13px', color: '#334155' };

export default Order;