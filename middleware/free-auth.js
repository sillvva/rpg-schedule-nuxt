export default async function({ store, req, route, app }) {
  try {
    await store.dispatch("initAuth", {
      req: req,
      route: route,
      app: app,
      allow: true
    });
  } catch (err) {}
}
