!(function(){
    "use strict"

    var size = 640;
    var height = 480;
    var width = 960;
    var charge = -0.3;

    var devicePixelRatio = window.devicePixelRatio || 1;	// Retina support

    var idCounter = 0;
    function randomCircle() {
        return {
            id: "c" + idCounter++,	// Need id for removal? http://stackoverflow.com/questions/13188395/setting-an-id-issue-in-d3
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            r: Math.floor(Math.random() * 8 + 2)
        };
    }

    var model = d3.range(size).map(randomCircle);
    var start = new Date();
    var time = 0;
    var ticks = 0;


    var canvas = d3.select('#graph')
        .append('canvas')
        .attr("width", width * devicePixelRatio)
        .attr("height", height * devicePixelRatio)
        .style("width", width + "px")
        .style("height", height + "px")
    ;

    var context = canvas.node().getContext("2d");
    context.scale(devicePixelRatio, devicePixelRatio);	// Retina support


// From http://bl.ocks.org/JMStewart/43ec6ba5df865181a66d
// Was: d3.ns.prefix.custom = "http://github.com/mbostock/d3/examples/dom";

// Actually not sure why this custom namespace is necessary anyway
// d3.namespaces["custom"] = "http://zaiadesign.com";
// d3.namespace("custom:circle");

// As far as I can tell, container is not added to DOM and is just an object for
// d3 to append circles to and animate using transitions, while drawing is still
// all done in
    var container = d3.select(document.createElementNS('custom', 'g'));

    var simulation;
    var circles;
    var newCircles;
    var dyingCircles;

    function drawWithData(data, simulation) {
        // console.log('drawWithData: ' + data.length + " simulation: ", simulation + " container: ", container);
        // console.log('drawWithData: container = ' + container);

        // nodes = simulation.nodes();
        circles = container.selectAll('circle')
            .data(data);

        // Insertion animation.
        newCircles = circles.enter()
            .append('circle')
            .attr("id", function(d, i){ return d.id; })
            .attr('r', 0)
            .attr('alpha', 1)
        ;

        circles.transition()
            .duration(1500)
            .attr('r', function(d){
                return d.r;
            });

        // Deletion animation
        dyingCircles = circles.exit();
        dyingCircles.transition()
            .duration(1200)
            .attr('r', 0)
            .attr('alpha', 0)
            .remove();

        simulation.on('tick', function() {
            var renderStart = new Date();
            context.clearRect(0, 0, width, height);
            context.fillStyle = "rgb(70, 130, 180)";
            context.beginPath();

            circles.each(function(d) {
                context.moveTo(d.x, d.y);
                var radius = d3.select(this).attr('r'); // because d.r contains the final value
                context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
            });

            dyingCircles.each(function(d) {
                context.moveTo(d.x, d.y);
                var alpha = d3.select(this).attr('alpha');
                context.fillStyle = "rgb(70, 130, 180, "+alpha+")";
                var radius = d3.select(this).attr('r'); // because d.r contains the final value
                context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
            });

            context.fill();

            time += (new Date() - renderStart);
            ticks++;
        });

        simulation.on('end', function(){
            var totalTime = new Date() - start;
            console.log('Total Time:', totalTime);
            console.log('Render Time:', time);
            console.log('Ticks:', ticks);
            console.log('Average Time:', totalTime / ticks);
        });
    }

    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(width/2))
        .force("y", d3.forceY(height/2))
        .force("charge", d3.forceManyBody().strength(function(node, index) {
            return node.r * node.r * charge;
        }))
        // .force("center", d3.forceCenter(width/2, height/2))
        .nodes(model)
    ;


    drawWithData(model, simulation);
    console.log("model = ", model);
    console.log("simulation = ", simulation);

    function randInt(max, min) {
        return ((min | 0) + Math.random() * (max + 1)) | 0;
    }

    document.getElementById("draw").onclick = function() {
        // simulation.nodes(data);
        // simulation.alpha(1.0).restart();
        drawWithData(model, simulation);
    }

    document.getElementById("add").onclick = function() {
        for (var i=0; i<100; i++) {
            model.push(randomCircle());
        }
        simulation.nodes(model);			// Refresh simulation nodes
        simulation.alpha(1.0).restart();	// When changing simulation, need to 'reheat' it
        drawWithData(model, simulation);
    };

    document.getElementById("remove").onclick = function() {
        // model = model.splice(100, model.length);
        model = model.splice(0, model.length-100);
        simulation.nodes(model);			// Refresh simulation nodes
        simulation.alpha(1.0).restart();	// When changing simulation, need to 'reheat' it
        drawWithData(model, simulation);
    }

}());

