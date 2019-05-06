function get_data(subdict, key, level) {
	if (level == undefined)
	level = 0;

	var root = subdict['path'];

	var len = root.length -1;

	if (root[len] == key) {
		return subdict;
	} else {
		var children = subdict['children'];
		for (var child in children) {
			var childdict = children[child];
			var solution = get_data(children[child], key, level+1);
			if (solution != undefined)
			return solution;
		}
	}
}

function getTimePoints(dict, entry) {
	subtree = get_data(dict[Object.keys(dict)[0]], entry);
	alice = subtree['read_count'].slice(0, 6);
	bob = subtree['read_count'].slice(6,12);
	return [alice, bob];
}

function get_arrays_for_entry(dict, entry, index, node_only) {
	if (node_only == undefined) {
		node_only = false;
	}
	subtree = get_data(dict[Object.keys(dict)[0]], entry);
	var categories = [];
	var alice = [];
	var bob = [];

	if (node_only) {
		categories.push(entry);
		alice = dict['read_count'].slice(0, 6);
		bob = dict['read_count'].slice(6,12);
		return [categories, alice, bob];
	}

	for (var child in subtree['children']) {
		var child_dict = subtree['children'][child];
		var label = child_dict['path'][child_dict['path'].length-1];
		var alice_value = child_dict['read_count'][index];
		var bob_value = child_dict['read_count'][6 + index];

		categories.push(label);
		alice.push(alice_value);
		bob.push(bob_value);
	}
	return [categories, alice, bob];
}

