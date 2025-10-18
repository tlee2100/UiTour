import "./Content.css";

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
                        <div className="content-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Great location</div>
                            <div className="content-subtitle">
                                95% of recent guests gave the location a 5-star rating
                            </div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <div className="content-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Free cancellation</div>
                            <div className="content-subtitle">Cancel within 48 hours for a full refund</div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <div className="content-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Self check-in</div>
                            <div className="content-subtitle">Check yourself in with the smart lock</div>
                        </div>
                    </div>

                    <div className="content-detail-item">
                        <div className="content-icon" />
                        <div className="content-text">
                            <div className="content-item-title">Available dates</div>
                        </div>
                    </div>
                </div>
            </div>

            {description && <div className="content-description">{description}</div>}
        </div>
    );
};

export default Content;