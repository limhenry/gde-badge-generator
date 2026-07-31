import { setOnStateChange } from "./state.js";
import {
  draw,
  loadBanner,
  checkMaterialFlag,
  updateSliderStates,
} from "./canvas.js";
import { initListeners } from "./listeners.js";

// Register draw callback when state updates
setOnStateChange(draw);

// Initialize all UI controls & event listeners
initListeners();

// Initial setup
loadBanner();
checkMaterialFlag();
updateSliderStates();
