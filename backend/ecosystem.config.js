// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "backend",
      script: "index.js", // or app.js, whatever your entry is
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
