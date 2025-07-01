const dotenv = require("dotenv");
dotenv.config({ path: "../.env" }); // Load global first
dotenv.config({ path: "./.env" }); // Then override with backend-local

const app = require("./app");
const { PORT, BASE_API_URL } = require("./constants");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running: *:${PORT}${BASE_API_URL}`);
});
