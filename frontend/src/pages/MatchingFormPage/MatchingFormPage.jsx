import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./MatchingFormPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Matching = () => {
  const navigate = useNavigate();
  // State for different form fields - each field is a number except the "rent or sale".
  const [rentOrSale, setRentOrSale] = useState("sale");
  const [floor, setFloor] = useState(0);
  const [beds, setBeds] = useState(1); //It's not possible to have '0' beds that's why it's '1'.
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [sizeRange, setSizeRange] = useState([0, 10000]);
  const [tags, setTags] = useState({
    school: 0,
    religious: 0,
    secular: 0,
    families: 0,
    parks: 0,
    light_trail: 0,
    quiet_street: 0,
  });

  const [loading, setLoading] = useState(false);
  const [naturalLanguageRequest, setNaturalLanguageRequest] = useState("");
  const [aiFillLoading, setAiFillLoading] = useState(false);
  const [aiFillError, setAiFillError] = useState("");
  const [aiFillSuccess, setAiFillSuccess] = useState("");
  const preserveAiPriceRangeRef = useRef(false);

  // State for the errors
  const [floorError, setFloorError] = useState("");
  const [bedsError, setBedsError] = useState("");

  // Format numbers with commas
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (preserveAiPriceRangeRef.current) {
      preserveAiPriceRangeRef.current = false;
      return;
    }
    if (rentOrSale === "rent") {
      setPriceRange([500, 50000]); // Range for rent
    } else {
      setPriceRange([10000, 50000000]); // Range for sale
    }
  }, [rentOrSale]);

  const handleTagChange = (e) => {
    const { name, value } = e.target;
    setTags({ ...tags, [name]: Number(value) });
  };

  const handleFloorChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0 || value > 100) {
      setFloorError("ערך הקומה חייב להיות בין 0 ל-100");
    } else {
      setFloorError("");
      setFloor(value);
    }
  };

  const handleBedsChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0 || value > 20) {
      setBedsError("מספר חדרי השינה חייב להיות בין 0 ל-20");
    } else {
      setBedsError("");
      setBeds(value);
    }
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleSizeRangeChange = (values) => {
    setSizeRange(values);
  };

  const handleAiFill = async () => {
    if (!naturalLanguageRequest.trim()) {
      setAiFillError("Please describe the apartment you are looking for.");
      setAiFillSuccess("");
      return;
    }

    setAiFillLoading(true);
    setAiFillError("");
    setAiFillSuccess("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/apartments/extract-preferences",
        { text: naturalLanguageRequest, rentOrSale },
      );
      const extracted = response.data.preferences || {};
      const extractedFields = Object.keys(extracted);

      if (extractedFields.length === 0) {
        throw new Error("No supported preferences were found.");
      }

      if (extracted.rentOrSale) {
        const hasPriceRange =
          extracted.minPrice !== undefined || extracted.maxPrice !== undefined;
        if (hasPriceRange) preserveAiPriceRangeRef.current = true;
        setRentOrSale(extracted.rentOrSale);
      }
      if (extracted.floor !== undefined) {
        setFloor(extracted.floor);
        setFloorError("");
      }
      if (extracted.beds !== undefined) {
        setBeds(extracted.beds);
        setBedsError("");
      }
      if (
        extracted.minPrice !== undefined ||
        extracted.maxPrice !== undefined
      ) {
        setPriceRange([
          extracted.minPrice ?? priceRange[0],
          extracted.maxPrice ?? priceRange[1],
        ]);
      }
      if (extracted.minSize !== undefined || extracted.maxSize !== undefined) {
        setSizeRange([
          extracted.minSize ?? sizeRange[0],
          extracted.maxSize ?? sizeRange[1],
        ]);
      }
      if (extracted.tags) {
        setTags((currentTags) => ({ ...currentTags, ...extracted.tags }));
      }
      setAiFillSuccess(
        "Preferences were filled. Please review them before submitting.",
      );
    } catch (error) {
      setAiFillError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fill preferences right now. Please try again.",
      );
    } finally {
      setAiFillLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (floorError || bedsError) {
      return;
    }

    const formData = {
      rentOrSale,
      floor,
      beds,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minSize: sizeRange[0],
      maxSize: sizeRange[1],
      tags,
    };

    setLoading(true);

    // Sending the form using Axios
    try {
      const response = await axios.post(
        "http://localhost:5000/api/apartments/match",
        formData,
      );

      const apartments = response.data.data;
      console.log(apartments);

      // Navigate to the matching apartments page
      navigate("/matching_apartments", {
        state: { apartments, preferences: formData },
      });
    } catch (error) {
      console.error("There was an error submitting the form:", error);
      alert("There was an error submitting the form. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="matching-section">
      <h2>טופס התאמת דירה</h2>
      <p>
        שלום, כאן נבקש ממך לענות על מספר שאלות על מנת שנוכל לקבוע בצורה הטובה
        ביותר איזו דירה היא המושלמת בשבילך!
      </p>
      <br />
      <div className="ai-preferences-section">
        <label htmlFor="natural-language-request">
          תארו בקצרה איזו דירה אתם מחפשים (אופציונלי):
        </label>
        <textarea
          id="natural-language-request"
          value={naturalLanguageRequest}
          onChange={(e) => setNaturalLanguageRequest(e.target.value)}
          placeholder="לדוגמה: אני מחפש דירת 3 חדרים להשכרה עד 7,000 ש״ח"
          rows="3"
        />
        <button
          type="button"
          className="ai-preferences-button"
          onClick={handleAiFill}
          disabled={aiFillLoading}
        >
          {aiFillLoading ? "ממלא את ההעדפות..." : "מלא העדפות בעזרת AI"}
        </button>
        {aiFillError && <p className="ai-preferences-error">{aiFillError}</p>}
        {aiFillSuccess && (
          <p className="ai-preferences-success">{aiFillSuccess}</p>
        )}
      </div>
      <form className="matching-form" onSubmit={handleSubmit}>
        <label>
          סוג הדירה:
          <select
            value={rentOrSale}
            onChange={(e) => setRentOrSale(e.target.value)}
            required
          >
            <option value="rent">להשכרה</option>
            <option value="sale">למכירה</option>
          </select>
        </label>

        <label>
          קומה:
          <input
            type="number"
            value={floor}
            onChange={handleFloorChange}
            min="0"
            max="100"
            required
          />
          {floorError && <span className="error-message">{floorError}</span>}
        </label>

        <label>
          מספר חדרי שינה:
          <input
            type="number"
            value={beds}
            onChange={handleBedsChange}
            min="0"
            max="10"
            required
          />
          {bedsError && <span className="error-message">{bedsError}</span>}
        </label>

        <label>
          טווח מחירים:
          <Slider
            range
            value={priceRange}
            onChange={handlePriceRangeChange}
            min={rentOrSale === "rent" ? 500 : 10000}
            max={rentOrSale === "rent" ? 50000 : 50000000}
            step={100}
            reverse={true}
            required
          />
          <div className="range-values">
            <span>מ- {formatNumber(priceRange[0])} ש"ח</span>
            <span>עד- {formatNumber(priceRange[1])} ש"ח</span>
          </div>
        </label>

        <label>
          טווח גודל הדירה:
          <Slider
            range
            value={sizeRange}
            onChange={handleSizeRangeChange}
            min={0}
            max={10000}
            step={10}
            reverse={true}
            required
          />
          <div className="range-values">
            <span>מ- {formatNumber(sizeRange[0])} מ"ר</span>
            <span>עד- {formatNumber(sizeRange[1])} מ"ר</span>
          </div>
        </label>
        <p>
          אנא דרגו את הפרמטרים הבאים לפי חשיבותם עבורכם (1 - לא חשוב בכלל, 5 -
          חשוב לי מאוד)
        </p>
        {[
          { key: "school", label: "קרבה לבתי ספר" },
          { key: "religious", label: "התאמה לדתיים" },
          { key: "secular", label: "התאמה לחילונים" },
          { key: "families", label: "התאמה למשפחות" },
          { key: "parks", label: "קרבה לפארקים" },
          { key: "light_trail", label: "קרבה לרכבת" },
          { key: "quiet_street", label: "רחוב שקט" },
        ].map(({ key, label }) => (
          <div key={key} className="tag-container">
            <div className="tag-label">
              <p>{label}</p>
              <div className="checkbox-group">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="checkbox-label">
                    <input
                      type="radio"
                      name={key}
                      value={value}
                      checked={tags[key] === value}
                      onChange={handleTagChange}
                      required
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}>
          שלח
        </button>
        <br />
      </form>
      {loading && (
        <div className="loading-alert">
          <div className="spinner"></div>
          <p>מחפש דירות תואמות, אנא המתן...</p>
        </div>
      )}
    </section>
  );
};

export default Matching;
