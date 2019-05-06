function doMyPlot(dataSet) {


    var currentHandle;
    var currentPerson;
    var currentTime;
    var ticks = [0,1,3,6,8,34];
    var svg = "sds"
  dict = {};

  dict['init'] = function(person, timepoint) {

        data = dataSet[person + timepoint];
        currentPerson = person;
        currentTime = timepoint;

        svg = d3.select("svg"),
            margin = 20,
            diameter = 900,
            g = svg.append("g").attr("transform", "translate(" + 1250 / 2 + "," + diameter / 2 + ")");

        g.attr("id", "firstG");

        doSlider(svg, g, ticks);

        var color = d3.scaleLinear()
            .domain([-1, 5])
            .range(["hsl(193,63%,95%)", "hsl(144,100%,21%)"])
            .interpolate(d3.interpolateHcl);

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

          root = d3.hierarchy(data)
              .sum(function(d) { return d.size; })
              .sort(function(a, b) { return b.value - a.value; });

          var focus = root,
              nodes = pack(root).descendants(),
              view;

          circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
              .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
              .style("fill", function(d) { return d.children ? color(d.depth) : null; })
              .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

          var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
              .attr("class", "label")
              .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
              .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
              .text(function(d) { return d.data.name; });

          var node = g.selectAll("circle,text");

          svg
              .style("background", color(-1))
              .on("click", function() { zoom(root); });

          zoomTo([root.x, root.y, root.r * 2 + margin]);

          function zoom(d) {
            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                  var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                  return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
              .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
          }

          function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
          }

        };

        whatever = function(person, timepoint) {

          data = dataSet[person + timepoint];

          gDelete = document.getElementById("firstG");
          gDelete.parentNode.removeChild( gDelete );

          svg = d3.select("svg"),
              margin = 20,
              diameter = 900,
              g = svg.append("g").attr("transform", "translate(" + 1250 / 2 + "," + diameter / 2 + ")");

          g.attr("id", "firstG");

          var color = d3.scaleLinear()
              .domain([-1, 5])
              .range(["hsl(193,63%,95%)", "hsl(144,100%,21%)"])
              .interpolate(d3.interpolateHcl);

          var pack = d3.pack()
              .size([900 - 20 , 900 - 20])
              .padding(2);

            root = d3.hierarchy(data)
                .sum(function(d) { return d.size; })
                .sort(function(a, b) { return b.value - a.value; });

            var focus = root,
                nodes = pack(root).descendants(),
                view;

            var circle = g.selectAll("circle")
              .data(nodes)
              .enter().append('circle')
                .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
                .style("fill", function(d) { return d.children ? color(d.depth) : null; })
                .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

            var text = g.selectAll("text")
              .data(nodes)
              .enter().append("text")
                .attr("class", "label")
                .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
                .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
                .text(function(d) { return d.data.name; });

            var node = g.selectAll("circle,text");

            svg.style("background", color(-1))
               .on("click", function() { zoom(root); });

            zoomTo([root.x, root.y, root.r * 2 + 20]);

            function zoom(d) {
              var focus0 = focus; focus = d;

              var transition = d3.transition()
                  .duration(d3.event.altKey ? 7500 : 750)
                  .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + 20]);
                    return function(t) { zoomTo(i(t)); };
                  });

              transition.selectAll("text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                  .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                  .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                  .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
            }

            function zoomTo(v) {
              var k = 900 / v[2]; view = v;
              node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
              circle.attr("r", function(d) { return d.r * k; });
            }


        };


function doSlider(svg, gElement, ticks) {

          var x = d3.scaleLinear()
              .range([0, 850])
              .clamp(true)
              .nice();

          var slider = svg.append("g")
              .attr("class", "slider")
              .attr("transform", "translate(" + 200 + "," + 960 / 1.05 + ")");

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
                    whatever(currentPerson, "00.json");
                  } else if (0.10 < h && h < 0.30) {
                    h_new = 0.20;
                    whatever(currentPerson, "01.json");
                  } else if (0.30 < h && h < 0.50) {
                    h_new = 0.40;
                    whatever(currentPerson, "03.json");
                  } else if (0.50 < h && h < 0.70) {
                    h_new = 0.60;
                    whatever(currentPerson, "06.json");
                  } else if (0.70 < h && h < 0.90) {
                    h_new = 0.80;
                    whatever(currentPerson, "08.json");
                  } else if (h > 0.90) {
                    h_new = 1;
                    whatever(currentPerson, "34.json");
                  }
                  handle.attr("cx", x(h_new));
                }

}
dict['update'] = whatever;

return dict;
}
