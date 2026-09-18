import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ─── Base dark theme matching Mublat brand ─────────────────── */
const base = Swal.mixin({
  background:        "#161616",
  color:             "#ffffff",
  confirmButtonColor:"#f5a623",
  cancelButtonColor: "#1e1e1e",
  iconColor:         "#f5a623",
  customClass: {
    popup:         "swal-mublat-popup",
    title:         "swal-mublat-title",
    htmlContainer: "swal-mublat-text",
    confirmButton: "swal-mublat-confirm",
    cancelButton:  "swal-mublat-cancel",
    icon:          "swal-mublat-icon",
  },
  buttonsStyling: false,
  showClass: {
    popup: "swal-mublat-show",
  },
  hideClass: {
    popup: "swal-mublat-hide",
  },
});

/* ─── Toast (top-end, auto-dismiss) ───────────────────── */
const Toast = Swal.mixin({
  toast:             true,
  position:          "top-end",
  showConfirmButton: false,
  timer:             3000,
  timerProgressBar:  true,
  background:        "#1a1a1a",
  color:             "#ffffff",
  customClass: {
    popup:       "swal-toast-popup",
    timerProgressBar: "swal-toast-bar",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/* ─── Public helpers ─────────────────────────────────────────── */

/** Green success toast */
export const toastSuccess = (msg) =>
  Toast.fire({ icon: "success", title: msg });

/** Red error toast */
export const toastError = (msg) =>
  Toast.fire({ icon: "error", title: msg });

/** Amber warning toast */
export const toastWarning = (msg) =>
  Toast.fire({ icon: "warning", title: msg });

/** Blue info toast */
export const toastInfo = (msg) =>
  Toast.fire({ icon: "info", title: msg });

/**
 * Danger confirmation dialog.
 * Returns true if the user clicked Confirm, false if they cancelled.
 */
export const confirmDanger = async ({ title, text, confirmText = "Delete" }) => {
  const result = await base.fire({
    title,
    html: text,
    icon:               "warning",
    iconColor:          "#e05555",
    showCancelButton:   true,
    confirmButtonText:  confirmText,
    cancelButtonText:   "Cancel",
    reverseButtons:     true,
    focusCancel:        true,
    customClass: {
      popup:         "swal-mublat-popup",
      title:         "swal-mublat-title",
      htmlContainer: "swal-mublat-text",
      confirmButton: "swal-mublat-confirm swal-mublat-danger",
      cancelButton:  "swal-mublat-cancel",
    },
  });
  return result.isConfirmed;
};

/**
 * Standard confirmation (gold confirm button).
 */
export const confirmAction = async ({ title, text, confirmText = "Confirm" }) => {
  const result = await base.fire({
    title,
    html:              text,
    icon:              "question",
    showCancelButton:  true,
    confirmButtonText: confirmText,
    cancelButtonText:  "Cancel",
    reverseButtons:    true,
  });
  return result.isConfirmed;
};

/**
 * Unsaved-changes warning — replaces window.confirm().
 * Returns true if user wants to discard.
 */
export const confirmDiscard = async () => {
  const result = await base.fire({
    title:             "Discard changes?",
    html:              "You have unsaved changes. They will be lost if you leave.",
    icon:              "warning",
    showCancelButton:  true,
    confirmButtonText: "Discard",
    cancelButtonText:  "Keep Editing",
    reverseButtons:    true,
    customClass: {
      popup:         "swal-mublat-popup",
      title:         "swal-mublat-title",
      htmlContainer: "swal-mublat-text",
      confirmButton: "swal-mublat-confirm swal-mublat-danger",
      cancelButton:  "swal-mublat-cancel",
    },
  });
  return result.isConfirmed;
};

/* Loading dialog */
export const showLoading = (
  title = "Please wait...",
  text = "Processing..."
) => {
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: "#161616",
    color: "#ffffff",
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

export const paymentSuccess = () =>
  base.fire({
    icon: "success",
    title: "Payment Successful!",
    html: `
      Thank you for your order.<br><br>
      Our chefs have received it and we'll start preparing it immediately.
    `,
    confirmButtonText: "Continue",
  });

export default base;
