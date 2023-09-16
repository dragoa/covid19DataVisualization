function drawGraph (id, dataset, deathOptionValue, wave) {
    // Clear the previous graph elements
    d3.select(id).selectAll("svg").remove();

    //console.log(dataset)
    // Set the dimensions of the canvas / graph
    const margin = { top: 100, right: 150, bottom: 50, left: 70 },
        width = 1400 - margin.left - margin.right,
        height = 740 - margin.top - margin.bottom;

    // Parse the date / time
    const parseTime = d3.timeParse("%Y-%m-%d");

    // Set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Define the line
    const valueline = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d[deathOptionValue]); });

    // Adds the svg canvas
    const svg = d3.select(id)
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right+100} ${height + margin.top + margin.bottom+100}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + (margin.top + 50) + ")");

    const tooltip = d3.select(id)
        .append("div")
        .attr("class", "tooltip1 fade-in")
        .style("display", "none");

    // Get the data
    d3.csv(dataset).then(function (data) {

        //console.log(data)
        const dataGroup = d3.group(data, d => d.location);

        // Years array
        let countries = [];

        for (let i = 0; i < dataGroup.size; i++) {
            countries[i] = Array.from(dataGroup)[i][0]
        }

        // format the data
        data.forEach(function (d) {
            d.date = parseTime(d.date);
            d[deathOptionValue] = +d[deathOptionValue];
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, d3.max(data, function (d) { return d[deathOptionValue]; })]);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        let date = ""
        if(wave === "1st")
            date = "15/02/2020 and 20/07/2020"
        else if(wave === "2nd")
            date = "20/07/2020 and 10/07/2021"
        else if(wave === "3rd")
            date = "10/07/2021 and 16/02/2023"


        // Add X axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", height + margin.bottom - 10)
            .text(`Date between ${date}`)
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        // Add Y axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left +30)
            .text(`${deathOptionValue.replace(/_/g, ' ')}`)
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top+30 / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`${wave} wave: ${deathOptionValue.replace(/_/g, ' ')} due to Covid-19 in the European Union's countries`)
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        // Nest the entries by location
        const dataNest = Array.from(dataGroup)
            .filter(([key, values]) => key !== undefined)
            .map(([key, values]) => ({ key, values }));

        // Set the color scale
        const colors = ["#dbdb8d", "#17becf", "#9edae5", "#5254a3", "#6b6ecf", "#9c9ede" ,"#f7b6d2", "#bcbd22", "#e377c2", "#393b79","#e7ba52", "#1f77b4", "#637939", "#8ca252","#2ca02c", "#b5cf6b", "#8c6d31", "#bd9e39", "#aec7e8", "#ff7f0e", "#ffbb78", "#98df8a",  "#ff9896", "#9467bd", "#c5b0d5","#d62728", "#8c564b", "#c49c94", "#7f7f7f"];
        const color = d3.scaleOrdinal().range(colors);

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

        // Loop through each location / key
        dataNest.forEach(function (d) {
            // Set the color property for this object

            let selected_country = d.key;
            d.color = color(d.key);

            svg.append("path")
                .attr("class", function () { return "line "+selected_country })
                .style("stroke", d.color)
                .attr("d", valueline(d.values))
                .attr("fill", "none")
                // Add mouseover and mouseleave events
                .on("mouseover",function(){
                    greyOut()
                    // Highlight the current line, the legend
                    svg.select(".line."+selected_country)
                        .style("stroke-width", "3px")
                        .style("opacity", 1)
                        .style("stroke", color(selected_country));
                    svg.select("#rect_"+selected_country)
                        .style("stroke-width", "3px")
                        .style("opacity", 1)
                        .style("fill", color(selected_country));

                    svg.select("#leg_"+selected_country)
                        .style("stroke-width", "1px")
                        .style("opacity", 1)
                        .style("fill", color(selected_country));

                    svg.select("#totDeaths_"+selected_country)
                        .style("stroke-width", "1px")
                        .style("opacity", 1)
                        .style("fill", color(selected_country));

                })
                .on("mouseleave", doNotHighlight);

        });

        // Sort dataNest by total number of new deaths in descending order
        dataNest.sort(function (a, b) {
            const totalDeathsA = d3.sum(a.values, function (d) { return d[deathOptionValue]; });
            const totalDeathsB = d3.sum(b.values, function (d) { return d[deathOptionValue]; });
            return d3.descending(totalDeathsA, totalDeathsB);
        });

        function getDataForDate(date) {
            return data.filter(function(d) {
                return d.date.getTime() === date.getTime();
            });
        }

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d[deathOptionValue]); })
            .attr("r", 5)
            .style("opacity", 0)
            .style("fill", function(d) { return color(d.location); })
            .on("mouseover", function(event,d) {
                // Highlight all circles with the same date
                d3.selectAll(".dot")
                    .filter(function(e) {
                        return d3.timeDay.count(d.date, e.date) === 0;
                    })
                    .style("opacity", 1);

                // Get data for the selected date and sort by deaths in descending order
                const dataForDate = getDataForDate(d.date);
                dataForDate.sort((a, b) => b[deathOptionValue] - a[deathOptionValue]);

                // Generate HTML for the tooltip
                const html = "<div>Date: " + d3.timeFormat("%d-%m-%Y")(d.date)+"<br><br>" + "</div>" +
                    dataForDate.map(d => "<div>" + d.location + ": " + (Number(d[deathOptionValue]) % 1 === 0 ? d[deathOptionValue] : parseFloat(d[deathOptionValue]).toFixed(2)) + "</div>").join("");

                tooltip.style("display", "block")
                    .style('left', `${event.x+50}px`)
                    .style('top', `${event.y-200}px`)
                    .style('font-size','14px')
                    .html(html);
            })
            .on("mouseout", function() {
                d3.selectAll(".dot").style("opacity", 0)
                tooltip.style("display", "none")
                    .html("");
            });

        // Add the legend
        const legend = svg.selectAll(".legend")
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
                svg.select(".line."+rectId)
                    .style("stroke-width", "3px")
                    .style("opacity", 1)
                    .style("stroke", color(rectId));

                svg.select("#rect_"+rectId)
                    .style("stroke-width", "3px")
                    .style("opacity", 1)
                    .style("fill", color(rectId));

                svg.select("#leg_"+rectId)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", color(rectId));

                svg.select("#totDeaths_"+rectId)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", color(rectId));

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
                svg.select(".line."+legId)
                    .style("stroke-width", "3px")
                    .style("opacity", 1)
                    .style("stroke", color(legId));
                svg.select("#rect_"+legId)
                    .style("stroke-width", "3px")
                    .style("opacity", 1)
                    .style("fill", color(legId));

                svg.select("#leg_"+legId)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", color(legId));

                svg.select("#totDeaths_"+legId)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", color(legId));
            })
            .on("mouseout", doNotHighlight);

        const sumCountries = function (selected_country){
            const sumTot = Array.from(dataGroup.keys()).map((Country) => {
                const summedData = {
                    Country,
                    total_deaths: d3.sum(dataGroup.get(Country), d => d[deathOptionValue])
                };
                return summedData
            });
            return sumTot.filter(d => d.Country === selected_country);
        }

        legend.append("text")
            .attr("x", 30)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("class", "totDeaths")
            .attr("id", function (d) { return "totDeaths_" + d.key; })
            .style("text-anchor", "start")
            .text(function (d) {
                const selected_country = d.key;
                const selectCountry = sumCountries(selected_country);
                const total_deaths = selectCountry.length > 0 ? selectCountry[0].total_deaths : 0;
                return total_deaths.toFixed(2);
            })

        // Add text to the top of the legend
        svg.append("text")
            .attr("class", "legend-title")
            .attr("x", width+127)
            .attr("y", -margin.top + 20)
            .style("text-anchor", "start")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Total Deaths");

        svg.append("text")
            .attr("class", "legend-title")
            .attr("x", width+50)
            .attr("y", -margin.top + 20)
            .style("text-anchor", "start")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Countries");
    });
}

