    function init() {
      var w = 600;
      var h = 300;
      var padding = 50;
      var dataset;

      // Load CSV data once
      d3.csv("Assignment.csv", function(d) {
        return {
          year: +d.year,
          number: +d.number
        };
      }).then(function(data) {
        dataset = data;

        // Draw the line chart by default
        drawLineChart();

        // Button listeners
        d3.select("#Line").on("click", drawLineChart);
        d3.select("#Bar").on("click", drawBarChart);

        function drawLineChart() {
          d3.select("#chart").select("svg").remove();

          var xScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.year))
            .range([padding, w - padding]);

          var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.number)])
            .range([h - padding, padding]);

          var xAxis = d3.axisBottom(xScale)
            .tickValues(dataset.map(d => d.year))
            .tickFormat(d3.format("d"));

          var yAxis = d3.axisLeft(yScale);

          var line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.number));

          var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

          svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

          svg.append("g")
            .attr("transform", `translate(0,${h - padding})`)
            .call(xAxis);

          svg.append("g")
            .attr("transform", `translate(${padding},0)`)
            .call(yAxis);
        }

        function drawBarChart() {
          d3.select("#chart").select("svg").remove();

          var xScale = d3.scaleBand()
            .domain(dataset.map(d => d.year))
            .range([padding, w - padding])
            .padding(0.1);

          var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.number)])
            .range([h - padding, padding]);

          var xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d"));

          var yAxis = d3.axisLeft(yScale);

          var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

          svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.number))
            .attr("width", xScale.bandwidth())
            .attr("height", d => h - padding - yScale(d.number))
            .attr("fill", "orange");

          svg.append("g")
            .attr("transform", `translate(0,${h - padding})`)
            .call(xAxis);

          svg.append("g")
            .attr("transform", `translate(${padding},0)`)
            .call(yAxis);
        }
      });
    }

    window.onload = init;
