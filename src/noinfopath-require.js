/**
 * #noinfopath-require
 * @version 0.0.18
 * NoInfoPath Require
 */
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.require",[])
		.provider("noRequire", [function (){

			function _service($injector, $q){
				this.loadScript = function(url){

					var deferred = $q.defer(),
						script = document.createElement("script");

					script.setAttribute("src", url);
					script.setAttribute("type","text/javascript");

					script.onload = function(e) {
						deferred.resolve(url);
						//register($injector, providers, [moduleName])
						//var fn = angular.module(moduleName); //initialize the module????

					};				

					script.onerror = function(e) {
						deferred.reject(e);
					};

					document.body.appendChild(script);	

					return deferred.promise;			
				}				
			}
	
			this.$get = ['$injector', '$q', function($injector, $q){
				return new _service($injector, $q);
			}];

		}])
	;

})(angular)