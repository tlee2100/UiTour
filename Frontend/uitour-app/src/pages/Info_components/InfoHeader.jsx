import React from "react";
import "./InfoHeader.css"; 
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";


const InfoHeaderTitle = ({title}) =>
{
  return(
    <h1 className="iheader-title">{title}</h1>
  );
}

const InfoHeaderDetails = ({info}) =>
{
  const {rating, reviews, hostStatus, location} = info;
  return(
      <div className="iheader-details">
        {/* Bên trái */}
        <div className="iheader-left">
          {/* Rating */}
          <div className="iheader-icon-text">
            <SvgIcon name="star" className="iheader-icon iheader-star-icon"/>
            <span className="iheader-text">{rating}</span>
          </div>

          <span className="iheader-dot" />

          <span className="iheader-reviews">{reviews}</span>

          <span className="iheader-dot" />

          <div className="iheader-icon-text">
            <SvgIcon name="badge" className="iheader-icon iheader-badge-icon"/>
            <span className="iheader-text">{hostStatus}</span>
          </div>

          <span className="iheader-dot" />

          <span className="iheader-location">{location}</span>
        </div>

        {/* Bên phải */}
        <div className="iheader-right">
          <ButtonWhite className="iheader-icon-button iheader-share-button" leftIcon={<SvgIcon name="share" className="icon share-icon"/>}>
            Share
          </ButtonWhite>
          <ButtonWhite className="iheader-icon-button iheader-save-button" leftIcon={<SvgIcon name="heart" className="icon heart-icon"/>}>
            Save
          </ButtonWhite>
        </div>
      </div>
  );
}

const InfoHeader = ({title, info}) => {
  return (
    <header className="info-header">
        <InfoHeaderTitle title={title}/>
        <InfoHeaderDetails info={info}/>
    </header>
  );
};

export default InfoHeader;