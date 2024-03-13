const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
// const cron = require("node-cron");
const db = require("./middleware/firebaseMiddleware.js");
const dnesneHlasovaniaRouter = require('./routes/oneTimeUse/dnesneHlasovania.js');
const poslanciRouter = require('./routes/oneTimeUse/poslanci.js');
const {SERVER} = require("./constants");

// const fetch = require("node-fetch");
app.use('/hlasovanie', dnesneHlasovaniaRouter);
app.use('/poslanci', poslanciRouter);
//
// //run every day at 4 am
// cron.schedule("0 4 * * *", () => {
//   axios.get(publicUrl + '/dnes').then((response) => {
//     console.log("Done! Get all IDs and pushed to DB");
//   });
// });
//
// //run every day at 5 am
// cron.schedule("0 5 * * *", () => {
//   axios
//     .get(publicUrl + '/dnes/push')
//     .then((response) => {
//       console.log("Done! Get all votings and pushed to DB based od IDs");
//     });
// });



app.listen(SERVER.PORT, () => {
  console.log(`Example app listening at http://localhost:${SERVER.PORT}`);
});
