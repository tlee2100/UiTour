import { useEffect, useState } from 'react';
import './WishlistPage.css';
import mockAPI from '../services/mockAPI';
// import authAPI from '../services/authAPI'; // sau này đổi sang BE

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState(false); // 👈 mode: false = folder, true = list

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // với mock:
        const data = await mockAPI.getUserWishlist(1);
        // nếu backend trả thẳng đúng format WishlistDto thì dùng authAPI.getWishlist(userId)
        if (mounted) setWishlist(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="wish">
        <h1 className="wish-title">Yêu thích</h1>
        <div className="wish-loading">Đang tải...</div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="wish">
        <h1 className="wish-title">Yêu thích</h1>
        <div className="wish-loading">Chưa có danh sách yêu thích nào.</div>
      </div>
    );
  }

  return (
    <div className="wish">
      <h1 className="wish-title">Yêu thích</h1>

      {/* MODE 1: FOLDER VIEW */}
      {!openFolder && (
        <div className="wish-grid">
          <div
            className="wish-card wish-folder-card"
            onClick={() => setOpenFolder(true)}
          >
            <div
              className="wish-cover"
              style={{ backgroundImage: `url(${wishlist.cover})` }}
            />
            <div className="wish-meta">
              <div className="wish-name">{wishlist.title}</div>
              <div className="wish-count">
                Đã lưu {wishlist.items?.length || 0} mục
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ITEM VIEW TRONG FOLDER */}
      {openFolder && (
        <>
          <button
            className="wish-back-btn"
            onClick={() => setOpenFolder(false)}
          >
            ← Quay lại danh sách
          </button>

          <div className="wish-grid">
            {wishlist.items.map(item => (
              <div key={item.id} className="wish-card">
                <div
                  className="wish-cover"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="wish-meta">
                  <div className="wish-name">{item.title}</div>
                  <div className="wish-count">
                    ₫{item.price?.toLocaleString('vi-VN')} / đêm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
