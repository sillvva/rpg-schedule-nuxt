export default async function ({ store, req, res }) {
  try {
    await store.dispatch("initAuth", req);
  }
  catch(err) {
  }
}