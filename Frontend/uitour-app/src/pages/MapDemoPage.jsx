// MapDemoPage: Trang demo để bạn test nhanh toàn bộ chức năng bản đồ và dữ liệu động
// Gợi ý sử dụng:
// - Mở trang gốc (/) để xem demo tất cả: tìm kiếm, hiển thị nhiều marker và chọn vị trí
// - Click vào marker trong grid để đi tới trang chi tiết /property/:id
// - Sửa cấu hình map (zoom, height) hoặc logic tìm kiếm ngay trong file này
import React, { useState, useEffect } from 'react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyMap from '../components/PropertyMap';
import PropertyMapGrid from '../components/PropertyMapGrid';
import LocationPicker from '../components/LocationPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import './MapDemoPage.css';

// Demo page để test các map components với dynamic data
export default function MapDemoPage() {
  // Lấy state và hàm hành động từ Context dùng chung cho property
  // - properties: danh sách chỗ ở từ Mock API
  // - loading/error: trạng thái tải dữ liệu
  // - fetchProperties(): tải toàn bộ danh sách
  // - searchProperties(query): tìm kiếm theo địa điểm (city, location)
  const { 
    properties, 
    loading, 
    error, 
    fetchProperties, 
    searchProperties 
  } = useProperty();
  
  // selectedLocation: vị trí được chọn từ LocationPicker (host chọn điểm trên map)
  const [selectedLocation, setSelectedLocation] = useState(null);
  // searchQuery: chuỗi người dùng nhập để tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  // searchResults: kết quả tìm kiếm; nếu rỗng sẽ fallback về properties
  const [searchResults, setSearchResults] = useState([]);

  // Load properties khi component mount
  // Lưu ý: mảng deps có fetchProperties để đảm bảo đúng hành vi với React hooks
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle search
  // - Nếu có query: gọi searchProperties() từ Context và lưu kết quả vào state
  // - Nếu rỗng: xóa kết quả tìm kiếm để hiển thị toàn bộ danh sách
  const handleSearch = async (query) => {
    if (query.trim()) {
      try {
        const results = await searchProperties(query);
        setSearchResults(results);
        setSearchQuery(query);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Khi host chọn vị trí mới trên map (LocationPicker), cập nhật state để hiển thị lại
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  // Khi người dùng click một property trong grid → điều hướng tới trang chi tiết
  // Bạn có thể thay window.location.href bằng React Router (useNavigate) nếu thích
  const handlePropertyClick = (property) => {
    console.log('Property clicked:', property);
    // Navigate to property detail page
    window.location.href = `/property/${property.id}`;
  };

  // Loading state
  // Chỉ hiển thị spinner khi chưa có dữ liệu nào và đang tải
  if (loading && properties.length === 0) {
    return <LoadingSpinner message="Đang tải dữ liệu..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="map-demo-page">
        <div className="demo-header">
          <h1>🗺️ Map Components Demo</h1>
          <p>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  // Lấy property đầu tiên để demo map 1 marker (PropertyMap)
  // Mẹo: Bạn có thể chọn theo tiêu chí riêng (VD: theo ID, theo thành phố,...)
  const demoProperty = properties[0];

  return (
    <div className="map-demo-page">
      <div className="demo-header">
        <h1>🗺️ Map Components Demo - Dynamic Data</h1>
        <p>Demo các component map với dữ liệu động từ Mock API</p>
      </div>

      {/* Search Section: Tìm kiếm theo địa điểm */}
      <section className="demo-section">
        <h2>🔍 Search Properties</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm theo địa điểm (VD: Ho Chi Minh, Da Lat, Vung Tau)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // Enter để tìm nhanh, hoặc click nút Tìm kiếm
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            className="search-input"
          />
          <button 
            onClick={() => handleSearch(searchQuery)}
            className="search-button"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* PropertyMap Demo: Bản đồ cho một chỗ ở duy nhất (1 marker) */}
      {demoProperty && (
        <section className="demo-section">
          <h2>1. PropertyMap - Chi tiết một chỗ ở</h2>
          <p>Hiển thị map với marker cho property đầu tiên từ API</p>
          <PropertyMap 
            property={demoProperty}
            height="400px"
            // Tùy chỉnh độ zoom mặc định ở đây
            zoom={15}
            showPopup={true}
          />
        </section>
      )}

      {/* PropertyMapGrid Demo: Bản đồ hiển thị nhiều marker (danh sách hoặc kết quả search) */}
      <section className="demo-section">
        <h2>2. PropertyMapGrid - Tìm kiếm nhiều chỗ ở</h2>
        <p>
          Hiển thị map với {searchResults.length > 0 ? searchResults.length : properties.length} chỗ ở
          {searchQuery && ` (kết quả tìm kiếm: "${searchQuery}")`}
        </p>
        <PropertyMapGrid 
          properties={searchResults.length > 0 ? searchResults : properties}
          searchLocation={searchQuery ? { name: searchQuery } : null}
          height="500px"
          // Tùy chỉnh zoom cho bản đồ danh sách
          zoom={10}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      {/* LocationPicker Demo: Host chọn vị trí chỗ ở bằng cách click trên map */}
      <section className="demo-section">
        <h2>3. LocationPicker - Chọn vị trí cho host</h2>
        <p>Cho phép host click vào map để chọn vị trí chỗ ở, hoặc nhập tọa độ thủ công</p>
        <LocationPicker 
          initialLocation={[10.8231, 106.6297]}
          height="600px"
          // Tùy chỉnh zoom cho khu vực demo (Ba Đình)
          zoom={13}
          onLocationChange={handleLocationChange}
        />
        
        {selectedLocation && (
          <div className="selected-location-info">
            <h3>📍 Vị trí đã chọn:</h3>
            <p><strong>Latitude:</strong> {selectedLocation.latitude}</p>
            <p><strong>Longitude:</strong> {selectedLocation.longitude}</p>
            <p><strong>Address:</strong> {selectedLocation.address}</p>
          </div>
        )}
      </section>

      {/* Data Info: Thống kê nhỏ để bạn biết trạng thái dữ liệu hiện tại */}
      <section className="demo-section">
        <h2>📊 Thông tin dữ liệu</h2>
        <div className="data-info">
          <div className="info-item">
            <strong>Tổng số properties:</strong> {properties.length}
          </div>
          <div className="info-item">
            <strong>Kết quả tìm kiếm:</strong> {searchResults.length}
          </div>
          <div className="info-item">
            <strong>Trạng thái:</strong> {loading ? 'Đang tải...' : 'Hoàn thành'}
          </div>
        </div>
      </section>

      {/* Usage Instructions: Gợi ý cách dùng nhanh tính năng trên trang demo */}
      <section className="demo-section">
        <h2>📋 Hướng dẫn sử dụng</h2>
        <div className="usage-instructions">
          <div className="instruction-item">
            <h3>Dynamic Data Features</h3>
            <ul>
              <li>✅ Dữ liệu được load từ Mock API</li>
              <li>✅ Search functionality hoạt động</li>
              <li>✅ Loading states và error handling</li>
              <li>✅ Click property để xem chi tiết</li>
            </ul>
          </div>
          
          <div className="instruction-item">
            <h3>API Integration</h3>
            <ul>
              <li>✅ Mock API service với delay simulation</li>
              <li>✅ Context API cho state management</li>
              <li>✅ Dynamic routing với property ID</li>
              <li>✅ Responsive design và error handling</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
