import { settings } from "./state.js";

export const loadImage = (src, fileName, name) => {
  const img = new Image();
  img.onload = () => (settings[name] = { img, fileName });
  img.src = src instanceof Blob ? URL.createObjectURL(src) : src;
};

export const loadFile = (name, file) => {
  const reader = new FileReader();
  reader.onload = (event) => loadImage(event.target.result, file.name, name);
  reader.readAsDataURL(file);
};
