const express = require("express");
const cors = require("cors");
const { Log } = require("../logging_middleware/logger");
const { PORT } = require("./src/config/env");
const requestLogger = require("./src/middleware/requestLogger");
const notificationRoutes = require("./src/routes/notification.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/notifications", notificationRoutes);

// Health check
app.get("/health", async (req, res) => {
  await Log("backend", "info", "route", "Health check endpoint called");
  return res.status(200).json({ status: "ok", message: "Server is running" });
});

// 404 handler
app.use(async (req, res) => {
  await Log("backend", "warn", "route", `404 - Route not found: ${req.method} ${req.originalUrl}`);
  return res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(async (err, req, res, next) => {
  await Log("backend", "fatal", "middleware", `Unhandled error: ${err.message}`);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, async () => {
  await Log(
    "backend", "info", "service",
    `Notification backend server is running on port ${PORT}`
  );
  console.log(`Server running at http://localhost:${PORT}`);
});