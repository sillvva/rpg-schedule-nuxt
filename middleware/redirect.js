export default function ({ store, redirect, route }) {
  if (store.getters.env[`${route.params.to}Url`]) {
    return redirect(store.getters.env[`${route.params.to}Url`])
  }
  else {
    return redirect(store.getters.config.urls.game.games.path);
  }
}