function Heatmap (myDivId, dataset) {
	var returnDictionary = {};

	var linechartDictionary;

	// set the margins for the actual charts
	margin = { top: 200, right: 100, bottom: 100, left: 100 };

	colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

	stack = [];
	parent = "root";
	index = 0;

	returnDictionary["init"] = function() {
		winWidth = window.screen.availWidth*0.9;
		winHeight = window.screen.availHeight*0.9;

		//winWidth = 1000;
		//winHeight = 400;

		// calculate width and height of chart
		chartWidth = 1 * winWidth;
		chartHeight = 0.486 * winHeight;

		// calc heatmap width & height
		heatmapWidth = chartWidth - margin.left - margin.right;


		element_height = 0.147 * chartHeight;
		margin.top = 0.37 * chartHeight;
		label_yoffset = -0.235 * chartHeight;
		path_offset = -0.039 * chartHeight + label_yoffset;
		legend_height = 0.019 * chartHeight;
		legend_margin = 0.02 * chartHeight;
		legend_text_margin = 0.0294 * chartHeight;
		slider_ypos = 0.033 * chartHeight;
		path_fontsize = 0.053 * chartHeight;
		read_count_fontsize = 0.041 * chartHeight;
		label_font_size = 0.023 * chartHeight;
		//bottom_margin


		parent = Object.keys(dataset)[0];

		var array = get_arrays_for_entry(dataset, parent, 0);
		categories = array[0];
		x1 = array[1];
		x2 = array[2];

		svg = d3.select(myDivId).append("svg");

		// set svg dimensions
		svg
			.attr("width", winWidth).attr("height", winHeight)
			.attr("align", "center");



		/* INIT LINECHART */
		linechartDictionary = linechart(svg, dataset, heatmapWidth,chartHeight, margin.left, chartHeight);
		linechartDictionary['init']();

		var data = d3.zip(categories, x1, x2);

		// define scales
		var max1 = d3.max(x1);
		var max2 = d3.max(x2);

		colorScale = d3.scaleQuantile()
			//.domain(x1.concat(x2))
			.domain([0, colors.length - 1, d3.max(x1.concat(x2))])
		    .range(colors);

		// create group that contains all elements of the chart
		chartGroup = svg.append("g");



		pathWidth = heatmapWidth;
		/*TEST

		chartGroup.append("rect")
            .attr("x", 0)
            .attr("y", -175)
            .attr("width", pathWidth)
            .attr("height", 50)
            .attr("fill", "transparent")
            .attr("stroke-width", 5)
            .attr("stroke", "black");
		TEST*/

		// move chartgroup to its position in the svg.
		chartGroup.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

		rectGroup = fillHeatmap(chartGroup, data, colors, colorScale);

        var aliceLabel = chartGroup.append("text")
            .text("Alice")
            .attr("x", heatmapWidth + 3)
            .attr("y", element_height/2)
            .style("class", "path");

        var bobLabel = chartGroup.append("text")
            .text("Bob")
            .attr("x", heatmapWidth + 3)
            .attr("y", element_height + element_height/2)
            .style("class", "path");

		backButton = chartGroup.append("rect")
		    .attr("x", -(0.5 * margin.left +  0.15 * 0.5 * margin.left))
		    .attr("y", 0)
		    .attr("rx", 6)
		    .attr("ry", 6)
		    .attr("width", 0.5 * margin.left)
		    .attr("height", element_height*2 + 3*padding)
		    .attr("fill", d3.rgb("#AAAAAA"));

		var labelsHeight = 140;

        pathText = chartGroup.append("text")
            .text("Root")
			.style("font-size", path_fontsize)
            .attr("x", 0)
            .attr("y", path_offset)
            .style("class", "path");

        readCount = chartGroup.append("text")
			.text("assigned reads")
			.style("font-size", read_count_fontsize)
			.style("text-anchor", "end")
			.style("class", "path")
			.attr("x", heatmapWidth)
        	.attr("y", path_offset);


	    var ticks = [0,1,3,6,8,34];
    	doSlider(chartGroup, ticks, returnDictionary);


	};

	returnDictionary["update"] = function(newRoot, index) {

		if (newRoot == undefined) {
			newRoot == parent;
		}


		/*this.alice_rects.exit().transition()
		.attr("width", 0)
		.attr("height", 0)
		.remove();

		this.bob_rects.exit().transition()
		.attr("fill", "transparent")
		.remove();*/

		xLabels.remove();
		alice_rects.remove();
		bob_rects.remove();
		legend.remove();
		legendText.remove();

		var array = get_arrays_for_entry(dataset, newRoot, index);
		categories = array[0];
		x1 = array[1];
		x2 = array[2];


		var data = d3.zip(categories, x1, x2);

		gridSize = heatmapWidth / categories.length;
		dataCount = categories.length;


		var buckets = 9;

		colorScale = d3.scaleQuantile()
		//	.domain(x1.concat(x2))
			.domain([0, buckets - 1, d3.max(x1.concat(x2))])
		    .range(colors);

		rectGroup = fillHeatmap(chartGroup, data, colors, colorScale);

		returnDictionary["doWhenClicked"]();
		returnDictionary["doOnMouseOver"]();
	};

	returnDictionary["doWhenClicked"] = function() {
		alice_rects.on("click", function() {
			clickedItem = d3.select(this);
			var array = get_arrays_for_entry(dataset, clickedItem.data()[0][0], index);
			if (array[0].length > 0) {
				stack.push(parent);
				parent = clickedItem.data()[0][0];
				pathText.text(pathString(pathText, stack.concat([parent]), heatmapWidth));
                returnDictionary["update"](parent, index);
            }
			linechartDictionary['update'](getTimePoints(dataset, clickedItem.data()[0][0]));
		});

        bob_rects.on("click", function() {
			clickedItem = d3.select(this);
			var array = get_arrays_for_entry(dataset, clickedItem.data()[0][0], index);
			if (array[0].length > 0) {
				stack.push(parent);
				parent = clickedItem.data()[0][0];
				pathText.text(pathString(pathText, stack.concat([parent]), heatmapWidth));
                returnDictionary["update"](parent, index);
            }
            linechartDictionary['update'](getTimePoints(dataset, clickedItem.data()[0][0]));
		});


		backButton.on("click", function() {
			if (stack.length > 0) {
			pathText.text(pathString(pathText, stack, heatmapWidth));
				parent = stack.pop();
				returnDictionary["update"](parent, index);
				linechartDictionary['update'](getTimePoints(dataset, parent));
			}

		});
	};

	returnDictionary["doOnMouseOver"] = function() {
		var tooltip = d3.select("body")
		    .append("div")
		    .attr("class", "tooltip")
		    .text("a simple tooltip");

		xLabels.on("mouseover", function() {
			tooltip.html(generateTooltipText(d3.select(this).data()[0][0]));
			return tooltip.style("visibility", "visible");
		});
		xLabels.on("mousemove", function() {
			tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		});
		xLabels.on("mouseout", function() {
			return tooltip.style("visibility", "hidden");
		});

        /*
         * MOUSEOVER FOR HEATMAP RECTANGLES
         */
		alice_rects.on("mouseover", function() {
			readCount.text(d3.select(this).data()[0][1] + " assigned reads");
			pathText.text(pathString(pathText, stack.concat([parent], [d3.select(this).data()[0][0]]), heatmapWidth-readCount.node().getComputedTextLength()-20));

			clickedItem = d3.select(this);
			var array = get_arrays_for_entry(dataset, clickedItem.data()[0][0], index);
			d3.select(this)
			   	.attr("stroke", "black");
		});

		alice_rects.on("mouseout", function() {
			d3.select(this)
			    .attr("stroke", d3.rgb("#E6E6E6"));
			readCount.text("");
			pathText.text(pathString(pathText, stack.concat([parent]), heatmapWidth));
		});

		backButton.on("mouseover", function() {
			backButton
			   	.attr("stroke", "black");
		});

		backButton.on("mouseout", function() {
			backButton
			    .attr("stroke", d3.rgb("#E6E6E6"));
		});

		bob_rects.on("mouseover", function() {
			readCount.text(d3.select(this).data()[0][2] + " assigned reads");
			pathText.text(pathString(pathText, stack.concat([parent], [d3.select(this).data()[0][0]]), heatmapWidth-readCount.node().getComputedTextLength()-20));

			clickedItem = d3.select(this);
			var array = get_arrays_for_entry(dataset, clickedItem.data()[0][0], index);
			d3.select(this)
			   	.attr("stroke", "black");
		});

		bob_rects.on("mouseout", function() {
			d3.select(this)
			    .attr("stroke", d3.rgb("#E6E6E6"));
			readCount.text("");
			pathText.text(pathString(pathText, stack.concat([parent]), heatmapWidth));
		});

	};

	return returnDictionary;
}

