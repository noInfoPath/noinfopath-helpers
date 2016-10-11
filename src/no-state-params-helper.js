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
			*
			*	### Remarks
			*
			*/
			this.resolveParams = function(params){
				var returnObj = {};

				for(var i = 0; i < params.length; i++){
					var param = params[i];

					if(angular.isArray(param)) {
						if(param.length !== 2) throw "Array type parameters must have exactly 2 elements.";

						/**
						*	When a parameter is an array then it is a name value pair.
						*	The first element of the array is the name, and the second
						*	is the value.
						*
						*	```json
						*	
						*		{
						*			"params": [
						*				["foo", 1000],
						*				["bar", false],
						*				"pid"
						*			]
						*		}
						*
						*	```
						*/
						returnObj[param[0]] = param[1];
					} else {

						/**
						*	When a parameter is a string, then it is the name
						*	of a $stateParams value.
						*/
						returnObj[param] = $stateParams[param];
					}

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
