const dotenv = require("dotenv");

// Load global first
dotenv.config({ path: "../.env" });
// Then override with backend-local
dotenv.config({ path: "./.env" });

const app = require("./app");
const PORT = process.env.API_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
