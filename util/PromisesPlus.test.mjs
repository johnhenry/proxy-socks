// deno repl -r  --allow-net --allow-env --allow-read --eval-file=./inverted.test.mjs
import {
  invertedAsyncIterator,
  KILLED,
  resolveAfter,
} from "./PromisesPlus.mjs";

const [shift, push, kill] = invertedAsyncIterator();

const display = async (iterator, stopAfter = -1) => {
  let index = 0;
  for await (const data of iterator) {
    console.log(`--> ${data} <--`);
    if (stopAfter === index++) {
      break;
    }
  }
};

const N = 9;

// enqueue 0 - N
for (var i = 0; i <= N; ) {
  push(i++);
}

// continue to enqueue N+ every half second
const interval = setInterval(() => push(i++), 500);

// kill the iterator after 5 seconds
setTimeout(kill, 5000);

try {
  await display(shift(), 2);
  await resolveAfter(2000);
  await display(shift(), 1);
  await resolveAfter(1000);
  await display(shift());
} catch (e) {
  if (e !== KILLED) {
    throw e;
  }
}
clearInterval(interval);

/*
const array = [1, 2, 3, 4, 5];
const iterator = array[Symbol.iterator];
for (const i of iterator) {
  console.log(i);
  if (i === 3) {
    break;
  }
}
for (const i of iterator) {
  console.log(i);
}
//logs 1,2,3,4,5
*/
