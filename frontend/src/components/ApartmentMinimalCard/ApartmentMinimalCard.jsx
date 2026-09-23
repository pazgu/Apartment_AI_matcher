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
  const [askOpen, setAskOpen] = useState(false);
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
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

  const openAskModal = () => {
    setAskQuestion("");
    setAskAnswer(null);
    setAskError("");
    setAskOpen(true);
  };

  const closeAskModal = () => {
    if (askLoading) return;
    setAskOpen(false);
    setAskQuestion("");
    setAskAnswer(null);
    setAskError("");
  };

  const handleAskSubmit = async (event) => {
    event.preventDefault();
    if (!askQuestion.trim()) {
      setAskError("Please enter a question.");
      return;
    }

    setAskLoading(true);
    setAskAnswer(null);
    setAskError("");
    try {
      const response = await axios.post(
        `http://localhost:5000/api/apartments/${apartment.id}/ask`,
        { question: askQuestion.trim() },
      );
      setAskAnswer(response.data);
    } catch (error) {
      setAskError(
        error.response?.data?.message ||
          "Unable to answer this question right now. Please try again.",
      );
    } finally {
      setAskLoading(false);
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
      <button
        type="button"
        className="apartment-ask-button"
        onClick={openAskModal}
      >
        שאלו את ה־AI על הדירה
      </button>
      {askOpen && (
        <div className="apartment-ask-overlay" role="presentation">
          <div
            className="apartment-ask-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`ask-apartment-title-${apartment.id}`}
          >
            <button
              type="button"
              className="apartment-ask-close"
              onClick={closeAskModal}
              disabled={askLoading}
              aria-label="Close question dialog"
            >
              ×
            </button>
            <h3 id={`ask-apartment-title-${apartment.id}`}>
              שאלו את ה־AI על {address || "הדירה"}
            </h3>
            <div className="apartment-ask-suggestions">
              {[
                "האם הדירה מתאימה למשפחה?",
                "האם אפשר להסתדר כאן בלי רכב?",
                "מה כדאי לבדוק לפני ביקור?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setAskQuestion(suggestion)}
                  disabled={askLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleAskSubmit}>
              <label htmlFor={`ask-apartment-question-${apartment.id}`}>
                השאלה שלכם
              </label>
              <textarea
                id={`ask-apartment-question-${apartment.id}`}
                value={askQuestion}
                onChange={(event) => setAskQuestion(event.target.value)}
                maxLength={300}
                rows="3"
                disabled={askLoading}
              />
              <button
                type="submit"
                className="apartment-ask-submit"
                disabled={askLoading}
              >
                {askLoading ? "בודק..." : "שאלו"}
              </button>
            </form>
            {askError && <p className="apartment-ask-error">{askError}</p>}
            {askAnswer && (
              <div className="apartment-ask-answer">
                <p>{askAnswer.answer}</p>
                {askAnswer.basedOn?.length > 0 && (
                  <small>מבוסס על: {askAnswer.basedOn.join(", ")}</small>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentMinimalCard;
