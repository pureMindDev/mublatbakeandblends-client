import React from "react";
import "./DeliveryPolicy.css";
import { DELIVERY_POLICY as P } from "../../utils/delivery";

/** The business's official delivery policy, word for word. */
function DeliveryPolicy({ id, heading = true, className = "" }) {
  return (
    <section id={id} className={`dp ${className}`} aria-label="Delivery charges">
      {heading && <h3 className="dp-title">{P.title}</h3>}
      <p className="dp-intro">{P.intro}</p>

      <div className="dp-tiers">
        {[P.standard, P.large].map((t) => (
          <div key={t.heading} className="dp-tier">
            <h4>{t.heading}</h4>
            <p>{t.lead}</p>
            <ul>{t.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </div>
        ))}
      </div>

      <p className="dp-note"><strong>Please note:</strong> {P.note}</p>
      <p className="dp-thanks">{P.thanks}</p>
    </section>
  );
}

export default DeliveryPolicy;
