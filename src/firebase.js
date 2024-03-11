// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nrsr-hlasovanie-default-rtdb.europe-west1.firebasedatabase.app"
});

module.exports = admin;
