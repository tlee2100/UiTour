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

const InfoHeaderDetails = ({ info, actions = {} }) =>
{
  const {rating, reviews, hostStatus, location} = info;
  const {
    onShareClick,
    onSaveClick,
    isSaved = false,
    saveLoading = false
  } = actions;

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
          <ButtonWhite
            className="iheader-icon-button iheader-share-button"
            leftIcon={<SvgIcon name="share" className="icon share-icon"/>}
            onClick={onShareClick}
          >
            Share
          </ButtonWhite>
          <ButtonWhite
            className={`iheader-icon-button iheader-save-button ${isSaved ? "saved" : ""}`}
            leftIcon={<SvgIcon name="heart" className="icon heart-icon"/>}
            onClick={onSaveClick}
            aria-pressed={isSaved}
            disabled={saveLoading}
          >
            {isSaved ? "Saved" : "Save"}
          </ButtonWhite>
        </div>
      </div>
  );
}

const InfoHeader = ({ title, info, actions }) => {
  return (
    <header className="info-header">
        <InfoHeaderTitle title={title}/>
        <InfoHeaderDetails info={info} actions={actions}/>
    </header>
  );
};

export default InfoHeader;