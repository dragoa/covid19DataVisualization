//Bubble plot
d3.csv("../assets/data/bubblechart/gdp_vaccination_data.csv").then(function (data) {
    // set the dimensions and margins of the graph
    const margin = { top: 20, right: 200, bottom: 70, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg5 = d3.select("#bubble")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    // Add X axis
    const heights = data.map(d => d.people_vaccinated_per_hundred)
    const x = d3.scaleLinear()
        .domain([0, Math.max(...heights)]).nice()
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
        .domain([0, Math.max(...co2_absorptions)]).nice()
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

    // Add a scale for bubble color
    const names = data.map(d => d.location)
    const names_uniq = [...new Set(names)];
    const names_ordered = names_uniq.sort((a, b) => a.localeCompare(b))
    // Set the color scale
    const colors = ["#dbdb8d", "#17becf", "#9edae5", "#5254a3", "#6b6ecf", "#9c9ede" ,"#f7b6d2", "#bcbd22", "#e377c2", "#393b79","#e7ba52", "#1f77b4", "#637939", "#8ca252","#2ca02c", "#b5cf6b", "#8c6d31", "#bd9e39", "#aec7e8", "#ff7f0e", "#ffbb78", "#98df8a",  "#ff9896", "#9467bd", "#c5b0d5","#d62728", "#8c564b", "#c49c94", "#7f7f7f"];
    const myColor = d3.scaleOrdinal().range(colors);

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
        // -3- Trigger the functions
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)

    var size = d3.scaleSqrt()
        .domain([0, Math.max(...canopy_covers)]).nice()
        .range([3, 35]);

    // Add legend: circles
    var valuesToShow = [Math.max(...canopy_covers) / 8, Math.max(...canopy_covers) / 2, Math.max(...canopy_covers)]
    var xCircle = 820
    var xLabel = 920
    var yCircle = 80
    svg5
        .selectAll("#bubble")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function (d) { return yCircle - size(d) })
        .attr("r", function (d) { return size(d) })
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg5
        .selectAll("#bubble")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr('x1', function (d) { return xCircle + size(d) })
        .attr('x2', xLabel - 50)
        .attr('y1', function (d) { return yCircle - size(d) })
        .attr('y2', function (d) { return yCircle - 1.5 * size(d) })
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg5
        .selectAll("#bubble")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr('x', xLabel - 50)
        .attr('y', function (d) { return yCircle - 1.5 * size(d) })
        .text(d => d + " (m^2)")
        .style("font-size", 15)
        .attr('alignment-baseline', 'center')

    // legend
    for (let i = 0; i < names_ordered.length; i++) {
        svg5.append("circle")
            .attr("cx", 800)
            .attr("cy", 100 + i * 18)
            .attr("r", 6)
            .style("fill", myColor(i))
        svg5.append("text")
            .attr("x", 820)
            .attr("y", 100 + i * 18)
            .text(names_ordered[i])
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    }
})

