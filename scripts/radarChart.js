function RadarChart(id, data, gdpData, options, wave) {
    const colors = ["#dbdb8d", "#17becf", "#9edae5", "#5254a3", "#6b6ecf", "#9c9ede" ,"#f7b6d2", "#bcbd22", "#e377c2", "#393b79","#e7ba52", "#1f77b4", "#637939", "#8ca252","#2ca02c", "#b5cf6b", "#8c6d31", "#bd9e39", "#aec7e8", "#ff7f0e", "#ffbb78", "#98df8a",  "#ff9896", "#9467bd", "#c5b0d5","#d62728", "#8c564b", "#c49c94", "#7f7f7f"];
    const colorScale = d3.scale.ordinal().range(colors);
    var cfg = {
        w: 600,				//Width of the circle
        h: 600,				//Height of the circle
        margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins around the circle
        legendPosition: {x: 20, y: 20}, // the position of the legend, from the top-left corner of the svg
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 0, 				//What is the value that the biggest circle will represent
        labelFactor: 1.25, 			//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 			//The number of pixels after which a label needs to be given a new line
        opacityArea: 0, 			//The opacity of the area of the blob
        dotRadius: 4, 				//The size of the colored circles of each blog
        opacityCircles: 0, 			//The opacity of the circles of each blob
        strokeWidth: 2, 			//The width of the stroke around each blob
        roundStrokes: false,			//If true the area and stroke will follow a round path (cardinal-closed)
        color:colorScale,		//Color function
        axisName: "axis",
        areaName:"areaName",
        value: "value",
        sortAreas: true,
    };

    //Put all of the options into a variable called cfg
    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }//for i
    }//if

    //Map the fields specified in the configuration
    // to the axis and value variables
    var axisName = cfg["axisName"],
        areaName = cfg["areaName"],
        value = cfg["value"];

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){
        return d3.max(i.map(
            function(o){ return o[value]; }
        ))
    }));

    var allAxis = (data[0].map(function(d, i){ return d[axisName] })),	//Names of each axis
        total = allAxis.length,					//The number of different axes
        radius = Math.min(cfg.w/2, cfg.h/2), 			//Radius of the outermost circle
        Format = d3.format(".2s"),			 	//Percentage formatting
        angleSlice = Math.PI * 2 / total;			//The width in radians of each "slice"

    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, maxValue]);

    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();

    //Initiate the radar chart SVG
    var svg = d3.select(id).append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("class", "radar"+id);
    //Append a g element
    var g = svg.append("g")
        .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

    // Add X axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .attr("x", width/2 + 180)
        .attr("y", margin.bottom)
        .text(`${wave} wave RADAR CHART: All factors in play`)
        .style("transform", "translate(0, -330px)")
        .style("font-weight", "bold")
        .style("font-family", "Fira Sans");

    //Set up the small tooltip for when you hover over a circle
    const tooltip = d3.select(id)
        .append("div")
        .attr("class", "tooltip1 fade-in")
        .style("display", "none");

    //Filter for the outside glow
    var filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

    // Draw the Circular grid
    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    //Draw the background circles
    axisGrid.selectAll(".levels")
        .data(d3.range(1,(cfg.levels+1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function(d, i){return radius/cfg.levels*d;})
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter" , "url(#glow)");

    //Text indicating at what % each level is
    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1,(cfg.levels+1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", function(d){return -d*radius/cfg.levels;})
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

    // Draw the axes

    //Create the straight lines radiating outward from the center
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line")
        .style("stroke", "#CCC")
        .style("stroke-width", "2px");

    //Append the labels at each axis
    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "9px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.4em")
        .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d})
        .call(wrap, cfg.wrapWidth);

    // Draw the radar chart blobs
    var radarLine = d3.svg.line.radial()
        .interpolate("linear-closed")
        .radius(function(d) { return rScale(d[value]); })
        .angle(function(d,i) {	return i*angleSlice; });

    if(cfg.roundStrokes) {
        radarLine.interpolate("cardinal-closed");
    }

    //Create a wrapper for the blobs
    var blobWrapper = g.selectAll(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");

    //Append the backgrounds
    blobWrapper
        .append("path")
        .attr("class", function(d) {
            return "radarArea" + " " + d[0][areaName].replace(/\s+/g, '') //Remove spaces from the areaName string to make one valid class name
        })
        .attr("d", function(d,i) { return radarLine(d); })
        .style("fill", function(d,i) { return cfg.color(i); })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d,i){
            //Dim all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0);
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        })
        .on('mouseout', function(){
            //Bring back all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });

    //Create the outlines
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d,i) { return cfg.color(i); })
        .style("fill", "none")
        .style("filter" , "url(#glow)");

    //Append the circles
    blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function(d,i){ return rScale(d[value]) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d[value]) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", function(d,i,j) { return cfg.color(j); })
        .style("fill-opacity", 0.8);

    // Append invisible circles for tooltip
    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

    // Append a set of invisible circles on top for the mouseover pop-up
