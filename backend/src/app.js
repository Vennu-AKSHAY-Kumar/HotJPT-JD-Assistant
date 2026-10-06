import "dotenv/config";
import express from "express";
import cors from "cors";
import jdRoutes from "./routes/jdRoutes.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS."));
    },
  })
);

app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "JD Assistant API",
  });
});

app.use("/api", jdRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;

  if (status >= 500) {
    console.error("Backend error:", err.message);
  }

  res.status(status).json({
    error:
      status >= 500
        ? "Something went wrong on the server. Please try again."
        : err.message,
  });
});

export default app;
