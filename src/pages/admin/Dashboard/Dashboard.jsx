import "./Dashboard.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useAdminSidebar } from "../../../hooks/useAdminSidebar";
import { fetchOrderStats, fetchOrders } from "../../../services/orderService";
import { fetchProducts } from "../../../services/productService";
import {
  LuPackage, LuShoppingBag, LuLogOut, LuDiamond,
  LuLayoutDashboard, LuTrendingUp, LuUsers, LuBanknote,
  LuArrowRight, LuRefreshCw, LuMenu,
} from "react-icons/lu";
import { MdOutlineDeliveryDining } from "react-icons/md";
import Loader from "../../../components/Loader/Loader";

const statusClass = s => ({
  "Pending":          "dash-status-pending",
  "Preparing":        "dash-status-preparing",
  "Out for Delivery": "dash-status-out",
  "Delivered":        "dash-status-delivered",
}[s] || "");

const initials = name =>
  name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

function Dashboard() {

  const { logout, admin } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useAdminSidebar();
  const navigate          = useNavigate();

  const [stats,         setStats]         = useState(null);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [productCount,  setProductCount]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [apiError,      setApiError]      = useState("");
  const [lastUpdated,   setLastUpdated]   = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetchOrderStats(),
        fetchOrders({ limit: 5 }),
        fetchProducts({ limit: 1 }),
      ]);
      setStats(statsRes);
      setRecentOrders(ordersRes.orders.map(o => ({
        id:     o.orderId || o._id,
        _id:    o._id,
        name:   o.customerName,
        amount: o.totalAmount,
        status: o.status,
        time:   new Date(o.createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      })));
      setProductCount(productsRes.total);
      setLastUpdated(new Date());
    } catch {
      setApiError("Could not load dashboard data. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* Fix #13: auto-refresh every 30 seconds so live orders appear without manual reload */
  useEffect(() => {
    const timer = setInterval(() => { loadAll(); }, 30_000);
    return () => clearInterval(timer);
  }, [loadAll]);

  /* ════════ RENDER ════════ */
  return (
    <div className="dash-page">

      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <p className="dash-sidebar-label">ADMIN PORTAL</p>
          <nav className="dash-sidebar-nav">
            <button className="dash-nav-item active"><LuLayoutDashboard /> Dashboard</button>
            <button className="dash-nav-item" onClick={() => navigate("/admin/products")}><LuPackage /> Products</button>
            <button className="dash-nav-item" onClick={() => navigate("/admin/orders")}><LuShoppingBag /> Orders</button>
          </nav>
        </div>
        <button className="dash-logout" onClick={logout}><LuLogOut /> Logout</button>
      </aside>

      {/* MAIN */}
      <main className="dash-main">

        {/* TOP NAV */}
        <header className="dash-topnav">
          {/* Hamburger — only visible ≤900px via admin-responsive.css */}
          <button className="admin-hamburger" onClick={toggleSidebar} aria-label="Toggle navigation">
            <LuMenu />
          </button>
          <div className="dash-topnav-links">
            <Link to="/">Home</Link><Link to="/menu">Menu</Link><Link to="/reviews">Reviews</Link>
          </div>
          <div className="dash-topnav-logo"><LuDiamond /><span>Mublat Admin</span></div>
          <div className="dash-topnav-right">
            <LuShoppingBag />
            <button className="dash-dash-btn active"><LuLayoutDashboard /> <span>Dashboard</span></button>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back{admin?.name ? `, ${admin.name}` : ""}. Here's what's happening at Mublat today.</p>
          </div>
          <div className="dash-header-right">
            <span className="dash-date">
              {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </span>
            <button className="dash-refresh-btn" onClick={loadAll} title="Refresh data"><LuRefreshCw /></button>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading dashboard…" />
        ) : apiError ? (
          <div className="dash-api-error">
            <p>{apiError}</p>
            <button onClick={loadAll}><LuRefreshCw /> Retry</button>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="dash-stats">

              <div className="dash-stat dash-stat-gold">
                <div className="dash-stat-icon"><LuBanknote /></div>
                <div>
                  <p>TODAY'S REVENUE</p>
                  <h2>£{Number(stats?.todayRevenue || 0).toFixed(2)}</h2>
                  <span className="green">Live from orders</span>
                </div>
              </div>

              <div className="dash-stat">
                <div className="dash-stat-icon"><LuShoppingBag /></div>
                <div>
                  <p>TODAY'S ORDERS</p>
                  <h2>{stats?.todayOrders ?? 0}</h2>
                  <span className="green">Orders placed today</span>
                </div>
              </div>

              <div className="dash-stat">
                <div className="dash-stat-icon" style={{color:"#f5a623"}}><MdOutlineDeliveryDining /></div>
                <div>
                  <p>OUT FOR DELIVERY</p>
                  <h2>{stats?.outForDelivery ?? 0}</h2>
                  <span style={{color:"#f5a623"}}>En route now</span>
                </div>
              </div>

              <div className="dash-stat">
                <div className="dash-stat-icon" style={{color:"#ccc"}}><LuPackage /></div>
                <div>
                  <p>PENDING ORDERS</p>
                  <h2>{stats?.pending ?? 0}</h2>
                  <span style={{color:"#ccc"}}>Awaiting prep</span>
                </div>
              </div>

              <div className="dash-stat">
                <div className="dash-stat-icon" style={{color:"#4caf82"}}><LuPackage /></div>
                <div>
                  <p>ACTIVE PRODUCTS</p>
                  <h2>{productCount ?? "—"}</h2>
                  <span style={{color:"#888"}}>In catalog</span>
                </div>
              </div>

              <div className="dash-stat">
                <div className="dash-stat-icon" style={{color:"#4caf82"}}><LuTrendingUp /></div>
                <div>
                  <p>TOTAL DELIVERED</p>
                  <h2>{stats?.delivered ?? 0}</h2>
                  <span className="green">All time</span>
                </div>
              </div>

            </div>

            {/* RECENT ORDERS */}
            <div className="dash-section">
              <div className="dash-section-header">
                <h3>Recent Orders</h3>
                <button className="dash-view-all" onClick={() => navigate("/admin/orders")}>
                  View All <LuArrowRight />
                </button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="dash-empty-orders">
                  <p>No orders yet. Share your menu to get started!</p>
                </div>
              ) : (
                <div className="dash-orders-list">
                  {recentOrders.map(order => (
                    <div key={order._id} className="dash-order-row">
                      <div className="dash-order-avatar">{initials(order.name)}</div>
                      <div className="dash-order-info">
                        <p>{order.name}</p>
                        <span>{order.id} · {order.time}</span>
                      </div>
                      <span className={`dash-status ${statusClass(order.status)}`}>{order.status}</span>
                      <strong className="dash-order-amount">£{order.amount.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="dash-section">
              <h3>Quick Actions</h3>
              <div className="dash-quick-actions">
                <button className="dash-action-card" onClick={() => navigate("/admin/orders")}>
                  <LuShoppingBag className="dash-action-icon" />
                  <strong>Manage Orders</strong>
                  <span>View and update order statuses</span>
                </button>
                <button className="dash-action-card" onClick={() => navigate("/admin/products")}>
                  <LuPackage className="dash-action-icon" />
                  <strong>Manage Products</strong>
                  <span>Add, edit or remove products</span>
                </button>
                <button className="dash-action-card" onClick={() => navigate("/")}>
                  <LuDiamond className="dash-action-icon" />
                  <strong>View Storefront</strong>
                  <span>See how your store looks live</span>
                </button>
              </div>
            </div>

            {lastUpdated && (
              <p className="dash-last-updated">
                Last updated: {lastUpdated.toLocaleTimeString("en-GB")}
              </p>
            )}
          </>
        )}

      </main>
    </div>
  );
}

export default Dashboard;