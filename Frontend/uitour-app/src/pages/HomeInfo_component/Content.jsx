import "./Content.css";
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";
import Calendar from "../../components/Calendar";

const Content = ({ property }) => {
    // Default values nếu property không có data
    const defaultProperty = {
        host: { name: "Host", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        accommodates: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: "Beautiful property with great amenities and location.",
        amenities: [],
        ...property
    };

    const photos = property.media?.photos ?? [];

    const bedroomPhoto = photos.find(
        img => img.alt?.toLowerCase().includes("bedroom") ||
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
                            <h2>{property.roomType || "Home"} hosted by {host?.name || "Host"}</h2>
                            <div className="content-meta">
                                <span>{property.capacity?.maxGuests || accommodates} guests</span>
                                <span className="content-dot" />
                                <span>{bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}</span>
                                <span className="content-dot" />
                                <span>{beds} bed{beds !== 1 ? 's' : ''}</span>
                                <span className="content-dot" />
                                <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        <div className="content-avatar-wrapper">
                            <img
                                src={host?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                                className="content-avatar"
                                alt={host?.name || "Host"}
                            />
                            <SvgIcon name="superhost" className="content-badge" />
                        </div>
                    </div>

                    <div className="content-divider" />
                </div>

                {/* ✅ Dynamic Highlights with icons */}
                <div className="content-details">
                    {Array.isArray(property.highlights) && property.highlights.length > 0 ? (
                        property.highlights.map((item) => {
                            // ✅ Map highlight ID → Icon name
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

                                        {/* ✅ Subtitle logic */}
                                        {item.id === "self_checkin" && (
                                            <div className="content-subtitle">
                                                Check yourself in with smart lock
                                            </div>
                                        )}

                                        {item.id === "enhanced_clean" && (
                                            <div className="content-subtitle">
                                                This place follows enhanced cleaning
                                            </div>
                                        )}

                                        {item.id === "free_cancellation" && property.cancellationPolicy?.details && (
                                            <div className="content-subtitle">
                                                {property.cancellationPolicy.details}
                                            </div>
                                        )}

                                        {item.id === "entire_place" && (
                                            <div className="content-subtitle">
                                                You'll have the {property.propertyType?.toLowerCase() || "space"} to yourself
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No highlights available</p>
                    )}
                </div>



                <div className="content-divider" />

                <div className="content-description">
                    <p className="content-text">
                        {description || "Come and stay in this superb property. Spacious and bright, you will enjoy all the charms of the city thanks to its ideal location. Close to many shops, bars and restaurants."}
                        <br />...
                    </p>

                    <ButtonWhite className="content-button-underline">Show more</ButtonWhite>
                </div>

                <div className="content-divider" />

                <div className="content-sleep-section">
                    <div className="content-title">Where you'll sleep</div>

                    <div className="content-thumbnail">
                        {bedroomPhoto ? (
                            <img
                                src={bedroomPhoto.url}
                                alt="Bedroom"
                                className="content-image"
                            />
                        ) : (
                            <div className="content-no-image">No bedroom photo provided</div>
                        )}

                        <div className="content-title-subtitle">
                            <div className="content-subtitle-title">Bedroom</div>
                            <div className="content-subtitle-text">
                                {beds} bed{beds !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="content-divider" />

                <section className="content-amen">
                    <h2 className="content-amen-title">What this place offers</h2>

                    {amenities && amenities.length > 0 ? (
                        <>
                            <div className="content-amen-body">
                                {/* Column Left */}
                                <div className="content-amen-column">
                                    {amenities.slice(0, Math.ceil(amenities.length / 2)).map((amenity, index) => {
                                        const iconName = amenity.icon ? `amen_${amenity.icon}` : null;
                                        return (
                                            <div key={amenity.id || `amenity-${index}`} className="content-amen-item">
                                                {iconName && <SvgIcon name={iconName} className="content-icon" />}
                                                {!iconName && <div className="content-icon-placeholder">•</div>}
                                                <div className="content-amen-text">
                                                    <div className="content-amen-item-title">{amenity.name || "Amenity"}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Column Right */}
                                <div className="content-amen-column">
                                    {amenities.slice(Math.ceil(amenities.length / 2)).map((amenity, index) => {
                                        const iconName = amenity.icon ? `amen_${amenity.icon}` : null;
                                        return (
                                            <div key={amenity.id || `amenity-${index}`} className="content-amen-item">
                                                {iconName && <SvgIcon name={iconName} className="content-icon" />}
                                                {!iconName && <div className="content-icon-placeholder">•</div>}
                                                <div className="content-amen-text">
                                                    <div className="content-amen-item-title">{amenity.name || "Amenity"}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="content-amen-empty">
                            <p>No amenities listed for this property.</p>
                        </div>
                    )}
                </section>

                <div className="content-divider" />

                <div className="content-calendar-section">
                    <div className="content-calendar-text">
                        <div className="content-calendar-title">Select check-in day</div>
                        <div className="content-calendar-subtitle">Oct 21, 2025 - Oct 25, 2025</div>
                    </div>
                    <Calendar />
                    <ButtonWhite className="content-button-clear-days">Clear days</ButtonWhite>
                </div>
            </div>
        </div>
    );
};

export default Content;