/*global d3, assetgraph*/
/*jshint onevar:false*/

window.onload = function () {
    // Fallback to show nothing. This shoudl probably be improved
    window.assetgraph = assetgraph || {
        assets: [],
        relations: []
    };

    // Data preperation for simpler d3 code
    assetgraph.relations.forEach(function (relation) {
        var distance = 10 +
            assetgraph.assets[relation.source].r +
            assetgraph.assets[relation.source].outgoing * 2 +
            relation.type.length * 6;

        if (relation.target) {
            distance += assetgraph.assets[relation.target].r;
        }

        relation.distance = distance;
    });

    var graph = d3.select('.graph')
            .attr('pointer-events', 'all')
            .call(d3.behavior.zoom().on('zoom', function () {
                graph.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
            }))
            .append('g'),
        force = d3.layout.force()
            .nodes(d3.values(assetgraph.assets))
            .links(assetgraph.relations)
            .size([window.innerWidth, window.innerHeight]) // Some browsers have trouble reading dimensions of svg elements
            .gravity(0.05)
            .charge(function (d) {
                var charge = -200;

                // Big files repulse more
                charge -= (d.size / 200);

                // Initial files get extra bonus
                if (d.initial) {
                    charge -= 1000;
                }
                return charge;
            })
            .linkDistance(function (d) {
                return d.distance;
            });

    var edges = graph.append('g')
        .attr('class', 'relations')
        .selectAll('path')
        .data(force.links())
        .enter()
            .append('path')
            .attr('id', function (d, i) { return 'p' + i; });

    var edgeLabels = graph.append('g')
        .attr('class', 'relationLabels')
        .selectAll('text')
        .data(force.links()).enter()
            .append('text')
            .attr('text-anchor', 'end')
                .append('textPath')
                .attr('startOffset', function (d) {
                    var offset = d.distance - assetgraph.assets[d.target].r - 5;
                    return offset;
                })
                .attr('xlink:href', function (d, i) { return '#p' + i; })
                .text(function (d) { return d.type; });

    var nodes = graph.append('g')
        .attr('class', 'assets')
        .selectAll('g')
        .data(force.nodes()).enter()
            .append('g');

    nodes.append('circle')
        .attr('r', function (d) { return d.r; })
        .attr('class', function (d) { return d.type; })
        .call(force.drag);

    nodes.append('title')
        .text(function (d) { return d.fileName + ' - ' + filesize(d.size); });

    nodes.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', function (d) { return -(5 + d.r); })
        .text(function (d) { return d.fileName; });


    force.on('tick', function () {
        edges.attr('d', function (d) {
            return "M" + d.source.x + "," + d.source.y +
                   " " + d.target.x + "," + d.target.y;
        });

        nodes.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }).start();
};
