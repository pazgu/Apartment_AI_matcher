import React from "react";
import "./AboutPage.css";
import Student1Img from "../../assets/student1.JPG";
import Student2Img from "../../assets/student2.JPG";
import Student3Img from "../../assets/student3.JPG";
import Student4Img from "../../assets/student4.JPG";
import HistoryImg from "../../assets/HistoryImg.JPG";
import IdeaImg from "../../assets/IdeaImg.JPG";
import CompetitorsImg from "../../assets/CompetitorsImg.JPG";

const About = () => {
  return (
    <section className="about">
      <h2>אודות האתר </h2>
      <div className="about-section">
        <img src={HistoryImg} alt="History" className="about-image" />
        <div className="about-text">
          <h3>איך הכל התחיל?</h3>
          <p>
            התחלנו את דרכנו מתוך רצון לספק פתרון אמיתי לאנשים שמחפשים דירה בצורה
            חכמה ויעילה. כיום, רוכשי ושוכרי דירות מתקשים למצוא את הדירה המתאימה
            ביותר לצרכיהם מבין מאות ואלפי מודעות הקיימות בשוק. לכן, רצינו ליצור
            מערכת שתתאים באופן אישי דירות ללקוחות פוטנציאליים על פי העדפותיהם
            ודרישותיהם.
          </p>
        </div>
      </div>

      <div className="about-section">
        <img src={IdeaImg} alt="Idea" className="about-image" />
        <div className="about-text">
          <h3>מאיפה בא הרעיון?</h3>
          <p>
            הרעיון לאתר נולד מתוך צורך אישי למציאת דירה של אחד מחברי הצוות.
            תהליכי החיפוש המסורבלים ואי מציאת דירה שעונה בדיוק על כל הצרכים,
            הובילו אותנו לחשוב על פתרון טכנולוגי מתקדם.
          </p>
        </div>
      </div>

      <div className="about-section">
        <img src={CompetitorsImg} alt="Competitors" className="about-image" />
        <div className="about-text">
          <h3>למה לבחור בנו על פני המתחרים?</h3>
          <p>
            הטכנולוגיה שלנו מתקדמת ונעזרת בבינה מלאכותית על מנת למצוא לכם את
            הדירה המושלמת במהירות ודיוק מירביים.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
