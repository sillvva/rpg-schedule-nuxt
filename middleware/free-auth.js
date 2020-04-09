import aux from "../components/appaux";

export default async function({ store, req, route, app }) {
  try {
    await store.dispatch("initAuth", {
      req: req,
      route: route,
      app: app,
      allow: true
    });
  } catch (err) {
    aux.log("free-auth.js", err.message || err);
  }
}
