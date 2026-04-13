function flatten(obj, prefix = "", res = {}) {
  for (let key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, newKey, res);
    } else {
      res[newKey] = value;
    }
  }
  return res;
}