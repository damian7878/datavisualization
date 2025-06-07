function init() {
  // Set width, height, and padding for the SVG container
  const w = 600;
  const h = 300;
  const padding = 30;

  // Load the CSV data asynchronously, and convert year and number to numbers
  d3.csv("Assignment.csv", d => ({
    country: d.country,
    year: +d.year,
    number: +d.number
  })).then(data => {

    // Set up click event listeners for buttons
    d3.select("#AusLine").on("click", () => drawLineChart("Australia"));
    d3.select("#AusBar").on("click", () => drawBarChart("Australia"));
    d3.select("#USLine").on("click", () => drawLineChart("United States"));
    d3.select("#USBar").on("click", () => drawBarChart("United States"));
    d3.select("#UKLine").on("click", () => drawLineChart("United Kingdom"));
    d3.select("#UKBar").on("click", () => drawBarChart("United Kingdom"));
    d3.select("#ItalyLine").on("click", () => drawLineChart("Italy"));
    d3.select("#ItalyBar").on("click", () => drawBarChart("Italy"));
    d3.select("#JapanLine").on("click", () => drawLineChart("Japan"));
    d3.select("#JapanBar").on("click", () => drawBarChart("Japan"));

    function drawLineChart(country) {
      const dataset = data.filter(d => d.country === country);

      d3.select("#chart").select("svg").remove();

      const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.year))
        .range([padding, w - padding]);

      const yScale = d3.scaleLinear()
        .domain([6, d3.max(dataset, d => d.number)])
        .range([h - padding, padding]);

      const xAxis = d3.axisBottom(xScale)
        .tickValues(dataset.map(d => d.year))
        .tickFormat(d3.format("d"));

      const yAxis = d3.axisLeft(yScale);

      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.number));

      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg.append("text")
        .attr("x", w / 2)
        .attr("y", padding / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`${country}`);

      svg.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);

      svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.number))
        .attr("r", 4)
        .attr("fill", "steelblue");

      svg.selectAll("text.label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.number) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.number);

      svg.append("g")
        .attr("transform", `translate(0,${h - padding})`)
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${padding},0)`)
        .call(yAxis);
    }

    function drawBarChart(country) {
      const dataset = data.filter(d => d.country === country);

      d3.select("#chart").select("svg").remove();

      let xScale = d3.scaleBand()
        .domain(dataset.map(d => d.year))
        .range([padding, w - padding])
        .padding(0.1);

      const yScale = d3.scaleLinear()
        .domain([6, d3.max(dataset, d => d.number)])
        .range([h - padding, padding]);

      let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
      const yAxis = d3.axisLeft(yScale);

      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg.append("text")
        .attr("x", w / 2)
        .attr("y", padding / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`${country}`);

      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", "orange")
        .transition()
        .delay((d, i) => i * 100)
        .duration(250)
        .transition()
        .duration(500)
        .ease(d3.easeElasticOut)
        .attr("y", d => yScale(d.number))
        .attr("height", d => h - padding - yScale(d.number));

      svg.selectAll("text.label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.number) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .transition()
        .delay((d, i) => i * 100 + 800)
        .duration(400)
        .style("opacity", 1)
        .text(d => d.number);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${h - padding})`)
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${padding},0)`)
        .call(yAxis);

      // Sort Bar Chart by numbers
      let sortOrder = false;

      d3.select("#sort").on("click", function () {
        sortOrder = !sortOrder;

        const sortedData = dataset.slice().sort((a, b) => {
          return sortOrder
            ? d3.ascending(a.number, b.number)
            : d3.descending(a.number, b.number);
        });

        // Update domain
        xScale.domain(sortedData.map(d => d.year));

        // Rebuild xAxis
        xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

        // Transition bars
        svg.selectAll("rect")
          .data(sortedData, d => d.year)
          .transition("sortBars")
          .duration(500)
          .attr("x", d => xScale(d.year));

        // Transition labels
        svg.selectAll("text.label")
          .data(sortedData, d => d.year)
          .transition("sortLabels")
          .duration(500)
          .attr("x", d => xScale(d.year) + xScale.bandwidth() / 2);

        // Update x-axis
        svg.select("g.x-axis")
          .transition("sortAxis")
          .duration(500)
          .call(xAxis);
      });

// Sort Bar Chart by year
let yearSortOrder = true;

d3.select("#sortyear").on("click", function () {
  // Toggle sort order

  yearSortOrder = !yearSortOrder;

  // Sort years based on the order
  const sortedYears = dataset
    .slice()
    .sort((a, b) => yearSortOrder
      ? d3.ascending(a.year, b.year)
      : d3.descending(a.year, b.year)
    )
    .map(d => d.year);

  // Update domain of xScale
  xScale.domain(sortedYears);

  // Rebuild xAxis
  xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  // Transition bars
  svg.selectAll("rect")
    .transition("yearSortBars")
    .duration(500)
    .attr("x", d => xScale(d.year));

  // Transition labels
  svg.selectAll("text.label")
    .transition("yearSortLabels")
    .duration(500)
    .attr("x", d => xScale(d.year) + xScale.bandwidth() / 2);

  // Update x-axis
  svg.select("g.x-axis")
    .transition("yearSortAxis")
    .duration(500)
    .call(xAxis);
});

    }
  });
}

// Run init when window loads
window.onload = init;
