var indata = {
    "K1001100 Metabolism": [4844330, 5375386, 5705003, 5434182, 4825587, 5552616, 4991606, 5018688,
        5317224, 5411519, 4755607, 5021955],
    "K2000011 Genetic Information Processing": [1387924, 1918628, 1404787, 2005017, 1334583, 1874740, 1441470,
        1761100, 1435870, 1412325, 1298925, 1359854],
    "K2000016 Environmental Information Processing": [525311, 695853, 659029, 655018, 547221, 753171, 611034,
        727973, 737763, 602771, 508000, 551082],
    "K2000020 Cellular Processes": [312190, 322720, 397361, 313971, 345793, 319993, 336657, 276876, 359491, 333782,
        336064, 342454],
    "K2000025 Organismal Systems": [136048, 1409520, 141476, 141414, 123135, 138340, 124549, 130718, 130375, 133148,
        125157, 125530],
    "K2000034 Human Diseases": [118717, 150030, 110363, 157731, 111666, 149708, 117329, 131665, 108223, 118062,
        115652, 113388]
};

    var key = Object.keys(indata);

    var marginBar = {top: 20, right: 370, bottom: 30, left: 80};
    width_bar = 650 - marginBar.left - marginBar.right;
    height_bar = 500 - marginBar.top - marginBar.bottom;

    var stack = d3.stack()
        .keys(key)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    xScale_bar = d3.scalePoint()
        .range([0, width_bar])
        .domain(["Alice", "Bob"])
        .padding(0.5);

    yScale_bar = d3.scaleLinear()
        .range([height_bar, 0])
        .domain([0, d3.max((stack(get_users(indata, 0)))[(stack(get_users(indata, 0))).length - 1], function (d) {
                return d[0];
            },
            function (d) {
                return d[1];
            })]).nice();

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    xAxis = d3.axisBottom(xScale_bar);
    yAxis = d3.axisLeft(yScale_bar);

    svg_bar = d3.select("#stacked-bar")
        .append("svg")
        .attr("width", width_bar + marginBar.left + marginBar.right)
        .attr("height", height_bar + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");

    var layer = svg_bar.selectAll(".layer")
        .data((stack(get_users(indata, 0))))
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) {
            return color(i);
        });

    layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return xScale_bar(d.data.person) - 25;
        })
        .attr("y", height_bar)
        .transition().duration(600)
        .attr("y", function (d) {
            return yScale_bar(d[1]);
        })
        .attr("height", function (d) {
            return yScale_bar(d[0]) - yScale_bar(d[1]);
        })
        .attr("width", 50);

    svg_bar.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height_bar) + ")")
        .call(xAxis);

    svg_bar.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

    for(var index = 0; index < key.length; index++){

        svg_bar.append("text")
            .attr("id", "bar_t_legend")
            .attr("x", -140 + marginBar.right)
            .attr("y", marginBar.top + 8 + 20 * index)
            .attr("dy", ".35em")
            .text(key[index]);

        svg_bar.append("rect")
            .attr("id", "bar_r_legend")
            .attr("x", -160 + marginBar.right)
            .attr("y", marginBar.top + 20 * index)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill",d3.schemeCategory20[index]);
    };

    
function changeBarInput(newInput, newVal) {

    indata = newInput;

    key = Object.keys(indata);

    stack = d3.stack()
        .keys(key)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

     yScale_bar = d3.scaleLinear()
        .range([height_bar, 0])
        .domain([0, d3.max((stack(get_users(indata, newVal)))[(stack(get_users(indata, newVal))).length - 1], function (d) {
                return d[0];
            },
            function (d) {
                return d[1];
            })]).nice();

      svg_bar.selectAll(".layer")
        .selectAll("rect")
        .transition().duration(500)
        .attr("y", height_bar)
        .attr("height", 0)
        .remove();

    svg_bar.selectAll(".layer")
        .exit()
        .data((stack(get_users(indata, newVal))))
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) {
            return color(i);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return xScale_bar(d.data.person) - 25;
        })
        .attr("y", height_bar)
        .transition().duration(600)
        .attr("y", function (d) {
            return yScale_bar(d[1]);
        })
        .attr("height", function (d) {
            return yScale_bar(d[0]) - yScale_bar(d[1]);
        })
        .attr("width", 50);


    yAxis = d3.axisLeft(yScale_bar);
    svg_bar.selectAll("g .y.axis")
        .transition().duration(500)
        .call(yAxis);


    svg_bar.selectAll("#bar_t_legend")
        .remove();
    svg_bar.selectAll("#bar_r_legend")
        .remove();

    for(var index = 0; index < key.length; index++){

        svg_bar.append("text")
            .attr("id", "bar_t_legend")
            .attr("x", -140 + marginBar.right)
            .attr("y", marginBar.top + 8 + 20 * index)
            .attr("dy", ".35em")
            .text(key[index]);

        svg_bar.append("rect")
            .attr("id", "bar_r_legend")
            .attr("x", -160 + marginBar.right)
            .attr("y", marginBar.top + 20 * index)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill",d3.schemeCategory20[index]);
    }

}



function updateBars(newVal) {

    yScale_bar = d3.scaleLinear()
        .range([height_bar, 0])
        .domain([0, d3.max((stack(get_users(indata, newVal)))[(stack(get_users(indata, newVal))).length - 1], function (d) {
                return d[0];
            },
            function (d) {
                return d[1];
            })]).nice();

    svg_bar.selectAll(".layer")
        .selectAll("rect")
        .transition().duration(500)
        .attr("y", height_bar)
        .attr("height", 0)
        .remove();

    svg_bar.selectAll(".layer")
        .exit()
        .data((stack(get_users(indata, newVal))))
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) {
            return color(i);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return xScale_bar(d.data.person) - 25;
        })
        .attr("y", height_bar)
        .transition().duration(600)
        .attr("y", function (d) {
            return yScale_bar(d[1]);
        })
        .attr("height", function (d) {
            return yScale_bar(d[0]) - yScale_bar(d[1]);
        })
        .attr("width", 50);


    yAxis = d3.axisLeft(yScale_bar);
    svg_bar.selectAll("g .y.axis")
        .transition().duration(500)
        .call(yAxis);
}


function get_users(dict, number){

    var keys = Object.keys(dict);

    var alice = {"person": "Alice"};
    var bob = {"person": "Bob"};

    for(var i = 0; i < keys.length; i++){
        if(number == 0){
            alice[keys[i]] = dict[keys[i]][1];
            bob[keys[i]] = dict[keys[i]][4];
        }
        else if(number == 1){
            alice[keys[i]] = dict[keys[i]][3];
            bob[keys[i]] = dict[keys[i]][6];
        }
        else if(number == 3){
            alice[keys[i]] = dict[keys[i]][7];
            bob[keys[i]] = dict[keys[i]][2];
        }
        else if(number == 6){
            alice[keys[i]] = dict[keys[i]][0];
            bob[keys[i]] = dict[keys[i]][8];
        }
        else if(number == 8){
            alice[keys[i]] = dict[keys[i]][10];
            bob[keys[i]] = dict[keys[i]][9];
        }
        else {
            alice[keys[i]] = dict[keys[i]][5];
            bob[keys[i]] = dict[keys[i]][11];
        }
    }

    var result = [];
    result.push(alice, bob);
    return result;
}