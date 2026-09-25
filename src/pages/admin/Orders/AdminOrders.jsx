import "./AdminOrders.css";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleIn, stagger, staggerItem } from "../../../utils/motion";
import { toastSuccess, toastError, confirmAction } from "../../../utils/swal";
import { useAuth } from "../../../context/AuthContext";
import { useAdminSidebar } from "../../../hooks/useAdminSidebar";
import {
  fetchOrders, fetchOrderStats, updateOrderStatus, createOrder, markOrderAsPaid,
  deleteOrder,
} from "../../../services/orderService";
import {
  LuSearch, LuFilter, LuShoppingBag, LuLayoutDashboard, LuStore,
  LuPackage, LuLogOut, LuEye, LuX, LuChevronLeft,
  LuChevronRight, LuDiamond, LuPlus, LuBanknote, LuRefreshCw,
  LuMenu, LuCheck, LuTrash2,
} from "react-icons/lu";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { TbShoppingBagCheck } from "react-icons/tb";
import Loader from "../../../components/Loader/Loader";

const STATUSES = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered"];
const PER_PAGE = 5;

const statusClass = s => ({
  "Pending": "status-pending",
  "Preparing": "status-preparing",
  "Out for Delivery": "status-out",
  "Delivered": "status-delivered",
}[s] || "");

const initials = name =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

const blankOrder = () => ({
  name: "", phone: "", address: "", items: "",
  amount: "", method: "Delivery", status: "Pending",
});

/* Normalise an API order to a flat display shape */
const normalise = (o) => ({
  id: o.orderId || o._id,
  _id: o._id,
  name: o.customerName,
  phone: o.phone,
  address: o.address || "",
  method: o.method,
  amount: o.totalAmount,
  status: o.status,
  paymentMethod: o.paymentMethod || "Bank Transfer",
  paymentStatus: o.paymentStatus || (o.isPaid ? "Paid" : "Pending"),
  time: new Date(o.createdAt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }),
  items: o.items?.map(i => `${i.name} ×${i.quantity}`).join(", ") || "",
});

