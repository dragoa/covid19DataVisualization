function RadarChart(id, data, options) {
    var cfg = {
        w: 600,
        h: 600,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        legendPosition: { x: 20, y: 20 },
        levels: 3,
        maxValue: 0,
        labelFactor: 1.25,
        wrapWidth: 60,
        opacityArea: 0,
        dotRadius: 4,
        opacityCircles: 0,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10), // Updated color function
        axisName: "axis",
        areaName: "areaName",
        value: "value",
        sortAreas: true,
    };

    if (options !== undefined) {
        for (var i in options) {
            if (options[i] !== undefined) {
                cfg[i] = options[i];
            }
        }
    }

    var axisName = cfg["axisName"],
        areaName = cfg["areaName"],
        value = cfg["value"];

    var maxValue = Math.max(
        cfg.maxValue,
        d3.max(data, function (i) {
            return d3.max(
                i.map(function (o) {
                    return o[value];
                })
            );
        })
    );

    var allAxis = data[0].map(function (d, i) {
            return d[axisName];
        }),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format(".2s"),
        angleSlice = Math.PI * 2 / total;

    var rScale = d3.scaleLinear() // Updated scale
        .range([0, radius])
        .domain([0, maxValue]);

    d3.select(id).select("svg").remove();

    var svg = d3.select(id).append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr("class", "radar" + id);

    var g = svg.append("g")
        .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    var filter = g.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    var axisGrid = g.append("g").attr("class", "axisWrapper");

    axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function (d, i) { return radius / cfg.levels * d; })
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter", "url(#glow)");

    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", function (d) { return -d * radius / cfg.levels; })
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(function (d, i) { return Format(maxValue * d / cfg.levels); });

    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function (d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y2", function (d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
        .attr("class", "line")
        .style("stroke", "#CCC")
        .style("stroke-width", "2px");

    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
        .text(function (d) { return d; })
        .call(wrap, cfg.wrapWidth);

    var radarLine = d3.lineRadial() // Updated line function
        .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed) // Updated curve type
        .radius(function (d) { return rScale(d[value]); })
        .angle(function (d, i) { return i * angleSlice; });

    var blobWrapper = g.selectAll(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");

    blobWrapper
        .append("path")
        .attr("class", function (d) {
            return "radarArea" + " " + d[0][areaName].replace(/\s+/g, '');
        })
        .attr("d", function (d, i) { return radarLine(d); })
        .style("fill", function (d, i) { return cfg.color(i); })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d, i) {
            // Dim all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            // Bring back the hovered-over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        })
        .on('mouseout', function () {
            // Bring back all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });

    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function (d, i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function (d, i) { return cfg.color(i); })
        .style("fill", "none")
        .style("filter", "url(#glow)");

    blobWrapper.selectAll(".radarCircle")
        .data(function (d, i) { return d; })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function (d, i) { return rScale(d[value]) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("cy", function (d, i) { return rScale(d[value]) * Math.sin(angleSlice * i - Math.PI / 2); })
        .style("fill", function (d, i, j) { return cfg.color(j); })
        .style("fill-opacity", 0.8);

    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

    blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(function (d, i) { return d; })
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius * 1.5)
        .attr("cx", function (d, i) { return rScale(d[value]) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("cy", function (d, i) { return rScale(d[value]) * Math.sin(angleSlice * i - Math.PI / 2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function (d, i) {
            newX = parseFloat(d3.select(this).attr('cx')) - 10;
            newY = parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d[value]))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on("mouseout", function () {
            tooltip.transition().duration(200)
                .style("opacity", 0);
        });

    var tooltip = g.append("text")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4,
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
    }

    function cellover(d) {
        d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", 0.1);

        d3.select("." + data[d][0][areaName].replace(/\s+/g, ''))
            .transition().duration(200)
            .style("fill-opacity", 0.7);
    }

    function cellout() {
        d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", cfg.opacityArea);
    }

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + cfg["legendPosition"]["x"] + "," + cfg["legendPosition"]["y"] + ")");

    var legendOrdinal = d3.legendColor() // Updated legend function
        .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
        .shapePadding(10)
        .scale(cfg.color)
        .labels(cfg.color.domain().map(function (d) {
            return data[d][0][areaName];
        }))
        .on("cellover", function (d) { cellover(d); })
        .on("cellout", function (d) { cellout(); });

    svg.select(".legendOrdinal")
        .call(legendOrdinal);
}
