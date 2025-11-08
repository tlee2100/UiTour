// MapDemoPage: Trang demo để bạn test nhanh toàn bộ chức năng bản đồ và dữ liệu động
import React, { useState, useEffect } from 'react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyMap from '../components/PropertyMap';
import PropertyMapGrid from '../components/PropertyMapGrid';
import LocationPicker from '../components/LocationPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import './MapDemoPage.css';

export default function MapDemoPage() {
  const { properties, loading, error, fetchProperties, searchProperties } = useProperty();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
  };

  const handlePropertyClick = (property) => {
    window.location.href = `/property/${property.id}`;
  };

  if (loading && properties.length === 0) {
    return <LoadingSpinner message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return (
      <div className="demo-page">
        <div className="demo-header">
          <h1>🗺️ Map Components Demo</h1>
          <p>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  const demoProperty = properties[0];

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1>🗺️ Map Components Demo - Dynamic Data</h1>
        <p>Demo các component map với dữ liệu động từ Mock API</p>
      </div>

      {/* Search Section */}
      <section className="demo-section">
        <h2>🔍 Search Properties</h2>
        <div className="demo-search-section">
          <input
            type="text"
            placeholder="Tìm kiếm theo địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            className="demo-search-input"
          />
          <button 
            onClick={() => handleSearch(searchQuery)}
            className="demo-search-button"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {demoProperty && (
        <section className="demo-section">
          <h2>1. PropertyMap - Chi tiết một chỗ ở</h2>
          <PropertyMap 
            property={demoProperty}
            height="400px"
            zoom={15}
            showPopup={true}
          />
        </section>
      )}

      <section className="demo-section">
        <h2>2. PropertyMapGrid - Tìm kiếm nhiều chỗ ở</h2>
        <PropertyMapGrid 
          properties={searchResults.length > 0 ? searchResults : properties}
          searchLocation={searchQuery ? { name: searchQuery } : null}
          height="500px"
          zoom={10}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      <section className="demo-section">
        <h2>3. LocationPicker - Chọn vị trí</h2>
        <LocationPicker 
          initialLocation={[10.8231, 106.6297]}
          height="600px"
          zoom={13}
          onLocationChange={handleLocationChange}
        />
        
        {selectedLocation && (
          <div className="demo-selected-location-info">
            <h3>📍 Vị trí đã chọn:</h3>
            <p><strong>Latitude:</strong> {selectedLocation.latitude}</p>
            <p><strong>Longitude:</strong> {selectedLocation.longitude}</p>
            <p><strong>Address:</strong> {selectedLocation.address}</p>
          </div>
        )}
      </section>

      <section className="demo-section">
        <h2>📊 Thông tin dữ liệu</h2>
        <div className="demo-data-info">
          <div><strong>Tổng số properties:</strong> {properties.length}</div>
          <div><strong>Kết quả tìm kiếm:</strong> {searchResults.length}</div>
          <div><strong>Trạng thái:</strong> {loading ? 'Đang tải...' : 'Hoàn thành'}</div>
        </div>
      </section>
    </div>
  );
}
