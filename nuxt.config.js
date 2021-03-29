const colors = require('vuetify/es5/util/colors').default;

module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - RPG Schedule',
    title: 'RPG Schedule',
    meta: [
      { property: "og:title", content: "RPG Schedule" },
      { property: "og:description", content: "A Discord bot designed for scheduling RPG games with automated signup, rescheduling, and RSS." },
      { property: "og:image", content: `https://www.rpg-schedule.com/images/social-logo.png` },
      { property: "og:url", content: `https://www.rpg-schedule.com/` },
      { name: "twitter:title", content: "RPG SChedule" },
      { name: "twitter:description", content: " A Discord bot designed for scheduling RPG games with automated signup, rescheduling, and RSS." },
      { name: "twitter:image", content: `https://www.rpg-schedule.com/images/social-logo.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/images/logo2.png' }
    ],
    script: [
      { src: '/scripts/socket.io.js' },
      { src: '/scripts/moment.js' },
      { src: '/scripts/moment-recur.js' },
      { src: 'https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.min.js' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#7289DA' },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/styles/main.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    "@nuxtjs/dotenv"
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/pwa',
    'cookie-universal-nuxt'
  ],
  pwa: {
    manifest: {
      name: "RPG Schedule",
      short_name: "RPG Schedule",
      display: "standalone",
      orientation: "portrait",
      lang: "en",
      background_color: "#222"
    }
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
          discord: '#7289DA'
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  server: {
    port: 6969,
    host: '0.0.0.0',
    timing: false
  }
}
