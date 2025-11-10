import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockAPI from '../services/mockAPI';
import './TripsPage.css';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await mockAPI.getUserTrips(1);
      if (mounted) setTrips(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="trips-page" style={{ padding: 24 }}>Đang tải...</div>;
  }

  const hasTrips = trips && trips.length > 0;

  return (
    <div className="trips-page">
      <h1 className="trips-title">Chuyến đi</h1>

      {!hasTrips ? (
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>Sắp xếp một chuyến đi hoàn hảo</h2>
            <p>
              Khám phá chỗ ở, trải nghiệm và dịch vụ. Sau khi bạn đặt, các lượt đặt của bạn sẽ hiển thị tại đây.
            </p>
            <button className="trips-btn" onClick={() => navigate('/')}>Bắt đầu</button>
          </div>
        </div>
      ) : (
        <div className="trips-list">
          {trips.map(item => (
            <div className="trip-card" key={item.id}>
              <div className="trip-cover" style={{ backgroundImage: `url(${item.cover})` }} />
              <div className="trip-meta">
                <div className="trip-title">{item.title}</div>
                <div className="trip-date">{item.date}</div>
                <div className="trip-place">{item.place}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


