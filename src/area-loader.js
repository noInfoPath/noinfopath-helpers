/**
*	## NoAreaLoaderService
*
*	The purpose of this services it to keep track of the async loading of all
*	noInfoPath components. The idea is to mitigate issues with ngFormControllers
*	being set to dirty while an area is loading.
*/

(function (angular, undefined) {
	function NoAreaLoaderService($rootScope) {
		if(!$rootScope.areas) $rootScope.areas = {};

		function _registerArea(areaName, cb) {
			if(!$rootScope.areas[areaName]) $rootScope.areas[areaName] = {};

			$rootScope.areas[areaName] = {};

			$rootScope.$watchCollection("areas." + areaName + "components", function(areaName, n, o, s){
				var done = true;

				for(var k in n) {
					var c = n[k];

					done = done & c;

					if(!done) break;
				}

				if(done) {
					console.log("noAreaLoader::areaReady", areaName);
					$rootScope.$broadcast("noAreaLoader::areaReady", areaName);
				}

			}.bind(null, areaName));
		}
		this.registerArea = _registerArea;

		function _loading(areaName, compName) {
			$rootScope.areas[areaName][compName] = false; //Means that the component is not loaded.
		}
		this.markComponentLoading = _loading;

		function _loaded(areaName, compName) {
			$rootScope.areas[areaName][compName] = true; //Means that the component is loaded.
		}
		this.markComponentLoaded = _loaded;
	}

	angular.module("noinfopath.helpers")
		.service("noAreaLoader", ["$rootScope", NoAreaLoaderService])
		;
})(angular);
