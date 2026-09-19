import React from "react";
import "./LegalPage.css";

function TermsOfService() {
  return (
    <div className="lp-page">
      <div className="lp-hero">
        <span className="lp-badge">Legal</span>
        <h1>Terms of Service</h1>
        <p>Last updated: September 2026</p>
      </div>

      <div className="lp-container">
        <p>
          These terms apply whenever you order from Mublat Bake &amp; Blends
          ("we", "us", "our") through this website. By placing an order, you
          agree to them.
        </p>

        <h2>Orders &amp; Payment</h2>
        <p>
          All prices are shown in GBP (£) and include any applicable taxes
          unless stated otherwise. Payment is taken at checkout through our
          payment provider, Stripe. We do not currently accept cash for
          online orders. An order is confirmed once you receive an order
          confirmation email.
        </p>

        <h2>Cancellations &amp; Changes</h2>
        <p>
          You may cancel or modify your order within 5 minutes of placing it
          by contacting us immediately at{" "}
          <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>.
          After this window, your order will likely already be in
          preparation and we may not be able to make changes.
        </p>

        <h2>Delivery</h2>
        <p>
          We aim to deliver within the estimated timeframe shown at checkout.
          Delivery times are estimates, not guarantees, and can occasionally
          be affected by weather, traffic or high demand. Please make sure
          your delivery address and contact details are accurate — we're not
          responsible for delays caused by incorrect information provided at
          checkout.
        </p>

        <h2>Allergens</h2>
        <p>
          All our products contain gluten (wheat flour) and may contain
          dairy, eggs, fish and nuts. If you have a specific allergy or
          dietary requirement, please contact us before ordering so we can
          advise accordingly. We take reasonable care in our kitchen, but
          cannot guarantee any product is completely free of trace allergens.
        </p>

        <h2>Refunds &amp; Issues With Your Order</h2>
        <p>
          If your order arrives incorrect, damaged, or doesn't meet the
          standard you'd expect, please contact us within 1 hour of
          receiving it, with a photo and your order number, at{" "}
          <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>.
          We'll arrange a replacement or a full refund. This doesn't affect
          any statutory rights you have as a consumer under UK law.
        </p>

        <h2>Our Liability</h2>
        <p>
          We aim to make sure everything on this site is accurate, but we
          don't guarantee it's always error-free (for example, occasional
          pricing or availability mistakes). Where something like that
          happens, we'll contact you before processing the order to confirm
          how you'd like to proceed. To the extent permitted by law, our
          liability is limited to the value of your order.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time; the "last updated"
          date above will reflect the most recent version. Continuing to use
          the site after changes are posted means you accept the updated
          terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of the United Kingdom, and any
          disputes will be handled in the applicable UK courts.
        </p>

        <h2>Contact Us</h2>
        <p>
          Questions about these terms? Get in touch:
          <br />
          Email: <a href="mailto:mublatbakeandblends@gmail.com">mublatbakeandblends@gmail.com</a>
          <br />
          Address: 33 College Garden, BT35 6DR, United Kingdom
        </p>

        <div className="lp-note">
          This page is provided as a general starting point and isn't a
          substitute for advice from a qualified solicitor — we'd recommend
          having it reviewed before relying on it for full legal compliance,
          especially around consumer rights and refund obligations specific
          to your business.
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
