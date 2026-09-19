import React from "react";
import "./LegalPage.css";

function PrivacyPolicy() {
  return (
    <div className="lp-page">
      <div className="lp-hero">
        <span className="lp-badge">Legal</span>
        <h1>Privacy Policy</h1>
        <p>Last updated: September 2026</p>
      </div>

      <div className="lp-container">
        <p>
          Mublat Bake &amp; Blends ("we", "us", "our") is based at
          33 College Garden, BT35 6DR, United Kingdom. This policy explains
          what personal information we collect when you use our website and
          place an order, how we use it, and the choices you have.
        </p>

        <h2>Information We Collect</h2>
        <p>When you place an order or contact us, we may collect:</p>
        <ul>
          <li>Your name, email address, phone number and delivery address</li>
          <li>Details of the products you order and your order history</li>
          <li>Messages you send us through the support/contact form</li>
          <li>Payment information — this is collected and processed directly by our payment provider, Stripe. We never see or store your full card details.</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process, prepare and deliver your order</li>
          <li>To send order confirmations and status updates by email</li>
          <li>To respond to enquiries submitted through our support form</li>
          <li>To keep records required for accounting and tax purposes</li>
        </ul>
        <p>We do not sell or rent your personal information to third parties.</p>

        <h2>Third-Party Services We Use</h2>
        <p>
          We rely on a small number of trusted providers to run our website
          and fulfil orders. Each only receives the information it needs to
          perform its function:
        </p>
        <ul>
          <li><strong>Stripe</strong> — processes payments securely; we never store your card details.</li>
          <li><strong>Brevo</strong> — sends order confirmation and status-update emails on our behalf.</li>
          <li><strong>MongoDB Atlas</strong> — securely hosts our order and account database.</li>
          <li><strong>Cloudinary</strong> — hosts our product images (this does not involve your personal data).</li>
        </ul>

        <h2>Cookies &amp; Local Storage</h2>
        <p>
          We don't use third-party advertising or tracking cookies. Our
          website stores a small amount of information directly in your
          browser (via "local storage") so your shopping cart is remembered
          between visits, and so admin staff can stay logged in to the
          dashboard. This information stays on your device and is not shared
          with anyone.
        </p>

        <h2>How Long We Keep Your Information</h2>
        <p>
          We retain order records for as long as needed to meet our legal and
          accounting obligations. You can ask us to delete other personal
          information (such as support enquiries) at any time, as described
          below.
        </p>

        <h2>Your Rights</h2>
        <p>
          Under UK data protection law, you have the right to request a copy
          of the personal information we hold about you, ask us to correct
          it, or ask us to delete it. To make a request, email us at{" "}
          <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this policy or how we handle your
          information, please get in touch:
          <br />
          Email: <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>
          <br />
          Address: 33 College Garden, BT35 6DR, United Kingdom
        </p>

        <div className="lp-note">
          This policy may be updated from time to time to reflect changes to
          our business or the law; the "last updated" date above will change
          when it does. This page is provided as a general starting point and
          isn't a substitute for advice from a qualified solicitor — we'd
          recommend having it reviewed before relying on it for full legal
          compliance.
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
