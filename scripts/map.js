function drawMap(id, dataset, colorMap, year){

    const map = new Map();
    colorMap = d3.scaleLinear()
        .domain([0, 20, 40, 60, 80])
        .range(['lightgrey', '#FFB17A', "#F1FEC6", '#037971', '#023436']);

    // load both geometric and aggregated data
    Promise.all([
        d3.json("/assets/data/map/custom.geo.json"),
        d3.csv(dataset, function (d) {
            // console.log(d);
            map.set(d.location, +d[year])
        })
    ]).then(function (loadData) {

        var height = 700;
        var width = document.documentElement.clientWidth / 2;

        var mapId = document.getElementById(id.replace("#", ""))
        mapId.innerHTML = "";

        const svg = d3.select(id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        // projection reflecting the Y to match d3 requirements
        let projection = d3.geoMercator()
            .center([7, 56])
            .scale([width / 1.3])
            .translate([width / 2, height / 2])

        const color = colorMap
        Legend(d3.scaleThreshold([20, 40, 60, 80], d3.schemeGreens[5]), "#legend_map")

        let topo = loadData[0]
        // projection.fitSize([width, height], topo);

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
                // console.log(percValue)
                if (percValue !== 0 && percValue) {
                    tooltipText = "The policies adopted <br>were " + percValue + "% strict";
                } else if (isNaN(percValue)){
                    tooltipText = "Missing data";
                }

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

drawMap("#map1", "assets/data/map/map_tot_stringency1.csv", d => d3.interpolateGreens(d/100), "average_stringency_containment_index")

function handlePaymentChange2(event) {
    const wave = event.target.id

    if(wave === "flexRadio1"){
        drawStackedBar("#barplot1", "/assets/data/barplot/average_1.csv", "1st")
        drawMap("#map1", "/assets/data/map/map_tot_stringency1.csv", d => d3.interpolateGreens(d/100), "average_stringency_containment_index")
    }
    else if(wave === "flexRadio2"){
        drawStackedBar("#barplot1", "/assets/data/barplot/average_2.csv", "2nd")
        drawMap("#map1", "/assets/data/map/map_tot_stringency2.csv", d => d3.interpolateGreens(d / 100), "average_stringency_containment_index")
    }
    else if(wave === "flexRadio3"){
        drawStackedBar("#barplot1", "/assets/data/barplot/average_3.csv", "3rd")
        drawMap("#map1", "/assets/data/map/map_tot_stringency3.csv", d => d3.interpolateGreens(d / 100), "average_stringency_containment_index")
    }
    else{
        drawStackedBar("#barplot1", "/assets/data/barplot/average_1.csv", "1st")
        drawMap("#map1", "/assets/data/map/map_tot_stringency1.csv", d => d3.interpolateGreens(d / 100), "average_stringency_containment_index")
    }
}