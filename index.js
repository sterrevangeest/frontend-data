console.log("Lets go 👩‍💻!");

var startYear = 1990;

// SVG ELEMENT
var svg = d3.select("svg");
var svgWidth = 800;
var svgHeight = 400;
var barPadding = 3;

// MARGINS
//var margin = { top: 48, right: 72, bottom: 120, left: 72 };

var causes = ["female", "male", "noGender"];

//LOAD DATA
d3.json("data/allData.json")
  .then(data => {
    var data = data.filter(selectedYears);
    var valueInYears = getYears(data);
    var barWidth = svgWidth / valueInYears.length;

    //DEFINE AXES
    var x = d3
      .scaleBand()
      .domain(valueInYears.map(d => d.key))
      .range([0, svgWidth]);

    var y = d3
      .scaleLinear()
      .domain([100, 0])
      .range([0, 100]);

    //PLACE AXES
    var xAxis = g =>
      g
        .attr("transform", `translate(0,300)`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove());

    var yAxis = g =>
      g
        .attr("transform", `translate(0,199)`)
        .call(d3.axisLeft(y).ticks(5, "s"));
    //.call(g => g.selectAll(".domain").remove());

    //DRAW SVG
    var svg = d3
      .select("svg")
      .attr("class", "bar-chart")
      .style("overflow", "visible");
    svg
      .selectAll("rect")
      .data(valueInYears)
      .enter()
      .append("rect")
      .attr("y", data => 300 - data.value)

      .attr("height", data => data.value)
      .attr("width", barWidth - barPadding)
      .attr("text", data => data.key)
      .attr("transform", (d, i) => {
        var translate = [barWidth * i, 0];
        return "translate(" + translate + ")";
      });

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);
  })
  .catch(err => console.error(err)); // error

//FUNCTIONS
function selectedYears(data) {
  return data.publicationYear > startYear;
}

function getYears(data) {
  var valueInYears = d3
    .nest()
    .key(data => data.publicationYear)
    //.key(data => data.gender)
    .rollup(v => v.length)
    .entries(data)
    .sort((a, b) => a.key - b.key)
    .filter(d => d.key != "noPublicationYear");
  console.log(valueInYears);

  return valueInYears;
}
