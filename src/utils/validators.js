/* ─────────────────────────────────────────────────
   Mublat — centralised validation utilities
───────────────────────────────────────────────── */

/** Non-empty string */
export const required = (val, label = "This field") =>
  val && val.trim() ? null : `${label} is required.`;

/** Minimum length */
export const minLength = (val, min, label = "This field") =>
  val && val.trim().length >= min
    ? null
    : `${label} must be at least ${min} characters.`;

/** Maximum length */
export const maxLength = (val, max, label = "This field") =>
  !val || val.trim().length <= max
    ? null
    : `${label} must be ${max} characters or fewer.`;

/** Email format */
export const isEmail = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val?.trim())
    ? null
    : "Enter a valid email address.";

/** UK postcode (e.g. W1J 8AJ) */
export const isUKPostcode = (val) =>
  /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(val?.trim())
    ? null
    : "Enter a valid UK postcode (e.g. W1J 8AJ).";

/** Phone — at least 7 digits, allows +, spaces, dashes, parens */
export const isPhone = (val) =>
  /^[\d\s+\-()]{7,}$/.test(val?.trim())
    ? null
    : "Enter a valid phone number.";

/** Positive number */
export const isPositiveNumber = (val, label = "Amount") =>
  val !== "" && !isNaN(Number(val)) && Number(val) > 0
    ? null
    : `${label} must be a valid positive number.`;

/** Non-negative number (0 allowed) */
export const isNonNegativeNumber = (val, label = "Price") =>
  val !== "" && !isNaN(Number(val)) && Number(val) >= 0
    ? null
    : `${label} must be a valid non-negative number.`;

/**
 * Run an array of validator functions and return the
 * first error string found, or null if all pass.
 *
 * Usage:
 *   const err = validate([
 *     () => required(name, "Full name"),
 *     () => isPhone(phone),
 *   ]);
 */
export const validate = (validators) => {
  for (const fn of validators) {
    const err = fn();
    if (err) return err;
  }
  return null;
};

/**
 * Validate a full checkout form object.
 * Returns an error object { field: message } or null.
 */
export const validateCheckout = ({ fullName, email, phone, method, street, city, postcode }) => {
  const errors = {};

  const nameErr = required(fullName, "Full name") || minLength(fullName, 2, "Full name");
  if (nameErr) errors.fullName = nameErr;

  const emailErr =
    required(email, "Email") || isEmail(email);
    if (emailErr)  errors.email = emailErr;

  const phoneErr = required(phone, "Phone number") || isPhone(phone);
  if (phoneErr) errors.phone = phoneErr;

  if (method === "delivery") {
    const streetErr = required(street, "Street address");
    if (streetErr) errors.street = streetErr;

    const cityErr = required(city, "City");
    if (cityErr) errors.city = cityErr;

    const postcodeErr = required(postcode, "Postcode") || isUKPostcode(postcode);
    if (postcodeErr) errors.postcode = postcodeErr;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate a create-order admin form.
 * Returns error string or null.
 */
export const validateAdminOrder = ({ name, phone, method, address, items, amount }) => {
  if (!name?.trim())    return "Customer name is required.";
  const phoneErr = isPhone(phone);
  if (phoneErr)         return phoneErr;
  if (method === "Delivery" && !address?.trim()) return "Delivery address is required.";
  if (!items?.trim())   return "Order items are required.";
  const amtErr = isPositiveNumber(amount, "Amount");
  if (amtErr)           return amtErr;
  return null;
};