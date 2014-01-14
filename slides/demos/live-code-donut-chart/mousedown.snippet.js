    svg.on('mousedown', function(){
      scope.$apply(function(){
        var num = Math.round(Math.random()* 10) + 1
        scope.data = d3.range(num).map(Math.random)
      })
    })