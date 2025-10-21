import "./Content.css";
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";
import Calendar from "../../components/Calendar";
import AvatarImage from "../../assets/mockdata/images/avatar.png"; // Assuming you have an avatar image

const Content = ({ description }) => {
    return (
        <div className="content-content">

            {/* TODO: Replace hardcoded text with dynamic data later */}

            <div className="content-left">
                <div className="content-top">
                    <div className="content-header">
                        <div className="content-title">
                            <h2>Entire rental unit hosted by Tèo Hoàng</h2>
                            <div className="content-meta">
                                <span>2 guests</span>
                                <span className="content-dot" />
                                <span>1 bedroom</span>
                                <span className="content-dot" />
                                <span>1 bed</span>
                                <span className="content-dot" />
                                <span>1 bath</span>
                            </div>
                        </div>

                        <div className="content-avatar-wrapper">
                            <img src={AvatarImage} className="content-avatar" />
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
                                You’ll have the apartment to yourself
                            </div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <SvgIcon name="clean" className="content-icon clean-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Enhanced Clean</div>
                            <div className="content-subtitle">This Host committed to UiTour’s 5-step enhanced cleaning process.</div>
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


                {/* TODO: Replace hardcoded text with dynamic data later */}
                <div className="content-description">
                    <p className="content-text">
                        Come and stay in this superb duplex T2, in the heart of the historic
                        center of Bordeaux. Spacious and bright, in a real Bordeaux building in
                        exposed stone, you will enjoy all the charms of the city thanks to its
                        ideal location. Close to many shops, bars and restaurants, you can
                        access the apartment by tram A and C and bus routes 27 and 44.
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
                            <div className="content-amen-item">
                                <SvgIcon name="amen_wifi" className="content-icon wifi-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Wifi</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_kitchen" className="content-icon kitchen-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Kitchen</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_tv" className="content-icon tv-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">TV</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_ac" className="content-icon ac-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Air conditioning</div>
                                </div>
                            </div>
                        </div>

                        {/* Column Right */}
                        <div className="content-amen-column">
                            <div className="content-amen-item">
                                <SvgIcon name="amen_free_parking" className="content-icon free-parking-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Free parking</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_washer" className="content-icon washer-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Washer</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_pool" className="content-icon pool-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Pool</div>
                                </div>
                            </div>

                            <div className="content-amen-item">
                                <SvgIcon name="amen_hottub" className="content-icon hottub-icon" />
                                <div className="content-amen-text">
                                    <div className="content-amen-item-title">Hot tub</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ButtonWhite >Show all 37 amenities</ButtonWhite>
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

        </div >
    );
};

export default Content;