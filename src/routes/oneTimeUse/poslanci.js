const axios = require("axios");
const cheerio = require("cheerio");
const express = require('express');
const db = require("../../middleware/firebaseMiddleware");
const router = express.Router();

// Route to fetch and save IDs of today's votings
router.get('/poslanci-zoznam', async (req, res) => {
    let url = "https://www.nrsr.sk/web/Default.aspx?sid=poslanci/zoznam_abc&ListType=1&CisObdobia=9";
    let poslanciList = []; // we put data in this array
    axios({
        method: "get",
        url: url,
    }).then(function (response) {
        let html = response.data;
        let $ = cheerio.load(html);

        let currentClub = null; // Variable to store the current club name

        // Find the specific table by its ID
        $("#_sectionLayoutContainer_ctl01__171f9f6a693b_ctlMainTable tr").each(function () {
            const $td = $(this).find("td");

            // Check if the row contains an h4 tag (club name)
            const clubName = $td.find("h4").text().trim();
            if (clubName) {
                currentClub = clubName; // Update the current club name
                return; // Skip to the next row
            }

            // Check if the row contains an anchor tag (MP)
            const anchor = $td.find("a");
            if (anchor.length === 0) {
                // If there's no anchor tag, skip this row
                return;
            }

            // For each row with an anchor tag, get the MP's name and ID
            const name = anchor.text().trim();
            const href = anchor.attr("href");
            const idMatch = href.match(/PoslanecID=(\d+)/);
            const id = idMatch ? idMatch[1] : null;

            // Push the data into the poslanciList array as an object, including the current club
            if (name && id && currentClub) {
                poslanciList.push({
                    name: name,
                    id: id,
                    club: currentClub
                });
            }
        });

        // Once poslanciList is populated, push it to Firebase Realtime Database
        const ref = db.ref("/poslanci");
        ref.set(poslanciList)
            .then(() => {
                res.json({ message: "Data successfully pushed to Firebase Realtime Database." });
            })
            .catch(error => {
                console.error("Error while pushing data to Firebase:", error);
                res.status(500).send("Error occurred while pushing data to Firebase Realtime Database.");
            });

    }).catch(error => {
        console.error("Error:", error);
        res.status(500).send("Error occurred while fetching and parsing data.");
    });
});


module.exports = router;