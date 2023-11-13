import { invertedPromise } from "./invertedPromise.mjs";

const KILLED = Symbol.for("KILLED_INVERTED_ASYNC_ITERATOR");

const bufferOverRunStrategies = {
  ERROR: "error",
  DROP: "drop",
  SHIFT: "shift",
  DIE: "die",
};

const bufferOverRunStrategiesValuesSet = new Set(
  Object.values(bufferOverRunStrategies)
);

const invertedAsyncIterator = (
  bufferSize = -1,
  bufferOverrunStrategy = bufferOverRunStrategies.ERROR
) => {
  if (!bufferOverRunStrategiesValuesSet.has(bufferOverrunStrategy)) {
    throw new Error(`Invalid bufferOverrunStrategy: ${bufferOverrunStrategy}`);
  }
  let buffer = [];
  let killed = false;
  let promise, resolve;
  const generator = async function* () {
    while (!killed) {
      if (buffer.length) {
        yield buffer.shift();
      } else {
        [promise, resolve] = invertedPromise();
        yield await promise;
      }
    }
    throw KILLED;
  };
  const enqueue = (data) => {
    if (resolve) {
      resolve(data);
    } else if (bufferSize < 0) {
      buffer.push(data);
    } else if (buffer.length === bufferSize) {
      // NOTE: im pretty sure that `buffer.length` can never exceed `bufferSize` as we only increase it in this function... pretty sure...
      switch (bufferOverrunStrategy) {
        case bufferOverRunStrategies.DROP:
          // do nothing with incoming data
          break;
        case bufferOverRunStrategies.DIE:
          killed = true;
          break;
        case bufferOverRunStrategies.SHIFT:
          buffer.shift();
          buffer.push(data);
          break;
        case bufferOverRunStrategies.ERROR:
        default:
          throw new Error(
            `Buffer overrun: ${bufferSize}. Cannot enque: ${data}`
          );
      }
    } else {
      buffer.push(data);
    }
    return data;
  };
  const toggle = () => {
    killed = !killed;
  };
  const pop = () => {
    return buffer.pop();
  };
  return [generator, enqueue, toggle, pop];
};

export { KILLED, invertedAsyncIterator, bufferOverRunStrategies };
export default invertedAsyncIterator;
