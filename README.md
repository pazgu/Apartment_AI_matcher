# Apartment AI Matcher

Apartment AI Matcher helps users find apartments for rent or sale, compare recommendations, and ask focused questions about individual listings. It combines a React interface, an Express/MongoDB backend, and a Python recommendation pipeline.


![<img src="frontend/src/assets/IdeaImg.JPG" width="25" height="25"/>](frontend/src/assets/IdeaImg.JPG)

## Highlights

- Search and browse apartment listings.
- Filter apartments by transaction type, floor, bedrooms, price, size, and lifestyle priorities.
- Receive up to 20 machine-learning recommendations based on the submitted preferences.
- Review and edit preferences before running a match.

## AI Features

The application includes three focused AI features powered by Google Gemini. They are on-demand: no AI request is made until the user starts the relevant action.

### 1. Fill Preferences With AI

On the apartment-matching form, users can describe what they want in Hebrew or English. Gemini extracts only values supported by the existing form, such as:

- Rent or sale.
- Floor and number of bedrooms.
- Minimum and maximum price.
- Minimum and maximum apartment size.
- Lifestyle priorities such as schools, parks, quiet streets, families, religious suitability, secular suitability, and light-rail proximity.

The extracted values populate the existing form. The form is not submitted automatically, so users can review and edit the values before matching.

### 2. Why Does This Apartment Match Me?

Recommended apartment cards can generate a short Hebrew explanation based on the submitted preferences and the apartment data available in MongoDB. The explanation is requested only after the user clicks the match-explanation button.

### 3. Ask AI About This Apartment

Each apartment result card includes a separate question action. Users can choose a suggested question or type one custom question in Hebrew or English. Gemini answers one question at a time using only the selected apartment's stored data.

The feature does not use conversation history, embeddings, a vector database, or external neighborhood knowledge. When the data does not contain an answer, the AI is instructed to say that the information is unavailable instead of guessing about elevators, balconies, parking, accessibility, safety, distances, or other unsupported attributes.

## Installation

Requirements:

- Node.js and npm.
- Python 3.11 or newer.
- MongoDB access.

Clone the repository:

```bash
git clone https://github.com/pazgu/Apartment_matcher.git
cd Apartment_matcher
```

Install backend dependencies:

```bash
cd backend/src
npm install
```

Install frontend dependencies from the `frontend` directory:

```bash
cd ../../frontend
npm install
```

Install Python dependencies:

```bash
cd ../backend/src
python -m pip install -r requirements.txt
```

## Configuration

Create `backend/src/.env` using the following variables. Never commit a real API key or database credential:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

The Gemini key is used only by the backend and is never exposed to the frontend.

## Running the Application

Start the backend in one terminal:

```bash
cd backend/src
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

Open `http://localhost:3000`. The backend listens on `http://localhost:5000`.

## Using The Application

1. Open the matching form.
2. Optionally describe the desired apartment and select **Fill Preferences With AI**.
3. Review or edit the populated fields.
4. Submit the form to receive apartment recommendations.
5. On a recommendation card, use the match explanation action or **Ask AI About This Apartment**.
6. Choose a suggested question or enter a custom question, then submit it.

## AI Endpoints

The backend exposes these AI routes:

```text
POST /api/apartments/extract-preferences
POST /api/apartments/:id/explain-match
POST /api/apartments/:id/ask
```

The apartment question endpoint accepts a question only; it retrieves the apartment by ID on the backend and does not trust a full apartment object sent by the browser.

## Technologies

- **Frontend:** React, React Router, Axios, rc-slider.
- **Backend:** Node.js, Express.js, Mongoose.
- **AI:** Google Gemini through `@google/generative-ai`.
- **Database:** MongoDB.
- **Machine learning:** Python, scikit-learn, pandas, NumPy.
- **Data processing:** Jupyter notebooks and scraped apartment data.

## Recommendation Pipeline

The matching pipeline preprocesses apartment features with a saved scikit-learn transformer, combines them with the user's preferences, uses t-SNE and KMeans to identify a relevant cluster, and ranks apartments in that cluster by Euclidean similarity. The final result contains the top 20 recommendations.
