import { useEffect, useState } from 'react';
import mockAPI from '../services/mockAPI';
import './WishlistPage.css';

export default function WishlistPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await mockAPI.getUserWishlist(1);
      if (mounted) setLists(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="wish">
      <h1 className="wish-title">Yêu thích</h1>
      {loading ? (
        <div className="wish-loading">Đang tải...</div>
      ) : (
        <div className="wish-grid">
          {lists.map(list => (
            <div key={list.id} className="wish-card">
              <div className="wish-cover" style={{ backgroundImage: `url(${list.cover})` }} />
              <div className="wish-meta">
                <div className="wish-name">{list.title}</div>
                <div className="wish-count">Đã lưu {list.itemsCount} mục</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


