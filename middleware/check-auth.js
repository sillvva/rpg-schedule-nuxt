import aux from "../assets/auxjs/appaux";
import config from "../assets/auxjs/config";

export default async function({ store, req, route }) {
  // try {
  //   if (process.client && route.path != route.fullPath && route.path === config.urls.game.calendar.path) return;
  //   await store
  //     .dispatch("initAuth", req)
  //     .then(result => {
  //       // console.log('ca', store.state.sessionToken);
  //     })
  //     .catch(err => {
  //       if (err && !err.noTokens) console.log("check-auth", err);
  //     });
  // } catch (err) {
  //   aux.log("check-auth.js", (err && err.message) || err);
  // }
}
