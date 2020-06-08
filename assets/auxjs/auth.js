const setToken = async (app, token) => {
  if (!app) return;
  localStorage.removeItem("redirect");
  const store = app.$store || app.store;
  if (store) store.dispatch("removeToken", app && app.$cookies);
  if (store) store.dispatch("setToken", token);
};

module.exports = {
  setToken: setToken
};