function stylePath(path, taxon) {
    if (taxon == undefined) {
        var split = path.split(" >> ");
        if (split.length > 2) {
            var lastItemLength = split[split.length-1].length + 4;
            return path.slice(0, path.length - lastItemLength);
        }
    } else {
        return path + " >> " + taxon;
    }
}

function pathString(textElement, array, maxWidth) {
	for (var i = 0; i < array.length; i++) {
		var pathString = getPathString(array.slice(i, array.length));
		textElement.text(pathString);
		var textWidth = textElement.node().getComputedTextLength();
		if (textWidth < maxWidth) {
			return pathString;
		}
	}
}

function getPathString(pathArray) {
    var pathString = "";
    for (var i = 0; i < pathArray.length; i++) {
        if (i != pathArray.length-1) {
            pathString += pathArray[i] + " >> ";
        } else {
            pathString += pathArray[i];
        }
    }
    return pathString;
}

function doSlider(svg, ticks, returnDictionary) {

          var x = d3.scaleLinear()
              .range([0, heatmapWidth])
              .clamp(true)
              .nice();

          var slider = svg.append("g")
              .attr("class", "slider")
              .attr("transform", "translate(0, " +  (legend_margin + legend_height + legend_text_margin + slider_ypos + 2*element_height) + ")");

          slider.append("line")
                .attr("class", "track")
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
                .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "track-inset")
                .attr("id", "timeline")
                .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "track-overlay")
                .call(d3.drag()
                    .on("start.interrupt", function() { slider.interrupt(); })
                    .on("start drag", function() { hue(x.invert(d3.event.x)); }));

          slider.insert("g", ".track-overlay")
                .attr("class", "ticks")
                .attr("transform", "translate(0," + 18 + ")")
                .selectAll("text")
                .data(x.ticks(5))
                .enter().append("text")
                .attr("x", x)
                .attr("text-anchor", "middle")
                .text(function(d,i) { return ticks[i] + 'd'; });

          var handle = slider.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("id", "handler")
                .attr("r", 9);

                function hue(h) {
                  var h_new;
                  if (h < 0.10) {
                    h_new = 0;
                    index = 0;
                    returnDictionary["update"](parent, 0);
                  } else if (0.10 < h && h < 0.30) {
                    h_new = 0.20;
                    index = 1;
                    returnDictionary["update"](parent, 1);
                  } else if (0.30 < h && h < 0.50) {
                    h_new = 0.40;
                    index = 2;
                    returnDictionary["update"](parent, 2);
                  } else if (0.50 < h && h < 0.70) {
                    h_new = 0.60;
                    index = 3;
                    returnDictionary["update"](parent, 3);
                  } else if (0.70 < h && h < 0.90) {
                    h_new = 0.80;
                    index = 4;
                    returnDictionary["update"](parent, 4);
                  } else if (h > 0.90) {
                    h_new = 1;
                    index = 5;
                    returnDictionary["update"](parent, 5);
                  }
                  handle.attr("cx", x(h_new));
                }

}

