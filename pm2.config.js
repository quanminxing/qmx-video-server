module.exports = {
    apps : [
        {
          name: "qmx-video",
          script: "./index.js",
          watch: true,
          env: {
              "PORT": 3000,
              "EGG_SERVER_ENV": "local"
          },
          env_production: {
              "PORT": 80,
              "EGG_SERVER_ENV": "production",
          }
        }
    ]
  }