const axios = require("axios");
require("dotenv").config({ path: __dirname + "/.env" });

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];

const VALID_PACKAGES_BACKEND = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service",
  "auth", "config", "middleware", "utils"
];

async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack value: "${stack}"`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level value: "${level}"`);
  }
  if (!VALID_PACKAGES_BACKEND.includes(pkg)) {
    throw new Error(`Invalid package value: "${pkg}"`);
  }

  try {
    const response = await axios.post(
      LOG_API_URL,
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("[Logger Error]", err.message);
  }
}

module.exports = { Log };