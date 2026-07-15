/**
 * Reusable Framer Motion variants for Mublat.
 *
 * Usage:
 *   import { fadeUp, stagger, scaleIn } from "../../utils/motion";
 *   import { motion } from "framer-motion";
 *
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible">
 *     content
 *   </motion.div>
 */

/* Fade up — used on page sections, cards */
export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* Fade in — subtle, for overlays and modals */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

/* Scale in — used for cards and pop-in elements */
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
};

/* Slide in from right — used for drawers and sidebars */
export const slideInRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, x: 60, transition: { duration: 0.2 } },
};

/* Slide in from left */
export const slideInLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, x: -60, transition: { duration: 0.2 } },
};

/* Stagger container — wraps a list of children that animate one by one */
export const stagger = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/* Stagger item — child of stagger container */
export const staggerItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* Page transition — wraps entire page content */
export const pageTransition = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0, y: -8,
    transition: { duration: 0.2 },
  },
};

/* Hover tap — for interactive buttons/cards */
export const tapScale = {
  whileTap:   { scale: 0.97 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 20 },
};
