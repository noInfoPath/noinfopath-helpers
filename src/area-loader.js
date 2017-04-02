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


		function _safeName(inName) {
			return inName.replace(/(\W|\s)/g, "_");
		}

		function _resolveComponentName(compName) {
			if(!compName) console.trace();

			var parts = compName.split(".");

			if(parts.length > 0) {
				return parts[parts.length-1];
			} else {
				return _safeName(compName);
			}
		}

		function _registerArea(areaName, cb) {
			//var config = noInfoPath.getItem(noConfig.current, areaName);
			var area = noFormConfig.getFormByRoute(areaName),
				components = noInfoPath.getItem(area, "noForm.noComponents"),
				registerables = {},
				nestedGrids = [];

			areaName = _safeName(areaName);

			for(var c in components) {
				var component = components[c];

				if(component.noKendoGrid)
				{
					if(!component.noGrid || !component.noGrid.skipAreaRegistration) {
						registerables[c] = false;
					}
				}

				if(component.noDataPanel) registerables[c] = false;

				if(component.noGrid && component.noGrid.nestedGrid) {
					nestedGrids.push(_resolveComponentName(component.noGrid.nestedGrid.noForm));
				}

			}

			nestedGrids.forEach(function(e){
				delete registerables[e];
			});


			$rootScope.areas[areaName] = {
				registerables: registerables
			};

			$rootScope.areas[areaName].unWatch = $rootScope.$watchCollection("areas." + areaName + ".registerables", function(safeName, n, o, s){
				var done = true, str = "", ok = 0, t = _.size(n);

				if(n && t > 0) {
					for(var k in n) {
						var c = n[k];
						str += "\t" + k + ": " + c + "\n";
						if(c) ok++;
					}

					done = ok === t;

					if(done) {
						console.log("noAreaLoader::Complete", safeName);
						noPrompt.hide(500);
						console.warn("Deprecating noAreaLoader::areaReady in a future release. Use noAreaLoader::Complete instead");
						$rootScope.$broadcast("noAreaLoader::areaReady", safeName);
						$rootScope.$broadcast("noAreaLoader::Complete", safeName);
					}

					//console.log("noAreaCheck\n", str);
				} else {
					console.log("noAreaLoader::Complete", safeName);
					console.warn("This area has no componets to track.");
				}


			}.bind(null, areaName));

			return _.size($rootScope.areas[areaName].registerables);
		}
		this.registerArea = _registerArea;

		function _unRegisterArea(areaName) {
			var tmp = $rootScope.areas[_safeName(areaName)];
			if(tmp && tmp.unWatch) tmp.unWatch();
		}
		this.unRegisterArea = _unRegisterArea;

		function _loading(areaName, compName) {
			//console.log("noAreaLoader::loading", compName);
			$rootScope.areas[_safeName(areaName)].registerables[_resolveComponentName(compName)] = false; //Means that the component is not loaded.
		}
		this.markComponentLoading = _loading;

		function _loaded(areaName, compName) {
			//console.info("noAreaLoader::component", compName, "loaded");
			var comp = $rootScope.areas[_safeName(areaName)].registerables[_resolveComponentName(compName)];
			if(comp !== undefined)
				$rootScope.areas[_safeName(areaName)].registerables[_resolveComponentName(compName)] = true; //Means that the component is loaded.
		}
		this.markComponentLoaded = _loaded;
	}

	angular.module("noinfopath.helpers")
		.service("noAreaLoader", ["$rootScope", "noFormConfig", "noPrompt", "lodash", NoAreaLoaderService])
		;
})(angular);
