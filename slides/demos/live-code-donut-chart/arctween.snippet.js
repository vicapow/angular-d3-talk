
    function arcTween(a) {
      // see: http://bl.ocks.org/mbostock/1346410
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }