import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';
import { Icon } from '@iconify/react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState(false);
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!user || !user.UserID) {
          if (mounted) {
            setWishlist(null);
            setLoading(false);
          }
          return;
        }
        
        const data = await authAPI.getUserWishlist(user.UserID);
        if (mounted) setWishlist(data);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        if (mounted) setWishlist(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">Wishlists</h1>
          <LoadingSpinner message="Loading your wishlists..." />
        </div>
      </div>
    );
  }

  if (!user || !user.UserID) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">Wishlists</h1>
          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />
            <h2>Please log in to view your wishlists</h2>
            <p>Sign in to see your saved properties and create wishlists</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">Wishlists</h1>
          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />
            <h2>No wishlists yet</h2>
            <p>Start saving properties to create your first wishlist</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if wishlist has no items
  if (!wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">Wishlists</h1>
          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Start exploring and save properties you love</p>
            <button 
              className="explore-button"
              onClick={() => navigate('/')}
            >
              Explore Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">Wishlists</h1>
          {openFolder && (
            <button
              className="wishlist-back-btn"
              onClick={() => setOpenFolder(false)}
            >
              <Icon icon="mdi:arrow-left" width="20" height="20" />
              Back to lists
            </button>
          )}
        </div>

        {/* FOLDER VIEW */}
        {!openFolder && (
          <div className="wishlist-folder-view">
            <div
              className="wishlist-folder-card"
              onClick={() => setOpenFolder(true)}
            >
              <div
                className="wishlist-folder-image"
                style={{ 
                  backgroundImage: wishlist.cover 
                    ? `url(${wishlist.cover})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <div className="wishlist-folder-overlay">
                  <Icon icon="mdi:heart" className="folder-heart-icon" />
                </div>
              </div>
              <div className="wishlist-folder-info">
                <h2 className="wishlist-folder-name">{wishlist.title}</h2>
                <p className="wishlist-folder-count">
                  {wishlist.items?.length || 0} {wishlist.items?.length === 1 ? 'saved place' : 'saved places'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ITEMS VIEW */}
        {openFolder && (
          <div className="wishlist-items-view">
            <div className="wishlist-items-header">
              <h2>{wishlist.title}</h2>
              <span className="wishlist-items-count">
                {wishlist.items?.length || 0} {wishlist.items?.length === 1 ? 'property' : 'properties'}
              </span>
            </div>
            <div className="wishlist-items-grid">
              {wishlist.items.map(item => (
                <div 
                  key={item.id} 
                  className="wishlist-item-card"
                  onClick={() => navigate(`/property/${item.id}`)}
                >
                  <div className="wishlist-item-image">
                    <img 
                      src={item.image || '/fallback.png'} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/fallback.png';
                      }}
                    />
                    <button
                      className="wishlist-item-remove"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await authAPI.removeFromWishlist(user.UserID, item.id);
                          const updated = await authAPI.getUserWishlist(user.UserID);
                          setWishlist(updated);
                        } catch (error) {
                          console.error('Failed to remove from wishlist:', error);
                        }
                      }}
                    >
                      <Icon icon="mdi:heart" width="20" height="20" />
                    </button>
                  </div>
                  <div className="wishlist-item-info">
                    <h3 className="wishlist-item-title">{item.title}</h3>
                    <div className="wishlist-item-price">
                      ${item.price?.toLocaleString('en-US')} <span className="price-unit">/ night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
