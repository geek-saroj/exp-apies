import fs from "fs";
import path from "path";

export function loadRouteFiles(routesDir: string) {
  const routes: any = {};
  const routeFiles = fs.readdirSync(routesDir);

  routeFiles.forEach((file) => {
    if (file.endsWith(".route.ts") || file.endsWith(".route.js")) {
      const routeName = file.replace(/\.(route\.ts|route\.js)$/, "");
      routes[routeName] = require(path.join(routesDir, file)).default;
    }
  });

  return routes;
}
