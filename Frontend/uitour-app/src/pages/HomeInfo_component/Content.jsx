import "./Content.css";
import SvgIcon from "../../components/SvgIcon";

const Content = ({ description }) => {
    return (
        <div className="content-content">
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
                            <div className="content-avatar" />
                            <div className="content-badge" />
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

                <div className="content-description">
                    <p className="content-text">
                        Come and stay in this superb duplex T2, in the heart of the historic
                        center of Bordeaux. Spacious and bright, in a real Bordeaux building in
                        exposed stone, you will enjoy all the charms of the city thanks to its
                        ideal location. Close to many shops, bars and restaurants, you can
                        access the apartment by tram A and C and bus routes 27 and 44. 
                        <br />...
                    </p>
                    
                    <button className="content-button-underline">Show more</button>
                    
                </div>


            </div>

            {description && <div className="content-description">{description}</div>}
        </div>
    );
};

export default Content;