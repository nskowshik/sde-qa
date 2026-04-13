class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;

    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);

    return val;
  }

  put(key, val) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }

    this.map.set(key, val);
  }
}