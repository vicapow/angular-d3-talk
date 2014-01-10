

var app = angular.module('myApp', [])

app.controller('MainCtrl', function($scope){
  var attrHash = {}
  
  var ids = 0
  $scope.attributes = []
  $scope.addAttribute = function(attr){
    var id = ++ids
    // default new attribute
    if(!attr) attr = {
      name: 'new attribute',
      value: 10,
      min: 0,
      max: 20
    }
    attr.id = id
    attrHash[attr.id] = attr
    $scope.attributes.push(attr)
  }

  // add some mock attributes to start with
  ;[
    { name: 'strength', value: 10, min: 0, max: 20 },
    { name: 'speed', value: 10, min: 0, max: 20 },
    { name: 'agility', value: 10, min: 0, max: 20 }
  ].forEach($scope.addAttribute)

  $scope.removeAttribute = function(){
    attrHash[$scope.attributes.splice(this.$index, 1)[0].id] = undefined
  }

  $scope.players = []
  $scope.addPlayer = function(){
    $scope.players.push({ name: 'New Player', attributes: [] })
    syncAttributes($scope.attributes)
  }
  $scope.removePlayer = function(){
    $scope.players.splice(this.$index, 1)
  }
  $scope.$watch('attributes', function(attributes){
    syncAttributes(attributes)
  }, true)

  function syncAttributes(attributes){
    $scope.players.forEach(function(player){
      var playerAttrIds = player.attributes.map(function(a){ return a.id })
      // find all the attributes that aren't yet on the player
      var attrIds = attributes.map(function(a){ return a.id })

      // remove old attributes
      player.attributes = player.attributes
        .filter(function(attr){ return attrHash[attr.id] })

      // add any new attributes
      player.attributes = player.attributes.concat(
        attributes
        .filter(function(attr){ return playerAttrIds.indexOf(attr.id) === -1 })
        .map(function(attr){ return angular.copy(attr) })
      )

      // update player attributes from attribute configuration changes
      player.attributes.forEach(function(attr){
        var config = attrHash[attr.id]
        attr.name = config.name
        attr.min = config.min
        attr.max = config.max
        if(attr.value < config.min) attr.value = config.min
        if(attr.value > config.max) attr.value = config.max
      })
    })
  }
})

app.directive('radarChart', function(){
  function link(scope, el, attr){

    var width = 200, height = 200
    var radius = width / 2

    // fiddle: http://jsfiddle.net/Wexcode/CrDUy/
    var angle = d3.scale.linear().range([0, Math.PI * 2])

    var line = d3.svg.line.radial()
      .interpolate("linear")
      .tension(0)
      .radius(function(d){
        return (d.value - d.min) / (d.max - d.min) * radius 
      })
      .angle(function(d, i) { return angle(i); });

    var svg = d3.select(el[0]).append('svg')
      .attr({width: width, height: height})
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    var area = svg.append('path')
      .attr('class', 'area')
      .style('opacity', '1')
      .style('fill', '#999')

    scope.$watch('data', function(data){
      if(!data) return
      angle.domain([0, data.length])
      area.datum(data).attr('d', line)
      var axis = svg.selectAll('g.axis').data(data)
      axis.call(updateAxis)
      axis.enter().append('g').attr('class', 'axis').call(updateAxis)
      axis.exit().remove()
    }, true)

    function updateAxis(axis){
      axis.each(function(d, i){
        var scale = d3.scale.linear()
          .domain([d.min, d.max])
          .range([0, radius])
        var axis = d3.svg.axis().scale(scale).ticks(4)
        d3.select(this).call(axis)
          .attr('transform', function(){
            return 'rotate(' + (angle(i) / Math.PI * 180 - 90) + ')'
          })
      })
    }

  }
  return {
    restrict: 'E',
    scope: { 'data': '=' },
    link: link
  }
})