import '../SideBar.css';
import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from 'axios'; 

// Imported official FontAwesome React Components & Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faLayerGroup,
  faPlus,
  faReceipt,
  faBoxesStacked,
  faTags,
  faBars,
  faXmark,
  faSignOutAlt,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";

export default function SideBar({ isModalOpen, editingProduct }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // 1. Mobile viewport height calculation and background scroll lock fix
  useEffect(() => {
    const calculateViewportHeight = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    calculateViewportHeight();
    window.addEventListener('resize', calculateViewportHeight);

    // Stop background dashboard scrolling entirely while drawer is expanded
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener('resize', calculateViewportHeight);
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // 2. Updated to an async network function hitting the cloud signout route
  const handleLogout = async () => {
    try {
      // Hit the live signout endpoint on your Render backend
      await axios.post('https://alluring-accent-backend.onrender.com/api/admin/signout', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Log error silently so the user is still cleared out locally even if connection drops
      console.error("Backend signout error:", error);
    } finally {
      // Clear all active local session tokens cleanly
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      
      toast.success("Logged out successfully", { duration: 2000 });
      navigate("/login", { replace: true });
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Topbar */}
      {
        isModalOpen && editingProduct ? <></> : 
        <div className="mobile-topbar">
          <h2 className="mobile-logo">Admin Panel</h2>
          <button
            className="menu-toggle"
            aria-label="Toggle Side Navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FontAwesomeIcon icon={faXmark} /> : <FontAwesomeIcon icon={faBars} />}
          </button>
        </div>
      }

      {/* Overlay */}
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
        ></div>
      )}

      <aside className={`sidebar ${menuOpen ? "show-sidebar" : ""}`}>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faChartPie} /></span>
            Dashboard
          </NavLink>

          <NavLink
            to="/category"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faLayerGroup} /></span>
            Category
          </NavLink>

            {/* <NavLink
            to="/collection"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faPlus} /></span>
            Collection
          </NavLink> */}

          <NavLink
            to="/addproduct"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faPlus} /></span>
            Add Products
          </NavLink>

          <NavLink
            to="/order"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faReceipt} /></span>
            Orders
          </NavLink>

          <NavLink
            to="/manageproduct"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faBoxesStacked} /></span>
            Manage Products
          </NavLink>

          <NavLink
            to="/promotion"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="icon"><FontAwesomeIcon icon={faTags} /></span>
            Promotions
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <FontAwesomeIcon icon={faUserShield} className="profile-icon" />
            <div className="user-info">
              <strong>Admin</strong>
            </div>
          </div>

          <button
            className="ad-logout-btn"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}