export { invertedPromise } from "./invertedPromise.mjs";
export {
  KILLED,
  invertedAsyncIterator,
  bufferOverRunStrategies,
} from "./invertedAsyncIterator.mjs";

const withResolvers = () => {
  const [promise, resolve, reject] = invertedPromise();
  return { promise, resolve, reject };
};

const resolveAfter = (
  ms = undefined,
  { value = undefined, signal = undefined } = {}
) => {
  return new Promise((resolve, reject) => {
    const rej = (e) => {
      signal.removeEventListener("abort", rej);
      reject(e);
    };
    if (signal) {
      signal.addEventListener("abort", rej);
    }
    setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", rej);
      }
      resolve(value);
    }, ms);
  });
};

export { withResolvers, resolveAfter };
