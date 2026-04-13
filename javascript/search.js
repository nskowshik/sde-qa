function Search({ api }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const abortRef = React.useRef(null);

  const fetchResults = React.useCallback(async (q) => {
    try {
      // Cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const res = await api(q, { signal: controller.signal });
      setResults(res);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    }
  }, [api]);

  const debouncedFetch = React.useMemo(
    () => debounce(fetchResults, 300),
    [fetchResults]
  );

  React.useEffect(() => {
    if (query) {
      debouncedFetch(query);
    }

    return () => {
      debouncedFetch.cancel?.();
    };
  }, [query, debouncedFetch]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}