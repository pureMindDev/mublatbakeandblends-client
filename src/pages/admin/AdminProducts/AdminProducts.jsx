import "./AdminProducts.css";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { stagger, staggerItem, scaleIn, fadeIn } from "../../../utils/motion";
import {
  toastSuccess, toastError, toastWarning,
  confirmDanger, confirmDiscard,
} from "../../../utils/swal";
import { useAuth } from "../../../context/AuthContext";
import { useAdminSidebar } from "../../../hooks/useAdminSidebar";
import {
  fetchProducts, createProduct, updateProduct,
  deleteProduct, toggleProduct,
  activateProduct, deactivateProduct,
} from "../../../services/productService";
import api from "../../../services/api";
import { compressImage } from "../../../utils/compressImage";
import {
  LuSearch, LuPlus, LuPencil, LuTrash2,
  LuShoppingBag, LuPackage, LuLogOut, LuX,
  LuLayoutDashboard, LuDiamond, LuChevronLeft, LuChevronRight,
  LuImagePlus, LuImage, LuCopy, LuEye, LuArrowUpDown,
  LuCheckCheck, LuChevronDown, LuArrowLeft, LuArrowRight,
  LuToggleLeft, LuToggleRight, LuRefreshCw, LuMenu,
} from "react-icons/lu";
import { MdMoreVert } from "react-icons/md";
import Loader from "../../../components/Loader/Loader";

const PER_PAGE = 5;
const CATS = ["All", "Pastries", "Drinks", "Other"];
const MAX_IMGS = 3;
const SORT_OPTS = [
  { value: "default", label: "Default" },
  { value: "name-asc", label: "Name A→Z" },
  { value: "name-desc", label: "Name Z→A" },
  { value: "price-asc", label: "Price Low→High" },
  { value: "price-desc", label: "Price High→Low" },
  { value: "newest", label: "Newest First" },
];

const now = () => new Date().toISOString();
const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

/* Normalise API product → internal shape */
const normalise = (p) => ({
  id: p._id || p.id,
  sku: p.sku || `MUB-${String(p._id || p.id).slice(-4).toUpperCase()}`,
  name: p.name,
  description: p.description,
  category: p.category,
  images: (p.images || []).map(src => ({ src, file: null, publicId: null })),
  options: (p.options || []).map(o => ({ label: o.label || o.name, price: o.price })),
  active: p.active ?? true,
  createdAt: p.createdAt || now(),
  updatedAt: p.updatedAt || now(),
});

const blankOption = () => ({ label: "", price: "" });
const blankForm = () => ({ name: "", category: "Pastries", description: "", images: [], options: [blankOption()] });

/* Category badge styling — "pastry" / "drink" / "other" */
const catBadgeClass = (category) =>
  category === "Pastries" ? "pastry" : category === "Drinks" ? "drink" : "other";

/* ── Toast component removed — using SweetAlert2 toasts ── */

