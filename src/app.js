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




app.get("/hlasovanie/:id", (req, res) => {
  let url =
    "https://www.nrsr.sk/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=" +
    req.params.id;
  let dataArray = []; // we put data in this array
  let votingAllData = [];
  let state;
  let za = [];
  let proti = [];
  let zdrzaliSa = [];
  let nehlasovali = [];
  let nepritomni = [];
  axios({
    method: "get",
    url: url,
  }).then(function (response) {
    let html = response.data;

    let $ = cheerio.load(html);
    let meetingNumber = $(
      ".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__schodzaLink"
    ).text();
    let date = $(".voting_stats_summary_full .grid_4:nth-child(2) span").text();
    date = date
      .substring(0, date.lastIndexOf(" "))
      .replace(/\./g, "-")
      .replace(/\s/g, "");
    let time = $(".voting_stats_summary_full .grid_4:nth-child(2) span").text();
    let votingNumber = $(
      ".voting_stats_summary_full .grid_4:nth-child(3) span"
    ).text();
    let votingName = $(
      ".voting_stats_summary_full .grid_12:nth-child(4).alpha.omega span"
    ).text();
    let votingResult = $(
      ".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__votingResultCell span"
    ).text();
    let present = $(
      ".voting_stats_summary_full .grid_3:nth-child(1) span"
    ).text();
    let voters = $(
      ".voting_stats_summary_full .grid_3:nth-child(2) span"
    ).text();
    let votedInFavor = $(
      ".voting_stats_summary_full .grid_3:nth-child(3) span"
    ).text();
    let votedAgainst = $(
      ".voting_stats_summary_full .grid_3:nth-child(4) span"
    ).text();
    let absentions = $(
      ".voting_stats_summary_full .grid_3:nth-child(5) span"
    ).text();
    let didntVote = $(
      ".voting_stats_summary_full .grid_3:nth-child(6) span"
    ).text();
    let absent = $(
      ".voting_stats_summary_full .grid_3:nth-child(7) span"
    ).text();

    $(".hpo_result_table tbody tr td").each(function () {
      const voters = $(this).text();
      votingAllData.push({
        name: voters,
      });
    });

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
        return za.push(obj);
      }
      if (state === 2) {
        return proti.push(obj);
      }
      if (state === 3) {
        return zdrzaliSa.push(obj);
      }
      if (state === 4) {
        return nehlasovali.push(obj);
      }
      nepritomni.push(obj);
    });

    dataArray.push({
      id: req.params.id,
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

    const ref = db.ref(date);
    const votingRef = ref.child(req.params.id);
    votingRef.set(dataArray);
    // console.log(dataArray);
    // console.log(req.params.id);
    res.send("Data successfully sended to DB!");
  });
});

app.get("/manual/push", (req, res) => {
  let idDataToday = [
    // 47080,
    // 47081,
    // 47082,
    // 47083,
    // 47084,
    // 47085,
    // 47086,
    // 47087,
    // 47088,
    // 47089,
  ];

  for (i = 0; i < idDataToday.length; i++) {
    let dataArray = []; // we put data in this array
    let votingAllData = [];
    let state;
    let za = [];
    let proti = [];
    let zdrzaliSa = [];
    let nehlasovali = [];
    let nepritomni = [];

    axios({
      method: "get",
      url:
        "https://www.nrsr.sk/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=" +
        idDataToday[i],
    }).then(function (response) {
      let html = response.data;
      let $ = cheerio.load(html);
      let meetingNumber = $(
        ".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__schodzaLink"
      ).text();
      let date = $(
        ".voting_stats_summary_full .grid_4:nth-child(2) span"
      ).text();
      date = date
        .substring(0, date.lastIndexOf(" "))
        .replace(/\./g, "-")
        .replace(/\s/g, "");
      let time = $(
        ".voting_stats_summary_full .grid_4:nth-child(2) span"
      ).text();
      let votingNumber = $(
        ".voting_stats_summary_full .grid_4:nth-child(3) span"
      ).text();
      let votingName = $(
        ".voting_stats_summary_full .grid_12:nth-child(4).alpha.omega span"
      ).text();
      let votingResult = $(
        ".voting_stats_summary_full #_sectionLayoutContainer_ctl01_ctl00__votingResultCell span"
      ).text();
      let present = $(
        ".voting_stats_summary_full .grid_3:nth-child(1) span"
      ).text();
      let voters = $(
        ".voting_stats_summary_full .grid_3:nth-child(2) span"
      ).text();
      let votedInFavor = $(
        ".voting_stats_summary_full .grid_3:nth-child(3) span"
      ).text();
      let votedAgainst = $(
        ".voting_stats_summary_full .grid_3:nth-child(4) span"
      ).text();
      let absentions = $(
        ".voting_stats_summary_full .grid_3:nth-child(5) span"
      ).text();
      let didntVote = $(
        ".voting_stats_summary_full .grid_3:nth-child(6) span"
      ).text();
      let absent = $(
        ".voting_stats_summary_full .grid_3:nth-child(7) span"
      ).text();
      let fakeUrlId = $(".hpo_links li a").attr("href");
      let uid = fakeUrlId.substr(fakeUrlId.length - 5);

      $(".hpo_result_table tbody tr td").each(function () {
        const voters = $(this).text();
        votingAllData.push({
          name: voters,
        });
      });

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
          return za.push(obj);
        }
        if (state === 2) {
          return proti.push(obj);
        }
        if (state === 3) {
          return zdrzaliSa.push(obj);
        }
        if (state === 4) {
          return nehlasovali.push(obj);
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

      const ref = db.ref(date);
      const votingRef = ref.child(uid);
      votingRef.set(dataArray);
    });
  }

  res.send("Data successfully sended to DB!");
});

app.listen(SERVER.PORT, () => {
  console.log(`Example app listening at http://localhost:${SERVER.PORT}`);
});
