import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ApartmentMinimalCard.css";

import { APARTMENT_PLACEHOLDER_IMAGE_URL } from "../../constants";

const ApartmentMinimalCard = ({ apartment, preferences }) => {
  const [explanation, setExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [explanationOpen, setExplanationOpen] = useState(false);
  const {
    beds,
    floor,
    address,
    images,
    deal_type,
    size_m2,
    similarity_score,
    price,
  } = apartment;

  const onImgError = (e) => {
    e.target.src = APARTMENT_PLACEHOLDER_IMAGE_URL;
  };

  let imgSrc;
  if (!images || !images[0] || !images[0].image_url) {
    imgSrc = "";
  } else {
    imgSrc = images[0].image_url;
  }

  const similarityPercentage = similarity_score
    ? (similarity_score * 100).toFixed(2)
    : null;

  const canExplain =
    similarity_score !== undefined && similarity_score !== null;

  const handleExplanationClick = async () => {
    if (explanation) {
      setExplanationOpen((isOpen) => !isOpen);
      return;
    }

    setExplanationLoading(true);
    setExplanationError("");
    try {
      const response = await axios.post(
        `http://localhost:5000/api/apartments/${apartment.id}/explain-match`,
        { preferences, similarity_score },
      );
      setExplanation(response.data.explanation);
      setExplanationOpen(true);
    } catch (error) {
      setExplanationError("לא ניתן להכין הסבר כרגע. נסו שוב מאוחר יותר.");
    } finally {
      setExplanationLoading(false);
    }
  };

  return (
    <div className="apartment-minimal-card-container">
      <Link to={`/apartment/${apartment.id}`}>
        <div className="apartment-minimal-card-img-wrapper">
          <img
            className="apartment-minimal-card-img"
            src={imgSrc}
            alt="Apartment"
            height="240"
            width="320"
            onError={(e) => onImgError(e)}
          />
        </div>
        <div className="apartment-minimal-card-content-wrapper">
          <p>
            {deal_type} - {beds} חדרים - קומה {floor} -{" "}
            {size_m2.toLocaleString()} מ"ר
          </p>
          <p>{address}</p>
          <p>מחיר - {price.toLocaleString()} ₪</p>
          {similarityPercentage && (
            <p>
              אחוז התאמה - <b>{similarityPercentage}%</b>
            </p>
          )}
        </div>
      </Link>
      {canExplain && (
        <div className="apartment-explanation">
          <button
            type="button"
            className="apartment-explanation-button"
            onClick={handleExplanationClick}
            disabled={explanationLoading}
          >
            {explanationLoading
              ? "מכין הסבר אישי..."
              : explanation
                ? explanationOpen
                  ? "הסתר הסבר אישי"
                  : "הצג הסבר אישי"
                : "למה הדירה הזאת מתאימה לי?"}
          </button>
          {explanationError && (
            <p className="apartment-explanation-error">{explanationError}</p>
          )}
          {explanation && explanationOpen && (
            <div className="apartment-explanation-content">
              <small>הסבר שנוצר בעזרת AI</small>
              <ul>
                {explanation.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
              {explanation.tradeoff && (
                <p>כדאי לקחת בחשבון: {explanation.tradeoff}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApartmentMinimalCard;
