async function runWithLimit(tasks, limit) {
  const results = [];
  let i = 0;

  async function worker() {
    while (i < tasks.length) {
      const current = i++;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from({ length: limit }, worker);
  await Promise.all(workers);

  return results;
}