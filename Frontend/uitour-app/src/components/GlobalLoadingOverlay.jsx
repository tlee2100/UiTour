import "./GlobalLoadingOverlay.css";
import { useGlobalLoading } from "../contexts/GlobalLoadingContext";

export default function GlobalLoadingOverlay() {
  const { isLoading } = useGlobalLoading();

  if (!isLoading) return null;

  return (
    <div className="global-loading-overlay">
      <div className="loader"></div>
    </div>
  );
}
