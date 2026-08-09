import app from "./app.js";
import { connecToDB } from "./utils/db.js";

const port = Number(process.env.PORT) || 3000;
const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await connecToDB();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
  
};
startServer();







