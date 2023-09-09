import("./d3.v7.js")

//Bubble plot
d3.csv("../assets/data/bubblechart/gdp_vaccination_data.csv").then(function (data) {
    // set the dimensions and margins of the graph
    const margin = { top: 50, right: 230, bottom: 70, left: 80 },
        width = 1300 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    data.forEach((d) => {
        // Convert to thousands
        d.gdp_per_capita = (d.gdp_per_capita/1000).toFixed(2);
    });

    const dataGroup = d3.group(data, d => d.location);
    console.log(dataGroup)
    // Years array
    let countries = [];
    for (let i = 0; i < dataGroup.size; i++) {
        countries[i] = Array.from(dataGroup)[i][0]
    }

    // append the svg object to the body of the page
    const svg5 = d3.select("#bubble")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg5.append("text")
        .attr("x", width/2 - 32)
        .attr("y", -margin.top+20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(`Bubble chart: Comparison between people vaccinated per hundred and people fully vaccinated per hundred and countries GDP`)
        .style("font-weight", "bold")
        .style("font-family", "Fira Sans");

    // Add X axis
    const heights = data.map(d => d.people_vaccinated_per_hundred)
    const x = d3.scaleLinear()
        .domain([0,100]).nice()
        .range([0, width]);
    svg5.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    svg5.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text("People vaccinated per hundred");

    // Add Y axis
    const co2_absorptions = data.map(d => d.people_fully_vaccinated_per_hundred)
    const y = d3.scaleLinear()
        .domain([0, 100]).nice()
        .range([height, 0]);
    svg5.append("g")
        .call(d3.axisLeft(y));
    svg5.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("People fully vaccinated per hundred");

    // Add a scale for bubble size
    const canopy_covers = data.map(d => d.gdp_per_capita)
    const z = d3.scaleLinear()
        .domain([0, Math.max(...canopy_covers)]).nice()
        .range([3, 35]);

    // Nest the entries by location
    const dataNest = Array.from(dataGroup)
        .filter(([key, values]) => key !== undefined)
        .map(([key, values]) => ({ key, values }));

    // Add a scale for bubble color
    let names = data.map(d => d.location)
    // Set the color scale
    const colors = ["#dbdb8d", "#17becf", "#9edae5", "#5254a3", "#6b6ecf", "#9c9ede" ,"#f7b6d2", "#bcbd22", "#e377c2", "#393b79","#e7ba52", "#1f77b4", "#637939", "#8ca252","#2ca02c", "#b5cf6b", "#8c6d31", "#bd9e39", "#aec7e8", "#ff7f0e", "#ffbb78", "#98df8a",  "#ff9896", "#9467bd", "#c5b0d5","#d62728", "#8c564b", "#c49c94", "#7f7f7f"];
    const myColor = d3.scaleOrdinal().range(colors);

    const greyOut = function (){
        // Grey out the rest
        svg.selectAll(".line")
            .style("stroke-width", "1px")
            .style("stroke", "lightgrey")
            .style("opacity", 0.5)
        svg.selectAll(".rect")
            .style("stroke-width", "1px")
            .style("fill", "lightgrey")
            .style("opacity", 0.5);
        svg.selectAll(".leg")
            .style("stroke-width", "0.1px")
            .style("fill", "lightgrey")
            .style("opacity", 0.5);
        svg.selectAll(".totDeaths")
            .style("stroke-width", "0.1px")
            .style("fill", "lightgrey")
            .style("opacity", 0.5);
    }

    const doNotHighlight = function (){
        for (let i = 0; i < dataGroup.size; i++){
            svg.select("." + countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "1px")
                .style("opacity", 1)
                .style("stroke", function () {
                    return color(countries[i]);
                });

            svg.select("#rect_"+ countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "1px")
                .style("opacity", 1)
                .style("fill", color(countries[i]));

            svg.select("#leg_"+ countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "0.25px")
                .style("opacity", 1)
                .style("fill", color(countries[i]));

            svg.select("#totDeaths_"+ countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "0.25px")
                .style("opacity", 1)
                .style("fill", "black");
        }
    }

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.7)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    const showTooltip = function (event, d) {

        tooltip.html("State: " + d.location +
            "<br>GDP per capita: " + d.gdp_per_capita +
            "<br>Vaccinated per hundred: " + d.people_vaccinated_per_hundred +
            "<br>Fully vaccinated per hundred: " + d.people_fully_vaccinated_per_hundred)
            .style("visibility", "visible");
    }
    const moveTooltip = function (event, d) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    }
    const hideTooltip = function (event, d) {
        tooltip.html(``).style("visibility", "hidden");
    }

    // Loop through each location / key
    dataNest.forEach(function (d) {
        // Set the color property for this object

        let selected_country = d.key;
        d.color = color(d.key);

        // Add dots
        svg5.append('g')
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("class", "bubbles")
            .attr("cx", d => x(d.people_vaccinated_per_hundred))
            .attr("cy", d => y(d.people_fully_vaccinated_per_hundred))
            .attr("r", d => z(d.gdp_per_capita))
            .style("fill", d => myColor(d.location))
            .attr("stroke", "none") // Add this line to set the default stroke to none
            // -3- Trigger the functions
            .on("mouseover", function (event, d) {
                showTooltip(event, d);
                d3.select(this).attr("stroke", "black"); // Add this line to set the stroke to black on hover
            })
            .on("mousemove", moveTooltip)
            .on("mouseleave", function (event, d) {
                hideTooltip(event, d);
                d3.select(this).attr("stroke", "none"); // Add this line to reset the stroke to none on mouse leave
            });

        // Add legend for color
        svg5.append("g")
            .attr("class", "legendColor")
            .attr("transform", "translate(1050, -20)")
            .style("text-anchor", "start")
            .style("font-size", "14px");

        var legendColor = d3.legendColor()
            .scale(myColor)
            .shapePadding(8)
            .shapeWidth(15)
            .shapeHeight(15)
            .labelOffset(6);

        svg5.select(".legendColor")
            .call(legendColor);

        // Add legend for size
        svg5.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(90, 10)")

        var legendSize = d3.legendSize()
            .scale(z)
            .shape('circle')
            .shapePadding(0)
            .labelAlign('end')
            .orient('vertical')
            .labels(d3.legendHelpers.thresholdLabels)
            .labelFormat(d3.format(".1s"));

        svg5.select(".legendSize")
            .call(legendSize)
            .selectAll("circle")
            .attr("fill", "#f8f9fa")
            .attr("stroke", "black");
    })
})
