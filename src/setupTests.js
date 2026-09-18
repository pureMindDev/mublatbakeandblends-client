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
