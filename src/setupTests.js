// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-router v7 expects TextEncoder/TextDecoder to be available globally.
// CRA's bundled jsdom test environment doesn't polyfill these, so without
// this, any test that imports react-router-dom fails with
// "ReferenceError: TextEncoder is not defined".
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// jsdom doesn't implement scrolling — calling window.scrollTo() (e.g. from
// the ScrollToTop component) logs a "Not implemented" console error on
// every test run otherwise. It's harmless (real browsers implement this
// fine), just noisy — stub it out for tests.
window.scrollTo = () => {};
