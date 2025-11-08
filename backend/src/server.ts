import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import intentionRoutes from "./routes/intention.routes";
import memberRoutes from "./routes/member.routes";
import referralRoutes from "./routes/referral.routes";
import announcementRoutes from "./routes/announcement.routes";
import businessOpportunityRoutes from "./routes/businessOpportunity.routes";
import presenceRoutes from "./routes/presence.routes";
import postRoutes from "./routes/post.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gestaofrontendrh.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sem origin (mobile apps, Postman, etc)
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
        callback(null, true); // Permitir temporariamente para debug
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

// Adicionar headers manualmente também
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
    res.header("Access-Control-Allow-Origin", "*"); // Permitir temporariamente
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

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/intentions", intentionRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/opportunities", businessOpportunityRoutes);
app.use("/api/presences", presenceRoutes);
app.use("/api/posts", postRoutes);

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
