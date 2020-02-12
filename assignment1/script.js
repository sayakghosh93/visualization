function main() {

	var width = 800
	var height = 450
	var svg = d3.select("svg"),
		margin = 200,
		width = width - margin,
		height = height - margin


	var binSize = 10,
		inflationSize = 10;

	var defaultVariable = "sales"

	var isBarChart = true
	var isFDG = false

	var g = svg.append("g")
		.attr("transform", "translate(" + 100 + "," + 100 + ")");



	var slider = svg.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(100,0)")



	var xScale = d3.scaleLinear();
	var yScale = d3.scaleLinear();

	var valueMap = {};

	var defaultVariable = "sales"
	var currentVariable = defaultVariable

	var data;

	var variables = ['sales', 'profits', 'assets', 'marketvalue']

	d3.csv("forbes.csv", function (error, csvdata) {
		if (error) {
			throw error;
		}

		variables.forEach(function (variable) {
			valueMap[variable] = csvdata.map(d => d[variable])
		});

		paint(defaultVariable);

		var pieButton = d3.select("#pieButton")
			.on("click", toPie);

		var barButton = d3.select("#barButton")
			.on("click", toBar);

		var fdgButton = d3.select("#fdgButton")
			.on("click", toFDG)


		d3.select("#slider").on("input", function () {
			update(+this.value);
		});

		var dropdown = d3.select("#dropdown")
			.insert("select", "svg")
			.on("change", dropDownChange);

		dropdown.selectAll("option")
			.data(variables)
			.enter().append("option")
			.attr("value", function (d) {
				return d;
			})
			.text(function (d) {
				return d[0].toUpperCase() + d.slice(1, d.length); 
			});

		function update(val) {
			binSize = val
			if(isFDG)
				return
			console.log(val)
			if (!isBarChart)
				toPie()
			else
				paint(currentVariable);
		}

		function dropDownChange() {
			
			var newVariable = d3.select(this).property('value');
			currentVariable = newVariable
			if(isFDG){
				toFDG()
				return
			}
				
			if (!isBarChart)
				toPie()
			else
				paint(newVariable);

		}

		function toBar() {
			isBarChart = true
			isFDG = false
			paint(currentVariable)
		}

		function toPie() {
			isBarChart = false
			isFDG = false
			values = valueMap[currentVariable]
			d3.selectAll("g > *").remove()
			d3.selectAll("circle").remove()
			d3.selectAll(".link").remove()

			var data = d3.histogram().domain([0, maxVal]).thresholds(binSize)(values);

			bindata = Array();

			data.forEach(function (variable) {
				bindata.push(variable.length)
			});

			var text = "";

			var width = 400;
			var height = 400;
			var thickness = 40;
			var duration = 750;
			var padding = 10;
			var opacity = .8;
			var opacityHover = 1;
			var otherOpacityOnHover = .8;
			var tooltipMargin = 13;

			var radius = Math.min(width - padding, height - padding) / 2;

			var cx = width/2 
			var cy = height/2

			var g = svg.append('g')
				.attr('transform', 'translate(' + cx + ',' + cy + ')');

			g.append('svg')
				.attr('class', 'pie')
				.attr('width', width)
				.attr('height', height);

			var color = d3.scaleOrdinal(d3.schemeCategory10);
			var arc = d3.arc().innerRadius(0).outerRadius(radius);
			var pie = d3.pie().value(function (d) {return d.length;}).sort(null);
			var path = g.selectAll('path')
				.data(pie(data))
				.enter()
				.append("g")
				.append('path')
				.attr('d', arc)
				.attr('fill', (d, i) => color(i))
				.style('opacity', opacity)
				.style('stroke', 'white')
				.on("mouseover", function (d, i) {
					var _d = arc.centroid(d)
					dx = _d[0] * 1.5
					dy = _d[1] * 1.5
					arc.outerRadius(radius + inflationSize)
					d3.select(this)
						.attr("d", arc)
					d3.select(this)
						.transition() 
						.duration(400)
						.attr("transform", function (d) {
							return "translate(" + 0 + "," + (-inflationSize) + ")";
						})
					g.append("text")
						.text(function () {
							return ["("+d.value + ","+i+")"];
						})
						.attr("transform", function (d) {
							return "translate(" + dx + "," + dy + ")";
						})
				})
				.on("mouseout", function (d, i) {
					arc.outerRadius(radius)
					d3.select(this)
						.attr("d", arc) 
					d3.select(this)
						.transition() 
						.duration(400)
						.attr("transform", function (d) {
							return "translate(" + 0 + "," + (-inflationSize) + ")";
						})
					d3.select(this)
						.transition() 
						.duration(400)
						.attr("transform", function (d) {
							return "translate(" + 0 + "," + 0 + ")";
						});
						arc.outerRadius(radius)			

					d3.selectAll('text')
						.remove()
				})
				.transition()

		}

		function paint(variable) {
			console.log("Painting")			
			d3.selectAll("g > *").remove()
			d3.selectAll("circle").remove()
			d3.selectAll(".link").remove()			

			var barWidth = 800
			var barHeight = 450

			var svg = d3.select("svg"),
				margin = 200,

				width = barWidth - margin,
				height = barHeight - margin

			values = valueMap[variable]
			maxVal = Math.max(...values);
			minVal = Math.min(...values);	

			xScale.domain([0, maxVal]).range([0, width]);

			var data = d3.histogram().domain([0, maxVal]).thresholds(binSize)(values);

			yScale.domain([0, d3.max(data, function (d) {
				return d.length;
			})]).range([height, 0]);

			svg.attr("width", barWidth)
				.attr("height", barHeight);
			var g = svg.append("g")
				.attr("transform", "translate(" + 100 + "," + 100 + ")");
			var g = svg.append("g")
				.attr("transform", "translate(" + 100 + "," + 100 + ")");

			console.log(currentVariable)

			g.append("g") 
				.attr("transform", "translate(0," + height + ")") 
				.call(d3.axisBottom(xScale)) 
				.append("text")
				.attr("y", height - 200	)
				.attr("x", width- 100)
				.attr("text-anchor", "end")
				.attr("stroke", "black")
				.text(currentVariable);

			g.append("g") 
				.call(d3.axisLeft(yScale).tickFormat(function (d) { 
						return d;
					})
					.ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "-5.1em")
				.attr("text-anchor", "end")
				.attr("stroke", "black")
				.attr("font-family","Arial")
				.attr("font-size","16pts")
				.text("Frequency");

			var bar = g.selectAll(".bar")
				.data(data)
				.enter().append("g")
				.attr("class", "bar")
				.attr("transform", function (d) {
					return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";
				});

			bar.append("rect")
				.attr("width", xScale(data[0].x1) - xScale(data[0].x0) - 1)
				.attr("height", function (d) {
					return height - yScale(d.length);
				})
				.on("mouseover", function (d, i) {
					values = valueMap[currentVariable]
					var data = d3.histogram().domain([0, maxVal]).thresholds(binSize)(values);
					d3.select(this).attr('class', 'highlight'); 
					d3.select(this)
						.transition() 
						.duration(400)
						.attr("transform", function (d) {
							return "translate(" + 0 + "," + (-inflationSize) + ")";
						})
						.attr("height", function (d) {
							return height - yScale(d.length) + inflationSize;
						});
					g.append("text")
						.attr('class', 'val')
						.attr('x', function () {
							return xScale(data[i].x0) + 10;
						})
						.attr('y', function () {
							return yScale(d.length) - 15;
						})
						.text(function () {
							return [+d.length]; 
						});


				}) 
				.on("mouseout", function (d, i) {
					d3.select(this).attr('class', 'bar');
					d3.select(this)
						.transition() 
						.duration(400)
						.attr("transform", function (d) {
							return "translate(" + 0 + "," + 0 + ")";
						})
						.attr("height", function (d) {
							return height - yScale(d.length);
						}); 

					d3.selectAll('.val')
						.remove()

				})
				.transition()
				.ease(d3.easeLinear)
				.duration(400)
				.delay(function (d, i) {
					return i * 50;
				});


		}

		function toFDG() {
			isFDG = true			
			var svg = d3.select("svg");
			svg.selectAll('*').remove();

			values = valueMap[currentVariable]

			var margin = {
					top: 100,
					right: 10,
					bottom: 100,
					left: 400
				},
				fwidth = 1500 - margin.left - margin.right,
				fheight = 800 - margin.top - margin.bottom
			dist = 10;


			var data = d3.histogram().thresholds(binSize)(values);

			var nodes = [];

			for (var i = 0; i < csvdata.length; i++) {
				var node = {};
				node.value = csvdata[i][currentVariable];
				node.name = csvdata[i].name;

				nodes.push(node);
			}

			var links = [];

			for(var i = 0; i<csvdata.length;i++){
				var a = createFeatureVector(csvdata[i])
				for (var j =i+1; j<csvdata.length;j++) {
					var b = createFeatureVector(csvdata[j])
					var dp = similarity(a,b)
					if (dp>0.995){
						var link ={}
						link.source = i;
						link.target = j;
						links.push(link)
					}
				}
				
			}

			console.log(links.length)

			var set = {};
			set.nodes = nodes;
			set.links = links;
			var svg = svg.attr("width", fwidth)
				.attr("height", fheight);
			var color = d3.scaleOrdinal(d3.schemeCategory10);


			var simulation = d3.forceSimulation(set.nodes)
				.force("charge_force",  d3.forceManyBody())
				.force("center_force", d3.forceCenter(width / 2, height / 2))
				.force("link", d3.forceLink().distance(dist));


			var nodes = svg.selectAll("circle")
				.data(set.nodes)
				.enter()
				.append("circle")
				.attr("r", function (d) {
					return Math.sqrt(+(d.value));
				})
				.style("fill", function (d, i) {
					return color(i);
				})
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended))
				.on("click", function () {
					toBar();
				});


			var link = svg.selectAll(".link")
				.data(set.links)
				.enter()
				.append("line")
				.attr("class", 'link')
				.attr("stroke-width", 2)
				.attr("stroke", "red");


		  nodes.append("title")
		      .text(function(d) { return d.name; });
	

			simulation.nodes(set.nodes).on('tick', ticked);
			simulation.force('link', d3.forceLink().links(set.links));


			function ticked() {
				link.attr("x1", function (d) {
						return d.source.x;
					})
					.attr("x2", function (d) {
						return d.target.x;
					})
					.attr("y1", function (d) {
						return d.source.y;
					})
					.attr("y2", function (d) {
						return d.target.y;
					})
					.attr("stroke", "black");

				nodes.attr("cx", function (d) {
						return d.x;
					})
					.attr("cy", function (d) {
						return d.y;
					});

			}

			function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}

			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}

			function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			}

			function createFeatureVector(d){
				return [d.assets,d.profits,d.marketvalue,d.sales]
			}

			function dotproduct(a,b) {
			    var n = 0, lim = Math.min(a.length,b.length);
			    for (var i = 0; i < lim; i++) n += a[i] * b[i];
			    return n;
			 }

			function norm2(a) {var sumsqr = 0; for (var i = 0; i < a.length; i++) sumsqr += a[i]*a[i]; return Math.sqrt(sumsqr);}

			function similarity(a, b) {return dotproduct(a,b)/norm2(a)/norm2(b);}
		}


	});

}