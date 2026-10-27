import React, { useEffect, useState } from "react";
import "./SafeImage.css";

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "M";

/**
 * <img> that never shows a broken-image icon: when there is no URL (a product
 * saved without photos) or the URL fails to load, it renders a branded
 * placeholder that keeps the same className (so the same sizing rules apply).
 */
function SafeImage({ src, alt = "", className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <div className={`${className} img-fallback`.trim()} role="img" aria-label={alt || "Image coming soon"}>
        <span>{initials(alt)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || undefined}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

export default SafeImage;
