import React, { useState } from "react";
import "./SupportPage.css";
import {
  LuMail, LuPhone, LuMapPin, LuClock,
  LuChevronDown, LuChevronUp, LuSend, LuCheck,
} from "react-icons/lu";
import api from "../../services/api";

const FAQS = [
  { q: "Where is Mublat Bakes & Blends based?", a: "We are based in Newry, Northern Ireland, and we deliver our delicious Nigerian drinks and homemade treats across the UK." },
  { q: "What products do you offer?", a: "We offer authentic Nigerian drinks, tigernut drink, zobo, PinGinger, coconut yoghurt, pastries, puff puff, chinchin, samosa, spring rolls and more." },
  { q: "How do I place an order?", a: "Simply browse our menu, choose your favourites and place your order through our website or contact us directly." },
  { q: "When do you dispatch orders?", a: "Orders are prepared and dispatched on Thursdays for delivery by Friday, subject to the delivery location." },
  { q: "Do you deliver across the UK?", a: "Yes! We offer UK-wide delivery for selected products. Delivery charges depend on your location and order size." },
  { q: "Can I mix and match my drinks?", a: "Yes, you can mix different flavours and drinks when ordering in packs, subject to availability." },
  { q: "How should I store the drinks?", a: "Our fresh drinks should be kept refrigerated. Some products, such as our tigernut drink, may require freezing for longer storage. Always check the product label for specific storage instructions." },
  { q: "Do your drinks contain artificial colours or preservatives?", a: "Our drinks are made with carefully selected ingredients, without artificial colours or preservatives." },
  { q: "How long do the drinks and pastries last?", a: "Shelf life varies by product. Please check the label on your order for the recommended use-by date and storage instructions." },
  { q: "Can I order for an event or large gathering?", a: "Absolutely! We welcome bulk and event orders. Please contact us in advance so we can discuss your requirements and availability." },
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
        "Failed to send your message. Please try emailing us directly at mublatbakeandblends@gmail.com."
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
            <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon"><LuPhone /></div>
            <h4>Call Us</h4>
            <p>Speak directly to our team</p>
            <a href="tel:+447587911097">+44 7587 911097</a>
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
