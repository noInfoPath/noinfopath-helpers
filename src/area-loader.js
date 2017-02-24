/**
*	## NoAreaLoaderService
*
*	The purpose of this services it to keep track of the async loading of all
*	noInfoPath components. The idea is to mitigate issues with ngFormControllers
*	being set to dirty while an area is loading.
*/

(function (angular, undefined) {
	function NoAreaLoaderService($rootScope, noFormConfig, noPrompt, _) {
		if(!$rootScope.areas) $rootScope.areas = {};

		function _registerArea(areaName, cb) {
			//var config = noInfoPath.getItem(noConfig.current, areaName);
			var area = noFormConfig.getFormByRoute(areaName),
				components = noInfoPath.getItem(area, "noForm.noComponents"),
				registerables = {},
				nestedGrids = [],
				safeName = areaName.replace(/\./g, "_");

			for(var c in components) {
				var component = components[c];

				if(component.noKendoGrid) registerables[c] = false;

				if(component.noDataPanel) registerables[c] = false;

				if(component.noGrid && component.noGrid.nestedGrid) {
					nestedGrids.push(component.noGrid.nestedGrid.noForm.split(".")[2]);
				}

			}

			nestedGrids.forEach(function(e){
				delete registerables[e];
			});


			$rootScope.areas[safeName] = registerables;

			$rootScope.$watchCollection("areas." + safeName, function(safeName, n, o, s){
				var done = true;


				//console.log("areas." + safeName, n);

				for(var k in n) {
					var c = n[k];

					done = done & c;

					if(!done) break;
				}

				if(done) {
					console.log("noAreaLoader::areaReady", safeName);
					noPrompt.hide(1000);
					$rootScope.$broadcast("noAreaLoader::areaReady", safeName);
				}

			}.bind(null, safeName));

			return _.size(registerables);
		}
		this.registerArea = _registerArea;

		function _loading(areaName, compName) {
			//console.log("noAreaLoader::loading", compName);
			$rootScope.areas[areaName.replace(/\./g, "_")][compName.split(".")[2]] = false; //Means that the component is not loaded.
		}
		this.markComponentLoading = _loading;

		function _loaded(areaName, compName) {
			//console.log("noAreaLoader::loaded", compName);
			$rootScope.areas[areaName.replace(/\./g, "_")][compName.split(".")[2]] = true; //Means that the component is loaded.
		}
		this.markComponentLoaded = _loaded;
	}

	angular.module("noinfopath.helpers")
		.service("noAreaLoader", ["$rootScope", "noFormConfig", "noPrompt", "lodash", NoAreaLoaderService])
		;
})(angular);
