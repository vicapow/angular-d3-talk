

var app = angular.module('myApp', [])

app.controller('MainCtrl', function($scope, $window){
  var attrHash = {}


  angular.element($window).on('resize', $scope.$apply.bind($scope))
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
  var playerIds = 1
  $scope.addPlayer = function(){
    $scope.players.push({ name: 'Character ' + (playerIds++), attributes: [] })
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
    var el = el[0]
    var pi = Math.PI
    var width = el.clientWidth, height = el.clientHeight
    var radius = 0
    var padding = 10

    // fiddle: http://jsfiddle.net/Wexcode/CrDUy/
    var angle = d3.scale.linear().range([0, Math.PI * 2])

    var radiusFromDatum = function(d){
      return (d.value - d.min) / (d.max - d.min) * radius 
    }

    var line = d3.svg.line.radial()
      .interpolate("linear")
      .tension(0)
      .radius(radiusFromDatum)
      .angle(function(d, i) { return angle(i) })

    var drag = d3.behavior.drag()
    .on("drag", function(d,i) {
      var self = this
      scope.$apply(function(){
        var x = d3.mouse(self)[0]
        var p = x / radius
        if(p > 1) p = 1
        if(p < 0) p = 0
        d.value =  p * (d.max - d.min)
        d3.select(self).attr('cx', p * radius)
      })
    })

    var svg = d3.select(el).append('svg')
    var g = svg.append('g')
    var axis = g.selectAll('g.axis')

    var area = g.append('path')
      .attr('class', 'area')
      .style('opacity', '1')
      .style('fill', '#999')

    var nobs = g.selectAll('g.nob')

    scope.$watch('data', function(data){
      if(!data) return
      angle.domain([0, data.length])
      area.datum(data).attr('d', line)

      // add, update, or remove axis
      axis = axis.data(data)
      axis.enter().append('g')
        .attr('class', 'axis').call(updateAxis)
        .append('text').attr('class', 'label')
          .style('text-anchor', 'end')
      axis.call(updateAxis)
      axis.exit().remove()

      // add, update, or remove nobs
      nobs = nobs.data(data)
      nobs.enter().append('g')
        .attr('class', 'nob')
        .append('circle').attr('r', 5)
        .call(drag)
      nobs.call(updateNobs)
      nobs.exit().remove()
    }, true)

    scope.$watch(function(){
      return el.clientWidth * el.clientHeight
    }, function(){
      width = el.clientWidth
      height = el.clientHeight
      var newRadius = Math.min(width, height) / 2

      // no need to run these updates if the radius didn't change
      if(newRadius - padding !== radius){
        radius = newRadius - padding
        area.attr('d', line) // update the area to the new radius
        axis.call(updateAxis)
        nobs.call(updateNobs)
      }
      svg.attr({width: width, height: height})
      g.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    })

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
      axis.call(updateAxisLabels)
    }

    function updateAxisLabels(axis){
      axis.select('text.label')
        .attr('transform', 'translate(' + radius + ', -5)')
        .text(function(d){ return d.name })
    }

    function updateNobs(nobs){
      nobs.attr('transform', function(d, i){
          return 'rotate(' + (angle(i) / Math.PI * 180 - 90) + ')'
        })
        .select('circle').attr('cx', radiusFromDatum)
    }
  }

  function pointFromAngleRadius(angle, radius){
    return [ Math.cos(angle) * radius, Math.sin(angle) * radius ]
  }
  return {
    restrict: 'E',
    scope: { 'data': '=' },
    link: link
  }
})