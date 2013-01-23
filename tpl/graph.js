/*global d3, assetgraph*/

window.onload = function () {
    var svg = d3.select('.graph'),
        force = d3.layout.force()
            .nodes(d3.values(assetgraph.assets))
            .links(assetgraph.relations)
            .size([window.innerWidth, window.innerHeight]) // Some browsers have trouble reading dimensions of svg elements
            .gravity(.05)
            .charge(-300)
            .linkDistance(200);


    var edges = svg.append('g')
        .attr('class', 'relations')
        .selectAll('path')
        .data(force.links())
        .enter()
            .append('path')
            .attr('id', function (d, i) { return 'p' + i; });

    var edgeLabels = svg.append('g')
        .attr('class', 'relationLabels')
        .selectAll('text')
        .data(force.links()).enter()
            .append('text')
            .attr('text-anchor', 'middle')
                .append('textPath')
                .attr('startOffset', '50%')
                .attr('xlink:href', function (d, i) { return '#p' + i; })
                .text(function (d) { return d.type; });

    var nodes = svg.append('g')
        .attr('class', 'assets')
        .selectAll('g')
        .data(force.nodes()).enter()
            .append('g');

    nodes.append('circle')
        .attr('r', 6)
        .attr('class', function (d) { return d.type; })
        .call(force.drag);

    nodes.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', function () { return -10; })
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
