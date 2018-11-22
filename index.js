console.log("Lets go 👩‍💻!");

var startYear = 1997;

// SVG ELEMENT
var svg = d3.select("svg");
var svgWidth = 800;
var svgHeight = 200;
//var barPadding = 3;

// MARGINS
var margin = { top: 48, right: 50, bottom: 120, left: 50 };

var x = d3
  .scaleTime()
  .domain([1998, 2018])
  .range([0, svgWidth]);
// x.domain(valueInGenders.map(d => d.key));

var y = d3
  .scaleLinear()
  .domain([100, 0])
  .range([0, svgHeight]);

//LOAD DATA
d3.json("data/allData.json")
  .then(data => {
    var data = data.filter(yearRange);
    var countInGender = getCountInGender(data);
    var relativeSum = getRelativeSum(countInGender);
    var chart = drawChart(relativeSum, countInGender);
  })
  .catch(err => console.error(err)); // error

//FUNCTIONS//
function yearRange(data) {
  return data.publicationYear > startYear;
}

function getCountInGender(data) {
  var totalGenders = d3
    .nest()
    .key(data => data.publicationYear)
    .rollup(v => {
      let temp = {
        female: [],
        male: []
      };

      v.forEach(_v => {
        if (_v.gender === "female") {
          temp.female.push("female");
        } else if (_v.gender === "male") {
          temp.male.push("male");
        }
      });

      temp.female = temp.female.length;
      temp.male = temp.male.length;

      return temp;
    })

    .entries(data)
    .sort((a, b) => a.key - b.key);

  return totalGenders;
}

function getRelativeSum(data) {
  var percentage = {
    female: [],
    male: []
  };

  var percentageFemale = data.map(
    data => (data.value.female * 100) / (data.value.female + data.value.male)
  );

  var percentageMale = data.map(
    data => (data.value.male * 100) / (data.value.female + data.value.male)
  );

  percentage.female.push(percentageFemale);
  percentage.male.push(percentageMale);
  //console.log(percentage.female[0]);

  //console.log(percentage);
  return percentage;
}

function drawChart(relativeSum, countInGender) {
  //PLACE AXES
  var xAxis = g =>
    g
      .attr("transform", `translate(0,${svgHeight})`)
      .attr("text", "jaartallen")

      .call(
        d3
          .axisBottom(x)
          .tickSizeOuter(0)
          .ticks(2018 - 1998)
          .tickFormat(d3.format("d"))
      )
      .style("text-anchor", "start")
      .call(g => g.selectAll(".domain").remove());

  var yAxis = g =>
    g
      .attr("transform", `translate(0,0)`)
      .call(d3.axisLeft(y).ticks(5, "s"))
      .call(g => g.selectAll(".domain").remove());

  //DRAW SVG
  var svg = d3
    .select("svg")
    .attr("class", "bar-chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("overflow", "visible");

  var absoluteLink = document.getElementById("absolute");
  console.log(absoluteLink);
  var relativeLink = document.getElementById("relative");
  console.log(relativeLink);

  // var absoluteChart = getAbsoluteChart(countInGender);
  // var relativeChart = getRelativeChart(relativeSum);

  d3.select("#relative").on("click", function() {
    getAbsoluteChart(countInGender);
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
  });

  d3.select("#absolute").on("click", function() {
    getRelativeChart(relativeSum);
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
  });

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
}

function getRelativeChart(relativeSum) {
  console.log(relativeSum.female);
  d3.selectAll("g").remove();
  d3.selectAll("rect").remove();
  d3.selectAll("text").remove();
  console.log("relative");

  var groupsFemale = svg
    .selectAll("g")
    .data(relativeSum.male[0])
    .enter()
    .append("g")
    .attr("class", "toolTip");

  groupsFemale.each((data, index, groups) => {
    var tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text(Math.round(data) + "%");

    var mRect = d3
      .select(groups[index])
      .append("rect")
      .attr("fill", "#EC407A")
      .attr("height", 200)
      .attr("width", 35)
      .attr("x", margin.left - margin.right + (svgWidth / 20) * index)
      .on("mouseover", function() {
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      });

    var fRect = d3
      .select(groups[index])
      .append("rect")
      .attr("fill", "#29B6F6")
      .attr("height", data * 2)
      .attr("width", 35)
      .attr("x", margin.left - margin.right + (svgWidth / 20) * index)
      .on("mouseover", function() {
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      });
  });
}
function getAbsoluteChart(countInGender) {
  d3.selectAll("g").remove();
  d3.selectAll("rect").remove();
  d3.selectAll("text").remove();
  console.log("absolute");
  var groups = svg
    .selectAll("g")
    .data(countInGender)
    .enter()
    .append("g");

  groups.each((data, index, groups) => {
    var fRect = d3
      .select(groups[index])
      .append("rect")
      .attr("fill", "#EC407A")
      .attr("text", data => data.key)
      .attr("height", data.value.female)
      .attr("width", 35)
      //  .attr("x", 50 * index)
      .attr("x", margin.left - margin.right + (svgWidth / 20) * index)
      .attr("y", svgHeight - data.value.female);

    var mRect = d3
      .select(groups[index])
      .append("rect")
      .attr("fill", "#29B6F6")
      .attr("text", data => data.key)
      .attr("height", data.value.male)
      .attr("width", 35)
      .attr("x", margin.left - margin.right + (svgWidth / 20) * index)
      .attr("y", svgHeight - (data.value.female + data.value.male));
  });
}