function fillHeatmap(chartGroup, data, categoryColors, colorScale) {
	var rectGroup = chartGroup.selectAll(".rect")
		.data(data.filter(function(d) {
			return d[1] != 0 || d[2] != 0;
		}))
		.enter();


	gridSize = heatmapWidth / rectGroup.data().length;


	categories = []
	for (var point in data)
		categories.push(data[point][0]);


	highlightColor = "black";
	nohighlightColor = d3.rgb("#E6E6E6");

	padding = 1;

	//element_height = 0.07 * height;


	alice_rects = rectGroup.append("rect");

	alice_rects
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", gridSize-2*padding)
				.attr("height", element_height)
				.attr("class", "hour bordered")
				.attr("stroke", nohighlightColor)
				.attr("stroke-width", padding*2)
				.attr("rx", 6)
				.attr("ry", 6)
				.attr("fill", function(data) {
						return colorScale(data[1]);
					})
				//.attr("fill-opacity", 1)
				.transition()
				.attr("x", function(data, index) {
						return index*gridSize+padding;
					})
				.attr("y", padding);
	//alice_rects.exit().remove();

	bob_rects = rectGroup.append("rect");

	bob_rects
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", gridSize-2*padding)
				.attr("height", element_height)
				.attr("class", "hour bordered")
				.attr("stroke", nohighlightColor)
				.attr("stroke-width", padding*2)
				.attr("rx", 6)
				.attr("ry", 6)
				.attr("fill", function(data, index) {
						return colorScale(data[2]);
					})
				.attr("fill-opacity", function(data) { return 0.9;})
				.transition()
				.attr("x", function(data, index) {
						return index*gridSize+padding;
					})
				.attr("y", element_height+3*padding);

	//####################LABELS###############################################################
	var prefix = sharedStart(categories);
	var start = prefix.length;

	var labelGroup = chartGroup.selectAll(".label")
		.data(data.filter(function(d) {
			return d[1] != 0 || d[2] != 0;
		}))
		.enter();



	xLabels = labelGroup.append("text");

	xLabels
		.text(function(d) {
			var start = (start+14) < d[0].length ? prefix.length : (d[0].length - 14);
			var end = start+14;
			//return d[0].substring(start, end) + "..";
			return d[0].substring(0,14)+"..";
		})

		//.attr("text-anchor", "middle")
		//.attr("transform", "rotate(90)")
		.attr("class", function(d,i) {
			return "timeLabel mono axis";
		})
		.style("font-size", label_font_size)
		.attr("y", function(d, i) {
			return -i * gridSize;
		})
		.attr("x", 0)
		.attr("transform", function(d,i) {
			return "translate(" + gridSize/2 + ", " + label_yoffset + ") rotate(90)";
		});

	legend = chartGroup.selectAll(".legend").data([0].concat(colorScale.quantiles()), function(d) { return d; }).enter();

	legendElementWidth = heatmapWidth/9;

	legend.enter().append("g")
		.attr("class", "legend");

	legend.append("rect")
		.attr("x", function(d, i) {
			return legendElementWidth*i;
		})
		.attr("y", 2*element_height + legend_margin)
		.attr("width", legendElementWidth)
		.attr("height", legend_height)
		//.attr("fill", "black");
		.style("fill", function(d, i) {return colors[i]; });

	legendText = legend.append("text")
		.attr("class", "mono")
		.style("font-size", label_font_size)
		.text(function(d) {return "≥ " + d.toFixed(2); })
		.attr("x", function(d,i) { return legendElementWidth * i; })
		.attr("y", legend_margin + legend_height + legend_text_margin + 2*element_height);

	return rectGroup;
}


function sharedStart(array){
	var A= array.concat().sort(),
	a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
	while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
	return a1.substring(0, i);
}

function generateTooltipText(category) {
	var text = "";
	text = text.concat(category);
	return text;
}

