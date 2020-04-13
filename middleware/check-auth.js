import aux from "../components/appaux";

export default async function({ store, req }) {
  try {
    await store
      .dispatch("initAuth", req)
      .then(result => {
        // console.log('ca', store.state.sessionToken);
      })
      .catch(err => {
        if (err && !err.noTokens) console.log("check-auth", err);
      });
  } catch (err) {
    aux.log("check-auth.js", (err && err.message) || err);
  }
}
