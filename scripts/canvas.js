import { settings } from "./state.js";
import { updateRange } from "./listeners.js";

export const drawGrid = (canvas, ctx) => {
  if (settings.isExport) return;

  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 3);
  ctx.lineTo(canvas.width, canvas.height / 3);
  ctx.moveTo(0, (canvas.height / 3) * 2);
  ctx.lineTo(canvas.width, (canvas.height / 3) * 2);
  ctx.moveTo(canvas.width / 3, 0);
  ctx.lineTo(canvas.width / 3, canvas.height);
  ctx.moveTo((canvas.width / 3) * 2, 0);
  ctx.lineTo((canvas.width / 3) * 2, canvas.height);

  // Grey border (outer stroke)
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#757575";
  ctx.stroke();

  // White line (inner stroke)
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.restore();
};

export const drawCheckPattern = (canvas, ctx) => {
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

export const updateSliderStates = () => {
  const eleX = document.querySelector(".form input#image-x");
  const eleY = document.querySelector(".form input#image-y");
  const eleZ = document.querySelector(".form input#image-z");
  const img = settings.image.img;

  if (!img) {
    if (eleX) eleX.disabled = true;
    if (eleY) eleY.disabled = true;
    if (eleZ) eleZ.disabled = true;
    return;
  }

  if (eleZ) eleZ.disabled = false;

  const z = parseFloat(settings.z) || 1;
  const shape = settings.shape;

  let canvasW, canvasH, renderW, renderH;

  if (shape === "original") {
    canvasW = img.width;
    canvasH = img.height;
    renderW = img.width * z;
    renderH = img.height * z;
  } else {
    const size = Math.min(img.width, img.height);
    canvasW = size;
    canvasH = size;
    const ratio = Math.max(size / img.width, size / img.height);
    renderW = img.width * ratio * z;
    renderH = img.height * ratio * z;
  }

  const canScrollX = renderW - canvasW > 0.5;
  const canScrollY = renderH - canvasH > 0.5;

  if (eleX) {
    if (!canScrollX) {
      if (!eleX.disabled) {
        eleX.disabled = true;
        updateRange("x", 0, 1);
      }
    } else {
      eleX.disabled = false;
    }
  }

  if (eleY) {
    if (!canScrollY) {
      if (!eleY.disabled) {
        eleY.disabled = true;
        updateRange("y", 0, 1);
      }
    } else {
      eleY.disabled = false;
    }
  }
};

export const draw = () => {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
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
  if (banner) {
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
  }

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
      if (settings.material) {
        ctx.drawImage(settings.material, 0, 0, canvas.width, canvas.height);
      }
      document.querySelector(".canvas").dataset.shape = "material";
      break;
    }
    default: {
      delete document.querySelector(".canvas").dataset.shape;
      break;
    }
  }
  updateSliderStates();
};

export const loadBanner = async (category = "gdev") => {
  settings.banner = new Image();
  settings.banner.src = (await import(`../images/${category}.webp`)).default;
  settings.banner.onload = async () => {
    await document.fonts.ready;
    draw();
  };
};

export const loadMaterial = async () => {
  const input = document.querySelector("input#shape-material");
  if (input) input.disabled = false;
  settings.material = new Image();
  settings.material.src = (await import("../images/m3.svg")).default;
  settings.material.onload = async () => {
    draw();
  };
};

export const checkMaterialFlag = () => {
  const params = new URLSearchParams(location.search);
  const material = params.get("material");
  if (material === "true") loadMaterial();
};