function AdminProducts() {

  const { logout } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useAdminSidebar();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  /* ── Data ── */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  /* ── Selection ── */
  const [selected, setSelected] = useState(new Set());

  /* ── Modals ── */
  const [modal, setModal] = useState("none");
  const [editTarget, setEditTarget] = useState(null);
  const [previewProd, setPreviewProd] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  /* ── Form ── */
  const [form, setForm] = useState(blankForm());
  const [formErr, setFormErr] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ── Toasts now via SweetAlert2 ── */
  const addToast = useCallback((msg, type = "success") => {
    if (type === "success") toastSuccess(msg);
    else if (type === "error") toastError(msg);
    else if (type === "warning") toastWarning(msg);
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const h = () => { setMenuOpen(null); setSortOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Fetch products from API ── */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetchProducts({ limit: 100 });
      setProducts(res.products.map(normalise));
    } catch {
      setApiError("Could not load products. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ── Filtered + sorted ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = products.filter(p => {
      const ms = p.name.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q);
      const mc = catFilter === "All" || p.category === catFilter;
      return ms && mc;
    });
    switch (sort) {
      case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": list = [...list].sort((a, b) => (a.options[0]?.price || 0) - (b.options[0]?.price || 0)); break;
      case "price-desc": list = [...list].sort((a, b) => (b.options[0]?.price || 0) - (a.options[0]?.price || 0)); break;
      case "newest": list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }
    return list;
  }, [products, search, catFilter, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageProd = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageIds = pageProd.map(p => p.id);
  const allPageSel = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someSel = pageIds.some(id => selected.has(id));

  /* ── Stats ── */
  const totalActive = products.filter(p => p.active).length;
  const totalInactive = products.filter(p => !p.active).length;
  const totalPastries = products.filter(p => p.category === "Pastries").length;
  const totalDrinks = products.filter(p => p.category === "Drinks").length;

  /* ── Selection ── */
  const toggleOne = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePage = () => {
    if (allPageSel) setSelected(prev => { const n = new Set(prev); pageIds.forEach(id => n.delete(id)); return n; });
    else setSelected(prev => { const n = new Set(prev); pageIds.forEach(id => n.add(id)); return n; });
  };
  const clearSel = () => setSelected(new Set());

  /* ── Bulk actions ── */
  const bulkActivate = async () => {
    try {
      /* Use activateProduct (not toggle) so it always sets active=true,
         never accidentally re-deactivates an already-active product */
      const results = await Promise.all([...selected].map(id => activateProduct(id)));
      setProducts(prev => {
        const updated = new Map(results.map(p => [p._id || p.id, p]));
        return prev.map(p => updated.has(p.id) ? { ...p, ...normalise(updated.get(p.id)), id: p.id } : p);
      });
      addToast(`${selected.size} product${selected.size > 1 ? "s" : ""} activated.`);
      clearSel();
    } catch (e) {
      addToast("Bulk activate failed: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const bulkDeactivate = async () => {
    try {
      /* Use deactivateProduct (not toggle) so it always sets active=false */
      const results = await Promise.all([...selected].map(id => deactivateProduct(id)));
      setProducts(prev => {
        const updated = new Map(results.map(p => [p._id || p.id, p]));
        return prev.map(p => updated.has(p.id) ? { ...p, ...normalise(updated.get(p.id)), id: p.id } : p);
      });
      addToast(`${selected.size} product${selected.size > 1 ? "s" : ""} deactivated.`, "warning");
      clearSel();
    } catch (e) {
      addToast("Bulk deactivate failed: " + (e.response?.data?.message || e.message), "error");
    }
  };
  const bulkDeleteDo = async () => {
    const count = selected.size;
    const ok = await confirmDanger({
      title: `Delete ${count} Product${count > 1 ? "s" : ""}`,
      text: `You are about to permanently delete <strong style="color:white">${count} product${count > 1 ? "s" : ""}</strong>. This cannot be undone.`,
      confirmText: `Delete ${count} Product${count > 1 ? "s" : ""}`,
    });
    if (!ok) return;
    try {
      await Promise.all([...selected].map(id => deleteProduct(id)));
      setProducts(prev => prev.filter(p => !selected.has(p.id)));
      addToast(`${count} product${count > 1 ? "s" : ""} deleted.`, "error");
      clearSel(); setModal("none"); setPage(1);
    } catch { addToast("Bulk delete failed.", "error"); }
  };

  /* ── Form helpers ── */
  const setField = (f, v) => { setForm(p => ({ ...p, [f]: v })); setFormErr(""); setIsDirty(true); };
  const setOption = (i, key, val) => {
    setForm(p => { const opts = [...p.options]; opts[i] = { ...opts[i], [key]: val }; return { ...p, options: opts }; });
    setIsDirty(true);
  };
  const addOption = () => { setForm(f => ({ ...f, options: [...f.options, blankOption()] })); setIsDirty(true); };
  const removeOption = i => { setForm(f => ({ ...f, options: f.options.length === 1 ? f.options : f.options.filter((_, idx) => idx !== i) })); setIsDirty(true); };

  /* ── Image upload via API ── */
  const handleImageFiles = async (files) => {
    const remaining = MAX_IMGS - form.images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining);

    setUploading(true);
    try {
      // Shrink each photo before it goes anywhere near the network —
      // this is what makes the upload feel fast even on a slow connection.
      const compressed = await Promise.all(toAdd.map(f => compressImage(f)));

      const fd = new FormData();
      compressed.forEach(f => fd.append("images", f));
      const { data } = await api.post("/upload/images", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newImgs = data.urls.map(url => ({ src: url, file: null, publicId: null }));
      setForm(f => ({ ...f, images: [...f.images, ...newImgs] }));
      setIsDirty(true);
    } catch {
      /* Fallback: use local base64 preview if backend upload fails */
      const newImgs = await Promise.all(
        toAdd.map(async file => {
          const compact = await compressImage(file);
          const src = await new Promise(res => {
            const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(compact);
          });
          return { src, file: compact, publicId: null };
        })
      );
      setForm(f => ({ ...f, images: [...f.images, ...newImgs] }));
      setIsDirty(true);
      addToast("Images saved locally (upload to server when backend is ready).", "warning");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = idx => { setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) })); setIsDirty(true); };
  const moveImageLeft = idx => {
    if (idx === 0) return;
    setForm(f => { const imgs = [...f.images];[imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]]; return { ...f, images: imgs }; });
    setIsDirty(true);
  };
  const moveImageRight = idx => {
    setForm(f => {
      if (idx >= f.images.length - 1) return f;
      const imgs = [...f.images];[imgs[idx], imgs[idx + 1]] = [imgs[idx + 1], imgs[idx]]; return { ...f, images: imgs };
    });
    setIsDirty(true);
  };
  const onDrop = e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); };

  /* ── Validation ── */
  const validate = () => {
    if (!form.name.trim()) return "Product name is required.";
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!form.description.trim()) return "Description is required.";
    for (const o of form.options) {
      if (!o.label.trim()) return "All option labels are required.";
      if (o.price === "" || isNaN(Number(o.price)) || Number(o.price) < 0) return "All option prices must be valid non-negative numbers.";
    }
    return "";
  };

  /* ── Open modals ── */
  const openAdd = () => { setForm(blankForm()); setFormErr(""); setIsDirty(false); setModal("add"); };
  const openEdit = p => {
    setEditTarget(p);
    setForm({
      name: p.name, category: p.category, description: p.description,
      images: p.images.map(img => ({ src: img.src, file: null, publicId: img.publicId || null })),
      options: p.options.map(o => ({ label: o.label, price: String(o.price) }))
    });
    setFormErr(""); setIsDirty(false); setMenuOpen(null); setModal("edit");
  };
  const closeModal = async () => {
    if (isDirty && (modal === "add" || modal === "edit")) {
      const discard = await confirmDiscard();
      if (!discard) return;
    }
    setModal("none"); setEditTarget(null); setIsDirty(false);
  };

  /* ── Save add ── */
  const saveAdd = async () => {
    const err = validate(); if (err) { setFormErr(err); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        images: form.images.map(i => i.src),
        options: form.options.map(o => ({ label: o.label.trim(), price: Number(o.price) })),
        active: true,
      };
      const created = normalise(await createProduct(payload));
      setProducts(prev => [created, ...prev]);
      setModal("none"); setIsDirty(false); setPage(1);
      addToast(`"${created.name}" created successfully.`);
    } catch (e) {
      setFormErr(e.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Save edit ── */
  const saveEdit = async () => {
    const err = validate(); if (err) { setFormErr(err); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        images: form.images.map(i => i.src),
        options: form.options.map(o => ({ label: o.label.trim(), price: Number(o.price) })),
      };
      const updated = normalise(await updateProduct(editTarget.id, payload));
      setProducts(prev => prev.map(p => p.id === editTarget.id ? updated : p));
      setModal("none"); setEditTarget(null); setIsDirty(false);
      addToast(`"${updated.name}" updated successfully.`);
    } catch (e) {
      setFormErr(e.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Duplicate ── */
  const duplicate = async (p) => {
    try {
      const payload = {
        name: `${p.name} (Copy)`,
        description: p.description,
        fullDescription: p.fullDescription || p.description,
        category: p.category,
        images: p.images.map(i => i.src),
        ingredients: p.ingredients || [],
        options: p.options.map(o => ({ label: o.label, price: o.price })),
        active: false,
      };
      const created = normalise(await createProduct(payload));
      setProducts(prev => [created, ...prev]);
      setMenuOpen(null);
      setPage(1);
      addToast(`"${p.name}" duplicated as "${created.name}".`);
    } catch (e) {
      addToast("Duplicate failed: " + (e.response?.data?.message || e.message), "error");
    }
  };

  /* ── Single delete ── */
  const handleDeleteClick = async (prod) => {
    const ok = await confirmDanger({
      title: "Delete Product",
      text: `Are you sure you want to delete <strong style="color:white">${prod.name}</strong>? This cannot be undone.`,
      confirmText: "Delete Product",
    });
    if (!ok) return;
    try {
      await deleteProduct(prod.id);
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      addToast(`"${prod.name}" deleted.`, "error");
      if (selected.has(prod.id)) {
        setSelected(prev => { const n = new Set(prev); n.delete(prod.id); return n; });
      }
    } catch { addToast("Delete failed.", "error"); }
  };

  /* ── Toggle active ── */
  const handleToggle = async (id, name, current) => {
    try {
      const updated = normalise(await toggleProduct(id));
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      addToast(`"${name}" ${updated.active ? "activated" : "deactivated"}.`, updated.active ? "success" : "warning");
    } catch { addToast("Toggle failed.", "error"); }
  };

  const priceLabel = prod => {
    const prices = prod.options.map(o => Number(o.price));
    const mn = Math.min(...prices), mx = Math.max(...prices);
    return mn === mx ? `£${mn.toFixed(2)}` : `£${mn.toFixed(2)} – £${mx.toFixed(2)}`;
  };

  const isFormOpen = modal === "add" || modal === "edit";

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="ap-page" onClick={() => { setMenuOpen(null); setSortOpen(false); }}>

      {/* Toasts handled by SweetAlert2 */}

      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={(e) => { e.stopPropagation(); closeSidebar(); }}
      />

      {/* SIDEBAR */}
      <aside className={`ap-sidebar ${sidebarOpen ? "open" : ""}`} onClick={e => e.stopPropagation()}>
        <div>
          <p className="ap-sidebar-label">ADMIN PORTAL</p>
          <nav className="ap-sidebar-nav">
            <button className="ap-nav-item" onClick={() => navigate("/admin/dashboard")}><LuLayoutDashboard /> Dashboard</button>
            <button className="ap-nav-item active"><LuPackage /> Products</button>
            <button className="ap-nav-item" onClick={() => navigate("/admin/orders")}><LuShoppingBag /> Orders</button>
          </nav>
        </div>
        <button className="ap-logout" onClick={logout}><LuLogOut /> Logout</button>
      </aside>

      {/* MAIN */}
      <main className="ap-main">

        {/* TOP NAV */}
        <header className="ap-topnav">
          {/* Hamburger — only visible ≤900px via admin-responsive.css */}
          <button
            className="admin-hamburger"
            onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
            aria-label="Toggle navigation"
          >
            <LuMenu />
          </button>
          <div className="ap-topnav-links">
            <Link to="/">Home</Link><Link to="/menu">Menu</Link><Link to="/reviews">Reviews</Link>
          </div>
          <div className="ap-topnav-logo"><LuDiamond /><span>Mublat Admin</span></div>
          <div className="ap-topnav-right">
            <LuShoppingBag />
            <button className="ap-dash-btn" onClick={() => navigate("/admin/dashboard")}><LuLayoutDashboard /> <span>Dashboard</span></button>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="ap-header">
          <div>
            <h1>Product Management</h1>
            <p>Manage your luxury catalog of pastries and drinks.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="ap-refresh-btn" onClick={loadProducts} title="Refresh"><LuRefreshCw /></button>
            <button className="ap-add-btn" onClick={openAdd}><LuPlus /> Add New Product</button>
          </div>
        </div>

        {/* STATS */}
        <motion.div className="ap-stats" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={staggerItem} className="ap-stat-card"><span className="ap-stat-label">Total Products</span><strong>{products.length}</strong></motion.div>
          <motion.div variants={staggerItem} className="ap-stat-card green"><span className="ap-stat-label">Active</span><strong>{totalActive}</strong></motion.div>
          <motion.div variants={staggerItem} className="ap-stat-card red"><span className="ap-stat-label">Inactive</span><strong>{totalInactive}</strong></motion.div>
          <motion.div variants={staggerItem} className="ap-stat-card gold"><span className="ap-stat-label">Pastries</span><strong>{totalPastries}</strong></motion.div>
          <motion.div variants={staggerItem} className="ap-stat-card blue"><span className="ap-stat-label">Drinks</span><strong>{totalDrinks}</strong></motion.div>
        </motion.div>

        {/* FILTERS */}
        <div className="ap-filters">
          <div className="ap-search">
            <LuSearch />
            <input placeholder="Search by name, description, category, SKU…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); setSelected(new Set()); }} />
            {search && <button className="ap-search-clear" onClick={() => { setSearch(""); setPage(1); }}><LuX /></button>}
          </div>
          <div className="ap-filter-right">
            <div className="ap-cat-filters">
              {CATS.map(c => (
                <button key={c} className={catFilter === c ? "active" : ""} onClick={() => { setCatFilter(c); setPage(1); setSelected(new Set()); }}>{c}</button>
              ))}
            </div>
            <div className="ap-sort-wrap" onClick={e => e.stopPropagation()}>
              <button className="ap-sort-btn" onClick={() => setSortOpen(o => !o)}>
                <LuArrowUpDown />{SORT_OPTS.find(o => o.value === sort)?.label}<LuChevronDown className={sortOpen ? "rotated" : ""} />
              </button>
              {sortOpen && (
                <div className="ap-sort-dropdown">
                  {SORT_OPTS.map(o => (
                    <button key={o.value} className={sort === o.value ? "active" : ""} onClick={() => { setSort(o.value); setSortOpen(false); setPage(1); }}>{o.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BULK BAR */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              className="ap-bulk-bar"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="ap-bulk-info">
                <LuCheckCheck />
                <span>{selected.size} product{selected.size > 1 ? "s" : ""} selected</span>
                <button className="ap-bulk-clear" onClick={clearSel}>Clear</button>
              </div>
              <div className="ap-bulk-actions">
                <button className="ap-bulk-btn activate" onClick={bulkActivate}><LuToggleRight /> Activate</button>
                <button className="ap-bulk-btn deactivate" onClick={bulkDeactivate}><LuToggleLeft /> Deactivate</button>
                <button className="ap-bulk-btn delete" onClick={bulkDeleteDo}><LuTrash2 /> Delete ({selected.size})</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABLE */}
        <div className="ap-table-wrap">

          {loading ? (
            <Loader message="Loading products…" />
          ) : apiError ? (
            <div className="ap-api-error">
              <p>{apiError}</p>
              <button onClick={loadProducts}><LuRefreshCw /> Retry</button>
            </div>
          ) : (
            <>
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" className="ap-checkbox" checked={allPageSel}
                        ref={el => { if (el) el.indeterminate = someSel && !allPageSel; }}
                        onChange={togglePage} />
                    </th>
                    <th>Product</th><th>Category</th><th>Status</th><th>Pricing</th><th>Last Updated</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {pageProd.length === 0 ? (
                      <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan={7} className="ap-empty">
                          <LuPackage className="ap-empty-icon" />
                          <p>No products found{search ? ` for "${search}"` : ""}.</p>
                          {search && <button onClick={() => setSearch("")}>Clear search</button>}
                        </td>
                      </motion.tr>
                    ) : (
                      pageProd.map((prod, i) => (
                        <motion.tr
                          key={prod.id}
                          className={selected.has(prod.id) ? "ap-row-selected" : ""}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                        >
                          <td><input type="checkbox" className="ap-checkbox" checked={selected.has(prod.id)} onChange={() => toggleOne(prod.id)} /></td>

                          <td>
                            <div className="ap-prod-cell">
                              <div className="ap-prod-img">
                                {prod.images.length > 0 ? <img src={prod.images[0].src} alt={prod.name} /> : <LuImage />}
                              </div>
                              <div>
                                <p className="ap-prod-name">{prod.name}</p>
                                <span className="ap-prod-sku">{prod.sku}</span>
                                <span className="ap-prod-desc">{prod.description}</span>
                              </div>
                            </div>
                          </td>

                          <td><span className={`ap-cat-badge ${catBadgeClass(prod.category)}`}>{prod.category}</span></td>

                          <td>
                            <div className={`ap-status-toggle ${prod.active ? "active" : ""}`} onClick={() => handleToggle(prod.id, prod.name, prod.active)} title="Click to toggle">
                              <div className="ap-status-dot" />
                              {prod.active ? "Active" : "Inactive"}
                            </div>
                          </td>

                          <td>
                            <p className="ap-price">{priceLabel(prod)}</p>
                            {prod.options.length > 1 && <span className="ap-options-count">{prod.options.length} OPTIONS</span>}
                          </td>

                          <td className="ap-updated">{fmtDate(prod.updatedAt)}</td>

                          <td>
                            <div className="ap-action-btns" onClick={e => e.stopPropagation()}>
                              <button className="ap-icon-btn" title="Preview" onClick={() => { setPreviewProd(prod); setModal("preview"); }}><LuEye /></button>
                              <button className="ap-icon-btn" title="Edit" onClick={() => openEdit(prod)}><LuPencil /></button>
                              <button className="ap-icon-btn danger" title="Delete" onClick={() => handleDeleteClick(prod)}><LuTrash2 /></button>
                              <div className="ap-kebab-wrap">
                                <button className="ap-icon-btn" onClick={() => setMenuOpen(menuOpen === prod.id ? null : prod.id)}><MdMoreVert /></button>
                                {menuOpen === prod.id && (
                                  <div className="ap-kebab-menu">
                                    <button onClick={() => { setPreviewProd(prod); setModal("preview"); setMenuOpen(null); }}><LuEye /> Preview</button>
                                    <button onClick={() => openEdit(prod)}><LuPencil /> Edit</button>
                                    <button onClick={() => duplicate(prod)}><LuCopy /> Duplicate</button>
                                    <button onClick={() => { handleToggle(prod.id, prod.name, prod.active); setMenuOpen(null); }}>
                                      {prod.active ? <><LuToggleLeft /> Deactivate</> : <><LuToggleRight /> Activate</>}
                                    </button>
                                    <button className="danger" onClick={() => { setMenuOpen(null); handleDeleteClick(prod); }}><LuTrash2 /> Delete</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="ap-pagination">
                <span>{filtered.length === 0 ? "No products" : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length} products`}</span>
                <div className="ap-page-btns">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><LuChevronLeft /> Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`ap-page-num ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next <LuChevronRight /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ══ ADD / EDIT MODAL ══ */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="ap-modal-overlay"
            variants={fadeIn} initial="hidden" animate="visible" exit="exit"
            onClick={closeModal}
          >
            <motion.div
              className="ap-modal"
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="ap-modal-header">
                <div>
                  <h3>{modal === "add" ? "Add New Product" : `Edit: ${editTarget?.name}`}</h3>
                  {modal === "edit" && editTarget && <p className="ap-modal-meta">SKU: {editTarget.sku} · Created {fmtDate(editTarget.createdAt)}</p>}
                  {modal === "add" && <p>Enter the details for the new luxury product.</p>}
                </div>
                <button className="ap-modal-close" onClick={closeModal}><LuX /></button>
              </div>
              <div className="ap-modal-body">
                {formErr && <div className="ap-form-err">⚠ {formErr}</div>}

                <div className="ap-form-row">
                  <label>Name <span className="ap-req">*</span><span className="ap-char-count">{form.name.length}/60</span></label>
                  <input className="ap-input" placeholder="e.g. Saffron Brioche" maxLength={60} value={form.name} onChange={e => setField("name", e.target.value)} />
                </div>

                <div className="ap-form-row ap-form-row-inline">
                  <label>Category <span className="ap-req">*</span></label>
                  <div className="ap-cat-toggle">
                    {["Pastries", "Drinks", "Other"].map(c => (
                      <button key={c} className={form.category === c ? "active" : ""} onClick={() => setField("category", c)}>{c === "Pastries" ? "Pastry" : c === "Drinks" ? "Drink" : "Other"}</button>
                    ))}
                  </div>
                </div>

                <div className="ap-form-row">
                  <label>Description <span className="ap-req">*</span><span className="ap-char-count">{form.description.length}/200</span></label>
                  <textarea className="ap-textarea" placeholder="Describe the exquisite taste profile..." maxLength={200} value={form.description} onChange={e => setField("description", e.target.value)} />
                </div>

                {/* IMAGES */}
                <div className="ap-form-row">
                  <div className="ap-img-header">
                    <label className="ap-section-label">PRODUCT IMAGES <span className="ap-optional">(optional, max {MAX_IMGS})</span></label>
                    <span className="ap-img-hint">{form.images.length}/{MAX_IMGS} {uploading ? "· Uploading…" : ""}</span>
                  </div>
                  {form.images.length > 0 && (
                    <div className="ap-img-previews">
                      {form.images.map((img, i) => (
                        <div key={i} className="ap-img-thumb">
                          <img src={img.src} alt={`img-${i}`} />
                          {i === 0 && <span className="ap-img-main-badge">Main</span>}
                          <button className="ap-img-remove" onClick={() => removeImage(i)} title="Remove"><LuX /></button>
                          <div className="ap-img-reorder">
                            <button onClick={() => moveImageLeft(i)} disabled={i === 0} title="Move left"><LuArrowLeft /></button>
                            <button onClick={() => moveImageRight(i)} disabled={i === form.images.length - 1} title="Move right"><LuArrowRight /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.images.length < MAX_IMGS && (
                    <div className={`ap-dropzone ${uploading ? "ap-dropzone-loading" : ""}`} onDragOver={e => e.preventDefault()} onDrop={onDrop} onClick={() => !uploading && fileInputRef.current.click()}>
                      <LuImagePlus className="ap-dropzone-icon" />
                      <p>{uploading ? "Uploading to Cloudinary…" : <>Drag & drop or <span>click to browse</span></>}</p>
                      <small>PNG · JPG · WEBP — up to {MAX_IMGS - form.images.length} more image{MAX_IMGS - form.images.length > 1 ? "s" : ""}</small>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageFiles(e.target.files)} />
                    </div>
                  )}
                </div>

                {/* OPTIONS */}
                <div className="ap-form-row">
                  <div className="ap-options-header">
                    <label className="ap-section-label">PRICE OPTIONS <span className="ap-req">*</span></label>
                    <button className="ap-add-option" onClick={addOption} disabled={form.options.length >= 5}><LuPlus /> Add Option</button>
                  </div>
                  {form.options.map((opt, i) => (
                    <div key={i} className="ap-option-row">
                      <input className="ap-option-label" placeholder={`Option ${i + 1} (e.g. Regular)`} value={opt.label} onChange={e => setOption(i, "label", e.target.value)} />
                      <div className="ap-option-price">
                        <span>£</span>
                        <input type="number" min="0" step="0.01" placeholder="0.00" value={opt.price} onChange={e => setOption(i, "price", e.target.value)} />
                      </div>
                      <button className="ap-remove-option" onClick={() => removeOption(i)} disabled={form.options.length === 1} title="Remove option"><LuX /></button>
                    </div>
                  ))}
                </div>

                {isDirty && <p className="ap-dirty-notice">● Unsaved changes</p>}

                <div className="ap-modal-actions">
                  <button className="ap-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button className="ap-save-btn" onClick={modal === "add" ? saveAdd : saveEdit} disabled={saving}>
                    {saving ? "Saving…" : modal === "add" ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal === "preview" && previewProd && (
          <motion.div
            className="ap-modal-overlay"
            variants={fadeIn} initial="hidden" animate="visible" exit="exit"
            onClick={() => setModal("none")}
          >
            <motion.div
              className="ap-modal ap-preview-modal"
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="ap-modal-header">
                <div><h3>{previewProd.name}</h3><p>{previewProd.sku} · {previewProd.category}</p></div>
                <div className="ap-preview-header-right">
                  <button className="ap-icon-btn" title="Edit" onClick={() => { setModal("none"); openEdit(previewProd); }}><LuPencil /></button>
                  <button className="ap-modal-close" onClick={() => setModal("none")}><LuX /></button>
                </div>
              </div>
              <div className="ap-preview-body">
                {previewProd.images.length > 0 ? (
                  <div className="ap-preview-images">
                    <div className="ap-preview-main-img"><img src={previewProd.images[0].src} alt={previewProd.name} /></div>
                    {previewProd.images.length > 1 && (
                      <div className="ap-preview-thumbs">{previewProd.images.map((img, i) => <img key={i} src={img.src} alt="" />)}</div>
                    )}
                  </div>
                ) : (
                  <div className="ap-preview-no-img"><LuImage /><span>No images uploaded</span></div>
                )}
                <div className="ap-preview-info">
                  <p className="ap-preview-desc">{previewProd.description}</p>
                  <div className="ap-preview-badges">
                    <span className={`ap-cat-badge ${catBadgeClass(previewProd.category)}`}>{previewProd.category}</span>
                    <span className={`ap-status-badge ${previewProd.active ? "active" : ""}`}>{previewProd.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="ap-preview-options">
                    <p className="ap-section-label">PRICE OPTIONS</p>
                    {previewProd.options.map((o, i) => (
                      <div key={i} className="ap-preview-opt"><span>{o.label}</span><strong>£{Number(o.price).toFixed(2)}</strong></div>
                    ))}
                  </div>
                  <div className="ap-preview-meta">
                    <span>Created: {fmtDate(previewProd.createdAt)}</span>
                    <span>Updated: {fmtDate(previewProd.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminProducts;