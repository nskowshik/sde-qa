class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, fn) {
    (this.events[event] ||= []).push(fn);
  }

  once(event, fn) {
    const wrapper = (...args) => {
      fn(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  emit(event, ...args) {
    (this.events[event] || []).forEach(fn => fn(...args));
  }

  off(event, fn) {
    this.events[event] = (this.events[event] || []).filter(f => f !== fn);
  }
}