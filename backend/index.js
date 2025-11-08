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

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Networking Platform API",
    status: "online",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      intentions: "/intentions",
      members: "/members",
      referrals: "/referrals",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Import routes (será necessário adaptar)
try {
  console.log("📂 Attempting to load routes from:", __dirname + "/dist/routes");

  const intentionRoutes = require("./dist/routes/intention.routes").default;
  const memberRoutes = require("./dist/routes/member.routes").default;
  const referralRoutes = require("./dist/routes/referral.routes").default;
  const announcementRoutes =
    require("./dist/routes/announcement.routes").default;
  const presenceRoutes = require("./dist/routes/presence.routes").default;
  const businessOpportunityRoutes =
    require("./dist/routes/businessOpportunity.routes").default;

  console.log("✅ Routes modules loaded");

  // Rotas com /api (padrão)
  app.use("/api/intentions", intentionRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/referrals", referralRoutes);
  app.use("/api/announcements", announcementRoutes);
  app.use("/api/presences", presenceRoutes);
  app.use("/api/opportunities", businessOpportunityRoutes);

  // Rotas sem /api (para compatibilidade)
  app.use("/intentions", intentionRoutes);
  app.use("/members", memberRoutes);
  app.use("/referrals", referralRoutes);
  app.use("/announcements", announcementRoutes);
  app.use("/presences", presenceRoutes);
  app.use("/opportunities", businessOpportunityRoutes);

  console.log("Routes loaded successfully");
} catch (error) {
  console.error("Error loading routes:", error);
  console.error("Stack:", error.stack);

  // Fallback para qualquer rota
  app.use("*", (req, res) => {
    res.status(500).json({
      error: "Server configuration error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler - deve ser a última rota
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
    message: "Route not found. Available routes start with /api/",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
