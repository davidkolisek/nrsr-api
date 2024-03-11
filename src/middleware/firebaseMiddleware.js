// middleware/firebaseMiddleware.js
const admin = require("../firebase"); // Import Firebase module

// You can use admin.database() to interact with the Realtime Database
const db = admin.database();

// Export the database instance for use in other parts of your application
module.exports = db;
