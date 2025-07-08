const dotenv = require("dotenv");
dotenv.config({ path: "../.env" }); // Load global first
dotenv.config({ path: "./.env" }); // Then override with backend-local

const app = require("./app");
const { PORT, BASE_API_URL } = require("./constants");

function startServer(port) {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running: *:${port}${BASE_API_URL}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use! Trying next port...`);
      // Try next port
      startServer(Number(port) + 1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(PORT);
