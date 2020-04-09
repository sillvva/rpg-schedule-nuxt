import moment from "moment";
import aux from "../components/appaux";

export default async function({ store, req, route, app }) {
  try {
    // if (moment().unix() - store.state.lastRefreshed > 1/12 * 3600) {
      // store.commit("setLastRefreshed", moment().unix());
      await store.dispatch("initAuth", {
        req: req,
        route: route,
        app: app
      });
    // }
  } catch (err) {
    aux.log("check-auth.js", err.message || err);
  }
}
