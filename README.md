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

## Render Deployment

The repository includes a root-level `render.yaml` Blueprint for two Render services:

- `apartment-ai-backend`: a Docker web service using `backend/src/Dockerfile`. The image contains Node.js, Python 3, the pinned ML dependencies, the matcher script, and the saved model/data files.
- `apartment-ai-frontend`: a React static site built from `frontend` and published from `frontend/build`.

The frontend is built with Create React App. Its backend origin is configured with the build-time variable `REACT_APP_API_URL`; local development falls back to `http://localhost:5000` when the variable is absent. The Blueprint includes the React Router rewrite from `/*` to `/index.html`.

### Render Environment Variables

Enter these values in Render. Use the actual secret values only in Render's environment settings, never in Git or this README:

Backend web service:

```text
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
PYTHON_EXECUTABLE=python3
CLIENT_URL=https://your-frontend.onrender.com
```

Frontend static site:

```text
REACT_APP_API_URL=https://your-backend.onrender.com
```

`PORT` is supplied by Render automatically. The backend defaults to port `5000` locally and listens on `0.0.0.0` for Render. The backend health check is `GET /health` and returns `{ "status": "ok" }` without calling MongoDB, Gemini, or Python.

### Manual Render Setup

1. Push this repository to GitHub without committing any `.env` files or secrets.
2. In Render, choose **New > Blueprint** and select the repository and deployment branch.
3. Review the two services from `render.yaml` and enter the backend secrets and MongoDB Atlas connection string.
4. Deploy the backend first, then set the frontend `REACT_APP_API_URL` to the deployed backend URL and deploy the frontend.
5. Set the backend `CLIENT_URL` to the deployed frontend URL. If the frontend URL changes, update this value and redeploy the backend.
6. Confirm `https://your-backend.onrender.com/health` returns `{ "status": "ok" }`.

MongoDB Atlas may need a Network Access rule allowing Render to connect. For a temporary course demonstration, `0.0.0.0/0` may be required when the free Render service has no stable outbound IP. This is a demo compromise: use a strong database password, grant the database user only the permissions this application needs, keep credentials only in Render environment variables, and restrict the rule later when stable egress is available.

Render free services can sleep when idle, so the first request after inactivity may be slow while the service starts. No GitHub Actions or external deployment automation is required.

### Local Development After Deployment Changes

Create `backend/src/.env` and `frontend/.env` from their corresponding `.env.example` files, then run:

```bash
cd backend/src
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm start
```

The frontend uses `REACT_APP_API_URL=http://localhost:5000` locally, while the backend uses `CLIENT_URL=http://localhost:3000` and `PYTHON_EXECUTABLE` can be set to a local Python executable when needed.

## Technologies

- **Frontend:** React, React Router, Axios, rc-slider.
- **Backend:** Node.js, Express.js, Mongoose.
- **AI:** Google Gemini through `@google/generative-ai`.
- **Database:** MongoDB.
- **Machine learning:** Python, scikit-learn, pandas, NumPy.
- **Data processing:** Jupyter notebooks and scraped apartment data.

## Recommendation Pipeline

The matching pipeline preprocesses apartment features with a saved scikit-learn transformer, combines them with the user's preferences, uses t-SNE and KMeans to identify a relevant cluster, and ranks apartments in that cluster by Euclidean similarity. The final result contains the top 20 recommendations.
