import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';
import { Icon } from '@iconify/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState(false);
  const { user } = useApp();
  const navigate = useNavigate();
  const { convertToCurrent, format } = useCurrency();
  const { language } = useLanguage();

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

  // Loading state
  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">
            {t(language, "homeWishlist.title")}
          </h1>

          <LoadingSpinner 
            message={t(language, "homeWishlist.loadingMessage")}
          />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user || !user.UserID) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">{t(language, "homeWishlist.title")}</h1>

          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />
            <h2>{t(language, "homeWishlist.loginRequiredTitle")}</h2>
            <p>{t(language, "homeWishlist.loginRequiredSubtitle")}</p>
          </div>
        </div>
      </div>
    );
  }

  // No wishlist object at all
  if (!wishlist) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">{t(language, "homeWishlist.title")}</h1>

          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />
            <h2>{t(language, "homeWishlist.emptyTitle")}</h2>
            <p>{t(language, "homeWishlist.emptySubtitle")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Wishlist exists but has no items
  if (!wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1 className="wishlist-title">{t(language, "homeWishlist.title")}</h1>

          <div className="wishlist-empty">
            <Icon icon="mdi:heart-outline" className="empty-icon" />

            <h2>{t(language, "homeWishlist.emptyItemsTitle")}</h2>
            <p>{t(language, "homeWishlist.emptyItemsSubtitle")}</p>

            <button 
              className="explore-button"
              onClick={() => navigate('/')}
            >
              {t(language, "homeWishlist.exploreButton")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="wishlist-page">
      <div className="wishlist-container">

        <div className="wishlist-header">
          <h1 className="wishlist-title">{t(language, "homeWishlist.title")}</h1>

          {openFolder && (
            <button 
              className="wishlist-back-btn"
              onClick={() => setOpenFolder(false)}
            >
              <Icon icon="mdi:arrow-left" width="20" height="20" />
              {t(language, "homeWishlist.backToLists")}
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
                  {wishlist.items.length}{" "}
                  {wishlist.items.length === 1
                    ? t(language, "homeWishlist.folder.savedPlaceSingular")
                    : t(language, "homeWishlist.folder.savedPlacePlural")}
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
                {wishlist.items.length}{" "}
                {wishlist.items.length === 1
                  ? t(language, "homeWishlist.items.savedItemSingular")
                  : t(language, "homeWishlist.items.savedItemPlural")}
              </span>
            </div>

            <div className="wishlist-items-grid">
              {wishlist.items.map(item => (
                <div 
                  key={item.id}
                  className="wishlist-item-card"
                  onClick={() => {
                    const type = item.type || item.Type || "property";
                    navigate(type === "tour" ? `/experience/${item.id}` : `/property/${item.id}`);
                  }}
                >
                  <div className="wishlist-item-image">
                    <img
                      src={item.image || '/fallback.svg'}
                      alt={item.title}
                      onError={(e) => { e.target.src = '/fallback.svg'; }}
                    />

                    <button
                      className="wishlist-item-remove"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const type = item.type || item.Type || "property";
                          await authAPI.removeFromWishlist(user.UserID, item.id, type);
                          setWishlist(await authAPI.getUserWishlist(user.UserID));
                        } catch (error) {
                          console.error('Failed to remove:', error);
                        }
                      }}
                    >
                      <Icon icon="mdi:heart" width="20" height="20" />
                    </button>
                  </div>

                  <div className="wishlist-item-info">
                    <h3 className="wishlist-item-title">
                      {item.title}
                      <span className="wishlist-item-type">
                        {t(language, item.type === "tour" || item.Type === "tour"
                          ? "homeWishlist.type.tour"
                          : "homeWishlist.type.property"
                        )}
                      </span>
                    </h3>

                    <div className="wishlist-item-price">
                      {item.price ? format(convertToCurrent(item.price)) : "—"}

                      <span className="price-unit">
                        {t(
                          language,
                          (item.type === "tour" || item.Type === "tour")
                            ? "homeWishlist.unit.person"
                            : "homeWishlist.unit.night"
                        )}
                      </span>
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
