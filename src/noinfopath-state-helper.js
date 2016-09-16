// noinfopath-state-helper.js
(function(angular, undefined){
	angular.module('noinfopath.helpers')
		.service("noStateHelper", ["$stateParams", function($stateParams){
			this.resolveParams = function(paramArray){
				var returnObj = {};

				if(paramArray){
					for(var i = 0; i < paramArray.length; i++){
						var param = paramArray[i];

						returnObj[param] = $stateParams[param];
					}
				}
				
				return returnObj;
			};
		}])
	;
})(angular);