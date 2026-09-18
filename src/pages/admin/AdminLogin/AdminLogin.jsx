import "./AdminLogin.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { scaleIn, stagger, staggerItem } from "../../../utils/motion";
import { toastError } from "../../../utils/swal";
import { useAuth } from "../../../context/AuthContext";
import {
  LuMail, LuLock, LuEye, LuEyeOff,
  LuShield, LuInfo, LuDiamond,
} from "react-icons/lu";

function AdminLogin() {

  const { login } = useAuth();

  const [email, setEmail] = useState("mublatbakeandblends@gmail.com");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    /* login() is async — calls the real backend */
    const err = await login(email, password);

    setLoading(false);

    if (err) {
      setError(err);
      toastError(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <motion.section
      className="admin-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      {/* BACK LINK */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <Link to="/" className="back-link">← Return to Storefront</Link>
      </motion.div>

      {/* CARD */}
      <motion.div
        className="admin-card"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >

        {/* LOGO */}
        <div className="admin-logo">
          <div className="logo-icon">
            <LuDiamond className="diamond-svg" />
          </div>
          <span>Mublat Admin</span>
        </div>

        <h2>Welcome Back</h2>
        <p>Please enter your credentials to manage the bakery</p>

        {/* DIVIDER */}
        <div className="divider">
          <span>Security Check</span>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <motion.div
            className="login-error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* EMAIL */}
        <label>Email Address</label>
        <div className={`input-box ${error && !email ? "input-error" : ""}`}>
          <LuMail />
          <input
            type="email"
            placeholder="mublatbakeandblends@gmail.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* PASSWORD */}
        <div className="password-row">
          <label>Password</label>
          <span className="forgot">Forgot Password?</span>
        </div>

        <div className="input-box">
          <LuLock />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
          />
          <span className="eye" onClick={() => setShowPass(p => !p)}>
            {showPass ? <LuEyeOff /> : <LuEye />}
          </span>
        </div>

        {/* REMEMBER */}
        <div className="remember">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">Remember this device</label>
        </div>

        {/* SUBMIT */}
        <motion.button
          className="login-btn"
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: loading ? 1 : 1.01 }}
        >
          {loading ? "Signing in…" : "Sign In to Dashboard"}
        </motion.button>

        {/* FOOTER BAR */}
        <div className="authorized">
          <LuShield /> AUTHORIZED PERSONNEL ONLY
        </div>

      </motion.div>

      {/* BOTTOM CARDS */}
      <motion.div
        className="admin-bottom"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >

        <motion.div variants={staggerItem} className="mini-card">
          <LuInfo className="mini-icon" />
          <div>
            <strong>First-time access?</strong>
            <span>Contact the lead manager for your activation key.</span>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="mini-card">
          <LuShield className="mini-icon" />
          <div>
            <strong>Secure Login</strong>
            <span>2FA is mandatory for all administrative accounts.</span>
          </div>
        </motion.div>

      </motion.div>

      {/* PAGE FOOTER */}
      <p className="admin-footer">
        © 2026 MUBLAT BAKE & BLENDS • INTERNAL SYSTEMS
      </p>

    </motion.section>
  );
}

export default AdminLogin;
