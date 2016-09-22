(function(angular, undefined) {
	angular.module('noinfopath.helpers')
		.service("noStateHelper", ["$stateParams", function($stateParams){
			this.resolveParams = function(params){
				var returnObj = {};

				for(var i = 0; i < params.length; i++){
					var param = params[i];

					returnObj[param] = $stateParams[param];
				}

				return returnObj;
			};
		}])
	;
})(angular);
