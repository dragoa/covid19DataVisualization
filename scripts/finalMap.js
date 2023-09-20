function drawMap2(id, dataset, wave, selectedOptionValue){

    d3.select(id).selectAll("svg").remove();

    const map = new Map();
    let colorMap = d3.scaleLinear()
        .domain([0, 20, 40, 60, 80, 100])
        .range(['lightgrey', '#FFB17A', "#F1FEC6", '#037971', '#023436', 'black']);

    // load both geometric and aggregated data
    Promise.all([
        d3.json("/assets/data/map/custom.geo.json"),
        d3.csv(dataset, function (d) {
            map.set(d.location, +d[selectedOptionValue])
        })
    ]).then(function (loadData) {

        // set the dimensions and margins of the graph
        const margin = {top: 10, right: 100, bottom: 10, left: 100},
            width = 1200 - margin.left - margin.right,
            height = 900 - margin.top - margin.bottom;

        var mapId = document.getElementById(id.replace("#", ""))
        mapId.innerHTML = "";

        const svg = d3.select(id)
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")

        // Add X axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .attr("x", width/3)
            .attr("y", margin.bottom)
            .text(`${wave} wave MAP: all the policies adopted against Covid-19 by all EU's countries.`)
            .style("transform", "translate(20px, 20px)")
            .style("font-weight", "bold")
            .style("font-family", "Fira Sans");

        // projection reflecting the Y to match d3 requirements
        let projection = d3.geoMercator()
            .center([7, 56])
            .scale([width / 1.3])
            .translate([width / 2, height / 2])

        console.log(d3.schemeGreens[6])
        const color = colorMap
        Legend(colorMap, "#legend_map1")

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
                    tooltipText = `The ${selectedOptionValue.replace(/_/g, ' ')} is <br> ${percValue}`;
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

drawMap2("#mapFinal", "assets/data/finalMap/FinalMap1.csv", "1st", "gdp_per_capita")

function handlePaymentChange6(event) {
    // Get the value of the selected radio button
    const radioButtons = document.getElementsByName("flexRadioDefault4");
    let selectedRadioButtonValue;

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedRadioButtonValue = radioButton.id;
            break; // Exit the loop once a checked radio button is found
        }
    }

    // Get the value of the selected option from the select element
    const selectElement = document.getElementById("map2");
    const selectedOptionValue = selectElement.value;

    //console.log(selectedRadioButtonValue)
    //console.log(selectedOptionValue)


    if(selectedRadioButtonValue === "flexRadio11"){ // 1st wave
        drawMap2("#mapFinal", "assets/data/finalMap/FinalMap1.csv",  "1st", selectedOptionValue)
    }
    else if(selectedRadioButtonValue === "flexRadio12"){
        drawMap2("#mapFinal", "assets/data/finalMap/FinalMap2.csv", "2nd", selectedOptionValue)
    }
    else if(selectedRadioButtonValue === "flexRadio13"){
        drawMap2("#mapFinal", "assets/data/finalMap/FinalMap3.csv", "3rd", selectedOptionValue)
    }
    else{
        drawMap2("#mapFinal", "assets/data/finalMap/FinalMap1.csv",  "1st", selectedOptionValue)
    }
}