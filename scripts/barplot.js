function drawBarplot(id, dataset, wave) {

    d3.select(id).selectAll("svg").remove();

    // Set the dimensions and margins of the graph
    const margin = { top: 50, right: 30, bottom: 70, left: 80 },
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create a box for the SVG graph with specified margins and dimensions
    const svg = d3.select(id)
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top+35)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(`${wave} wave barplot: Comparison between people vaccinated per hundred and people fully vaccinated per hundred`)
        .style("font-weight", "bold")
        .style("font-family", "Fira Sans");

    // Get the data
    d3.csv(dataset).then(function (data) {

        // List of subgroups = header of the csv files = soil condition here
        const subgroups = data.columns.slice(1)
        // List of groups = species here = value of the first column called group -> I show them on the Y axis
        const groups = data.map(d => d.location)

        // Add Y axis
        const y = d3.scaleBand()
            .domain(groups)
            .range([0, height])
            .padding([0.2])
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(5))
            .style("font-size", "12px");

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Another scale for subgroup position?
        const ySubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, y.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#037971', '#023436'])

        // add tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("padding", "15px")
            .style("background", "rgba(0,0,0,0.6)")
            .style("border-radius", "5px")
            .style("color", "#fff")
            .text("a simple tooltip");

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(data)
            .join("g")
            .attr("transform", d => `translate(0, ${y(d.location)})`)
            .selectAll("rect")
            .data(function (d) {
                return subgroups.map(function (key) {
                    return {key: key, value: d[key]};
                });
            })
            .join("rect")
            .attr("x", 0)
            .attr("y", d => ySubgroup(d.key))
            .attr("width", d => x(d.value))
            .attr("height", ySubgroup.bandwidth())
            .attr("fill", d => color(d.key))
            .on("mouseover", function (d, i) {
                tooltip.html(`${i.key.replace(/_/g, ' ')} : ${Math.round(i.value * 100) / 100}`)
                    .style("visibility", "visible");
                d3.select(this).attr("fill", "#ffb17a");
            })
            // move tooltip on move
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            // on mouseout: blue bar and hide tooltip
            .on("mouseout", function () {
                tooltip.html(``).style("visibility", "hidden");
                d3.select(this).attr("fill", d => color(d.key));
            })
            .attr("width", 0)
            .transition()
            .delay(function (d, i) {
                return i * 50;
            })
            .duration(1000)
            .attr("width", d => x(d.value));

        // add grid
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickSize(-height)
                .tickFormat("") // no further label
            );

        // add horizontal axis title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", (width / 2) + 50)
            .attr("y", height + 50)
            .text("Percentage of vaccinated people");
    });
}

drawBarplot("#barplot2", "assets/data/vaccine/pop_vaccinated_2.csv", "2nd")

function handlePaymentChange3(event) {
    const wave = event.target.id

    if(wave === "flexRadio4")
        drawBarplot("#barplot2", "assets/data/vaccine/pop_vaccinated_2.csv", "2nd")
    else if(wave === "flexRadio5")
        drawBarplot("#barplot2", "assets/data/vaccine/pop_vaccinated_3.csv", "3rd")
    else
        drawBarplot("#barplot2", "assets/data/vaccine/pop_vaccinated_2.csv", "2nd")
}