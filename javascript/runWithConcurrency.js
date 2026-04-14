
/**
 * Implement: runWithConcurrency(tasks, limit)
 *
 * Requirements:
 * - Only `limit` tasks run at once
 * - Preserve order of results
 * - Fail-safe: return null for failed tasks
 */

function runWithConcurrency(tasks, limit) {
  return new Promise((resolve) => {
    const results = new Array(tasks.length);
    let index = 0;
    let active = 0;
    let completed = 0;

    function runNext() {
      if (completed === tasks.length) {
        resolve(results);
        return;
      }

      while (active < limit && index < tasks.length) {
        const current = index++;
        active++;

        Promise.resolve()
          .then(() => tasks[current]())
          .then((res) => {
            results[current] = res;
          })
          .catch(() => {
            results[current] = null;
          })
          .finally(() => {
            active--;
            completed++;
            runNext();
          });
      }
    }

    runNext();
  });
}

/*
🔥 FINAL BOSS EVALUATES:
- Distributed system thinking
- Batching + queue design
- Concurrency control
- Deduplication at scale
- Production resilience
*/