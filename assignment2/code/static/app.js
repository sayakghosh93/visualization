function main() {
	console.log(masterData)
	var margin = {
			top: 30,
			right: 20,
			bottom: 20,
			left: 30
		},

		width = 900 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;

	var svg = d3.select("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

	var dropdown = d3.select("#dropdown")
		.insert("select", "svg")
		.on("change", dropDownChange);

	dataOptions = ['all', 'random', 'stratified']

	plotOptions = ['elbow', 'scree', 'pcaproj', 'mdsproj', 'loadedattr']

	var currDataOption = 'all'
	var currPlotOption = 'elbow'

	dropdown.selectAll("option")
		.data(dataOptions)
		.enter().append("option")
		.attr("value", function (d) {
			return d;
		})
		.text(function (d) {
			return d[0].toUpperCase() + d.slice(1, d.length);
		});
	var screeButton = d3.select("#screeButton")
		.on("click", toScree);

	var pcaProjButton = d3.select("#pcaProjButton")
		.on("click", toPCAProj);

	var mdsProjButton = d3.select("#mdsProjButton")
		.on("click", toMDSProj)

	var attrProjButton = d3.select("#attrProjButton")
		.on("click", toLoadedPCAAttr)


	drawElbowPlot(masterData.kmeansData)

	function getDataFromOption(dataOption) {
		if (dataOption == 'all') {
			return masterData.all
		} else if (dataOption == 'random') {
			return masterData.random
		} else {
			return masterData.stratified
		}
	}

	function toScree() {
		currPlotOption = 'scree'
		currData = getDataFromOption(currDataOption)
		data = currData.screeData
		drawScreePlot(data)
	}

	function toPCAProj() {
		currPlotOption = 'pcaproj'
		currData = getDataFromOption(currDataOption)
		data = currData.pcaData
		drawScatterPlot(data, "PCA1 vs PCA2")
	}

	function toMDSProj() {
		currPlotOption = 'mdsproj'
		currData = getDataFromOption(currDataOption)
		data = currData.mdsData
		drawScatterPlot(data, "MDS1 vs MDS2")

	}

	function toLoadedPCAAttr() {
		currPlotOption = 'loadedattr'
		currData = getDataFromOption(currDataOption)
		data = currData.loadedAttributesData
		drawBarChart(data)

	}

	function dropDownChange() {
		var newVariable = d3.select(this).property('value');
		currDataOption = newVariable
		if (currPlotOption == 'scree') {
			toScree()
		} else if (currPlotOption == 'pcaproj') {
			toPCAProj()
		} else if (currPlotOption == 'mdsproj') {
			toMDSProj()
		} else if (currPlotOption == 'loadedattr') {
			toLoadedPCAAttr()
		}
	}

	function drawElbowPlot(values) {

		data = values
		var g = d3.select("g");
		g.selectAll('*').remove();

		var xScale = d3.scaleBand()
			.rangeRound([0, width])
			.padding(0.1)
			.domain(data.map(function (d) {
				return d.x;
			}));

		var yScale = d3.scaleLinear()
			.rangeRound([height, 0])
			.domain([d3.min(data, (function (d) {
				return d.y;
			})), d3.max(data, (function (d) {
				return d.y;
			}))]);

		var valueline = d3.line()
			.x(function (d) {
				return xScale(d.x);
			})
			.y(function (d) {
				return yScale(d.y);
			});

		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		g.append("text")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("K-Means Distortion vs K");

		// axis-x
		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]));


		// axis-y
		g.append("g")
			//.attr("class", "axis axis--y")
			.call(d3.axisLeft(yScale));

		g.append("path")
			.data([data])
			.attr("class", "line")
			.attr("d", valueline);

		g.append('line')
			.style("stroke", "lightgreen")
			.style("stroke-width", 2)
			.attr("x1", xScale(10))
			.attr("y1", 0)
			.attr("x2", xScale(10))
			.attr("y2", yScale(0) + 10);


	}

	function drawScatterPlot(values, label) {
		data = values

		var g = d3.select("g");
		d3.selectAll("g > *").remove();

		var xmin = d3.min(data, (function (d) {
			return d[0];
		}))
		var xmax = d3.max(data, (function (d) {
			return d[0];
		}))

		var xScale = d3.scaleLinear()
			.rangeRound([height, 0])
			.domain([xmin, xmax]);

		var ymin = d3.min(data, (function (d) {
			return d[1];
		}))

		var ymax = d3.max(data, (function (d) {
			return d[1];
		}))

		var yScale = d3.scaleLinear()
			.rangeRound([height, 0])
			.domain([ymin, ymax]);


		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		g.append("text")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text(label);

		// axis-x
		if (ymin < 0 & 0 < ymax) {
			g.append("g")
				.attr("transform", "translate(0," + yScale(0) + ")")
				.attr("fill", "#A73406")
				.call(d3.axisBottom(xScale).ticks(10));
		} else {
			g.append("g")
				// .attr("transform", "translate(0," + yScale(0) + ")")
				.call(d3.axisBottom(xScale).ticks(10));
		}


		// axis-y
		if (xmin < 0 & 0 < xmax) {
			g.append("g")
				.attr("transform", "translate(" + xScale(0) + ",0)")
				.call(d3.axisLeft(yScale));
		} else {
			g.append("g")
				.call(d3.axisLeft(yScale));
		}


		console.log(data)
		g.selectAll("dot")
			.data(data)
			.enter().append("circle")
			.attr("r", 2)
			.attr("fill", "#052E11")
			.attr("cx", function (d) {
				return xScale(d[0]);
			})
			.attr("cy", function (d) {

				return yScale(d[1]);
			});


	}

	function colorFill(pca) {
		if (pca < 3) {
			return "#ff3300"
		}
		return "#ffcc66"

	}


	function drawScreePlot(values) {

		console.log(values)
		data = values
		var g = d3.select("g");
		d3.selectAll("g > *").remove();

		var xScale = d3.scaleBand()
			.rangeRound([0, width])
			.padding(0.1)
			.domain(data.map(function (d) {
				return d.x;
			}));

		var yScale = d3.scaleLinear()
			.rangeRound([height, 0])
			.domain([0, 1]);

		var valueline = d3.line()
			.x(function (d) {
				return xScale(d.x);
			})
			.y(function (d) {
				return yScale(d.y2);
			});

		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		g.append("text")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("Scree Plot");

		// axis-x
		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale).ticks(12))


		// axis-y
		g.append("g")
			//.attr("class", "axis axis--y")
			.call(d3.axisLeft(yScale));

		var bar = g.selectAll("rect")
			.data(data)
			.enter().append("g");


		// bar chart

		bar.append("rect")
			.attr("x", function (d) {
				return xScale(d.x);
			})
			.attr("y", function (d) {
				return yScale(d.y);
			})
			.attr("width", xScale.bandwidth())
			.attr("height", function (d) {
				return height - yScale(d.y);
			})
			.attr("fill", function (d, i) {
				return colorFill(i);
			});

		g.append("path")
			.data([data])
			.attr("class", "line")
			.attr("d", valueline);

		g.selectAll("dot")
			.data(data)
			.enter().append("circle")
			.attr("r", 5)
			.attr('fill', '#052E11')
			.attr("cx", function (d) {
				return xScale(d.x);
			})
			.attr("cy", function (d) {
				return yScale(d.y2);
			});


	}

	function drawBarChart(values) {

		var g = d3.select("g");
		d3.selectAll("g > *").remove();

		var ymax = d3.max(data, (function (d) {
			return d.y;
		}))

		var xScale = d3.scaleBand()
			.rangeRound([0, width])
			.padding(0.1)
			.domain(data.map(function (d) {
				return d.x;
			}));

		var yScale = d3.scaleLinear()
			.rangeRound([height, 0])
			.domain([0, ymax]);


		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		g.append("text")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("Most Loaded Features");

		// axis-x
		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))


		// axis-y
		g.append("g")
			.call(d3.axisLeft(yScale));

		var bar = g.selectAll("rect")
			.data(data)
			.enter().append("g");


		// bar chart

		bar.append("rect")
			.attr("x", function (d) {
				return xScale(d.x);
			})
			.attr("y", function (d) {
				return yScale(d.y);
			})
			.attr("width", xScale.bandwidth())
			.attr("height", function (d) {
				return height - yScale(d.y);
			})
			.attr("fill", function (d, i) {
				return colorFill(i);
			});

	}


}