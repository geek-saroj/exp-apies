export function registerRoutes(routes: any, app: any) {
    Object.keys(routes).forEach((routeName) => {
      const route = routes[routeName];
      app.use(`/${routeName}`, route); // Register each route with a prefix
    });
  }
  