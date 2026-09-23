const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

dotenv.config(); // Load config
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function validateStartupConfiguration() {
  const requiredVariables = ["MONGO_URI", "GEMINI_API_KEY"];
  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
}

async function main() {
  validateStartupConfiguration();

  await connectDB();
  //Middleware - run this for every request
  app.use(express.json());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
    }),
  );
  app.use(bodyParser.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const apartmentsRoute = require("./routers/apartment.route");

  app.use("/api/apartments", apartmentsRoute);

  app.listen(PORT, "0.0.0.0", () => console.log(`app running on port ${PORT}`));
}

main().catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exitCode = 1;
});
