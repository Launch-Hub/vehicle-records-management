const dotenv = require("dotenv");
dotenv.config({ path: "../.env" }); // Load global first
dotenv.config({ path: "./.env" }); // Then override with backend-local

const app = require("./app");
const PORT = process.env.API_PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
