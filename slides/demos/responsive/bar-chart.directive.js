app.directive('barChart', function(){
  return {
    template: '<svg></svg>'
    , restrict: 'E'
    , scope: { data: '=', max: '=', min: '=' }
    , link: link
  }
  function link(scope, element, attrs){
    var el = element[0]
      , width = el.clientWidth
      , height = el.clientHeight
      , svg
      , y = d3.scale.linear()
      , bars
      , max
      , min
      , barSpacing

    if(attrs.barWidth === undefined) attrs.barWidth = 'fill'

    svg = d3.select(element.find('svg')[0])
    
    scope.$watch('data', update)
    
    scope.$watch(function(){
      return el.clientWidth * el.clientHeight
    },function(){
      width = el.clientWidth
      height = el.clientHeight
      resize()
    })

    function resize(){
      svg.attr({width: width, height: height})
      barSpacing = width / scope.data.length
      y.range([height, 0])
      var rect = bars.selectAll('g')
        .attr('transform', function(d, i){
          return 'translate(' + i * barSpacing + ',0)' 
        }).select('rect')
          .attr('y', function(d){ return y(d) })
          // .attr('height', '1')
          .attr('height', function(d){ return height - y(d)})
      if(attrs.barWidth === 'fill')
        rect.attr('width', barSpacing - 1)
      else rect.attr('width', attrs.barWidth)
        .attr('x', barSpacing / 2 - attrs.barWidth / 2)
    }

    function update(data, oldData){
      if(scope.max === undefined) max = d3.max(data, function(d){ return d })
      else max = scope.max
      if(scope.min === undefined) min = 0
      else min = scope.min
      console.log('min', min, 'max', max)
      y.domain([min, max]).range([height, 0])
      barSpacing = width / data.length
      // no need to add new bars
      if(oldData && oldData !== data && data.length === oldData.length) return
      // re-add the bars
      bars = svg.append('g').attr('class', 'bars')
      var g = bars.selectAll('g').data(data)
      g.enter().append('g').attr('class', 'bar').append('rect')
      g.exit().remove()
      resize()
    }
  }
})