blobCircleWrapper.selectAll(".radarInvisibleCircle")
.data(function(d, i) { return d; })
.enter().append("circle")
.attr("class", "radarInvisibleCircle")
.attr("r", cfg.dotRadius * 1.5)
.attr("cx", function(d, i) { return rScale(d[value]) * Math.cos(angleSlice * i - Math.PI / 2); })
.attr("cy", function(d, i) { return rScale(d[value]) * Math.sin(angleSlice * i - Math.PI / 2); })
.style("fill", "none")
.style("pointer-events", "all")
// Mouseover event
.on("mouseover", function(d, i) {
    var countryValues = []; // Array to store country name and factor value pairs

    // Populate the array with country name and factor value pairs
    for (var j = 0; j < data.length; j++) {
        var countryName = data[j][0][areaName];
        var factorValue = 0;

        switch (d.axis) {
            case 'People Vaccinated per Hundred':
                factorValue = data[j][0][value];
                break;
            case 'People Fully Vaccinated per Hundred':
                factorValue = data[j][1][value];
                break;
            case 'Average Stringency Index':
                factorValue = data[j][2][value];
                break;
            case 'Average Containment Index':
                factorValue = data[j][3][value];
                break;
        }

        countryValues.push({ countryName: countryName, factorValue: factorValue });
    }

    // Sort the array based on factor values in descending order
    countryValues.sort(function(a, b) {
        return b.factorValue - a.factorValue;
    });

    // Calculate newX and newY as before
    newX = parseFloat(d3.select(this).attr('cx')) - 10;
    newY = parseFloat(d3.select(this).attr('cy')) - 10;

    // Generate the HTML content for the tooltip
    let html = "<div> Factor: " + d.axis + "<br><br>";

    for (var k = 0; k < countryValues.length; k++) {
        html += countryValues[k].countryName + ": " + parseFloat(countryValues[k].factorValue).toFixed(1) + "%<br>";
    }

    html += "</div>";

    // Set the HTML content and position of the tooltip
    tooltip.style("display", "block")
        .style('left', `${event.x + 50}px`)
        .style('top', `${event.y - 20}px`)
        .style('font-size', '14px')
        .html(html);
})
.on("mouseout", function() {
    tooltip.style("display", "none")
                    .html("");
});


    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap

    // on mouseover for the legend symbol
    function cellover(d) {
        //Dim all blobs
        d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", 0);
        //Bring back the hovered over blob
        d3.select("." + data[d][0][areaName].replace(/\s+/g, ''))
            .transition().duration(200)
            .style("fill-opacity", 0.7);
    }

    // on mouseout for the legend symbol
    function cellout() {
        //Bring back all blobs
        d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", cfg.opacityArea);
    }

    // Sort the gdpData array based on GDP per capita values in descending order
gdpData.sort(function (a, b) {
    return b[4].value - a[4].value;
});

// Create an array of legend labels in the sorted order
var legendLabels = gdpData.map(function (d) {
    return d[4].country;
});
    // Create a bubble legend using the GDP data
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (margin.top+cfg["legendPosition"]["x"]+30) + "," + (margin.top) + ")");

    // Calculate the maximum GDP value for scaling the bubble size
    var maxGDP = d3.max(gdpData, function(d) { return d[4].value; });
    var radiusScale = d3.scale.sqrt()
        .domain([0, maxGDP])
        .range([0, 20]);

    // Add a text label for "GDP scale" above the circles
    legend.append("text")
    .attr("x", -35) // Adjust the position as needed
    .attr("y", -30) // Adjust the position as needed
    .style("font-size", "11px")
    .text("GDP per capita");

    // Add circles, GDP values, and country names to the legend
    var legendItems = legend.selectAll(".legend-item")
    .data(gdpData)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", function(d, i) {
        return "translate(0," + (i * 25) + ")";
    });

    legendItems.append("text")
    .attr("x", 30) // Adjust the position as needed
    .attr("y", 5)
    .style("font-size", "11px")
    .text(function(d) { return parseFloat(d[4].value).toFixed(0); }); // Display GDP per capita value

    legendItems.append("text")
    .attr("x", -25) // Adjust the position as needed
    .attr("y", 5)
    .style("text-anchor", "end")
    .style("font-size", "11px")
    .text(function(d) { return d[4].country; }); // Display country name

    legendItems.append("circle")
    .attr("r", function(d) { return radiusScale(d[4].value); })
    .style("fill", function(d, i) { return cfg.color(i); })
    .attr("class", "gdpLegendCircle") // Add a class for GDP legend circles
    .on('mouseover', function(d, i) {
        // Dim all radar chart areas
        d3.selectAll(".radarArea")
            .transition()
            .duration(200)
            .style("fill-opacity", 0);

        // Bring back the hovered over radar chart area
        var radarAreaClass = "." + data[i][0][areaName].replace(/\s+/g, '');
        d3.select(radarAreaClass)
            .transition()
            .duration(200)
            .style("fill-opacity", 0.7);
    })
    .on('mouseout', function() {
        // Bring back all radar chart areas
        d3.selectAll(".radarArea")
            .transition()
            .duration(200)
            .style("fill-opacity", cfg.opacityArea);
    });

}//RadarChart
