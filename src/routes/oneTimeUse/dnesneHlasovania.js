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

router.get("/hlasovanie/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const html = await fetchData(`${URLS.NRSR_HLASOVANIE_DETAIL}${id}`);
        parseVotingData(html, id);

        res.send("Data successfully pushed to DB!");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while processing the request.");
    }
});

router.get("/manual", async (req, res) => {
    try {
        const idData = [
            54535,
            54536,
            54537,
            54538,
            54539,
            54540,


            // 8.2.2024
            // 52967,
            // 52968,
            // 52969,
            // 52970,
            // 52971,
            // 52972,
            // 52973,
            // 52974,
            // 52975,
            // 52976,
            // 52977,
            // 52978,
            // 52979,
            // 52980,
            // 52981,
            // 52982,
            // 52983,
            // 52984,
            // 52985,
            // 52986,
            // 52987,
            // 52988,
            // 52989,
            // 52990,
            // 52991,
            // 52992,
            // 52993,
            // 52994,
            // 52995,
            // 52996,
            // 52997,
            // 52998,
            // 52999,
            // 53000,
            // 53001,
            // 53002,
            // 53003,
            // 53004,
            // 53005,
            // 53006,
            // 53007,
            // 53008,
            // 53009,
            // 53010,
            // 53011,
            // 53012,
            // 53013,
            // 53014,
            // 53015,
            // 53016,
            // 53017,
            // 53018,
            // 53019,
            // 53020,
            // 53021,
            // 53022,
            // 53023,
            // 53024,
            // 53025,
            // 53026,
            // 53027,
            // 53028,
            // 53029,
            // 53030,
            // 53031,
            // 53032,
            // 53033,
            // 53034,
            // 53035,
            // 53036,
            // 53037,
            // 53038,
            // 53039,
            // 53040,
            // 53041,
            // 53042,
            // 53043,
            // 53044,
            // 53045,
            // 53046,
            // 53047,
            // 53048,
            // 53049,
            // 53050,
            // 53051,
            // 53052,
            // 53053,
            // 53054,
            // 53055,
            // 53056,
            // 53057,
            // 53058,
            // 53059,
            // 53060,
            // 53061,
            // 53062,
            // 53063,
            // 53064,
            // 53065,
            // 53066,
            // 53067,
            // 53068,
            // 53069,
            // 53070,
            // 53071,
            // 53072,
            // 53073,
            // 53074,
            // 53075,
            // 53076,
            // 53077,
            // 53078,
            // 53079,
            // 53080,
            // 53081,
            // 53082,
            // 53083,
            // 53084,
            // 53085,
            // 53086,
            // 53087,
            // 53088,
            // 53089,
            // 53090,
            // 53091,
            // 53092,
            // 53093,
            // 53094,
            // 53095,
            // 53096,
            // 53097,
            // 53098,
            // 53099,
            // 53100,
            // 53101,
            // 53102,
            // 53103,
            // 53104,
            // 53105,
            // 53106,
            // 53107,
            // 53108,
            // 53109,
            // 53110,
            // 53111,
            // 53112,
            // 53113,
            // 53114,
            // 53115,
            // 53116,
            // 53117,
            // 53118,
            // 53119,
            // 53120,
            // 53121,
            // 53122,
            // 53123,
            // 53124,
            // 53125,
            // 53126,
            // 53127,
            // 53128,
            // 53129,
            // 53130,
            // 53131,
            // 53132,
            // 53133,
            // 53134,
            // 53135,
            // 53136,
            // 53137,
            // 53138,
            // 53139,
            // 53140,
            // 53141,
            // 53142,
            // 53143,
            // 53144,
            // 53145,
            // 53146,
            // 53147,
            // 53148,
            // 53149,
            // 53150,
            // 53151,
            // 53152,
            // 53153,
            // 53154,
            // 53155,
            // 53156,
            // 53157,
            // 53158,
            // 53159,
            // 53160,
            // 53161,
            // 53162,
            // 53163,
            // 53164,
            // 53165,
            // 53166,
            // 53167,
            // 53168,
            // 53169,
            // 53170,
            // 53171,
            // 53172,
            // 53173,
            // 53174,
            // 53175,
            // 53176,
            // 53177,
            // 53178,
            // 53179,
            // 53180,
            // 53181,
            // 53182,
            // 53183,
            // 53184,
            // 53185,
            // 53186,
            // 53187,
            // 53188,
            // 53189,
            // 53190,
            // 53191,
            // 53192,
            // 53193,
            // 53194,
            // 53195,
            // 53196,
            // 53197,
            // 53198,
            // 53199,
            // 53200,
            // 53201,
            // 53202,
            // 53203,
            // 53204,
            // 53205,
            // 53206,
            // 53207,
            // 53208,
            // 53209,
            // 53210,
            // 53211,
            // 53212,
            // 53213,
            // 53214,
            // 53215,
            // 53216,
            // 53217,
            // 53218,
            // 53219,
            // 53220,
            // 53221,
            // 53222,
            // 53223,
            // 53224,
            // 53225,
            // 53226,
            // 53227,
            // 53228,
            // 53229,
            // 53230,
            // 53231,
            // 53232,
            // 53233,
            // 53234,
            // 53235,
            // 53236,
            // 53237,
            // 53238,
            // 53239,
            // 53240,
            // 53241,
            // 53242,
            // 53243,
            // 53244,
            // 53245,
            // 53246,
            // 53247,
            // 53248,
            // 53249,
            // 53250,
            // 53251,
            // 53252,
            // 53253,
            // 53254,
            // 53255,
            // 53256,
            // 53257,
            // 53258,
            // 53259,
            // 53260,
            // 53261,
            // 53262,
            // 53263,
            // 53264,
            // 53265,
            // 53266,
            // 53267,
            // 53268,
            // 53269,
            // 53270,
            // 53271,
            // 53272,
            // 53273,
            // 53274,
            // 53275,
            // 53276,
            // 53277,
            // 53278,
            // 53279,
            // 53280,
            // 53281,
            // 53282,
            // 53283,
            // 53284,
            // 53285,
            // 53286,
            // 53287,
            // 53288,
            // 53289,
            // 53290,
            // 53291,
            // 53292,
            // 53293,
            // 53294,
            // 53295,
            // 53296,
            // 53297,
            // 53298,
            // 53299,
            // 53300,
            // 53301,
            // 53302,
            // 53303,
            // 53304,
            // 53305,
            // 53306,
            // 53307,
            // 53308,
            // 53309,
            // 53310,
            // 53311,
            // 53312,
            // 53313,
            // 53314,
            // 53315,
            // 53316,
            // 53317,
            // 53318,
            // 53319,
            // 53320,
            // 53321,
            // 53322,
            // 53323,
            // 53324,
            // 53325,
            // 53326,
            // 53327,
            // 53328,
            // 53329,
            // 53330,
            // 53331,
            // 53332,
            // 53333,
            // 53334,
            // 53335,
            // 53336,
            // 53337,
            // 53338,
            // 53339,
            // 53340,
            // 53341,
            // 53342,
            // 53343,
            // 53344,
            // 53345,
            // 53346,
            // 53347,
            // 53348,
            // 53349,
            // 53350,
            // 53351,
            // 53352,
            // 53353,
            // 53354,
            // 53355,
            // 53356,
            // 53357,
            // 53358,
            // 53359,
            // 53360,
            // 53361,
            // 53362,
            // 53363,
            // 53364,
            // 53365,
            // 53366,
            // 53367,
            // 53368,
            // 53369,
            // 53370,
            // 53371,
            // 53372,
            // 53373,
            // 53374,
            // 53375,
        ]; // Array of IDs
        const dataArray = [];

        for (const id of idData) {
            console.log(id, 'id')
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