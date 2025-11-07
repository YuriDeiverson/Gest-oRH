import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import intentionRoutes from "./routes/intention.routes";
import memberRoutes from "./routes/member.routes";
import referralRoutes from "./routes/referral.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/intentions", intentionRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/referrals", referralRoutes);

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
