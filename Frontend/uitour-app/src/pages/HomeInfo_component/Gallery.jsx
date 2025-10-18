import { useState } from "react";
import "./Gallery.css";

// Component Gallery dùng để hiển thị bộ sưu tập ảnh (images)
// - Khi mới vào chỉ hiển thị 5 ảnh đầu tiên
// - Khi bấm vào ảnh => mở ra "modal" hiển thị tất cả ảnh
function Gallery({ images }) {
  // Biến showAll cho biết đang hiển thị chế độ nào:
  // false = chỉ 5 ảnh đầu, true = hiện tất cả ảnh trong modal
  const [showAll, setShowAll] = useState(false);

  // Defensive: ensure images is an array to avoid runtime crashes
  if (!Array.isArray(images)) {
    console.warn('Gallery expected images array but received:', images);
    images = [];
  }

  // 🟩 Nếu showAll đang bật (true) => chỉ hiển thị modal toàn bộ ảnh
  if (showAll) {
    return (
      <div className="gallery-modal">
        {/* Nút ĐÓNG modal: bấm vào sẽ đặt showAll = false => quay lại hiển thị 5 ảnh */}
        <button onClick={() => setShowAll(false)}>Đóng</button>

        <div className="all-images">
          {/* Lặp qua toàn bộ mảng images để hiển thị tất cả ảnh */}
          {images.map((src, i) => (
            <img key={i} src={src} alt={`photo-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  // 🟨 Nếu showAll = false (chưa bấm mở modal):
  // => Chỉ lấy 5 ảnh đầu để hiển thị ngoài màn hình
  const firstFive = images.slice(0, 5);

  // Đếm xem còn bao nhiêu ảnh dư (nếu có)
  // Dùng để hiển thị dòng chữ "+X ảnh" trên ảnh cuối cùng
  const extraCount = images.length - 5;

  // 🟦 Trả về phần giao diện hiển thị 5 ảnh
  return (
    <div className="gallery-container">
        <div className="gallery-grid">
        {/* Lặp qua 5 ảnh đầu */}
        {firstFive.map((src, i) => (
            <div
            key={i}
            // Ảnh đầu tiên (i === 0) sẽ có class "large" để style to hơn
            className={`gallery-item ${i === 0 ? "large" : ""}`}
            // Khi bấm vào ảnh => showAll = true => mở modal toàn bộ ảnh
            onClick={() => setShowAll(true)}
            >
            <img src={src} alt={`photo-${i}`} />

            {/* Nếu là ảnh thứ 5 và vẫn còn ảnh dư => hiện overlay "+X ảnh" */}
            {i === 4 && extraCount > 0 && (
                <div className="overlay">+{extraCount}</div>
            )}
            </div>
        ))}
        </div>
    </div>
  );
}

export default Gallery;

/* 
========================
 GỢI Ý NÂNG CẤP TRONG TƯƠNG LAI
========================
✅ (1) Nếu sau này bạn muốn LẤY ẢNH từ API thay vì mock data:
    👉 Thêm useEffect() ở phía trên (ngay sau useState)
    👉 Gọi fetch("url_api") để lấy danh sách ảnh rồi lưu vào state

    // Ví dụ chỗ thêm:
    // useEffect(() => {
    //   fetch("https://api.example.com/photos")
    //     .then(res => res.json())
    //     .then(data => setImages(data));
    // }, []);

✅ (2) Nếu sau này bạn muốn mỗi ảnh có ID, tên, mô tả:
    👉 Thay images từ mảng URL (string) sang mảng object:
       [{ id: 1, src: "...", title: "Ảnh A" }, { id: 2, ... }]

✅ (3) Nếu muốn thêm hiệu ứng hoặc đóng modal bằng phím ESC:
    👉 Thêm sự kiện window.addEventListener("keydown", ...)
       để lắng nghe phím bấm.

✅ (4) Nếu muốn modal hiển thị ngoài layout chính:
    👉 Dùng React Portal để render modal ra ngoài (đỡ bị CSS ảnh hưởng)
*/
