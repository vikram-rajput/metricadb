var request = require('superagent');
var endpoints = require('./endpoints.json');
module.exports = function() {
  return new MetricaDB();
};
function MetricaDB(){
  return this;
}
Object.keys(endpoints.methods).forEach(function(method){
  // console.log('landed here');
  var met = endpoints.methods[method];
  Object.keys(met).forEach(function(m){
    MetricaDB.prototype[method + m] = function(params, fn){
      var self = this;
      if("function" == typeof params) {
        fn = params;
        params = {};
      }
      execMethod.call(this, met[m].method, params, met[m].resource, fn);
      return this;
    };
  });
});
var execMethod = function(type, params, endpoint, fn){
  params = params || {};
  endpoint = endpoint.replace(':id', params.id).replace(':season_number', params.season_number).replace(':episode_number', params.episode_number);
  type = type.toUpperCase();
  var req = request(type, endpoints.base_url + endpoint)
            .set('Accept', 'application/json');
  if (params.ifNoneMatch) {
    req=req.set('If-None-Match', params.ifNoneMatch);
  } else if (params.ifModifiedSince) {
    var t=params.ifModifiedSince;
    if (t.toUTCString) {
      t=t.toUTCString();
    }
    req=req.set('If-Modified-Since', t);
  }
  if(type === 'GET')
    req.query(params);
  else
    req.send(params);
  req.end(function(err, res){
    if(err){
      fn(err, null, res);
    } else {
      fn(null, res.body, res);
    }
  });
};
