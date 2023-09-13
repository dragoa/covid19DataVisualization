// radarchart

var RadarChart = {
    draw: function (id, d, options) {
        var cfg = {
            radius: 5,
            w: 1000,
            h: 600,
            factor: 1,
            factorLegend: .85,
            levels: 3,
            maxTemp: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.1,
            ToRight: 5,
            TranslateX: 30,
            TranslateY: 30,
            ExtraWidthX: 100,
            ExtraWidthY: 100,
            color: d3.scaleOrdinal(d3.schemeCategory10)
        };

        function onMouseOverLegend(event) {
            var yearClass = event.target.classList[1];
            d3.selectAll(".lowOpacityOnHover")
                .style("opacity", "0.1")
            d3.selectAll("." + yearClass)
                .style("opacity", "1")
        }

        function onMouseOutLegend(event) {
            d3.selectAll(".lowOpacityOnHover")
                .style("opacity", "1")
        }

        if ('undefined' !== typeof options) {
            for (var i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }
        //cfg.maxTemp = Math.max(cfg.maxTemp, d3.max(d, function (i) { return d3.max(i.map(function (o) { return o.temp; })) }));
        // var allYear = (d[0].map(function (i, j) { return i.month }));
        var allYear = ["1", "2", "3", "4"]
        var total = allYear.length;
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        var Format = d => parseInt(d) + " per hundred";
        console.log("Formet"+Format)
        d3.select(id).select("svg").remove();

        var g = d3.select(id)
            .append("svg")
            .attr("width", cfg.w + cfg.ExtraWidthX)
            .attr("height", cfg.h + cfg.ExtraWidthY)
            .append("g")
            .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

        //Circular segments
        for (var j = 0; j < cfg.levels - 1; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll(".levels")
                .data(allYear)
                .enter()
                .append("svg:line")
                .attr("x1", function (d, i) { return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total)); })
                .attr("y1", function (d, i) { return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total)); })
                .attr("x2", function (d, i) { return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total)); })
                .attr("y2", function (d, i) { return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total)); })
                .attr("class", "line")
                .style("stroke", "grey")
                .style("stroke-opacity", "0.75")
                .style("stroke-width", "0.3px")
                .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
        }

        // Text indicating the level
        var legendLabels = []
        for (let i = 0; i < cfg.maxTemp; i += (cfg.maxTemp - cfg.minTemp) / cfg.levels) {
            legendLabels.push(i);
        }
        for (var j = 0; j < cfg.levels; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll(".levels")
                .data([1]) //dummy data
                .enter()
                .append("svg:text")
                .attr("x", function (d) { return levelFactor * (1 - cfg.factor * Math.sin(0)); })
                .attr("y", function (d) { return levelFactor * (1 - cfg.factor * Math.cos(0)); })
                .attr("class", "legend")
                .style("font-family", "sans-serif")
                .style("font-size", "10px")
                .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
                .attr("fill", "#737373")
                .text(Format(legendLabels[j]));
        }

        var series = 0;

        var year = g.selectAll(".month")
            .data(allYear)
            .enter()
            .append("g")
            .attr("class", "year");

        year.append("line")
            .attr("x1", cfg.w / 2)
            .attr("y1", cfg.h / 2)
            .attr("x2", function (d, i) { return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total)); })
            .attr("y2", function (d, i) { return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total)); })
            .attr("class", "line")
            .style("stroke", "grey")
            .style("stroke-width", "1px");

        let locations = [];

        d.forEach(innerArray => {
            innerArray.forEach(item => {
                locations.push(item.location);
            });
        });

        console.log(locations)

        const factors = ['people_vaccinated_per_hundred', 'people_fully_vaccinated_per_hundred', 'average_stringency_index', 'average_containment_index'];

        year.append("text")
            .attr("class", "legend")
            .text(function (d) { return factors[d - 1] })
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .attr("transform", function (d, i) { return "translate(0, -10)" })
            .attr("x", function (d, i) { return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total); })
            .attr("y", function (d, i) { return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total); })

        var i = 0;
        factors.forEach(function (key){

            d.forEach(function (y, x) {
                dataTemps = [];
                g.selectAll(".nodes")
                    .data(y, function (j, i) {

                        // Iterate over the object's properties
                        dataTemps.push([
                            cfg.w / 2 * (1 - (parseFloat((j[key])) / cfg.maxTemp) * cfg.factor * Math.sin(i * cfg.radians / total)),
                            cfg.h / 2 * (1 - (parseFloat((j[key])) / cfg.maxTemp) * cfg.factor * Math.cos(i * cfg.radians / total))])
                    });
                //dataTemps.push(dataTemps[0]);
                g.selectAll(".area")
                    .data([dataTemps])
                    .enter()
                    .append("polygon")
                    .style("stroke-width", "1px")
                    .style("stroke", cfg.color(series))
                    .attr("class", "lowOpacityOnHover year" + locations[i++])
                    .attr("points", function (d) {
                        var str = "";
                        for (var pti = 0; pti < d.length; pti++) {
                            str = str + d[pti][0] + "," + d[pti][1] + " ";
                        }
                        return str;
                    })
                    .style("fill", function (j, i) { return cfg.color(series) })
                    .style("fill-opacity", cfg.opacityArea)
                series++;
            });
        })
        series = 0;

        // plot vertical legend
        var i = 0;
        factors.forEach(function (key){


            d.forEach(function (y, x) {
                g.selectAll(".nodes")
                    .data(y).enter()
                    .append("circle")
                    .attr('r', cfg.radius)
                    .attr("alt", function (j) {
                        return j[key]
                    })
                    .attr("cx", function (j, i) {
                        // Iterate over the object's properties
                        dataTemps.push([
                            cfg.w / 2 * (1 - (parseFloat((j[key])) / cfg.maxTemp) * cfg.factor * Math.sin(i * cfg.radians / total)),
                            cfg.h / 2 * (1 - (parseFloat((j[key])) / cfg.maxTemp) * cfg.factor * Math.cos(i * cfg.radians / total))])

                        return cfg.w / 2 * (1 - (j[key] / cfg.maxTemp) * cfg.factor * Math.sin(i * cfg.radians / total))
                    })
                    .attr("cy", function (j, i) {
                        return cfg.h / 2 * (1 - (j[key] / cfg.maxTemp) * cfg.factor * Math.cos(i * cfg.radians / total));
                    })
                    .attr("class", "lowOpacityOnHover year" + locations[i++])
                    .on("mouseover", onMouseOverLegend)
                    .on("mouseout", onMouseOutLegend)
                    .attr("data-id", function (j) { return key })
                    .style("fill", cfg.color(series)).style("fill-opacity", .9)
                    .append("title")
                    .text(function (j) {
                        return j[key] })
                series++;
            });
        })
        for (let i = 0; i < locations.length; i++) {
            g.append("circle")
                .attr("cx", 510)
                .attr("cy", 0 + i * 14)
                .attr("r", 6)
                .style("fill", cfg.color(i))
                .attr("class", "lowOpacityOnHover year" + locations[i])
                .on("mouseover", onMouseOverLegend)
                .on("mouseout", onMouseOutLegend);
            g.append("text")
                .attr("x", 520)
                .attr("y", 2 + i * 14)
                .text(locations[i])
                .style("font-size", "15px")
                .attr("class", "lowOpacityOnHover year" + locations[i])
                .attr("alignment-baseline", "middle")
                .on("mouseover", onMouseOverLegend)
                .on("mouseout", onMouseOutLegend);
        }
    }
};

//Options for the Radar chart, other than default
var mycfg = {
    w: 600,
    h: 600,
    maxTemp: 80,
    minTemp: 0,
    levels: 10,
    ExtraWidthX: 100
}

d3.csv("../assets/data/radar/Radar1.csv").then(function (data) {
    console.log(data)

    const sumstat = d3.group(data, d => d.location);
    arrayData = [];
    sumstat.forEach(element => {
        console.log(element);
        arrayData.push(element)
    });
    console.log(arrayData)

    RadarChart.draw("#graph22", arrayData, mycfg);
});