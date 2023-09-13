$(document).ready(function () {

    let features = ["people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "average_stringency_index", "average_containment_index"]
    let factor = ["location", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "average_stringency_index", "average_containment_index"];

    features.reverse()



    // Append years legend

    const legendColor = d3.select("#graph22")
        .append("svg")
        .attr("width", 1400)
        .attr("height", 100)
        .attr("margin", 0);

    // Load data
    d3.csv("../assets/data/radar/Radar2.csv").then(function (data) {
        // Inizitialization array all data
        let values = new Array()

        let locations = {
            "Finland" : 0,
            "Denmark" : 1,
            "Belgium" : 2,
            "Netherlands" : 3,
            "Ireland" : 4
        }

        // Create objects for each location in the values array
        for (const locationName in locations) {
            const index = locations[locationName];
            const valueObject = {};
            valueObject[factor[0]] = locationName; // Set the "location" property
            values[index] = valueObject; // Store the object in the values array
        }

        // Now, you can access and modify properties of objects in the values array
        console.log(values);

        k=1
        for (let i = 0; i < values.length; i++) {
            for (let k = 1; k < 5; k++)
                values[locations[data[i].location]][factor[k]] = data[i][factor[k]]
        }

        // SVG
        let svg = d3.select("#graph22").append("svg")
            .attr("width", 1024)
            .attr("height", 700);

        let radialScale = d3.scaleLinear()
            .domain([0, 200])
            .range([0, 450]);

        let ticks = [0,25,50,75];

        ticks.forEach(t =>
            svg.append("circle")
                .attr("cx", 300)
                .attr("cy", 300)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", radialScale(t))
        );

        ticks.forEach(t =>
            svg.append("text")
                .attr("x", 305)
                .attr("y", 300 - radialScale(t))
                .text(t.toString())
        );

        function angleToCoordinate(angle, value) {
            let x = Math.cos(angle) * radialScale(value);
            let y = Math.sin(angle) * radialScale(value);
            return { "x": 300 + x, "y": 300 - y };
        }

        for (var i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            let line_coordinate = angleToCoordinate(angle, 100);
            let label_coordinate = angleToCoordinate(angle, 100);

            // Draw axis line
            svg.append("line")
                .attr("x1", 300)
                .attr("y1", 300)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke", "black");

            // Draw axis label
            svg.append("text")
                .attr("x", label_coordinate.x - 10)
                .attr("y", label_coordinate.y)
                .text(ft_name);
        }

        let line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        let colors = ['#FF8000', '#CD0000', '#CDAD00', '#FF1493', '#228B22', '#9B30FF', '#00FFFF', '#0000FF'];

        function getPathCoordinates(data_point) {
            let coordinates = [];
            for (var i = 0; i < features.length; i++) {
                let ft_name = features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
                coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
            }

            // Add the first coordinate at the end to close the path
            coordinates.push(coordinates[0]);

            return coordinates;
        }


        const highlight = function (event, d) {
            d3.selectAll("path")
                .transition()
                .delay("100")
                .duration("10")
                .style("opacity", "0.1")
                .style("stroke-width", "1.3");

            const selection = d3.select(this).raise();
            selection.transition()
                .delay("100")
                .duration("10")
                .style("opacity", "1")
                .style("stroke-width", "4");
        }

        const doNotHighlight = function (event, d) {
            d3.selectAll("path")
                .transition()
                .delay("100")
                .duration("10")
                .style("opacity", "1")
                .style("stroke-width", "2.3");
        }

        for (var i = 0; i < values.length; i++) {
            let coordinates = getPathCoordinates(values[i]);
            // Draw the path element
            svg.append("path")
                .datum(coordinates)
                .attr("d", line)
                .attr("stroke-width", 2.3)
                .attr("stroke", colors[i])
                .attr("fill", "none")
                .attr("opacity", 1)
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight)
            //Bottom years legend

            if (i % 2 == 0) {
                legendColor.append("text").attr("x", 340 + i * 100).attr("y", 15).text(Object.keys(locations)[i]).style("font-size", "20px").attr("alignment-baseline", "middle")
                legendColor.append('rect').attr('x', 300 + i * 100).attr('y', 12).attr('fill', colors[i]).attr('width', 30).attr('height', 6)
            }

            else {
                legendColor.append("text").attr("x", 340 + (i - 1) * 100).attr("y", 52).text(Object.keys(locations)[i]).style("font-size", "20px").attr("alignment-baseline", "middle")
                legendColor.append('rect').attr('x', 300 + (i - 1) * 100).attr('y', 47).attr('fill', colors[i]).attr('width', 30).attr('height', 6)
            }
        }
    })
})