import "./Content.css";
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";
import Calendar from "../../components/Calendar";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

const Content = ({ property }) => {
    const { language } = useLanguage();

    const defaultProperty = {
        host: { name: "Host", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        accommodates: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: t(language, "homeContent.description.default"),
        amenities: [],
        ...property
    };

    const photos = property.media?.photos ?? [];

    const bedroomPhoto = photos.find(
        img =>
            img.alt?.toLowerCase().includes("bedroom") ||
            img.category === "bedroom" ||
            img.type === "bedroom"
    );

    const { host, accommodates, bedrooms, beds, bathrooms, description, amenities } = defaultProperty;

    return (
        <div className="content-content">
            <div className="content-left">
                <div className="content-top">
                    <div className="content-header">
                        <div className="content-title">
                            <h2>
                                {property.roomType || t(language, "homeContent.roomType.default")}{" "}
                                {t(language, "homeContent.hostedBy")} {host?.name || "Host"}
                            </h2>

                            <div className="content-meta">
                                <span>
                                    {property.capacity?.maxGuests || accommodates}{" "}
                                    {t(language, "homeContent.meta.guests")}
                                </span>
                                <span>
                                    {t(language, "homeContent.meta.bedroom", { count: bedrooms })}
                                </span>
                                <span className="content-dot" />

                                <span>
                                    {t(language, "homeContent.meta.bed", { count: beds })}
                                </span>
                                <span className="content-dot" />

                                <span>
                                    {t(language, "homeContent.meta.bath", { count: bathrooms })}
                                </span>
                            </div>
                        </div>

                        <div className="content-avatar-wrapper">
                            <img
                                src={host?.avatar}
                                className="content-avatar"
                                alt={host?.name || "Host"}
                            />
                            <SvgIcon name="superhost" className="content-badge" />
                        </div>
                    </div>

                    <div className="content-divider" />
                </div>

                {/* Highlights */}
                <div className="content-details">
                    {Array.isArray(property.highlights) && property.highlights.length > 0 ? (
                        property.highlights.map((item) => {
                            const iconMap = {
                                entire_place: "house",
                                enhanced_clean: "clean",
                                self_checkin: "selfcheck",
                                free_cancellation: "calendar",
                            };

                            const iconName = iconMap[item.id];

                            return (
                                <div key={item.id} className="content-detail-item">
                                    {iconName && <SvgIcon name={iconName} className="content-icon" />}

                                    <div className="content-text">
                                        <div className="content-item-title">{item.label}</div>

                                        {item.id === "self_checkin" && (
                                            <div className="content-subtitle">
                                                {t(language, "homeContent.highlights.selfCheckin")}
                                            </div>
                                        )}

                                        {item.id === "enhanced_clean" && (
                                            <div className="content-subtitle">
                                                {t(language, "homeContent.highlights.enhancedClean")}
                                            </div>
                                        )}

                                        {item.id === "free_cancellation" && property.cancellationPolicy?.details && (
                                            <div className="content-subtitle">
                                                {property.cancellationPolicy.details}
                                            </div>
                                        )}

                                        {item.id === "entire_place" && (
                                            <div className="content-subtitle">
                                                {t(language, "homeContent.highlights.entirePlace", {
                                                    type: property.propertyType?.toLowerCase() || "space"
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>{t(language, "homeContent.noHighlights")}</p>
                    )}
                </div>

                <div className="content-divider" />

                {/* Description */}
                <div className="content-description">
                    <p className="content-text">
                        {description}
                        <br />
                    </p>

            
                </div>

                <div className="content-divider" />

                {/* Sleep section */}
                <div className="content-sleep-section">
                    <div className="content-title">{t(language, "homeContent.sleep.title")}</div>

                    <div className="content-thumbnail">
                        {bedroomPhoto ? (
                            <img src={bedroomPhoto.url} alt="Bedroom" className="content-image" />
                        ) : (
                            <div className="content-no-image">
                                {t(language, "homeContent.sleep.noBedroomPhoto")}
                            </div>
                        )}

                        <div className="content-title-subtitle">
                            <div className="content-subtitle-title">
                                {t(language, "homeContent.sleep.bedroom")}
                            </div>
                            <div className="content-subtitle-text">
                                {beds} {t(language, "homeContent.meta.bed", { count: beds })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-divider" />

                {/* Amenities */}
                <section className="content-amen">
                    <h2 className="content-amen-title">
                        {t(language, "homeContent.amenities.title")}
                    </h2>

                    {amenities && amenities.length > 0 ? (
                        <div className="content-amen-body">
                            <div className="content-amen-column">
                                {amenities.slice(0, Math.ceil(amenities.length / 2)).map((amenity, index) => {
                                    const iconName = amenity.icon ? `amen_${amenity.icon}` : null;
                                    return (
                                        <div key={index} className="content-amen-item">
                                            {iconName ? (
                                                <SvgIcon name={iconName} className="content-icon" />
                                            ) : (
                                                <div className="content-icon-placeholder">•</div>
                                            )}

                                            <div className="content-amen-text">
                                                <div className="content-amen-item-title">
                                                    {amenity.name}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="content-amen-column">
                                {amenities.slice(Math.ceil(amenities.length / 2)).map((amenity, index) => {
                                    const iconName = amenity.icon ? `amen_${amenity.icon}` : null;
                                    return (
                                        <div key={index} className="content-amen-item">
                                            {iconName ? (
                                                <SvgIcon name={iconName} className="content-icon" />
                                            ) : (
                                                <div className="content-icon-placeholder">•</div>
                                            )}

                                            <div className="content-amen-text">
                                                <div className="content-amen-item-title">
                                                    {amenity.name}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="content-amen-empty">
                            <p>{t(language, "homeContent.amenities.empty")}</p>
                        </div>
                    )}
                </section>

                <div className="content-divider" />

                {/* Calendar section */}
                <div className="content-calendar-section">
                    <div className="content-calendar-text">
                        <div className="content-calendar-title">
                            {t(language, "homeContent.calendar.select")}
                        </div>

                        <div className="content-calendar-subtitle">
                            Oct 21, 2025 - Oct 25, 2025
                        </div>
                    </div>

                    <Calendar />

                    <ButtonWhite className="content-button-clear-days">
                        {t(language, "homeContent.calendar.clear")}
                    </ButtonWhite>
                </div>
            </div>
        </div>
    );
};

export default Content;
