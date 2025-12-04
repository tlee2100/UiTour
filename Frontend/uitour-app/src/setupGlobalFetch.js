// src/setupGlobalFetch.js
import { setIsLoadingGlobal } from "./contexts/GlobalLoadingContextHelper";

const originalFetch = window.fetch.bind(window);

let activeRequests = 0;
let showTimer = null;
let hideTimer = null;

const MIN_SHOW_DELAY = 120;   // chỉ show overlay nếu request kéo dài hơn 120ms
const MIN_VISIBLE = 200;      // overlay phải hiển thị ít nhất 200ms để tránh flicker

function safeSetLoading(value) {
  try {
    setIsLoadingGlobal(value);
  } catch (err) {
    // Nếu provider chưa mount => bỏ qua
  }
}

window.fetch = async (...args) => {
  // Khi bắt đầu request
  activeRequests += 1;

  // Bật overlay sau delay (nếu request không quá nhanh)
  if (!showTimer) {
    showTimer = setTimeout(() => {
      safeSetLoading(true);
      showTimer = null;
    }, MIN_SHOW_DELAY);
  }

  try {
    const res = await originalFetch(...args);
    return res;
  } catch (err) {
    throw err;
  } finally {
    // Khi request kết thúc
    activeRequests -= 1;

    if (activeRequests === 0) {
      // Nếu overlay chưa show, huỷ timer show
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }

      // Đảm bảo overlay hiển thị ít nhất MIN_VISIBLE rồi mới tắt
      if (hideTimer) clearTimeout(hideTimer);

      hideTimer = setTimeout(() => {
        safeSetLoading(false);
        hideTimer = null;
      }, MIN_VISIBLE);
    }
  }
};
