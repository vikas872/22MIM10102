const axios = require("axios");
require("dotenv").config({ path: __dirname + "/../logging_middleware/.env" });
const { Log } = require("../logging_middleware/logger");

const BASE_URL = "http://4.224.186.213/evaluation-service";

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
};

async function fetchDepots() {
  await Log("backend", "info", "service", "Initiating depot fetch from evaluation API");

  const response = await axios.get(`${BASE_URL}/depots`, { headers: HEADERS });

  await Log(
    "backend", "info", "service",
    `Successfully fetched ${response.data.depots.length} depots`
  );

  return response.data.depots;
}

async function fetchVehicles() {
  await Log("backend", "info", "service", "Initiating vehicle task fetch from evaluation API");

  const response = await axios.get(`${BASE_URL}/vehicles`, { headers: HEADERS });

  await Log(
    "backend", "info", "service",
    `Successfully fetched ${response.data.vehicles.length} vehicle tasks`
  );

  return response.data.vehicles;
}

/*
  0/1 Knapsack — O(n * capacity)
  Each task has Duration (weight) and Impact (value).
  We want max Impact within MechanicHours (capacity).
*/
function knapsack(tasks, capacity) {
  const n = tasks.length;

  // dp[w] = best impact achievable using exactly w hours or less
  const dp = new Array(capacity + 1).fill(0);

  // keep[i][w] = true if task i is included at capacity w
  const keep = Array.from({ length: n }, () => new Array(capacity + 1).fill(false));

  for (let i = 0; i < n; i++) {
    const duration = tasks[i].Duration;
    const impact = tasks[i].Impact;

    // Traverse backwards to prevent reusing same task
    for (let w = capacity; w >= duration; w--) {
      if (dp[w - duration] + impact > dp[w]) {
        dp[w] = dp[w - duration] + impact;
        keep[i][w] = true;
      }
    }
  }

  // Backtrack to find selected tasks
  const selectedTasks = [];
  let remainingCapacity = capacity;

  for (let i = n - 1; i >= 0; i--) {
    if (keep[i][remainingCapacity]) {
      selectedTasks.push(tasks[i].TaskID);
      remainingCapacity -= tasks[i].Duration;
    }
  }

  return {
    maxImpact: dp[capacity],
    selectedTasks: selectedTasks,
  };
}

async function main() {
  await Log("backend", "info", "service", "Vehicle Maintenance Scheduler started");

  try {
    const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

    await Log(
      "backend", "debug", "service",
      `Running knapsack for ${depots.length} depots with ${vehicles.length} available tasks`
    );

    const results = [];

    for (const depot of depots) {
      await Log(
        "backend", "debug", "service",
        `Processing depot ID=${depot.ID}, budget=${depot.MechanicHours} mechanic-hours`
      );

      const { maxImpact, selectedTasks } = knapsack(vehicles, depot.MechanicHours);

      await Log(
        "backend", "info", "service",
        `Depot ${depot.ID} result: maxImpact=${maxImpact}, tasksSelected=${selectedTasks.length}`
      );

      results.push({
        depotID: depot.ID,
        mechanicHoursBudget: depot.MechanicHours,
        maxImpactScore: maxImpact,
        selectedTaskCount: selectedTasks.length,
        selectedTaskIDs: selectedTasks,
      });
    }

    // Print results clearly for screenshot
    console.log("\n========== VEHICLE SCHEDULING RESULTS ==========");
    for (const r of results) {
      console.log(`\nDepot ID         : ${r.depotID}`);
      console.log(`Budget (hours)   : ${r.mechanicHoursBudget}`);
      console.log(`Max Impact Score : ${r.maxImpactScore}`);
      console.log(`Tasks Selected   : ${r.selectedTaskCount}`);
      console.log(`Task IDs         : ${r.selectedTaskIDs.join(", ")}`);
      console.log("-------------------------------------------------");
    }

    await Log(
      "backend", "info", "service",
      "Vehicle Maintenance Scheduler completed successfully for all depots"
    );

  } catch (err) {
    await Log("backend", "error", "service", `Scheduler encountered an error: ${err.message}`);
    console.error("Fatal error:", err.message);
  }
}

main();