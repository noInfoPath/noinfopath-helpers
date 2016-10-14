// no-state-params-helper.js
(function(angular, undefined) {
	angular.module('noinfopath.helpers')
		/**
		*	## NoStateHelperService
		*
		*	> Service Name: noStateHelper
		*/
		.service("noStateHelper", ["$injector", "$stateParams", function($injector, $stateParams){
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
						*			"params:"" [
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
						value = values[i],
						key = param.key;

					if(!key && angular.isArray(param)){
						key = param[0];
					}

					results[key] = value;
				}

				console.log("makeStateParams", results);

				return results;
			};

			function resolveParams($injector, taskParams, scope) {
				var params = [];

				if(taskParams) {

					for(var p = 0; p < taskParams.length; p++) {
						var param = taskParams[p];

						if(angular.isArray(param)){
							if(param.length !== 2) throw "Array type parameters must have exactly 2 elements.";

							/**
							*	When a parameter is an array then it is a name value pair.
							*	The first element of the array is the name, and the second
							*	is the value. resolveParams only looks at the second element
							*	of the array. The first element is used by the caller.
							*
							*	```json
							*
							*		{
							*			"params:"" [
							*				["foo", 1000],
							*				["bar", false],
							*				"pid"
							*			]
							*		}
							*
							*	```
							*/
							params.push(param[1]);
						} else if(angular.isObject(param)) {
							var prov = param.provider === "scope" ? scope : $injector.get(param.provider),
								meth = param.method ? prov[param.method] : undefined,
								prop = param.property ? noInfoPath.getItem(prov, param.property) : undefined;
							if(prop) {
								params.push(prop);
							} else if(meth) {
								params.push(meth());
							} else {
								params.push(prov);
							}
						} else {
							params.push(param);
						}
					}
				}

				return params;
			}

			noInfoPath.resolveParams = resolveParams.bind(this, $injector);
		}])
	;
})(angular);