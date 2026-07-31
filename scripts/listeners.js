import { settings } from "./state.js";
import { loadFile, loadImage } from "./image.js";
import { loadBanner } from "./canvas.js";

export const updateRange = (name, value, dp) => {
  const eleName = `.form input#image-${name}`;
  const ele = document.querySelector(eleName);
  if (ele) ele.value = value;
  const text = parseFloat(value).toFixed(dp);
  const textEle = document.querySelector(`${eleName} + div span`);
  if (textEle) textEle.textContent = text;
  if (settings[name] != value) {
    settings[name] = value;
  }
};

export const fileListener = (name) => {
  const ele = document.querySelector(`.form input#${name}`);
  const btn = document.querySelector(`.form input#${name} + button`);
  if (!ele || !btn) return;
  ele.addEventListener("change", (e) => {
    if (e && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      loadFile(name, file);
    }
  });
  btn.addEventListener("click", () => ele.click());
};

export const selectListener = (name) => {
  const ele = document.querySelector(`.form select#${name}`);
  if (!ele) return;
  ele.addEventListener("change", async (e) => {
    const value = e.target.value;
    settings[name] = value;
    loadBanner(value);
  });
};

export const radioListener = (name) => {
  document.querySelectorAll(`input[name="${name}"]`).forEach((ele) => {
    ele.addEventListener("change", (e) => {
      settings[name] = e.target.value;
    });
  });
};

export const rangeListener = (name, dp) => {
  const eleName = `.form input#image-${name}`;
  const ele = document.querySelector(eleName);
  if (!ele) return;
  ele.addEventListener("input", (e) => {
    const value = e.target.value;
    const text = parseFloat(value).toFixed(dp);
    const textEle = document.querySelector(`${eleName} + div span`);
    if (textEle) textEle.textContent = text;
    settings[name] = value;
  });
};

export const resetButtonListener = () => {
  const ele = document.querySelector(`.form button#reset`);
  if (!ele) return;
  ele.addEventListener("click", () => {
    updateRange("x", 0, 1);
    updateRange("y", 0, 1);
    updateRange("z", 1, 2);
  });
};

export const downloadButtonListener = () => {
  const ele = document.querySelector(`button#download`);
  if (!ele) return;
  ele.addEventListener("click", () => {
    settings.isExport = true;
    setTimeout(() => {
      const a = document.createElement("a");
      const canvas = document.querySelector("canvas");
      const url = canvas.toDataURL("image/png;base64");
      const fileName = settings.image.fileName
        ? settings.image.fileName.replace(/\.[^/.]+$/, "")
        : "";
      a.download = `${fileName || Date.now()}-gde-badge.png`;
      a.href = url;
      a.click();
      settings.isExport = false;
    }, 100);
  });
};

export const dropListener = () => {
  const body = document.querySelector("body");
  const drop = document.querySelector(".drop");
  if (!body || !drop) return;

  body.addEventListener(
    "dragenter",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.setAttribute("active", "");
    },
    false,
  );

  body.addEventListener(
    "dragleave",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.removeAttribute("active");
    },
    false,
  );

  body.addEventListener(
    "dragover",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.setAttribute("active", "");
    },
    false,
  );

  body.addEventListener(
    "drop",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.removeAttribute("active");
      if (e && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        loadFile("image", file);
      }
    },
    false,
  );
};

export const pasteListener = () => {
  document.addEventListener("paste", async (e) => {
    e.preventDefault();
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        if (type.startsWith("image/")) loadImage(blob, "", "image");
      }
    }
  });
};

export const panListener = () => {
  const canvas = document.querySelector("canvas");
  const container = document.querySelector(".canvas");
  if (!canvas || !container) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialX = 0;
  let initialY = 0;

  canvas.addEventListener("pointerdown", (e) => {
    if (!settings.image.img) return;
    const eleX = document.querySelector(".form input#image-x");
    const eleY = document.querySelector(".form input#image-y");
    if ((!eleX || eleX.disabled) && (!eleY || eleY.disabled)) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = parseFloat(settings.x) || 0;
    initialY = parseFloat(settings.y) || 0;
    canvas.setPointerCapture(e.pointerId);
    container.classList.add("dragging");
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDragging || !settings.image.img) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasDx = (e.clientX - startX) * scaleX;
    const canvasDy = (e.clientY - startY) * scaleY;

    const img = settings.image.img;
    const z = settings.z;
    let factorX = (canvas.width - img.width * z) / 2;
    let factorY = (canvas.height - img.height * z) / 2;

    if (Math.abs(factorX) < 1) factorX = canvas.width / 2;
    if (Math.abs(factorY) < 1) factorY = canvas.height / 2;

    let newX = initialX + (canvasDx / factorX) * 100;
    let newY = initialY + (canvasDy / factorY) * 100;

    newX = Math.max(-100, Math.min(100, newX));
    newY = Math.max(-100, Math.min(100, newY));

    const eleX = document.querySelector(".form input#image-x");
    const eleY = document.querySelector(".form input#image-y");

    if (eleX && !eleX.disabled) updateRange("x", newX, 1);
    if (eleY && !eleY.disabled) updateRange("y", newY, 1);
  });

  const stopDragging = (e) => {
    if (isDragging) {
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {
        // Pointer might already be released
      }
      container.classList.remove("dragging");
    }
  };

  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);

  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!settings.image.img) return;
      e.preventDefault();
      const zoomStep = e.deltaY < 0 ? 0.05 : -0.05;
      const currentZ = parseFloat(settings.z) || 1;
      let newZ = currentZ + zoomStep;
      newZ = Math.max(1, Math.min(5, newZ));
      updateRange("z", newZ, 2);
    },
    { passive: false },
  );
};

export const initListeners = () => {
  rangeListener("x", 1);
  rangeListener("y", 1);
  rangeListener("z", 2);
  radioListener("shape");
  radioListener("grid");
  selectListener("category");
  fileListener("image");
  resetButtonListener();
  downloadButtonListener();
  dropListener();
  pasteListener();
  panListener();
};
