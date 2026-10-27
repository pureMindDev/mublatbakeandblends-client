import "../Dashboard/Dashboard.css";
import "./AdminVideoReviews.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useAdminSidebar } from "../../../hooks/useAdminSidebar";
import {
  fetchAllVideoReviews, addVideoReviewUrl, uploadVideoReview,
  updateVideoReview, deleteVideoReview,
} from "../../../services/videoReviewService";
import { toastSuccess, toastError, confirmDanger } from "../../../utils/swal";
import {
  LuPackage, LuShoppingBag, LuLogOut, LuDiamond, LuStore,
  LuMenu, LuVideo, LuCheck, LuEyeOff, LuTrash2, LuUpload, LuLink,
} from "react-icons/lu";
import Loader from "../../../components/Loader/Loader";

/* A 404 here means the live server doesn't have the video-review routes yet. */
const explain = (e, fallback) =>
  e.response?.status === 404
    ? "The server doesn't have the video reviews feature yet — redeploy the backend (server folder) with the latest code."
    : e.response?.data?.message || e.message || fallback;

function AdminVideoReviews() {
  const { logout } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useAdminSidebar();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [mode, setMode] = useState("upload"); // "upload" | "url"
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVideos(await fetchAllVideoReviews()); }
    catch (e) { toastError(explain(e, "Could not load video reviews.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setFile(null); setUrl(""); setPosterUrl(""); setCustomerName(""); setCaption(""); setProgress(null); };

  const handleAdd = async () => {
    if (mode === "upload" && !file) return toastError("Choose a video file first.");
    if (mode === "url" && !url.trim()) return toastError("Enter the video link.");
    setSaving(true);
    try {
      const created = mode === "upload"
        ? await uploadVideoReview(file, { customerName, caption }, setProgress)
        : await addVideoReviewUrl({ videoUrl: url.trim(), posterUrl: posterUrl.trim(), customerName, caption });
      setVideos(v => [...v, created]);
      resetForm();
      toastSuccess("Video added. It stays hidden until you approve it.");
    } catch (e) {
      toastError(explain(e, "Could not add the video."));
    } finally { setSaving(false); }
  };

  const patch = async (v, changes, msg) => {
    setBusyId(v._id);
    try {
      const updated = await updateVideoReview(v._id, changes);
      setVideos(list => list.map(x => (x._id === v._id ? updated : x)));
      if (msg) toastSuccess(msg);
    } catch (e) { toastError(e.response?.data?.message || "Update failed."); }
    finally { setBusyId(null); }
  };

  const remove = async (v) => {
    const ok = await confirmDanger({ title: "Delete this video review?", text: "It will be removed from the website.", confirmText: "Delete" });
    if (!ok) return;
    setBusyId(v._id);
    try {
      await deleteVideoReview(v._id);
      setVideos(list => list.filter(x => x._id !== v._id));
      toastSuccess("Video review deleted.");
    } catch (e) { toastError(e.response?.data?.message || "Delete failed."); }
    finally { setBusyId(null); }
  };

  return (
    <div className="dash-page">
      <div className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={closeSidebar} />

      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <p className="dash-sidebar-label">ADMIN PORTAL</p>
          <nav className="dash-sidebar-nav">
            <button className="dash-nav-item" onClick={() => navigate("/")}><LuStore /> Store Front</button>
            <button className="dash-nav-item" onClick={() => navigate("/admin/products")}><LuPackage /> Products</button>
            <button className="dash-nav-item" onClick={() => navigate("/admin/orders")}><LuShoppingBag /> Orders</button>
            <button className="dash-nav-item active"><LuVideo /> Video Reviews</button>
          </nav>
        </div>
        <button className="dash-logout" onClick={logout}><LuLogOut /> Logout</button>
      </aside>

      <main className="dash-main">
        <header className="dash-topnav">
          <button className="admin-hamburger" onClick={toggleSidebar} aria-label="Toggle navigation"><LuMenu /></button>
          <div className="dash-topnav-links">
            <Link to="/">Home</Link><Link to="/menu">Menu</Link><Link to="/reviews">Reviews</Link>
          </div>
          <div className="dash-topnav-logo"><LuDiamond /><span>Mublat Admin</span></div>
          <div className="dash-topnav-right"></div>
        </header>

        <div className="dash-header">
          <div>
            <h1>Video Reviews</h1>
            <p>Customer testimonial videos. Only <strong>approved</strong> videos appear on the website.</p>
          </div>
        </div>

        {/* ADD */}
        <div className="avr-body">
        <section className="avr-add">
          <div className="avr-tabs">
            <button className={mode === "upload" ? "active" : ""} onClick={() => setMode("upload")}><LuUpload /> Upload video</button>
            <button className={mode === "url" ? "active" : ""} onClick={() => setMode("url")}><LuLink /> Use a link</button>
          </div>

          {mode === "upload" ? (
            <label className="avr-field">Video file <small>(MP4 / MOV, up to 100&nbsp;MB — sent straight to Cloudinary)</small>
              <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          ) : (
            <>
              <label className="avr-field">Video link <small>(https://… or /videos/file.mp4)</small>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/…/video.mp4" />
              </label>
              <label className="avr-field">Poster image link <small>(optional)</small>
                <input value={posterUrl} onChange={e => setPosterUrl(e.target.value)} />
              </label>
            </>
          )}

          <div className="avr-row">
            <label className="avr-field">Customer name <small>(only if they've approved it)</small>
              <input value={customerName} maxLength={80} onChange={e => setCustomerName(e.target.value)} />
            </label>
            <label className="avr-field">Short caption <small>(optional)</small>
              <input value={caption} maxLength={200} onChange={e => setCaption(e.target.value)} />
            </label>
          </div>

          <button className="avr-primary" onClick={handleAdd} disabled={saving}>
            {saving ? (progress != null ? `Uploading… ${progress}%` : "Saving…") : "Add video"}
          </button>
        </section>

        {/* LIST */}
        {loading ? <Loader message="Loading videos…" /> : videos.length === 0 ? (
          <p className="avr-empty">No video reviews yet.</p>
        ) : (
          <div className="avr-grid">
            {videos.map(v => (
              <div key={v._id} className={`avr-card ${v.approved ? "approved" : ""}`}>
                <video src={v.videoUrl} poster={v.posterUrl || undefined} controls preload="metadata" playsInline />
                <div className="avr-card-body">
                  <span className={`avr-badge ${v.approved ? "on" : "off"}`}>{v.approved ? "Approved · live" : "Not approved · hidden"}</span>
                  <input
                    className="avr-name"
                    defaultValue={v.customerName}
                    placeholder="Customer name (optional)"
                    maxLength={80}
                    onBlur={e => e.target.value.trim() !== (v.customerName || "") && patch(v, { customerName: e.target.value.trim() }, "Name saved.")}
                  />
                  <div className="avr-actions">
                    <button
                      className={v.approved ? "avr-secondary" : "avr-primary"}
                      disabled={busyId === v._id}
                      onClick={() => patch(v, { approved: !v.approved }, v.approved ? "Video hidden from the website." : "Video approved and live.")}
                    >
                      {v.approved ? <><LuEyeOff /> Unapprove</> : <><LuCheck /> Approve</>}
                    </button>
                    <button className="avr-danger" disabled={busyId === v._id} onClick={() => remove(v)} aria-label="Delete video"><LuTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default AdminVideoReviews;
