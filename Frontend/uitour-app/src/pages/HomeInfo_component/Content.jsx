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

    const { host, accommodates, bedrooms, beds, bathrooms, description, amenities } = defaultProperty;

    return (
        <div className="content-content">
            <div className="content-left">
                <div className="content-top">
                    <div className="content-header">
                        <div className="content-title">
                            <h2>Entire rental unit hosted by {host?.name || "Host"}</h2>
                            <div className="content-meta">
                                <span>{accommodates} guests</span>
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

                <div className="content-details">
                    <div className="content-detail-item">
                        <SvgIcon name="house" className="content-icon house-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Entire home</div>
                            <div className="content-subtitle">
                                You'll have the apartment to yourself
                            </div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <SvgIcon name="clean" className="content-icon clean-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Enhanced Clean</div>
                            <div className="content-subtitle">This Host committed to UiTour's 5-step enhanced cleaning process.</div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <SvgIcon name="selfcheck" className="content-icon selfcheck-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Self check-in</div>
                            <div className="content-subtitle">Check yourself in with the smart lock</div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <SvgIcon name="calendar" className="content-icon calendar-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Free cancellation</div>
                        </div>
                    </div>
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
                        <div className="content-image" />

                        <div className="content-title-subtitle">
                            <div className="content-subtitle-title">Bedroom 1</div>
                            <div className="content-subtitle-text">1 Queen bed</div>
                        </div>
                    </div>
                </div>

                <div className="content-divider" />

                <section className="content-amen">
                    <h2 className="content-amen-title">What this place offers</h2>

                    <div className="content-amen-body">
                        {/* Column Left */}
                        <div className="content-amen-column">
                            {amenities.slice(0, Math.ceil(amenities.length / 2)).map((amenity, index) => (
                                <div key={amenity.id || index} className="content-amen-item">
                                    <SvgIcon name={`amen_${amenity.icon}`} className="content-icon" />
                                    <div className="content-amen-text">
                                        <div className="content-amen-item-title">{amenity.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Column Right */}
                        <div className="content-amen-column">
                            {amenities.slice(Math.ceil(amenities.length / 2)).map((amenity, index) => (
                                <div key={amenity.id || index} className="content-amen-item">
                                    <SvgIcon name={`amen_${amenity.icon}`} className="content-icon" />
                                    <div className="content-amen-text">
                                        <div className="content-amen-item-title">{amenity.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ButtonWhite>Show all {amenities.length} amenities</ButtonWhite>
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
                <div className="content-divider" />
            </div>
        </div>
    );
};

export default Content;