const axios = require("axios");
const cheerio = require("cheerio");
const express = require('express');
const db = require("../../middleware/firebaseMiddleware");
const router = express.Router();
const { URLS } = require("../../constants");

//Maunalne vytahujem ID aktualnych hlasovani na prvej strane a nasledne si ich pushujem do DB

// Function to fetch data from the URL
async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching data from URL: ${url}`);
    }
}

// Function to extract IDs from the HTML
function extractIds(html) {
    const $ = cheerio.load(html);
    return $(".tab_zoznam tbody tr td:nth-child(3) a")
        .map(function () {
            const href = $(this).attr("href");
            if (href && href.trim() !== '') { // Check if href exists and is not empty
                const id = href.split("=").pop();
                return id;
            }
            return null; // Return null for anchors without href or with empty href
        })
        .get()
        .filter(id => id !== null);
}

// Route to fetch and save IDs of today's votings
router.get('/najnovsie-zoznam-id', async (req, res) => {
    try {
        const html = await fetchData(URLS.NRSR_HLASOVANIA_DNES);
        const idsToday = extractIds(html);
        const ref = db.ref("hlasovaniaNajnovsieIds");
        await ref.set(idsToday);
        res.send("IDs of today's votings have been saved to the database.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching and saving data.");
    }
});

// Route to push voting data to database
router.get("/najnovsie-zoznam", async (req, res) => {
    try {
        const snapshot = await db.ref("hlasovaniaNajnovsieIds").once("value");
        const idDataToday = snapshot.val() || [];
        console.log(idDataToday)
        const dataArray = [];
        const idArray = Object.values(idDataToday);


        for (const id of idArray) {
            const html = await fetchData(`${URLS.NRSR_HLASOVANIE_DETAIL}${id}`);
            const votingData = parseVotingData(html, id);
            dataArray.push(votingData);
        }

        res.send("Data successfully sent to DB!");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while processing the request.");
    }
});

router.get("/:id", async (req, res) => {
    let url = `${URLS.NRSR_HLASOVANIE_DETAIL}${req.params.id}`;
    axios({
        method: "get",
        url: url,
    }).then(function (response) {
        let html = response.data;
        let dataArray = parseVotingData(html, req.params.id);
        res.send(dataArray);
});
});

// Function to parse voting data from HTML
function parseVotingData(html, id) {
    const $ = cheerio.load(html);
    const dataArray = [];

    let uid = id
    let meetingNumber = $(".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__schodzaLink").text();
    let date = $(".voting_stats_summary_full .grid_4:nth-child(2) span").text();
    let dbDate = date
        .substring(0, date.lastIndexOf(" "))
        .replace(/\./g, "-")
        .replace(/\s/g, "")
        .split('.')
        .reverse()
        .join('-');

    let time = $(".voting_stats_summary_full .grid_4:nth-child(2) span").text();
    let votingNumber = $(".voting_stats_summary_full .grid_4:nth-child(3) span").text();
    let votingName = $(".voting_stats_summary_full .grid_12:nth-child(4).alpha.omega span").text();
    let votingResult = $(".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__votingResultCell span").text();
    let present = $(".voting_stats_summary_full .grid_3:nth-child(1) span").text();
    let voters = $(".voting_stats_summary_full .grid_3:nth-child(2) span").text();
    let votedInFavor = $(".voting_stats_summary_full .grid_3:nth-child(3) span").text();
    let votedAgainst = $(".voting_stats_summary_full .grid_3:nth-child(4) span").text();
    let absentions = $(".voting_stats_summary_full .grid_3:nth-child(5) span").text();
    let didntVote = $(".voting_stats_summary_full .grid_3:nth-child(6) span").text();
    let absent = $(".voting_stats_summary_full .grid_3:nth-child(7) span").text();
    // let fakeUrlId = $(".hpo_links li a").attr("href");
    // let uid = fakeUrlId.substr(fakeUrlId.length - 5);

    const votingAllData = [];
    $(".hpo_result_table tbody tr td").each(function () {
        const voters = $(this).text();
        votingAllData.push({
            name: voters,
        });
    });

    let state;
    let za = [];
    let proti = [];
    let zdrzaliSa = [];
    let nehlasovali = [];
    let nepritomni = [];

    votingAllData.forEach((obj) => {
        if (obj.name === "Za") {
            state = 1;
            return;
        }
        if (obj.name === "Proti") {
            state = 2;
            return;
        }
        if (obj.name === "Zdržali sa") {
            state = 3;
            return;
        }
        if (obj.name === "Nehlasovali") {
            state = 4;
            return;
        }
        if (obj.name === "Neprítomní") {
            state = 5;
            return;
        }
        if (state === 1) {
            za.push(obj);
            return;
        }
        if (state === 2) {
            proti.push(obj);
            return;
        }
        if (state === 3) {
            zdrzaliSa.push(obj);
            return;
        }
        if (state === 4) {
            nehlasovali.push(obj);
            return;
        }
        nepritomni.push(obj);
    });

    dataArray.push({
        id: uid,
        info: {
            meetingNumber: meetingNumber,
            date: date,
            time: time,
            votingNumber: votingNumber,
            votingName: votingName,
            votingResult: votingResult,
            pritomni: present,
            hlasujuci: voters,
            za: votedInFavor,
            proti: votedAgainst,
            zdrzaloSa: absentions,
            nehlasovalo: didntVote,
            nepritomni: absent,
        },
        hlasovanie: {
            za: za,
            proti: proti,
            zdrzaliSa: zdrzaliSa,
            nehlasovali: nehlasovali,
            nepritomni: nepritomni,
        },
    });

    const ref = db.ref('hlasovania').child(uid);
    ref.set(dataArray);
    return dataArray;
}

module.exports = router;