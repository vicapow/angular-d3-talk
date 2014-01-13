svg.on('mousedown', function(){
  scope.$apply(function(){
    scope.data = d3.range(Math.round(Math.random()* 10) + 1).map(Math.random)
  })
})