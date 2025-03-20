import express from "express";
import cors from "cors";
import { loadRouteFiles } from "./utils/loadRouteFiles";
import { registerRoutes } from "./utils/registerRoutes";
import dotenv from "dotenv";
import * as morgan from "morgan";
import { AppDataSource } from "./db/datasource";
import processRecords from "./controllers/algoliaController";
import path from "path";
import sls from "serverless-http";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(morgan.default("dev"));
app.use(express.static(path.resolve(__dirname, "public")));
// const routesDir = path.resolve(__dirname, "routes");
const routesDir = path.resolve(__dirname, process.env.NODE_ENV === "production" ? "routes" : "routes");

const routes = loadRouteFiles(routesDir);
registerRoutes(routes, app);

AppDataSource.initialize()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
    // processRecords()
    //   .then(() => console.log("Successfully indexed objects!"))
    //   .catch((err) => console.error(err));
  })
  .catch((error) => {
    console.error("Error during DataSource initialization:", error);
  });

// module.exports.handler = sls(app);
