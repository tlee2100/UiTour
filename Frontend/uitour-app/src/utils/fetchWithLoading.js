import { setIsLoadingGlobal } from "../contexts/GlobalLoadingContextHelper";

// Hàm fetch global tự động bật/tắt overlay
export async function fetchWithLoading(url, options = {}) {
  try {
    setIsLoadingGlobal(true);  // bật overlay

    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw err;
  } finally {
    setIsLoadingGlobal(false); // tắt overlay
  }
}
