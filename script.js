const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const usCountyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// set dimensions
const width = 960,
    height = 600,
    margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    };

    
// create svg
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// create title
const title = d3.select(".container")
    .insert("h1", ":first-child")
    .attr("id", "title")
    .text("United States Educational Attainment");

// create description
const description = d3.select(".container")
    .insert("div", ":nth-child(2)")
    .attr("id", "description")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

// create tooltip
const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

// load data
Promise.all([
    d3.json(educationDataUrl), d3.json(usCountyDataUrl)
]).then(([educationData, usData]) => {
    
    // process data
    const counties = topojson.feature(usData, usData.objects.counties);

    // create path generator
    const path = d3.geoPath();

    // draw counties
    const usCounties = svg.append("g")
        .selectAll("path")
        .data(counties.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d=>{
            const county= educationData.find(item =>item.fips === d.id);
            return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.5")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationData.find(item => item.fips === d.id).bachelorsOrHigher);

    // add legend
    
});