const updateToken = (app) => {
  if (app.$store.getters.sessionToken && app.$store.getters.sessionToken != app.$cookies.get('token')) {
    console.log('Refreshing token:', app.$store.getters.sessionToken, app.$cookies.get('token'))
    setToken(app, app.$store.getters.sessionToken);
  }
};

const setToken = async (app, token) => {
  console.log(7, token);
  const d = new Date();
  d.setDate(d.getDate() + 14);
  await app.$cookies.remove('token');
  await app.$cookies.set('token', token, { expires: d });
  app.$store.commit('setToken', token);
};

module.exports = {
  updateToken: updateToken,
  setToken: setToken
};