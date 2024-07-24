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

    // create color scale
    const minEducation = d3.min(educationData, d => d.bachelorsOrHigher);
    const maxEducation = d3.max(educationData, d => d.bachelorsOrHigher);
    const colorScale = d3.scaleQuantize()
        .domain([minEducation, maxEducation])
        .range(d3.schemeGreens[8]);

    console.log(d3.schemeGreens[8]);
    console.log(minEducation);
    console.log(maxEducation);

    // create path generator
    const path = d3.geoPath();

    
    // draw counties
    svg.append("g")
        .selectAll("path")
        .data(counties.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => {
            const county = educationData.find(item => item.fips === d.id);
            return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.5")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationData.find(item => item.fips === d.id).bachelorsOrHigher)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    // add legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - legendWidth}, ${margin.top})`);

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(legendHeight)
        .tickFormat(d => `${d.toFixed(0)}%`)
        .ticks(8);

    legend.selectAll("rect")
        .data(d3.range(8))
        .enter()
        .append("rect")
        .attr("x", d => d * (legendWidth / 8))
        .attr("width", legendWidth / 8)
        .attr("height", legendHeight)
        .attr("fill", d => d3.schemeGreens[8][d]);

    legend.call(legendAxis)
        .select(".domain")
        .remove();



    // handle tooltip
    function handleMouseOver(event, d) {
        const county = educationData.find(item => item.fips === d.id);
        if(county) {
            tooltip.transition()
                .duration(0)
                .style("opacity", .8)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            tooltip.html(
                `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
            )
        }
    }

    function handleMouseOut(event, d) {
        tooltip.transition()
            .duration(0)
            .style("opacity", 0);
    }

    // add state borders
    const statesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
    d3.json(statesUrl).then((states) => {
        svg.append("path")
            .datum(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b))
            .attr("class", "states")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
    })
});