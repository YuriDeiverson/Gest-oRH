const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gestaofrontendrh.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some((allowed) =>
          origin.includes(
            allowed.replace("https://", "").replace("http://", ""),
          ),
        )
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permitir temporariamente
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Headers manuais também
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    allowedOrigins.some((allowed) =>
      origin.includes(allowed.replace("https://", "").replace("http://", "")),
    )
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Import routes (será necessário adaptar)
try {
  const intentionRoutes = require("../dist/routes/intention.routes").default;
  const memberRoutes = require("../dist/routes/member.routes").default;
  const referralRoutes = require("../dist/routes/referral.routes").default;

  app.use("/api/intentions", intentionRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/referrals", referralRoutes);
} catch (error) {
  console.error("Error loading routes:", error);
  app.use("/api/*", (req, res) => {
    res.status(500).json({
      error: "Server configuration error",
      message: error.message,
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
