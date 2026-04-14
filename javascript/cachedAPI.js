/**
 * PROBLEM: advancedDedupCache(api)
 *
 * Build a wrapper that returns a function:
 *
 *   const wrapped = advancedDedupCache(api);
 *
 * Requirements:
 * 1. Deduplicate in-flight requests by key
 * 2. Cache successful responses
 * 3. Support TTL-based cache expiry
 * 4. If cache is expired:
 *    - return stale value immediately (if exists)
 *    - AND trigger background refresh (stale-while-revalidate)
 * 5. Prevent duplicate in-flight requests per key
 * 6. Handle errors safely (do NOT overwrite valid cache with failure)
 */

function advancedDedupCache(api, options = {}) {
  const ttl = options.ttl ?? 5000;

  const cache = new Map(); 
  const inFlight = new Map(); 

  function execute(key) {
    if (inFlight.has(key)) return inFlight.get(key);

    const promise = api(key)
      .then((res) => {
        cache.set(key, {
          value: res,
          expiry: Date.now() + ttl
        });
        inFlight.delete(key);
        return res;
      })
      .catch((err) => {
        inFlight.delete(key);
        throw err;
      });

    inFlight.set(key, promise);
    return promise;
  }

  return function (key) {
    const now = Date.now();
    const entry = cache.get(key);

    if (!entry) {
      return execute(key);
    }

    if (entry.expiry > now) {
      return Promise.resolve(entry.value);
    }

    const staleValue = entry.value;

    if (!inFlight.has(key)) {
      execute(key);
    }

    return Promise.resolve(staleValue);
  };
}