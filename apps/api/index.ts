import bodyParser from "body-parser";
import express from "express";
import glob from "glob";
import cors from "cors";
import { RouteModuleInterface } from "./lib/types";
import * as dotenv from "dotenv";
import * as config from "./config";

// All global variables goes here
const args = process.argv.slice(2);

const app = express();
const PORT: number = Number(args[1]);
const routePath: string = String(args[3]);
const routes: string[] = [];

// For ENV variables
dotenv.config({
  path:
    process.env.NODE_ENV === "development" || !process.env.NODE_ENV
      ? ".env.local"
      : ".env",
});

// Some needed functions to have evrything go (JSON formatter - JSON formatter v2 - CORS for secuirty)
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [config.webEndpoint, config.uiEndpoint],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    exposedHeaders: ["*"],
    credentials: true,
  })
);

// Create all routes
glob(routePath, {}, function (err, files) {
  for (const x of files) {
    const routeModule: RouteModuleInterface = require("./" +
      x.replace("dist/", ""));

    // Check for duplicated routes
    if (!routes.includes(routeModule.path)) {
      // Check if route path is defined otherwise do nothing
      if (routeModule.path != null) {
        routes.push(routeModule.path);

        app.all(routeModule.path, async (req, res) => {
          await routeModule.handler(req, res);
        });
      }
    } else {
      console.log(
        `Found duplicated route ignoring [${routeModule.path} | ${x}]`
      );
    }
  }

  console.log(`[Server] Loaded succesfully ${routes.length} routes!`);
});

// Listen the server to the world
app.listen(PORT, () => {
  console.log(`[Server] Server is running at http://localhost:${PORT}`);
});
