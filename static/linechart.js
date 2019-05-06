function get_arrays_for_time_series(dict, entry) {
        subtree = get_data(dict[Object.keys(dataset)[0]], entry);
        var alice = [], bob = [];
        for (var a = 0; a < 6; a++) {
            alice.push(subtree['read_count'][a]);
            bob.push(subtree['read_count'][6 + a]);
        }

        return [alice, bob];
    }

// d3's line generator
        line = d3.line()
            .x(function (d) {
                return xScale(d.time_point);
            }) // set the x values for the line generator
            .y(function (d) {
                return yScale(d.value);
            }); // set the y values for the line generator
        //.curve(d3.curveMonotoneX) // apply smoothing to the line

function linechart (svg, dataset, width, height, x, y) {

    var returnDictionary = {};

    var data = [[0,0,0,0,0,0],[0,0,0,0,0,0]];

    //get time points
    var time_points = [0, 1, 2, 3, 4, 5];
    var time_stands = ["0", "1", "3", "6", "8", "34"];


    returnDictionary["init"] = function () {

        //frame the marginBar
        var mySvgWidth = width;
        var mySvgHeight = height;
        var margin = {top: 50, right: 25, bottom: 100, left: 35};
        var myChartWidth = mySvgWidth - margin.left - margin.right;
        myChartHeight = mySvgHeight - margin.top - margin.bottom;


        //project it in form of a panel
        panel = svg.append("g")
            .attr("transform", "translate(" + (margin.left + x) + "," + (margin.top + y) + ")");

        //get the axis ready
        //x-Axis
        xScale = d3.scaleLinear()
            .range([margin.right, myChartWidth])
            .domain([0, d3.max(time_points)]);

        var xAxis = d3.axisBottom(xScale)
            .tickValues(time_points)
            .tickFormat(function (d, i) {
                return time_stands[i];
            });

        panel.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + myChartHeight + ")")
            .call(xAxis);

        //y-Axis

        //get highest value of the data
        if (d3.max(data[0]) > d3.max(data[1])) {
            var maximum = d3.max(data[0]);
        } else {
            var maximum = d3.max(data[1]);
        }

        yScale = d3.scaleLinear()
            .range([myChartHeight, 0])
            .domain([0, maximum]).nice();

        var yAxis = d3.axisLeft(yScale);

        panel.append("g")
            .attr("class", "yaxis lchart")
            .call(yAxis)
            .attr("transform", "translate(" + margin.right + "," + 0 + ")")
            .selectAll("text")
            .attr('dx', '-.5em');

        // create dict for Alice and Bob line
        var arr_1 = [];
        var arr_2 = [];
        for (i = 0; i < time_points.length; i++) {
            arr_1[i] = {"time_point": time_points[i], "value": data[0][i]};
            arr_2[i] = {"time_point": time_points[i], "value": data[1][i]};
        }
        var arr = [arr_1, arr_2];

        //label axes
        //x axis
        panel.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", mySvgWidth / 2)
            .attr("y", myChartHeight + 30)
            .text("time points of measuring")
            .style("font-size", "13px")
            .style("font-weight", "bold");

        //y axis
        panel.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -myChartHeight / 2)
            .attr("y", 0)
            .attr("dy", "-2.6em")
            .attr("transform", "rotate(-90)")
            .text("number of reads")
            .style("font-size", "13px")
            .style("font-weight", "bold");

        /*
         //give title
         svg.append("text")
         .attr("class", "title")
         .attr("text-anchor", "middle")
         .attr("x", mySvgWidth/2 + marginBar.left + marginBar.right)
         .attr("y",  mySvgHeight-5)
         .text("figure: comparison Alice and Bob")
         .style("font-size", "34px");
         */

        //legend for identifying Alice and Bob

        //names and linechartColors for each line
        names = ["Alice", "Bob"];
        linechartColors = ["crimson", "#6495ED"];

        //print them
        //+ print circles
        for (var index = 0; index < 2; index++) {

            // Append the pathfor Alice, bind the data, and call the line generator
            panel.append("svg:path")
                .attr('id', names[index])
                .datum(arr[index]) // 10. Binds data to the line
                .attr("class", "line") // Assign a class for styling
                .attr("d", line) // 11. Calls the line generator
                .attr("stroke", linechartColors[index]);

            var bubble = panel.selectAll("#linechart")
                .data(data[index])
                .enter();

            panel.append("text")
                .attr("x", width - 30)
                .attr("y", margin.top + 8 + 20 * index)
                .attr("dy", ".35em")
                .text(names[index]);

            panel.append("rect")
                .attr("x", width - 50)
                .attr("y", margin.top + 20 * index)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", linechartColors[index]);


            bubble.append("circle") // Uses the enter().append() method
                .attr("id", "circle" + names[index])
                .attr("class", "circle") // Assign a class for styling
                .attr("cx", function (d, i) {
                    return xScale(i);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 5)
                .style("fill", linechartColors[index]);
        }

        //get all circles
        var circle = d3.selectAll("circle");

        d3.selectAll("circle").on('mouseover', function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 10);
        });
        circle.on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 5);
        });

    }

    //update
    returnDictionary["update"] = function (dataArray) {

            //var data = get_arrays_for_time_series(dataset, entry);
            data = dataArray;

            //get highest value of the data
            if (d3.max(data[0]) > d3.max(data[1])) {
                var maximum = d3.max(data[0])
            } else {
                var maximum = d3.max(data[1])
            }

            yScale = d3.scaleLinear()
                .range([myChartHeight, 0])
                .domain([0, maximum]).nice();

            yAxis = d3.axisLeft(yScale);

            panel.selectAll("g .yaxis.lchart")
                .transition().duration(500)
                .call(yAxis);


            // create dict for Alice and Bob line
            var arr_1 = [];
            var arr_2 = [];
            for (i = 0; i < time_points.length; i++) {
                arr_1[i] = {"time_point": time_points[i], "value": data[0][i]};
                arr_2[i] = {"time_point": time_points[i], "value": data[1][i]};
            }
            var arr = [arr_1, arr_2];

            // panel.selectAll("#selepath").remove();
            // svg.selectAll("circle").remove();

            for (var index = 0; index < 2; index++) {

                // Append the pathfor Alice, bind the data, and call the line generator
                panel.select("#" + names[index])
                    .datum(arr[index]) // 10. Binds data to the line
                    .transition().duration(500)
                    .attr("class", "line") // Assign a class for styling
                    .attr("d", line) // 11. Calls the line generator
                    .attr("stroke", linechartColors[index]);


                panel.selectAll("#circle" + names[index]) // Uses the enter().append() method
                    .data(data[index])
                    .transition().duration(500)
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function (d, i) {
                        return xScale(i);
                    })
                    .attr("cy", function (d) {
                        return yScale(d);
                    })
                    .attr("r", 5)
                    .style("fill", linechartColors[index]);
            }
            ;

            //get all circles
            var circle = d3.selectAll("circle");

            d3.selectAll("circle").on('mouseover', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 10);
            });
            circle.on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", 5);
            });
        }


    return returnDictionary;
}
