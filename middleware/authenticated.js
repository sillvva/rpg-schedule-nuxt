export default function ({ store, redirect, route }) {
  const isAccessible = /(^\/$)|login|help|games\/edit/.test(route.path);
  if (!store.state.sessionToken && !isAccessible) {
      return redirect(`${store.getters.config.urls.login.path}?redirect=${encodeURIComponent(route.fullPath)}`);
  }
  else if (store.state.sessionToken && /(^\/$)|login/.test(route.path)) {
      return redirect(store.getters.config.urls.game.games.path);
  }
}