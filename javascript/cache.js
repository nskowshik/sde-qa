export function cacheAsync(fn, { ttl = 5000 } = {}) {
  const cache = new Map();

  return async function (key) {
    const now = Date.now();

    if (cache.has(key)) {
      const { value, expiry, promise } = cache.get(key);

      // Return in-flight promise
      if (promise) return promise;

      // Return cached value if valid
      if (expiry > now) return value;

      // Expired → delete
      cache.delete(key);
    }

    // Create promise and store immediately (dedupe)
    const promise = fn(key)
      .then((result) => {
        cache.set(key, {
          value: result,
          expiry: now + ttl
        });
        return result;
      })
      .catch((err) => {
        cache.delete(key); // avoid caching failures
        throw err;
      });

    cache.set(key, { promise });

    return promise;
  };
}