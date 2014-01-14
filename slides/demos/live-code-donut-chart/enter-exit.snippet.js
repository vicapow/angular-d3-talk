    scope.$watch('data', function(data){
      var duration = 1000
      arcs = arcs.data(pie(data))
      arcs.transition()
        .duration(duration)
        .attrTween('d', arcTween)
      
      arcs.enter()
        .append('path')
        .style('stroke', 'white')
        .attr('fill', function(d, i){ return color(i) })
        .each(function(d) {
          this._current = { startAngle: 2 * Math.PI - 0.001, endAngle: 2 * Math.PI }
        })
        .transition()
        .duration(duration)
        .attrTween('d', arcTween)
      
      arcs.exit()
        .transition()
        .duration(duration)
        .each(function(d){ 
          d.startAngle = 2 * Math.PI - 0.001; d.endAngle = 2 * Math.PI; 
        })
        .attrTween('d', arcTween).remove();
    })