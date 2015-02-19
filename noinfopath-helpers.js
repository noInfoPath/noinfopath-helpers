/**
 * #noinfopath-helpers
 * NoInfoPath Helpers
 */

(function(angular,undefined){

	angular.module('noinfopath.helpers',[])
		.service("noUrl",['$window', function($window){
			this.params = function() {
				var qs = !!$window.location.search ? $window.location.search.substr(1) : "",
					qp = qs.split('&'),
					params = {};

				angular.forEach(qp, function(p){
					var nvp = p.split('=');
					if(nvp.length > 1){
						params[nvp[0]] = nvp[1];
					}else if(nvp.length == 1){
						if(!!nvp[0])
						params[nvp[0]] = true;
					}else{
						angular.noop();
					}
				})

				return params;
			}
		}])
	;
})(angular)