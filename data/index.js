const OBA = require("oba-api");
var fs = require("file-system");

require("dotenv").config();

// Setup authentication to api server
const client = new OBA({
  // ProQuest API Keys
  public: process.env.PUBLIC_KEY,
  secret: process.env.SECRET_KEY
});

// General usage:
// client.get({ENDPOINT}, {PARAMS});
// ENDPOINT = search | details | refine | schema | availability | holdings
// PARAMS = API url parameter options (see api docs for more info) https://zoeken.oba.nl/api/v1/

// Client returns a promise which resolves the APIs output in JSON

// for (var i = 0; i < 61; i++) { //API can't handle this for loop
client
  .get(
    // get all books
    "search",
    {
      q: "genre:biografie",
      librarian: true,
      refine: true,
      page: 1
    }
  )
  .then(response => JSON.parse(response).aquabrowser)
  .then(response => {
    var data = getData(response);
  })
  .catch(err => console.error(err)); // Something went wrong in the request to the API
// }

function getData(response) {
  var result = response.results.result;
  var author = getAuthor(result);
  var title = getTitle(result);
  var summary = getSummary(result);
  var publicationYear = getPublicationYear(result);
  var gender = getGender(summary);
  var authorUrl = makeAuthorUrl(author);

  var dataStore = result.map((d, i) => {
    return {
      author: author[i],
      title: title[i],
      summary: summary[i],
      publicationYear: publicationYear[i],
      gender: gender[i],
      authorUrl: authorUrl[i]
    };
  });

  var allDataJson = JSON.stringify(dataStore);
  fs.appendFileSync("data/data.json", allDataJson, err => {
    if (err) throw err;
  });
}

function getAuthor(result) {
  var authorsAndTitles = result.map(result => result.titles.title["$t"]);
  var authors = authorsAndTitles.map(authorsAndTitles => {
    if (authorsAndTitles == undefined) {
      return "noTitle";
    } else {
      return authorsAndTitles.split(" / ").pop();
    }
  });
  return authors;
}

function getTitle(result) {
  var authorsAndTitles = result.map(result => result.titles.title["$t"]);
  var title = authorsAndTitles.map(authorsAndTitles => {
    if (authorsAndTitles == undefined) {
      return "noAuthor";
    } else {
      return authorsAndTitles.split(" / ").shift();
    }
  });
  return title;
}

function getSummary(result) {
  var summaries = result.map(result => result.summaries);
  var summaryTexts = summaries.map(summary => {
    if (summary != undefined) {
      if (true) {
      }
      return summary.summary["$t"];
    } else if (summary == undefined) {
      return "noSummary";
    }
  });
  return summaryTexts;
}

function getPublicationYear(result) {
  var publicationYear = result.map(result => {
    var publicationYear = result.publication.publishers.publisher.year;
    if (publicationYear !== undefined) {
      var publicationYear = parseInt(
        result.publication.publishers.publisher.year.replace(/\D/g, "")
      );
      return publicationYear;
    } else {
      return "noPublicationYear";
    }
  });
  return publicationYear;
}

function getGender(summary) {
  var gender = summary.map(summary => {
    if (
      summary.includes("vrouw") ||
      summary.includes("zij ") ||
      summary.includes("haar")
    ) {
      return "female";
    } else if (
      summary.includes("man") ||
      summary.includes("zijn") ||
      summary.includes("hem")
    ) {
      return "male";
    } else {
      return "noGender";
    }
  });
  return gender;
}

function makeAuthorUrl(author) {
  console.log(author);
  var urlAuthor = author.map(author => {
    if (
      author.charCodeAt(0) === author.toUpperCase().charCodeAt(0) &&
      author.length < 35
    ) {
      var urlAuthor = author.replace(/ /g, "_");
    } else {
      var urlAuthor = "noURL";
    }
    return urlAuthor;
  });
  return urlAuthor;
}

// TODO: use authorURL for Wikipedia API request, to check gender of author

// const rp = require("request-promise");
// const $ = require("cheerio");
// const url = "https://en.wikipedia.org/wiki/Anchee_Min";
//
// rp(url)
//   .then(function(html) {
//     //success!
//     const wikiUrls = [];
//     for (let i = 0; i < 45; i++) {
//       wikiUrls.push($(".firstHeading", html)[i].attribs.href);
//     }
//     console.log(wikiUrls);
//   })
//   .catch(function(err) {
//     //handle error
//   });
