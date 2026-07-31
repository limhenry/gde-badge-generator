let onStateChange = null;

export const setOnStateChange = (fn) => {
  onStateChange = fn;
};

export const settings = new Proxy(
  {
    banner: "",
    image: {
      src: "",
      fileName: "",
    },
    shape: "original",
    grid: "none",
    x: 0,
    y: 0,
    z: 1,
    isExport: false,
  },
  {
    get: (target, property) => target[property],
    set: (target, property, value) => {
      target[property] = value;
      if (typeof onStateChange === "function") {
        onStateChange();
      }
      return true;
    },
  },
);
