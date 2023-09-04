function drawMap(id, dataset, colorMap, year){

    const map = new Map();

    // load both geometric and aggregated data
    Promise.all([
        d3.json("/assets/data/map/custom.geo.json"),
        d3.csv(dataset, function (d) {
            // console.log(d);
            map.set(d.location, +d[year])
        })
    ]).then(function (loadData) {

        var height = 670;
        var width = document.documentElement.clientWidth / 2 - 150;

        var mapId = document.getElementById(id.replace("#", ""))
        mapId.innerHTML = "";

        const svg = d3.select(id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        // projection reflecting the Y to match d3 requirements
        let projection = d3.geoMercator()
            .center([7, 52])
            .scale([width / 1.3])
            .translate([width / 2, height / 2])

        const color = colorMap
        //Legend(d3.scaleThreshold([39, 100, 300, 500, 1000, 2000, 3024], d3.schemeGreens[8]), id)

        let topo = loadData[0]
        //projection.fitSize([width_1, height_1], topo);

        //draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each region
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", function (d) {
                d.total = map.get(d.properties.name) || 0;
                return color(d.total);
            })
            .style("stroke", "black")
            .attr("class", function (d) { return "TIME" })
            .style("opacity", .8)

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

        svg.join("g")
            .selectAll("path")
            .on("mouseover", function (event, d) {
                d3.selectAll("path")
                    .style("opacity", ".4")
                d3.select(this)
                    .style("opacity", "1")
                    .style("stroke", "black")

                const percValue = Math.round(map.get(d.properties.name));
                let tooltipText;
                console.log(percValue)
                if (percValue !== 0 && percValue) {
                    tooltipText = "The policies adopted <br>were " + percValue + "% strict";
                } else if (isNaN(percValue)){
                    tooltipText = "Missing data";
                }
                console.log(tooltipText)

                tooltip.html(d.properties.name + ": " + tooltipText)
                    .style("visibility", "visible");
            })
            .on("mousemove", function () {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function (event, d) {
                d3.selectAll(".TIME")
                    .style("opacity", .8)
                d3.select(this)
                    .style("stroke", "black")
                tooltip.html(``).style("visibility", "hidden");
            });

    })
}

drawMap("#map1", "assets/data/map/merged_data.csv", d => d3.interpolateOrRd(d / 100), "ratio")

