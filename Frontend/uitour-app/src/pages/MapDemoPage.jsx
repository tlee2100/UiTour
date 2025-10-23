import React, { useState, useEffect } from 'react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyMap from '../components/PropertyMap';
import PropertyMapGrid from '../components/PropertyMapGrid';
import LocationPicker from '../components/LocationPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import './MapDemoPage.css';

// Demo page để test các map components với dynamic data
export default function MapDemoPage() {
  const { 
    properties, 
    loading, 
    error, 
    fetchProperties, 
    searchProperties 
  } = useProperty();
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load properties khi component mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle search
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

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const handlePropertyClick = (property) => {
    console.log('Property clicked:', property);
    // Navigate to property detail page
    window.location.href = `/property/${property.id}`;
  };

  // Loading state
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

  // Get first property for single property demo
  const demoProperty = properties[0];

  return (
    <div className="map-demo-page">
      <div className="demo-header">
        <h1>🗺️ Map Components Demo - Dynamic Data</h1>
        <p>Demo các component map với dữ liệu động từ Mock API</p>
      </div>

      {/* Search Section */}
      <section className="demo-section">
        <h2>🔍 Search Properties</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm theo địa điểm (VD: Ho Chi Minh, Da Lat, Vung Tau)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* PropertyMap Demo */}
      {demoProperty && (
        <section className="demo-section">
          <h2>1. PropertyMap - Chi tiết một chỗ ở</h2>
          <p>Hiển thị map với marker cho property đầu tiên từ API</p>
          <PropertyMap 
            property={demoProperty}
            height="400px"
            zoom={15}
            showPopup={true}
          />
        </section>
      )}

      {/* PropertyMapGrid Demo */}
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
          zoom={10}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      {/* LocationPicker Demo */}
      <section className="demo-section">
        <h2>3. LocationPicker - Chọn vị trí cho host</h2>
        <p>Cho phép host click vào map để chọn vị trí chỗ ở, hoặc nhập tọa độ thủ công</p>
        <LocationPicker 
          initialLocation={[10.8231, 106.6297]}
          height="600px"
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

      {/* Data Info */}
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

      {/* Usage Instructions */}
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
