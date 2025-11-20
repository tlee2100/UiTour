import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import './TripsPage.css';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useApp();

  const formatDateRange = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '';
    try {
      const ci = new Date(checkIn);
      const co = new Date(checkOut);
      const fmt = (date) =>
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${fmt(ci)} - ${fmt(co)}`;
    } catch {
      return `${checkIn} - ${checkOut}`;
    }
  }, []);

  const loadTrips = useCallback(async () => {
    if (!user?.UserID) return;
    setLoading(true);
    setError('');
    try {
      const bookings = await authAPI.getUserBookings(user.UserID);
      const enriched = await Promise.all(
        (bookings || []).map(async (booking) => {
          let propertyInfo = null;
          let tourInfo = null;

          if (booking.propertyID || booking.PropertyID) {
            try {
              propertyInfo = await authAPI.getPropertyById(
                booking.propertyID ?? booking.PropertyID
              );
            } catch (err) {
              console.error('Failed to fetch property detail', err);
            }
          } else if (booking.tourID || booking.TourID) {
            try {
              tourInfo = await authAPI.getTourById(booking.tourID ?? booking.TourID);
            } catch (err) {
              console.error('Failed to fetch tour detail', err);
            }
          }

          return {
            ...booking,
            propertyInfo,
            tourInfo,
          };
        })
      );
      setTrips(enriched);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách chuyến đi');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const hasTrips = useMemo(() => trips.length > 0, [trips]);

  if (!user?.UserID) {
    return (
      <div className="trips-page">
        <div className="trips-title">Chuyến đi</div>
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>Đăng nhập để theo dõi chuyến đi của bạn</h2>
            <p>Đăng nhập để xem các chuyến đã đặt và tiếp tục khám phá những trải nghiệm mới.</p>
            <button className="trips-btn" onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="trips-page">
        <div className="trips-title">Chuyến đi</div>
        <div style={{ padding: 24 }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="trips-page">
      <h1 className="trips-title">Chuyến đi</h1>

      {!!error && (
        <div className="trips-feedback error">
          {error}
          <button className="trips-btn small" onClick={loadTrips}>
            Thử lại
          </button>
        </div>
      )}

      {!error && !hasTrips && (
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>Sắp xếp một chuyến đi hoàn hảo</h2>
            <p>
              Khám phá chỗ ở, trải nghiệm và dịch vụ. Sau khi bạn đặt, các lượt đặt của bạn sẽ hiển thị
              tại đây.
            </p>
            <button className="trips-btn" onClick={() => navigate('/')}>
              Bắt đầu
            </button>
          </div>
        </div>
      )}

      {!error && hasTrips && (
        <div className="trips-list">
          {trips.map((trip) => {
            const propertyInfo = trip.propertyInfo;
            const tourInfo = trip.tourInfo;
            const isTour = !!tourInfo && !propertyInfo;
            const coverImage =
              propertyInfo?.photos?.[0]?.url ||
              propertyInfo?.media?.photos?.[0]?.url ||
              tourInfo?.media?.cover?.url ||
              tourInfo?.image?.url ||
              '/fallback.png';
            const title =
              propertyInfo?.listingTitle ||
              propertyInfo?.title ||
              tourInfo?.tourName ||
              tourInfo?.title ||
              `Đặt chỗ #${trip.bookingID || trip.BookingID}`;
            const location =
              propertyInfo?.location ||
              propertyInfo?.Location ||
              tourInfo?.location ||
              '';
            const detailLink = propertyInfo
              ? `/property/${propertyInfo.PropertyID || propertyInfo.id || trip.propertyID || trip.PropertyID}`
              : tourInfo
              ? `/experience/${tourInfo.tourID || tourInfo.id || trip.tourID || trip.TourID}`
              : null;
            const dateRange = formatDateRange(trip.checkIn || trip.CheckIn, trip.checkOut || trip.CheckOut);
            const status = (trip.status || trip.Status || '').toLowerCase();
            const guests = trip.guestsCount ?? trip.GuestsCount ?? 1;
            const totalPrice = trip.totalPrice ?? trip.TotalPrice ?? 0;
            const nights = trip.nights ?? trip.Nights ?? null;

            return (
              <div key={trip.bookingID || trip.BookingID} className="trip-card">
                <div className="trip-cover">
                  <img src={coverImage} alt={title} />
                  <span className="trip-type-badge">{isTour ? 'Trải nghiệm' : 'Chỗ ở'}</span>
                </div>
                <div className="trip-info">
                  <div className="trip-title">{title}</div>
                  <div className="trip-location">
                    <Icon icon="mdi:map-marker" width="16" height="16" />
                    <span>{location || 'Chưa cập nhật địa điểm'}</span>
                  </div>
                  <div className="trip-dates">
                    <Icon icon="mdi:calendar" width="16" height="16" />
                    <span>{dateRange || 'Chưa có lịch'}</span>
                  </div>
                  <div className="trip-meta">
                    <span>{nights ? `${nights} đêm` : ''}</span>
                    <span>{guests} khách</span>
                    <span className={`trip-status ${status}`}>
                      {status === 'confirmed'
                        ? 'Đã xác nhận'
                        : status === 'completed'
                        ? 'Hoàn tất'
                        : status === 'cancelled' || status === 'canceled'
                        ? 'Đã hủy'
                        : 'Đang chờ'}
                    </span>
                  </div>
                  <div className="trip-price">
                    {totalPrice ? `₫${Number(totalPrice).toLocaleString('vi-VN')}` : ''}
                  </div>

                  <div className="trip-actions">
                    {detailLink ? (
                      <button className="trip-btn-secondary" onClick={() => navigate(detailLink)}>
                        Xem chi tiết
                      </button>
                    ) : (
                      <button className="trip-btn-secondary" onClick={() => navigate('/')}>
                        Đặt chuyến đi khác
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}