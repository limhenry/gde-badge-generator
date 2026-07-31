const settings = new Proxy(
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
      draw();
      return true;
    },
  },
);

const loadFile = (name, file) => {
  const reader = new FileReader();
  reader.onload = (event) => loadImage(event.target.result, file.name, name);
  reader.readAsDataURL(file);
};

const loadImage = (src, fileName, name) => {
  const img = new Image();
  img.onload = () => (settings[name] = { img, fileName });
  img.src = src instanceof Blob ? URL.createObjectURL(src) : src;
};

const fileListener = (name) => {
  const ele = document.querySelector(`.form input#${name}`);
  const btn = document.querySelector(`.form input#${name} + button`);
  ele.addEventListener("change", (e) => {
    if (e && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      loadFile(name, file);
    }
  });
  btn.addEventListener("click", () => ele.click());
};

const selectListener = (name) => {
  const ele = document.querySelector(`.form select#${name}`);
  ele.addEventListener("change", async (e) => {
    const value = e.target.value;
    settings[name] = value;
    loadBanner(value);
  });
};

const radioListener = (name) => {
  document.querySelectorAll(`input[name="${name}"]`).forEach((ele) => {
    ele.addEventListener("change", (e) => {
      settings[name] = e.target.value;
    });
  });
};

const rangeListener = (name, dp) => {
  const eleName = `.form input#image-${name}`;
  const ele = document.querySelector(eleName);
  ele.addEventListener("input", (e) => {
    const value = e.target.value;
    const text = parseFloat(value).toFixed(dp);
    document.querySelector(`${eleName} + div span`).textContent = text;
    settings[name] = value;
  });
};

const updateRange = (name, value, dp) => {
  const eleName = `.form input#image-${name}`;
  document.querySelector(eleName).value = value;
  const text = parseFloat(value).toFixed(dp);
  document.querySelector(`${eleName} + div span`).textContent = text;
  settings[name] = value;
};

const resetButtonListener = () => {
  const ele = document.querySelector(`.form button#reset`);
  ele.addEventListener("click", () => {
    updateRange("x", 0, 1);
    updateRange("y", 0, 1);
    updateRange("z", 1, 2);
  });
};

const downloadButtonListener = () => {
  const ele = document.querySelector(`button#download`);
  ele.addEventListener("click", () => {
    settings.isExport = true;
    setTimeout(() => {
      const a = document.createElement("a");
      const canvas = document.querySelector("canvas");
      const url = canvas.toDataURL("image/png;base64");
      const fileName = settings.image.fileName.replace(/\.[^/.]+$/, "");
      a.download = `${fileName || Date.now()}-gde-badge.png`;
      a.href = url;
      a.click();
      settings.isExport = false;
    }, 100);
  });
};

const dropListener = () => {
  const body = document.querySelector("body");
  const drop = document.querySelector(".drop");
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

const pasteListener = () => {
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

const drawGrid = (canvas, ctx) => {
  if (settings.isExport) return;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 3);
  ctx.lineTo(canvas.width, canvas.height / 3);
  ctx.moveTo(0, (canvas.height / 3) * 2);
  ctx.lineTo(canvas.width, (canvas.height / 3) * 2);
  ctx.moveTo(canvas.width / 3, 0);
  ctx.lineTo(canvas.width / 3, canvas.height);
  ctx.moveTo((canvas.width / 3) * 2, 0);
  ctx.lineTo((canvas.width / 3) * 2, canvas.height);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0, 0, 0, .25)";
  ctx.stroke();
};

const drawCheckPattern = (canvas, ctx) => {
  if (settings.isExport) return;

  const size = canvas.width / 40;
  ctx.fillStyle = "#bdbdbd";

  for (let i = 0; i < 40; ++i) {
    for (let j = 0, col = 40 / 2; j < col; ++j) {
      ctx.rect(2 * j * size + (i % 2 ? 0 : size), i * size, size, size);
    }
  }

  ctx.fill();
};

const draw = () => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const { image: imageObj, x, y, z, shape, grid, banner } = settings;
  const image = imageObj.img;

  if (image) {
    switch (shape) {
      case "original": {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.save();
        ctx.translate(
          (((canvas.width - image.width * z) / 2) * x) / 100,
          (((canvas.height - image.height * z) / 2) * y) / 100,
        );
        ctx.transform(
          z,
          0,
          0,
          z,
          (-(z - 1) * canvas.width) / 2,
          (-(z - 1) * canvas.height) / 2,
        );
        drawCheckPattern(canvas, ctx);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
        break;
      }
      default: {
        const size = Math.min(image.width, image.height);
        canvas.width = size;
        canvas.height = size;
        const hRatio = canvas.width / image.width;
        const vRatio = canvas.height / image.height;
        const ratio = Math.max(hRatio, vRatio);
        const canvasX = (canvas.width - image.width * ratio) / 2;
        const canvasY = (canvas.height - image.height * ratio) / 2;
        ctx.save();
        ctx.translate(
          (((canvas.width - image.width * z) / 2) * x) / 100,
          (((canvas.height - image.height * z) / 2) * y) / 100,
        );
        ctx.transform(
          z,
          0,
          0,
          z,
          (-(z - 1) * canvas.width) / 2,
          (-(z - 1) * canvas.height) / 2,
        );
        drawCheckPattern(canvas, ctx);
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          canvasX,
          canvasY,
          image.width * ratio,
          image.height * ratio,
        );
        ctx.restore();
        break;
      }
    }
  } else {
    // Set transparent canvas
    ctx.canvas.width = 1920;
    ctx.canvas.height = 1920;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCheckPattern(canvas, ctx);
  }

  // Draw "Banner"
  const height = (banner.height / banner.width) * canvas.width;
  const bannerY = canvas.height - height;
  ctx.drawImage(
    banner,
    0,
    0,
    banner.width,
    banner.height,
    0,
    bannerY,
    canvas.width,
    height,
  );

  // Draw grid
  if (grid === "grid") drawGrid(canvas, ctx);

  switch (shape) {
    // Mask image into circle
    case "circle": {
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
      document.querySelector(".canvas").dataset.shape = "circle";
      break;
    }
    case "material": {
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(settings.material, 0, 0, canvas.width, canvas.height);
      document.querySelector(".canvas").dataset.shape = "circle";
      break;
    }
    default: {
      delete document.querySelector(".canvas").dataset.shape;
      break;
    }
  }
};

const loadBanner = async (category) => {
  settings.banner = new Image();
  settings.banner.src = (await import(`../images/${category}.webp`)).default;
  settings.banner.onload = async () => {
    await document.fonts.ready;
    draw();
  };
};

const loadMaterial = async () => {
  document.querySelector("input#shape-material").disabled = false;
  settings.material = new Image();
  settings.material.src = (await import("../images/m3.svg")).default;
  settings.material.onload = async () => {
    draw();
  };
};

const checkMaterialFlag = () => {
  const params = new URLSearchParams(location.search);
  const material = params.get("material");
  if (material === "true") loadMaterial();
};

const panListener = () => {
  const canvas = document.querySelector("canvas");
  const container = document.querySelector(".canvas");
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialX = 0;
  let initialY = 0;

  canvas.addEventListener("pointerdown", (e) => {
    if (!settings.image.img) return;
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

    updateRange("x", newX, 1);
    updateRange("y", newY, 1);
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
loadBanner("gdev");
checkMaterialFlag();

