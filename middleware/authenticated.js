export default function ({ store, redirect, route }) {
  const isAccessible = /(^\/$)|login|help/.test(route.path);
  if (!store.state.sessionToken && !isAccessible) {
      return redirect("/?inactive=1");
  }
  else if (store.state.sessionToken && /(^\/$)|login/.test(route.path)) {
      return redirect(store.getters.config.urls.game.games.path);
  }
}