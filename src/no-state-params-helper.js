(function(angular, undefined) {
	angular.module('noinfopath.helpers')
		/**
		*	## NoStateHelperService
		*
		*	> Service Name: noStateHelper
		*/
		.service("noStateHelper", ["$stateParams", function($stateParams){
			/**
			*	### Methods
			*
			*	#### resolveParams(params)
			*
			*	> TODO: What does this method actuallu do?
			*
			*	##### Parameters
			*
			*	###### params `Array`
			*
			*	An arrray of parameters name to extract from $stateParams.
			*
			*	##### Returns `object`
			*
			*	> TODO: Describe what is in the objec returned.
			*/
			this.resolveParams = function(params){
				var returnObj = {};

				for(var i = 0; i < params.length; i++){
					var param = params[i];

					returnObj[param] = $stateParams[param];
				}

				return returnObj;
			};

			this.makeStateParams = function(scope, params) {
				var values = noInfoPath.resolveParams(params, scope),
					results = {};

				for(var i=0; i < params.length; i++) {
					var param = params[i],
						value = values[i];

					results[param.key] = value;
				}

				console.log("makeStateParams", results);

				return results;
			};
		}])
	;
})(angular);
