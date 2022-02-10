import bodyParser from "body-parser";
import express from "express";
import glob from "glob";
import cors from "cors";
import { routeModuleInterface } from "./lib/types";
import * as dotenv from "dotenv";

// All global variables goes here
const app = express();
const PORT: number = 8000;
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
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    exposedHeaders: ["*"],
    credentials: true,
  })
);

// Create all routes
glob("routes/**/*.ts", {}, function (err, files) {
  for (const x of files) {
    const routeModule: routeModuleInterface = require("./" + x);

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
