import React, { useState } from "react";
import "./SupportPage.css";
import {
  LuMail, LuPhone, LuMapPin, LuClock,
  LuChevronDown, LuChevronUp, LuSend, LuCheck,
} from "react-icons/lu";
import api from "../../services/api";

const FAQS = [
  { q: "How long does delivery take?", a: "We deliver within 30–45 minutes for most areas in London. You'll receive a text update when your order is being prepared and when it's on the way." },
  { q: "What areas do you deliver to?", a: "We currently deliver across central and greater London. Enter your postcode at checkout to confirm your area is covered. If not, you're welcome to use our boutique pickup option." },
  { q: "Can I cancel or modify my order?", a: "Orders can be cancelled or modified within 5 minutes of placing them. After that, your order will already be in preparation. Please contact us immediately at support@mublat.com." },
  { q: "Are your pastries freshly made?", a: "Yes — all pastries are baked fresh daily in small batches. We never use frozen ingredients. Our drinks are also prepared fresh with no artificial preservatives." },
  { q: "Do you cater for events or large orders?", a: "Absolutely. We offer catering for events, corporate orders, and large gatherings. Contact us at least 48 hours in advance via email or phone and we'll prepare a custom quote." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) through our secure Stripe payment system. We do not currently accept cash for online orders." },
  { q: "My order arrived incorrect — what should I do?", a: "We sincerely apologise. Please contact us within 1 hour of receiving your order with a photo and your order number. We'll arrange a replacement or full refund immediately." },
  { q: "Do you offer allergen information?", a: "Yes. All our products contain gluten (wheat flour) and may contain dairy, eggs, fish, and nuts. If you have a specific allergy, please contact us before ordering and we'll advise accordingly." },
];

const CONTACT_TOPICS = [
  "General Enquiry", "Order Issue", "Delivery Problem",
  "Payment / Refund", "Catering / Large Order", "Allergen Information", "Other",
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sp-faq-item ${open ? "open" : ""}`}>
      <button className="sp-faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        {open ? <LuChevronUp /> : <LuChevronDown />}
      </button>
      {open && <p className="sp-faq-a">{a}</p>}
    </div>
  );
}

const blankForm = () => ({ name: "", email: "", topic: "", message: "" });

function SupportPage() {
  const [form,      setForm]      = useState(blankForm());
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [apiError,  setApiError]  = useState("");

  const setField = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    setErrors(e => ({ ...e, [f]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Your name is required.";
    if (!form.email.trim())   e.email   = "Your email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = "Enter a valid email address.";
    if (!form.topic)          e.topic   = "Please select a topic.";
    if (!form.message.trim()) e.message = "Please describe your issue.";
    else if (form.message.trim().length < 20)
                              e.message = "Message must be at least 20 characters.";
    return e;
  };

  // Fix #6: actually POST to backend and send the email
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSending(true);
    setApiError("");

    try {
      await api.post("/support", {
        name:    form.name.trim(),
        email:   form.email.trim(),
        topic:   form.topic,
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        "Failed to send your message. Please try emailing us directly at support@mublat.com."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sp-page">

      <div className="sp-hero">
        <span className="sp-badge">Support Centre</span>
        <h1>How Can We Help?</h1>
        <p>Our concierge team is available 7 days a week to assist you with orders, deliveries, payments, and anything else you need.</p>
      </div>

      <div className="sp-container">

        <div className="sp-info-grid">
          <div className="sp-info-card">
            <div className="sp-info-icon"><LuMail /></div>
            <h4>Email Us</h4>
            <p>For all enquiries and non-urgent issues</p>
            <a href="mailto:support@mublat.com">support@mublat.com</a>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon"><LuPhone /></div>
            <h4>Call Us</h4>
            <p>Speak directly to our team</p>
            <a href="tel:+442071234567">+44 (0)20 7123 4567</a>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon"><LuMapPin /></div>
            <h4>Visit Us</h4>
            <p>Our boutique pickup location</p>
            <span>12 Mayfair Square, London W1J 8AJ</span>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon"><LuClock /></div>
            <h4>Opening Hours</h4>
            <p>When we're available</p>
            <span>Mon–Sun · 8:00 AM – 9:00 PM</span>
          </div>
        </div>

        <div className="sp-main-grid">

          <div className="sp-faq-section">
            <h2>Frequently Asked Questions</h2>
            <p className="sp-faq-sub">Quick answers to our most common questions.</p>
            <div className="sp-faq-list">
              {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          </div>

          <div className="sp-form-section">
            <h2>Send a Message</h2>
            <p className="sp-form-sub">We typically respond within 2 hours during opening hours.</p>

            {submitted ? (
              <div className="sp-submitted">
                <div className="sp-submitted-icon"><LuCheck /></div>
                <h3>Message Received!</h3>
                <p>Thank you for reaching out. Our team will get back to you at <strong>{form.email}</strong> within 2 hours.</p>
                <button className="sp-reset-btn" onClick={() => { setForm(blankForm()); setSubmitted(false); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="sp-form">

                <div className="sp-field">
                  <label>Your Name</label>
                  <input placeholder="e.g. Jane Doe" value={form.name} onChange={e => setField("name", e.target.value)} />
                  {errors.name && <span className="sp-error">{errors.name}</span>}
                </div>

                <div className="sp-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="jane@example.com" value={form.email} onChange={e => setField("email", e.target.value)} />
                  {errors.email && <span className="sp-error">{errors.email}</span>}
                </div>

                <div className="sp-field">
                  <label>Topic</label>
                  <select value={form.topic} onChange={e => setField("topic", e.target.value)} className={!form.topic ? "sp-select-placeholder" : ""}>
                    <option value="" disabled>Select a topic…</option>
                    {CONTACT_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <span className="sp-error">{errors.topic}</span>}
                </div>

                <div className="sp-field">
                  <label>Message <span className="sp-char-count">{form.message.length} chars</span></label>
                  <textarea placeholder="Please describe your issue in as much detail as possible…" value={form.message} onChange={e => setField("message", e.target.value)} />
                  {errors.message && <span className="sp-error">{errors.message}</span>}
                </div>

                {apiError && <p className="sp-error sp-api-error">{apiError}</p>}

                <button className="sp-submit-btn" onClick={handleSubmit} disabled={sending}>
                  {sending ? "Sending…" : <><LuSend /> Send Message</>}
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SupportPage;
