/**
 * PROBLEM: intelligentRequestScheduler(api)
 *
 * Build a production-grade request scheduler:
 *
 * const request = intelligentRequestScheduler(api, options);
 *
 * -----------------------------
 * REQUIREMENTS:
 *
 * 1. DEDUPLICATION (global)
 *    - If multiple requests with same key are in-flight → reuse same promise
 *
 * 2. BATCHING
 *    - Requests arriving within `batchWindowMs` should be grouped
 *    - API should be called with array of keys instead of single key
 *
 * 3. PRIORITY SUPPORT
 *    - Each request has priority: 'high' | 'normal' | 'low'
 *    - High priority requests must be processed first in next batch
 *
 * 4. CONCURRENCY LIMIT
 *    - Only `maxConcurrentBatches` batches can run at the same time
 *
 * 5. CANCELLATION
 *    - If a key is cancelled before batch executes, it should not be sent
 *
 * 6. ERROR HANDLING
 *    - Failed batch should NOT poison other batches
 *
 * -----------------------------
 * API CONTRACT:
 *
 * api(keys: string[]) => Promise<{ key: string, value: any }[]>
 */

function intelligentRequestScheduler(api, options = {}) {
  const batchWindowMs = options.batchWindowMs ?? 50;
  const maxConcurrentBatches = options.maxConcurrentBatches ?? 2;

  const queue = [];
  const inFlight = new Map(); // key -> promise
  const cancelled = new Set();

  let batchTimer = null;
  let activeBatches = 0;

  function scheduleBatch() {
    if (batchTimer) return;

    batchTimer = setTimeout(async () => {
      batchTimer = null;

      if (queue.length === 0) return;

      // Respect concurrency limit
      if (activeBatches >= maxConcurrentBatches) {
        scheduleBatch();
        return;
      }

      activeBatches++;

      // Sort by priority
      queue.sort((a, b) => {
        const rank = { high: 3, normal: 2, low: 1 };
        return rank[b.priority] - rank[a.priority];
      });

      const batch = [...queue];
      queue.length = 0;

      const keys = batch
        .map(r => r.key)
        .filter(k => !cancelled.has(k));

      if (keys.length === 0) {
        activeBatches--;
        scheduleBatch();
        return;
      }

      try {
        const promise = api(keys);

        keys.forEach(key => {
          inFlight.set(key, promise);
        });

        const results = await promise;

        results.forEach(({ key, value }) => {
          const req = batch.find(r => r.key === key);
          if (req) req.resolve(value);
          inFlight.delete(key);
        });

      } catch (err) {
        batch.forEach(r => {
          r.reject(err);
          inFlight.delete(r.key);
        });
      }

      activeBatches--;
      scheduleBatch();
    }, batchWindowMs);
  }

  return function request(key, { priority = "normal" } = {}) {
    if (cancelled.has(key)) {
      return Promise.reject(new Error("Cancelled"));
    }

    // dedup in-flight
    if (inFlight.has(key)) {
      return inFlight.get(key);
    }

    let resolve, reject;

    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    promise.resolve = resolve;
    promise.reject = reject;

    queue.push({ key, priority, resolve, reject });

    scheduleBatch();

    return promise;
  };
}

// -----------------------------
// Example usage:
// const request = intelligentRequestScheduler(api, {
//   batchWindowMs: 50,
//   maxConcurrentBatches: 2
// });
//
// request("A", { priority: "high" });
// request("B", { priority: "low" });
// -----------------------------