drawGraph("#graph1", "/assets/data/linechart/graph1_1.csv", "new_deaths", "1st")
drawGraph("#graph2", "/assets/data/linechart/graph2_1.csv", "new_deaths", "2nd")
drawGraph("#graph3", "/assets/data/linechart/graph3_1.csv", "new_deaths", "3rd")

function handlePaymentChange1(event) {
    const wave = event.target.id
    const deathOptionValue = event.target.value;

    //console.log(deathOptionValue)

    if(wave === "wave1")
        if(deathOptionValue === "new_deaths")
            drawGraph("#graph1", "/assets/data/linechart/graph1_1.csv", deathOptionValue, "1st")
        else if(deathOptionValue === "new_deaths_density")
            drawGraph("#graph1", "/assets/data/linechart/graph1_2.csv", deathOptionValue, "1st")
        else if(deathOptionValue === "new_deaths_per_million")
            drawGraph("#graph1", "/assets/data/linechart/graph1_3.csv", deathOptionValue, "1st")
        else
            drawGraph("#graph1", "/assets/data/linechart/graph1_1.csv", "new_deaths", "1st")
    else if(wave === "wave2")
        if(deathOptionValue === "new_deaths")
            drawGraph("#graph2", "/assets/data/linechart/graph2_1.csv", deathOptionValue, "2nd")
        else if(deathOptionValue === "new_deaths_density")
            drawGraph("#graph2", "/assets/data/linechart/graph2_2.csv", deathOptionValue, "2nd")
        else if(deathOptionValue === "new_deaths_per_million")
            drawGraph("#graph2", "/assets/data/linechart/graph2_3.csv", deathOptionValue, "2nd")
        else
            drawGraph("#graph2", "/assets/data/linechart/graph2_1.csv", "new_deaths", "2nd")
    else if(wave === "wave3")
        if(deathOptionValue === "new_deaths")
            drawGraph("#graph3", "/assets/data/linechart/graph3_1.csv", deathOptionValue, "3rd")
        else if(deathOptionValue === "new_deaths_density")
            drawGraph("#graph3", "/assets/data/linechart/graph3_2.csv", deathOptionValue, "3rd")
        else if(deathOptionValue === "new_deaths_per_million")
            drawGraph("#graph3", "/assets/data/linechart/graph3_3.csv", deathOptionValue, "3rd")
        else
            drawGraph("#graph3", "/assets/data/linechart/graph3_1.csv", "new_deaths", "3rd")
}