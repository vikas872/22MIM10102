Designed as a modular backend systems project, this repository includes a shared logging middleware, a vehicle maintenance scheduler, and a notification backend service.

## What's inside

```
├── logging_middleware/
├── vehicle_maintence_scheduler/
├── notification_app_be/
└── notification_system_design.md
```

### Logging Middleware
A reusable module used across both services. Every significant action gets
logged to a central evaluation server using a `Log(stack, level, package, message)`
call. No console logging anywhere except where the logger itself fails.

### Vehicle Maintenance Scheduler
Each depot has a fixed number of mechanic hours per day. Given a list of
vehicle tasks with durations and impact scores, the scheduler picks the
best combination using 0/1 knapsack DP to maximize total impact within
the available budget. Runs against a live evaluation API.

### Notification Backend
REST API built with Express. Pulls notifications from an evaluation API
and exposes two main endpoints — one for all notifications and one for a
priority inbox. Priority is weighted by type (placement > result > event)
and then sorted by timestamp.

## Tech

- Node.js + Express
- axios for HTTP calls
- dotenv for config
- cors for cross-origin support

## Setup

Each service has its own `package.json`. Install dependencies in each folder:

```bash
npm install
```

Create a `.env` file in both `logging_middleware/` and `notification_app_be/`:

```
ACCESS_TOKEN=your_bearer_token
PORT=3000
```

## Running

```bash
# vehicle scheduler (run once, prints results)
cd vehicle_maintence_scheduler
node scheduler.js

# notification server
cd notification_app_be
node index.js
```

## Endpoints

```
GET  /health                        → server health check
GET  /notifications                 → fetch all notifications
GET  /notifications/priority?n=10   → top n priority notifications
```

## Notes

- All logs go through the shared logging middleware
- Tokens are never hardcoded — loaded from `.env` which is gitignored
- Knapsack runs per depot so each depot gets its own optimal task selection
