function groupBy(data, keyFn) {
  return data.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}