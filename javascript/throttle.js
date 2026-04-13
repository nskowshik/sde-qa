function throttle(fn, delay) {
  let lastCall = 0;
  let timer = null;
  let lastArgs, lastThis;

  function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn.apply(lastThis, lastArgs);
      }, delay - (now - lastCall));
    }
  }

  throttled.cancel = () => clearTimeout(timer);

  return throttled;
}