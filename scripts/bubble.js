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
    // console.log(dataGroup)
    // Years array
    let countries = [];

    for (let i = 0; i < dataGroup.size; i++) {
        countries[i] = Array.from(dataGroup)[i][0]
    }

    const greyOut = function (){
        // Grey out the rest
        svg5.selectAll(".bubble")
            .style("fill", "lightgrey")
            .style("opacity", 0.5)
        svg5.selectAll(".rect")
            .style("stroke-width", "1px")
            .style("fill", "lightgrey")
            .style("opacity", 0.5);
        svg5.selectAll(".leg")
            .style("stroke-width", "0.1px")
            .style("fill", "lightgrey")
            .style("opacity", 0.5);
    }

    const doNotHighlight = function (){
        for (let i = 0; i < dataGroup.size; i++){
            svg5.select("." + countries[i])
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("fill", function () {
                    return myColor(countries[i]);
                });

            svg5.select("#rect_"+ countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "1px")
                .style("opacity", 1)
                .style("fill", myColor(countries[i]));

            svg5.select("#leg_"+ countries[i])
                .transition()
                .duration(200)
                .style("stroke-width", "0.25px")
                .style("opacity", 1)
                .style("fill", myColor(countries[i]));
        }
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
    const gdpPerCapita = data.map(d => d.gdp_per_capita)
    const z = d3.scaleLinear()
        .domain([0, Math.max(...gdpPerCapita)]).nice()
        .range([3, 35]);

    // Nest the entries by location
    const dataNest = Array.from(dataGroup)
        .filter(([key, values]) => key !== undefined)
        .map(([key, values]) => ({ key, values }));

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

    // Loop through each location / key
    dataNest.forEach(function (d) {
        // Set the color property for this object
        let selected_country = d.key;
        d.color = myColor(d.key);

        // Add dots
        svg5.append('g')
            .selectAll("dot")
            .data(d.values) // Use the values associated with the current key
            .join("circle")
            .attr("class", function () { return "bubble " + selected_country })
            .attr("cx", d => x(d.people_vaccinated_per_hundred))
            .attr("cy", d => y(d.people_fully_vaccinated_per_hundred))
            .attr("r", d => z(d.gdp_per_capita))
            .style("fill", function(d) { return myColor(d.location) })
            .style("opacity", 1)
            .attr("stroke", "none")
            .on("mouseover", function (event, d) {
                greyOut()

                svg5.select(".bubble." + selected_country)
                    .style("opacity", 1)
                    .style("fill", myColor(selected_country));
                svg5.select("#rect_"+selected_country)
                    .style("stroke-width", "3px")
                    .style("opacity", 1)
                    .style("fill", myColor(selected_country));

                svg5.select("#leg_"+selected_country)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", myColor(selected_country));

                showTooltip(event, d);
                d3.select(this).attr("stroke", "black");
            })
            .on("mouseout", doNotHighlight)
            .on("mousemove", moveTooltip)
            .on("mouseleave", function (event, d) {
                hideTooltip(event, d);
                d3.select(this).attr("stroke", "none");
            });
    });


    // Sort dataNest by total number of new deaths in descending order
    dataNest.sort(function (a, b) {
        const gdpA = a.gdp_per_capita;
        const gdpB = b.gdp_per_capita;
        return d3.descending(gdpA, gdpB);
    });

    // Add the legend
    const legend = svg5.selectAll(".legend")
        .data(dataNest)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(" + (width + 100) + "," + (-70+i * 25) +  ")"; });

    // Draw legend colored rectangles
    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("class","rect")
        .attr("id", function (d) { return "rect_" + d.key; })
        .style("fill", function (d) { return d.color; })
        .on("mouseover", function () {
            // Get the id of the rect element
            let rectId = this.id.split("_")[1];
            greyOut()

            // Highlight the corresponding line
            svg5.select(".bubble."+rectId)
                .style("opacity", 1)
                .style("fill", myColor(rectId));

            svg5.select("#rect_"+rectId)
                .style("stroke-width", "3px")
                .style("opacity", 1)
                .style("fill", myColor(rectId));

            svg5.select("#leg_"+rectId)
                .style("stroke-width", "1px")
                .style("opacity", 1)
                .style("fill", myColor(rectId));
        })
        .on("mouseout", doNotHighlight);

    // Draw legend text and values
    legend.append("text")
        .attr("x", -6)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d.key; })
        .attr("class","leg")
        .attr("id", function (d) { return "leg_" + d.key; })
        .style("fill", function (d) { return d.color; })
        .on("mouseover", function () {
            // Get the id of the rect element
            let legId = this.id.split("_")[1];
            greyOut()

            // Highlight the corresponding line
            svg5.select(".bubble."+legId)
                .style("opacity", 1)
                .style("fill", myColor(legId));
            svg5.select("#rect_"+legId)
                .style("stroke-width", "3px")
                .style("opacity", 1)
                .style("fill", myColor(legId));

            svg5.select("#leg_"+legId)
                .style("stroke-width", "1px")
                .style("opacity", 1)
                .style("fill", myColor(legId));
        })
        .on("mouseout", doNotHighlight);














    /*
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
        .attr("stroke", "black");*/
})