export { doConnection } from "./connection.mjs";
export { invertedPromise, invertedAsyncIterator } from "./PromisesPlus.mjs";
export { routeEmptyFavicon } from "./routeEmptyFavicon.mjs";
// https://developer.mozilla.org/en-US/docs/Glossary/Base64

const base64ToBytes = (base64 = "") =>
  Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
const bytesToBase64 = (bytes = []) => btoa(String.fromCodePoint(...bytes));
const randId = (prefix = "") => {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}`;
};

// // Usage
// bytesToBase64(new TextEncoder().encode("a Ā 𐀀 文 🦄")); // "YSDEgCDwkICAIOaWhyDwn6aE"
// new TextDecoder().decode(base64ToBytes("YSDEgCDwkICAIOaWhyDwn6aE")); // "a Ā 𐀀 文 🦄"

export { base64ToBytes, bytesToBase64, randId };
