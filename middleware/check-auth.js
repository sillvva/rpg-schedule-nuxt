import aux from "../components/appaux";

export default async function({ store, req }) {
  try {
    await store
      .dispatch("initAuth", req)
      .catch(err => {
        console.log("check-auth", err);
      });
  } catch (err) {
    aux.log("check-auth.js", (err && err.message) || err);
  }
}