function AdminOrders() {

  const { logout } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useAdminSidebar();
  const navigate = useNavigate();

  /* ── Data ── */
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  /* ── Modals ── */
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [cForm, setCForm] = useState(blankOrder());
  const [cFormErr, setCFormErr] = useState("");
  const [cSaving, setCSaving] = useState(false);

  /* ── Status update loading ── */
  const [updatingId, setUpdatingId] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Load orders + stats ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetchOrders({ limit: 200 }),
        fetchOrderStats(),
      ]);
      setOrders(ordersRes.orders.map(normalise));
      setStats(statsRes);
    } catch {
      setApiError("Could not load orders. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Filtered + paginated ── */
  const filtered = useMemo(() => orders.filter(o => {
    const ms = o.id.toLowerCase().includes(search.toLowerCase())
      || o.name.toLowerCase().includes(search.toLowerCase())
      || o.phone.includes(search);
    const mf = statusFilter === "All" || o.status === statusFilter;
    return ms && mf;
  }), [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageOrders = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Stat card click → filter table */
  const filterByStatus = (s) => { setStatusFilter(s); setPage(1); setSearch(""); };

  /* ── Status update ── */
  const handleStatusUpdate = async (id, _id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(_id, newStatus);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selected?.id === id) setSelected(s => ({ ...s, status: newStatus }));
      toastSuccess(`Order ${id} marked as ${newStatus}.`);
    } catch {
      toastError("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Mark payment as received (bank transfer) ──
   * The ONLY place a payment can be confirmed. This is a one-way action
   * (Pending → Paid) — the customer never has access to this, and admins
   * can't undo it here by design (matches the backend guard). */
  const handleMarkPaid = async (order) => {
    const ok = await confirmAction({
      title: "Confirm payment received?",
      text: `This will mark order <strong>${order.id}</strong> as <strong>Paid</strong> and email the customer a payment confirmation. This can't be undone from here.`,
      confirmText: "Mark as Paid",
    });
    if (!ok) return;

    setMarkingPaidId(order.id);
    try {
      await markOrderAsPaid(order._id);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentStatus: "Paid" } : o));
      if (selected?.id === order.id) setSelected(s => ({ ...s, paymentStatus: "Paid" }));
      toastSuccess(`Order ${order.id} marked as Paid. Customer has been notified.`);
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to mark order as paid. Please try again.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  /* ── Delete order ──
   * Permanently removes the order record. Confirmed with a warning since
   * this can't be undone, unlike a status change. */
  const handleDelete = async (order) => {
    const ok = await confirmAction({
      title: "Delete this order?",
      text: `Order <strong>${order.id}</strong> for <strong>${order.name}</strong> will be permanently deleted. This can't be undone.`,
      confirmText: "Delete Order",
    });
    if (!ok) return;

    setDeletingId(order.id);
    try {
      await deleteOrder(order._id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      if (selected?.id === order.id) setSelected(null);
      toastSuccess(`Order ${order.id} deleted.`);
      fetchOrderStats().then(s => setStats(s)).catch(() => { });
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to delete order. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Create order ── */
  const setCField = (f, v) => { setCForm(p => ({ ...p, [f]: v })); setCFormErr(""); };
  const validateCreate = () => {
    if (!cForm.name.trim()) return "Customer name is required.";
    if (!cForm.phone.trim()) return "Phone number is required.";
    if (!/^[\d\s+\-()]{7,}$/.test(cForm.phone)) return "Enter a valid phone number.";
    if (cForm.method === "Delivery" && !cForm.address.trim()) return "Delivery address is required.";
    if (!cForm.items.trim()) return "Order items are required.";
    if (!cForm.amount || isNaN(Number(cForm.amount)) || Number(cForm.amount) <= 0) return "Enter a valid amount.";
    return "";
  };

  const saveCreate = async () => {
    const err = validateCreate(); if (err) { setCFormErr(err); return; }
    setCSaving(true);
    try {
      const payload = {
        customerName: cForm.name.trim(),
        phone: cForm.phone.trim(),
        address: cForm.address.trim(),
        method: cForm.method,
        items: [{
          name: cForm.items.trim(),
          optionName: "Standard",
          quantity: 1,
          price: Number(cForm.amount),
        }],
        deliveryFee: cForm.method === "Delivery" ? 3.50 : 0,
        totalAmount: Number(cForm.amount),
        status: cForm.status,
      };
      const res = await createOrder(payload);
      setOrders(prev => [normalise(res), ...prev]);
      setShowCreate(false); setCForm(blankOrder()); setCFormErr("");
      setPage(1);
      toastSuccess(`Order created for ${payload.customerName}.`);
      /* Refresh stats */
      fetchOrderStats().then(s => setStats(s)).catch(() => { });
    } catch (e) {
      setCFormErr(e.response?.data?.message || "Failed to create order.");
    } finally {
      setCSaving(false);
    }
  };

  /* ── Stat values (from API or counted from orders) ── */
  const countOf = s => stats ? (stats[s.toLowerCase().replace(/ /g, "")] ?? 0)
    : orders.filter(o => o.status === s).length;
  const todayCount = stats?.todayOrders ?? orders.filter(o => o.time.includes(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }))).length;
  const todayRevenue = stats?.todayRevenue ?? 0;

  /* ══════════ RENDER ══════════ */
  return (
    <div className="ao-page">

      {/* MOBILE SIDEBAR OVERLAY — tapping it closes the drawer */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <aside className={`ao-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <p className="ao-sidebar-label">ADMIN PORTAL</p>
          <nav className="ao-sidebar-nav">
            <button className="ao-nav-item" onClick={() => navigate("/")}><LuStore /> Store Front</button>
            <button className="ao-nav-item" onClick={() => navigate("/admin/products")}><LuPackage /> Products</button>
            <button className="ao-nav-item active"><LuShoppingBag /> Orders</button>
          </nav>
        </div>
        <button className="ao-logout" onClick={logout}><LuLogOut /> Logout</button>
      </aside>

      {/* MAIN */}
      <main className="ao-main">

        {/* TOP NAV */}
        <header className="ao-topnav">
          {/* Hamburger — only visible ≤900px via admin-responsive.css */}
          <button className="admin-hamburger" onClick={toggleSidebar} aria-label="Toggle navigation">
            <LuMenu />
          </button>
          <div className="ao-topnav-links">
            <Link to="/">Home</Link><Link to="/menu">Menu</Link><Link to="/reviews">Reviews</Link>
          </div>
          <div className="ao-topnav-logo"><LuDiamond /><span>Mublat Admin</span></div>
          <div className="ao-topnav-right">
            <LuShoppingBag />
            <button className="ao-dash-btn" onClick={() => navigate("/admin/dashboard")}><LuLayoutDashboard /> <span>Dashboard</span></button>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="ao-header">
          <div>
            <h1>Order Management</h1>
            <p>Monitor, fulfill, and manage your luxury pastry orders.</p>
          </div>
          <div className="ao-header-actions">
            <button className="ao-refresh-btn" onClick={loadAll} title="Refresh"><LuRefreshCw /></button>
            <div className="ao-search">
              <LuSearch />
              <input placeholder="Search orders..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="ao-filter-wrap">
              <button className="ao-filter-btn" onClick={() => setShowFilter(f => !f)}>
                <LuFilter /> Filter
                {statusFilter !== "All" && <span className="ao-filter-active-dot" />}
              </button>
              {showFilter && (
                <div className="ao-filter-dropdown">
                  {STATUSES.map(s => (
                    <button key={s} className={statusFilter === s ? "active" : ""}
                      onClick={() => { setStatusFilter(s); setPage(1); setShowFilter(false); }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <button className="ao-create-btn" onClick={() => { setCForm(blankOrder()); setCFormErr(""); setShowCreate(true); }}>
              <LuPlus /> Create Order
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <motion.div className="ao-stats" variants={stagger} initial="hidden" animate="visible">

          <motion.div variants={staggerItem} className={`ao-stat ao-stat-gold ao-stat-clickable ${statusFilter === "All" ? "ao-stat-active" : ""}`}
            onClick={() => filterByStatus("All")}>
            <div className="ao-stat-top">
              <div><p>TODAY'S ORDERS</p><h2>{todayCount}</h2><span className="green">Total orders today</span></div>
              <div className="ao-stat-icon"><TbShoppingBagCheck /></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className={`ao-stat ao-stat-clickable ${statusFilter === "Pending" ? "ao-stat-active" : ""}`}
            onClick={() => filterByStatus("Pending")}>
            <div className="ao-stat-top">
              <div><p>PENDING</p><h2>{countOf("Pending")}</h2><span style={{ color: "#ccc" }}>Awaiting preparation</span></div>
              <div className="ao-stat-icon"><LuPackage /></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className={`ao-stat ao-stat-clickable ${statusFilter === "Preparing" ? "ao-stat-active" : ""}`}
            onClick={() => filterByStatus("Preparing")}>
            <div className="ao-stat-top">
              <div><p>PREPARING</p><h2>{countOf("Preparing")}</h2><span style={{ color: "#80b4f5" }}>In the kitchen</span></div>
              <div className="ao-stat-icon" style={{ color: "#80b4f5" }}><LuPackage /></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className={`ao-stat ao-stat-clickable ${statusFilter === "Out for Delivery" ? "ao-stat-active" : ""}`}
            onClick={() => filterByStatus("Out for Delivery")}>
            <div className="ao-stat-top">
              <div><p>OUT FOR DELIVERY</p><h2>{countOf("outForDelivery") || countOf("Out for Delivery")}</h2><span style={{ color: "#f5a623" }}>On the way</span></div>
              <div className="ao-stat-icon" style={{ color: "#f5a623" }}><MdOutlineDeliveryDining /></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className={`ao-stat ao-stat-clickable ${statusFilter === "Delivered" ? "ao-stat-active" : ""}`}
            onClick={() => filterByStatus("Delivered")}>
            <div className="ao-stat-top">
              <div><p>DELIVERED</p><h2>{countOf("Delivered")}</h2><span className="green">Completed</span></div>
              <div className="ao-stat-icon" style={{ color: "#4caf82" }}><TbShoppingBagCheck /></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="ao-stat">
            <div className="ao-stat-top">
              <div><p>REVENUE TODAY</p><h2>£{Number(todayRevenue).toFixed(2)}</h2><span className="green">+8.5% from yesterday</span></div>
              <div className="ao-stat-icon" style={{ color: "#4caf82" }}><LuBanknote /></div>
            </div>
          </motion.div>

        </motion.div>

        {/* ACTIVE FILTER NOTICE */}
        {statusFilter !== "All" && (
          <div className="ao-filter-notice">
            Showing <strong>{statusFilter}</strong> orders
            <button onClick={() => { setStatusFilter("All"); setPage(1); }}>Clear ×</button>
          </div>
        )}

        {/* TABLE */}
        <div className="ao-table-wrap">
          <div className="ao-table-header">
            <h3>{statusFilter === "All" ? "All Orders" : `${statusFilter} Orders`}</h3>
            <span>Showing {filtered.length} of {orders.length} total</span>
          </div>

          {loading ? (
            <Loader message="Loading orders…" />
          ) : apiError ? (
            <div className="ao-api-error">
              <p>{apiError}</p>
              <button onClick={loadAll}><LuRefreshCw /> Retry</button>
            </div>
          ) : (
            <>
              <table className="ao-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>Customer</th><th>Method</th>
                    <th>Total Amount</th><th>Status</th><th>Payment</th><th>Date & Time</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {pageOrders.length === 0 ? (
                      <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan={8} className="ao-empty">No orders match your search.</td>
                      </motion.tr>
                    ) : (
                      pageOrders.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                        >
                          <td className="ao-order-id" data-label="Order ID">{order.id}</td>
                          <td data-label="Customer">
                            <div className="ao-customer">
                              <div className="ao-avatar">{initials(order.name)}</div>
                              <div><p>{order.name}</p><span>{order.phone}</span></div>
                            </div>
                          </td>
                          <td data-label="Method">
                            <div className="ao-method">
                              {order.method === "Delivery" ? <MdOutlineDeliveryDining /> : <TbShoppingBagCheck />}
                              {order.method}
                            </div>
                          </td>
                          <td className="ao-amount" data-label="Total Amount">£{order.amount.toFixed(2)}</td>
                          <td data-label="Status"><span className={`ao-status ${statusClass(order.status)}`}>{order.status}</span></td>
                          <td data-label="Payment">
                            <span className={order.paymentStatus === "Paid" ? "ao-status status-delivered" : "ao-status status-pending"}>
                              {order.paymentStatus === "Paid" ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="ao-time" data-label="Date & Time">{order.time}</td>
                          <td data-label="Action">
                            <div className="ao-action-btns">
                              <button className="ao-view-btn" onClick={() => setSelected(order)}>
                                <LuEye /> View Detail
                              </button>
                              <button
                                className="ao-delete-btn"
                                title="Delete order"
                                disabled={deletingId === order.id}
                                onClick={() => handleDelete(order)}
                              >
                                <LuTrash2 />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>

              <div className="ao-pagination">
                <span>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–
                  {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} orders
                </span>
                <div className="ao-page-btns">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><LuChevronLeft /> Previous</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next <LuChevronRight /></button>
                </div>
              </div>
            </>
          )}
        </div>

      </main>

      {/* ══ ORDER DETAIL MODAL ══ */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="ao-modal-overlay"
            variants={fadeIn} initial="hidden" animate="visible" exit="exit"
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="ao-modal"
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="ao-modal-header">
                <div><h3>{selected.id}</h3><p>{selected.time}</p></div>
                <button className="ao-modal-close" onClick={() => setSelected(null)}><LuX /></button>
              </div>
              <div className="ao-modal-body">
                <div className="ao-modal-row"><span>Customer</span><strong>{selected.name}</strong></div>
                <div className="ao-modal-row"><span>Phone</span><strong>{selected.phone}</strong></div>
                {selected.address && <div className="ao-modal-row"><span>Address</span><strong>{selected.address}</strong></div>}
                <div className="ao-modal-row"><span>Method</span><strong>{selected.method}</strong></div>
                {selected.items && <div className="ao-modal-row"><span>Items</span><strong>{selected.items}</strong></div>}
                <div className="ao-modal-row"><span>Amount</span><strong>£{selected.amount.toFixed(2)}</strong></div>
                <div className="ao-modal-row">
                  <span>Status</span>
                  <span className={`ao-status ${statusClass(selected.status)}`}>{selected.status}</span>
                </div>
                <div className="ao-modal-row">
                  <span>Payment Method</span>
                  <strong>{selected.paymentMethod}</strong>
                </div>
                <div className="ao-modal-row">
                  <span>Payment Status</span>
                  <span className={selected.paymentStatus === "Paid" ? "ao-status status-delivered" : "ao-status status-pending"}>
                    {selected.paymentStatus === "Paid" ? "Paid" : "Pending"}
                  </span>
                </div>

                {selected.paymentStatus !== "Paid" && (
                  <div className="ao-modal-actions">
                    <p className="ao-modal-label">Payment</p>
                    <button
                      className="ao-status-update-btn active"
                      disabled={markingPaidId === selected.id}
                      onClick={() => handleMarkPaid(selected)}
                    >
                      <LuCheck style={{ marginRight: 4 }} />
                      {markingPaidId === selected.id ? "Confirming…" : "Mark as Paid (Bank Transfer Received)"}
                    </button>
                  </div>
                )}

                <div className="ao-modal-actions">
                  <p className="ao-modal-label">Update Status {updatingId === selected.id && "…"}</p>
                  <div className="ao-modal-status-btns">
                    {["Pending", "Preparing", "Out for Delivery", "Delivered"].map(s => (
                      <button key={s}
                        className={`ao-status-update-btn ${selected.status === s ? "active" : ""}`}
                        disabled={updatingId === selected.id}
                        onClick={() => handleStatusUpdate(selected.id, selected._id, s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ao-modal-actions">
                  <p className="ao-modal-label">Danger Zone</p>
                  <button
                    className="ao-status-update-btn ao-delete-order-btn"
                    disabled={deletingId === selected.id}
                    onClick={() => handleDelete(selected)}
                  >
                    <LuTrash2 style={{ marginRight: 4 }} />
                    {deletingId === selected.id ? "Deleting…" : "Delete Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CREATE ORDER MODAL ══ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="ao-modal-overlay"
            variants={fadeIn} initial="hidden" animate="visible" exit="exit"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="ao-modal ao-create-modal"
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="ao-modal-header">
                <div><h3>Create New Order</h3><p>Manually enter order details for a customer.</p></div>
                <button className="ao-modal-close" onClick={() => setShowCreate(false)}><LuX /></button>
              </div>
              <div className="ao-modal-body">
                {cFormErr && <div className="ao-form-err">{cFormErr}</div>}

                <div className="ao-field">
                  <label>Customer Name</label>
                  <input className="ao-input" placeholder="e.g. Julian Sterling" value={cForm.name} onChange={e => setCField("name", e.target.value)} />
                </div>
                <div className="ao-field">
                  <label>Phone Number</label>
                  <input className="ao-input" placeholder="+44 7700 900123" value={cForm.phone} onChange={e => setCField("phone", e.target.value)} />
                </div>
                <div className="ao-field">
                  <label>Delivery Method</label>
                  <div className="ao-method-toggle">
                    {["Delivery", "Pickup"].map(m => (
                      <button key={m} className={cForm.method === m ? "active" : ""} onClick={() => setCField("method", m)}>
                        {m === "Delivery" ? <><MdOutlineDeliveryDining /> Delivery</> : <><TbShoppingBagCheck /> Pickup</>}
                      </button>
                    ))}
                  </div>
                </div>
                {cForm.method === "Delivery" && (
                  <div className="ao-field">
                    <label>Delivery Address</label>
                    <input className="ao-input" placeholder="e.g. 14 Baker St, London W1U 6SG" value={cForm.address} onChange={e => setCField("address", e.target.value)} />
                  </div>
                )}
                <div className="ao-field">
                  <label>Order Items</label>
                  <textarea className="ao-textarea" placeholder="e.g. Meat Pie ×3, Tigernut Drink ×2" value={cForm.items} onChange={e => setCField("items", e.target.value)} />
                </div>
                <div className="ao-field">
                  <label>Total Amount (£)</label>
                  <div className="ao-amount-input">
                    <span>£</span>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={cForm.amount} onChange={e => setCField("amount", e.target.value)} />
                  </div>
                </div>
                <div className="ao-field">
                  <label>Initial Status</label>
                  <div className="ao-status-select">
                    {["Pending", "Preparing", "Out for Delivery", "Delivered"].map(s => (
                      <button key={s} className={`ao-status-opt ${cForm.status === s ? "active" : ""}`} onClick={() => setCField("status", s)}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="ao-create-actions">
                  <button className="ao-cancel-btn" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button className="ao-save-btn" onClick={saveCreate} disabled={cSaving}>
                    {cSaving ? "Creating…" : "Create Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminOrders;