function drawBarplot (id, dataset) {
    // Clear the previous graph elements
    d3.select(id).selectAll("svg").remove();

// set the dimensions and margins of the graph
    const margin = {top: 100, right: 40, bottom: 170, left: 150},
        width = 1400 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
    const svg = d3.select(id)
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
    d3.csv(dataset).then(function (data) {

        // List of subgroups = header of the csv files = soil condition here
        const subgroups = data.columns.slice(1)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        const groups = data.map(d => (d.location))

        // Add Y axis
        const y = d3.scaleBand()
            .domain(groups)
            .range([height, 0])
            .padding(0.2);

        svg.append("g")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans")
            .style("font-size", "15px")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 200])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans")
            .style("font-size", "11px")
            .call(d3.axisBottom(x));

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#377eb8','#4daf4a'])

        const greyOut = function (){
            // Grey out the rest
            svg.selectAll(".rect_average_stringency_index")
                .style("fill", "lightgrey")
                .style("opacity", 0.5);

            svg.selectAll(".rect_average_containment_index")
                .style("fill", "lightgrey")
                .style("opacity", 0.5);
        }

        const doNotHighlight = function(){
            svg.selectAll(".rect_average_stringency_index")
                .style("fill", color("average_stringency_index"))
                .style("opacity",1);

            svg.selectAll(".rect_average_containment_index")
                .style("fill", color("average_containment_index"))
                .style("opacity", 1);
        }

        //stack the data? --> stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)
            (data)

        // Add X axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", height + margin.bottom - 120)
            .text("Accumulated percentage of both indices")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        // Add Y axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left +30)
            .text("1st WAVE : Top 5 countries ")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top+35)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("1st WAVE STACKED BARS 1: Top 5 countries of the first Covid-19 wave with their correspondent accumulated percentages of the ")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top+65)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(" average of the stringency and containment indexes against Covid-19")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .attr("id", function (d) { return "rect_" + d.key; })
            .attr("class", "rect")
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
            .attr("class", function () {return this.parentNode.id})
            .attr("y", d => y(d.data.location))
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("height", y.bandwidth())
            .on("mouseover", function() {
                greyOut()
                // Highlight the corresponding line
                svg.selectAll("."+this.parentNode.id)
                    .style("opacity", 1)
                    .style("fill", color(this.parentNode.id.split("_")[1]+"_"+this.parentNode.id.split("_")[2]+"_"+this.parentNode.id.split("_")[3]));
            })
            .on("mouseout", doNotHighlight)

        const legend = svg.selectAll(".legend")
            .data(stackedData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(" + (margin.right+50) + "," + (height+i * 25+75) +  ")"; });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 40)
            .attr("height", 20)
            .attr("class",function (d) { return "rect_" + d.key; })
            .style("fill", d => color(d.key))

        // Draw legend text and values
        legend.append("text")
            .attr("x", +50)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "left")
            .text(function (d) { return "percentage " + d.key.split("_")[0]+" "+d.key.split("_")[1]+" "+d.key.split("_")[2]; })
            .attr("class",function (d) { return "rect_" + d.key; })
            .style("fill", d => color(d.key))
    })
}

drawBarplot("#barplot1", "./assets/data/barplot/average_1.csv")

function handlePaymentChange2(event) {
    const wave = event.target.id

    if(wave === "flexRadio1")
        drawBarplot("#barplot1", "/assets/data/barplot/average_1.csv")
    else if(wave === "flexRadio2")
        drawBarplot("#barplot1", "/assets/data/barplot/average_2.csv")
    else if(wave === "flexRadio3")
        drawBarplot("#barplot1", "/assets/data/barplot/average_3.csv")
    else
        drawBarplot("#barplot1", "/assets/data/barplot/average_1.csv")
}
