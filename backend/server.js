// Load global first
require("dotenv").config({ path: "../.env" });
// Then override with backend-local
require("dotenv").config({ path: "./.env" });

const app = require("./app");
const PORT = process.env.BE_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
