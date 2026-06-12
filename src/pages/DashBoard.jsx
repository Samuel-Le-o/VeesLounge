import React, { useState, useEffect, useRef } from 'react';
import '../DashBoard.css';
import { NavLink } from 'react-router';
import axios from 'axios'; // Imported to handle API connectivity

// Import the specific icons we need
import {
  FiSearch, FiBell, FiTag, FiAlertTriangle, FiBox,
  FiArchive, FiUser, FiActivity, FiDollarSign, FiX
} from 'react-icons/fi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";

import SideBar from '../components/SideBar';
import { useAdminBackButton } from '../hooks/useAdminBackButton.jsx';

// ==========================================================================
// STATIC INLINE STYLES MOVED TO TOP TO PREVENT INITIALIZATION HOP RUNTIME ERRORS
// ==========================================================================
const notifPanelStyle = {
  position: 'absolute',
  top: '50px',
  backgroundColor: '#ffffff',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  zIndex: 1600,
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column'
};

const notifHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '14px'
};

const notifItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px 16px',
  borderBottom: '1px solid #f8fafc',
  transition: 'background-color 0.2s',
  lineHeight: '1.3'
};

const statusIndicatorStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginTop: '4px',
  flexShrink: 0
};

function DashBoard() {
  // Global loading states for overall dashboard network requests
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);

  useAdminBackButton();

  // --- STATE SYSTEM FOR DYNAMIC REAL-TIME MONITORING ---
  const [productMetrics, setProductMetrics] = useState({
    totalProducts: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    lowStockItems: [],
    outOfStockItems: []
  });

  const [orderMetrics, setOrderMetrics] = useState({
    todaysSales: "0.00",
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    newCustomersCount: 0
  });

  const [liveOrdersList, setLiveOrdersList] = useState([]);

  // --- STATE ALLOCATIONS FOR DYNAMIC PROMOTIONS ENGINE ---
  const [activePromotionsList, setActivePromotionsList] = useState([]);

  // --- NOTIFICATION BELL INTERACTIVE UI STATES ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Window width tracking to adjust inline styles dynamically for mobile viewports
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Click outside handler to dismiss notification dropdown
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // MASTER DASHBOARD SYNCHRONIZATION ENGINE
  useEffect(() => {
    const synchronizeDashboard = async () => {
      try {
        setLoadingDashboardData(true);

        // Fire all endpoints parallel to maximize pipeline speed
        await Promise.all([
          fetchLiveCatalogMetrics(),
          fetchLiveTodayStats(),
          fetchLiveRecentOrders(),
          fetchLivePromotionsData() // Linked clean inside pipeline execution loop
        ]);

      } catch (err) {
        console.error("Dashboard master synchronization error:", err);
      } finally {
        loadingDashboardData && setLoadingDashboardData(false);
      }
    };

    synchronizeDashboard();
  }, []);

  // =====================================================================
  // 1. LIVE REFRESH LINK: INVENTORY BACKEND DATA (ACTIVE)
  // =====================================================================
  const fetchLiveCatalogMetrics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/all`);

      // Adapt safely based on array wrappers
      const storedItems = response.data.products || response.data || [];

      const outOfStock = storedItems.filter(item => (parseInt(item.stock) || 0) === 0);
      const lowStock = storedItems.filter(item => {
        const stockVal = parseInt(item.stock) || 0;
        return stockVal < 50 && stockVal > 0;
      });

      // Remap properties safely to match existing component names
      const normalLowStockItems = lowStock.map(item => ({
        id: item._id,
        name: item.name || "Unnamed Item",
        stock: item.stock || 0
      }));

      const normalOutOfStockItems = outOfStock.map(item => ({
        id: item._id,
        name: item.name || "Unnamed Item",
        stock: 0
      }));

      setProductMetrics({
        totalProducts: storedItems.length,
        outOfStockCount: outOfStock.length,
        lowStockCount: lowStock.length,
        lowStockItems: normalLowStockItems,
        outOfStockItems: normalOutOfStockItems
      });
    } catch (error) {
      console.error("Failed syncing products metric data:", error);
    }
  };

  // =====================================================================
  // 2. LIVE REFRESH LINK: REAL-TIME PROMOTIONS RUNTIME FILTER ENGINE
  // =====================================================================
  const fetchLivePromotionsData = async () => {
    try {
      // 1. Add authorization headers so the backend doesn't reject the request
      const token = localStorage.getItem("ACCESS_TOKEN");
      const config = token ? { headers: { authorization: `Bearer ${token}` } } : {};

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotion/all`, config);

      // 2. Extract data safely whether it's raw or wrapped in a 'promotions' key
      const originalPromoArray = response.data?.promotions || response.data || [];

      if (!Array.isArray(originalPromoArray)) {
        console.warn("Promotions data returned from server is not an array:", originalPromoArray);
        setActivePromotionsList([]);
        return;
      }

      const currentTime = new Date();

      const calculatedActivePromos = originalPromoArray.filter(p => {
        // Drop explicitly paused items immediately
        if (p.status === 'paused') return false;

        // Extract values
        const startDate = p.startDate || p.start;
        const endDate = p.endDate || p.end;

        if (!startDate || !endDate) return false;

        // 3. Clean Date Formatting: Ensure standard 'YYYY-MM-DD' split to prevent timezone shifting quirks
        const cleanStartDate = startDate.split('T')[0];
        const cleanEndDate = endDate.split('T')[0];

        const startTime = p.startTime || '00:00';
        const endTime = p.endTime || '23:59';

        const startObj = new Date(`${cleanStartDate}T${startTime}`);
        const endObj = new Date(`${cleanEndDate}T${endTime}`);

        // Check if current system time falls between start and end boundaries
        return currentTime >= startObj && currentTime <= endObj;
      });

      setActivePromotionsList(calculatedActivePromos);
    } catch (error) {
      console.error("Dashboard engine failed to load fresh campaigns:", error);
      setActivePromotionsList([]);
    }
  };

  // =====================================================================
  // 🛠️ BACKEND DEVELOPER: INSERT TODAY'S STATS LINK HERE
  // Replace the placeholder URL below once your collaborator completes the endpoint.
  // =====================================================================
  const fetchLiveTodayStats = async () => {
    try {
      // PLUG REAL URL PATH HERE:
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/today-stats`, {
        headers: { authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}` }
      });

      // Destructure data parameters returned from the Mongoose aggregations
      if (response.data) {
        setOrderMetrics({
          todaysSales: parseFloat(response.data.todaySales || 0).toFixed(2),
          totalOrdersCount: response.data.totalOrdersCount || 0,
          pendingOrdersCount: response.data.pendingOrdersCount || 0,
          newCustomersCount: response.data.newCustomersCount || 0
        });
      }
    } catch (error) {
      console.warn("Today's stats endpoint not fully linked or initialized yet. Falling back to base configurations.");
      // Keep static defaults safe if backend isn't deployment ready yet
      setOrderMetrics({
        todaysSales: "0.00",
        totalOrdersCount: 0,
        pendingOrdersCount: 0,
      });
    }
  };

  // =====================================================================
  // 🛠️ BACKEND DEVELOPER: INSERT RECENT ORDERS DATA LINK HERE
  // Replace the placeholder URL below once your collaborator completes the endpoint.
  // =====================================================================
  const fetchLiveRecentOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/order/all`, {
        headers: { authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}` }
      });

      const ordersData = response.data.orders || response.data || [];

      // Structure database entries into UI table row mapping params cleanly
      const unifiedOrders = ordersData.map(order => {
        // 1. Calculate the total dynamically from the products array if a top-level price is missing
        let calculatedTotal = 0;

        if (Array.isArray(order.products) && order.products.length > 0) {
          calculatedTotal = order.products.reduce((sum, item) => {
            // Adapt to whatever price and quantity keys your product objects use (e.g., item.price or item.product?.price)
            const itemPrice = parseFloat(item.price || item.product?.price || 0);
            const itemQty = parseInt(item.quantity || item.qty || 1);
            return sum + (itemPrice * itemQty);
          }, 0);
        }

        return {
          id: order.orderId || order._id || order.id || "N/A",
          name: order.recipient || order.customerName || order.name || "Anonymous User",

          // 2. Use the database total if it somehow exists, otherwise use our calculated sum!
          amount: order.total || order.totalPrice || order.totalAmount || order.amount || calculatedTotal,

          // color: order.statusColor || '#f1f5f9',
          // time: order.formattedTime || order.createdAt || order.date || "Just Now"
        };
      });

      setLiveOrdersList(unifiedOrders);
    } catch (error) {
      console.warn("Recent transactions feed endpoint not ready. Falling back to default empty state arrays.");
      setLiveOrdersList([]);
    }
  };
  // Total alert notifications combining out of stock and low stock warnings
  const totalAlertNotificationsCount = productMetrics.outOfStockCount + productMetrics.lowStockCount;

  // Responsive adjusted style configurations
  const dynamicNotifPanelStyle = {
    ...notifPanelStyle,
    right: windowWidth <= 768 ? '10px' : '40px',
    width: windowWidth <= 480 ? 'calc(100vw - 20px)' : '290px'
  };

  return (
    <div className="dashboard-container">
      <SideBar />

      {/* Main Content Workspace */}
      <main className="main-content">

        {/* Top Header */}
        <header className="top-header" style={{ overflow: 'visible' }}>
          <h1>Welcome back, Admin!</h1>
          <div className="header-actions" style={{ position: 'relative' }} ref={notifRef}>

            {/* Functional Notification Trigger Button */}
            <button
              className={`icon-btn badge-btn ${isNotifOpen ? 'active-bell' : ''}`}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <FiBell />
              {totalAlertNotificationsCount > 0 && (
                <span className="badge" style={{ backgroundColor: '#e11d48', color: '#fff' }}>
                  {totalAlertNotificationsCount}
                </span>
              )}
            </button>

            {/* Dynamic Notification Dropdown Drawer Panel */}
            {isNotifOpen && (
              <div className="notification-dropdown-panel" style={dynamicNotifPanelStyle}>
                <div style={notifHeaderStyle}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>Inventory Stock Alerts</span>
                  <button onClick={() => setIsNotifOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
                </div>

                <div className="notification-scroll-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {totalAlertNotificationsCount === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                      All items have healthy stock configurations.
                    </div>
                  ) : (
                    <>
                      {/* Out of stock notifications block */}
                      {productMetrics.outOfStockItems.map(item => (
                        <div key={`out-${item.id}`} style={notifItemStyle}>
                          <div style={{ ...statusIndicatorStyle, backgroundColor: '#ef4444' }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{item.name} is empty!</span>
                            <small style={{ fontSize: '11px', color: '#64748b' }}>Stock dropped to absolute 0 units.</small>
                          </div>
                        </div>
                      ))}

                      {/* Low stock notifications block */}
                      {productMetrics.lowStockItems.map(item => (
                        <div key={`low-${item.id}`} style={notifItemStyle}>
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

            <div>

            </div>
          </div>
        </header>

        {loadingDashboardData ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
            <h3>Compiling database metric aggregations...</h3>
          </div>
        ) : (
          <>
            {/* Top Metric Cards Grid */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="icon-wrapper yellow"><FiBox /></div>
                <div className="metric-data">
                  <span className="label">Total Products</span>
                  <h3>{productMetrics.totalProducts}</h3>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon-wrapper pink"><FiArchive /></div>
                <div className="metric-data">
                  <span className="label">Out of Stock</span>
                  <h3>{productMetrics.outOfStockCount}</h3>
                </div>
              </div>
              <div className="metric-card">
                <div className="icon-wrapper orange"><FiAlertTriangle /></div>
                <div className="metric-data">
                  <span className="label">Low Stock</span>
                  <h3>{productMetrics.lowStockCount}</h3>
                </div>
              </div>
            </section>

            {/* Middle Section: Stats & Orders */}
            <section className="dashboard-row">
              <div className="dashboard-card">
                <h3 className="card-title">Today's Stats</h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Today's Sales</span>
                    <strong>GHC {orderMetrics.todaysSales}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Orders</span>
                    <strong>{orderMetrics.totalOrdersCount}</strong>
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS COMPONENT CARD */}
              <div className="dashboard-card recent-orders" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="card-title">Recent Orders</h3>
                <div className="orders-list" style={{ flexGrow: 1 }}>
                  {liveOrdersList.length === 0 ? (
                    <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', width: '100%' }}>
                      No active user orders found. Waiting for incoming data...
                    </div>
                  ) : (
                    // Slices data array down to exactly 5 items
                    liveOrdersList.slice(0, 5).map(order => (
                      <div className="order-item" key={order.id}>
                        <div className="order-user-wrapper">
                          <FiUser className="order-user-icon" />
                          <div className="order-user">
                            <span className="order-name">{order.name}</span>
                            <small className="order-id-label">{order.id}</small>
                          </div>
                        </div>
                        <div className="order-financials">
                          <strong className="order-amount-label">GHC {parseFloat(order.amount).toFixed(2)}</strong>
                          <span className="status-badge" style={{ backgroundColor: order.color || '#f1f5f9' }}>
                            {order.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* View All Orders Button Layout Section */}
                <div className="card-action-right" style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <NavLink
                    to="/order"
                    className="manage-btn"
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      textAlign: "center"
                    }}
                  >
                    View All Orders
                  </NavLink>
                </div>
              </div>
            </section>

            {/* Bottom Section: Alerts & Promotions */}
            <section className="dashboard-row">
              <div className="dashboard-card alerts-card">
                <h3 className="card-title">Low Stock Alerts</h3>
                <ul className="simple-list">
                  {productMetrics.lowStockItems.length === 0 ? (
                    <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px', border: 'none' }}>
                      All catalog stock allocations running smoothly.
                    </li>
                  ) : (
                    productMetrics.lowStockItems.slice(0, 3).map((item) => (
                      <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                        <span className="bullet orange"></span>
                        <span style={{ textAlign: 'left' }}>{item.name}</span>
                        <strong style={{ color: '#e11d48', marginLeft: 'auto', fontSize: '13px', flexShrink: 0 }}>{item.stock} left</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* DYNAMIC PROMOTIONS COMPONENT CARD */}
              <div className="dashboard-card promos-card">
                <h3 className="card-title">Active Promotions ({activePromotionsList.length})</h3>
                <ul className="simple-list">
                  {activePromotionsList.length === 0 ? (
                    <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px', padding: '20px 0', border: 'none', justifyContent: 'center' }}>
                      No active store discounts running right now.
                    </li>
                  ) : (
                    activePromotionsList.map((promo) => (
                      <li key={promo._id || promo.id}>
                        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                          <span className="bullet yellow"></span>
                          <span>
                            {promo.title || promo.name}
                            {promo.discountValue && ` – ${promo.discountValue}% Off`}
                          </span>
                        </div>
                        <span className="arrow">›</span>
                      </li>
                    ))
                  )}
                </ul>
                <div className="card-action-right">
                  <NavLink
                    to="/promotion"
                    className="manage-btn"
                    style={({ isActive }) => ({
                      display: "inline-block",
                      textDecoration: "none",
                      textAlign: "center"
                    })}
                  >
                    Manage Promotions
                  </NavLink>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default DashBoard;