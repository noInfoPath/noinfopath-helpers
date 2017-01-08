//no-action-queue.js
(function(angular, undefined) {
	angular.module('noinfopath.helpers')
		/**
		*	## NoActionQueueService
		*
		*	> Service Name: noActionQueue
		*
		*	### configuration
		*
		*
		* 	[{
		* 	 "scope": "current|parent|root"
		* 	 "scopeKey": "projectTabs",
		* 	 "action": {
		* 		 "provider": "noNavigationManager",
		* 		 "method": "changeNavBar",
		* 		 "params": [
		* 			 {
		* 				 "provider": "scope|scope.$parent|scope.$root",
		* 				 "property": "projectTabs.btnBar"
		* 			 }
		* 		 ]
		* 	 }
		* 	}]
		*
		*
		*/
		.service("noActionQueue", ["$injector", "$q", "noParameters", function($injector, $q, noParameters) {
			function _recurse(deferred, results, execQueue, i){
				var action = execQueue[i];
				if(action){
					action()
					.then(function(deferred, results, execQueue, i, data){
						results[i] = data;
						//console.log("execAction finished", i);
						_recurse(deferred, results, execQueue, ++i);
					}.bind(null, deferred, results, execQueue, i))
					.catch(function(err){
						deferred.reject(err);
					});
				}else {
					deferred.resolve(results);
				}
			}

			function _resolveActionProvider(action){
				try{
					return $injector.get(action.provider);
				}catch(err){
					if(action.provider !== "scope") console.error("invalid action provider: ", action);
					return;
				}
			}

			function _resolveActionParams(scope, el, params){
				var promises = [];

				for(var p=0; p<params.length; p++){
					var param = params[p];

					if(angular.isObject(param)){
						if(param.provider === "scope"){
							if(param.property) {
								promises.push($q.when(noInfoPath.getItem(scope, param.property)));
							} else {
								promises.push(scope);

							}
						}else if(param.provider){
							var prov = _resolveActionProvider(param),
								method = prov ? prov[param.method] : undefined,
								methparams = param.params || [],
								property = param.property ? noInfoPath.getItem(prov, param.property) : undefined,
								tmpArgs = [];

							if(method){
								if(param.passLocalScope) tmpArgs.push(scope);
								if(param.passElement) tmpArgs.push(el);
								tmpArgs.push(methparams);
								promises.push($q.when(method.apply(el, tmpArgs)));
							}else if(property){
								promises.push($q.when(property));
							}else{
								promises.push($q.reject({"error": "Invalid parameter", data: param}));
							}
						}else{
							promises.push($q.when(param));
						}
					}else{
						promises.push($q.when(param));
					}

				}

				return $q.all(promises);
			}

			function _noop(action, params){
				console.error("Could not resolve method from action config.", action, params);
				return $q.when({method: angular.noop, params: params});
			}

			function _resolveActionMethodAndParams(scope, el, action){
				var prov = _resolveActionProvider(action) || scope,
					prop = action.property ? noInfoPath.getItem(prov, action.property) : undefined,
					method;

				if(action.property && prop) {
					method = prop[action.method];
				}else{
 					method = prov ? prov[action.method] : undefined;
				}

				//if(!method) method = _noop.bind(null, action);
				if(action.params) {
					return _resolveActionParams(scope, el, action.params || [])
						.then(function(params){
							return {provider: prov, property: prop, method: method ||  _noop.bind(null, action), params: params};
						})
						.catch(function(err){
							console.error(err);
						});
				} else {
					return $q.when({provider: prov, property: prop, method: method ||  _noop.bind(null, action)});
				}



			}

			function _createActionExecFunction(ctx, scope, el, action){
				function actionExecFunction(ctx, scope, el, action){
					return $q(function(resolve, reject){
						_resolveActionMethodAndParams(scope, el, action)
							.then(function(result){
								var returnValue = result.method.apply(result.property ? result.property : ctx, action.noContextParams ? result.params : [ctx, scope, el].concat(result.params));

								if(returnValue && returnValue.then && returnValue.catch){
									returnValue
										.then(resolve)
										.catch(reject);
								} else if(returnValue && returnValue.then && returnValue.fail) {
									returnValue
										.then(resolve)
										.fail(reject);
								}else{
									resolve(returnValue);
								}

							})
							.catch(reject);

					});

				}

				return actionExecFunction.bind(ctx, ctx, scope, el, action);

			}

			function _createWatchFunction(ctx, scope, el, action){
				function actionExecFunction(ctx, scope, el, action, newval, oldval, effectiveScope){
					return $q(function(resolve, reject){
						if(newval !== oldval){
							_resolveActionMethodAndParams(scope, action)
								.then(function(result){
									var returnValue = result.method.apply(ctx, action.noContextParams ? result.params : [ctx, scope, el].concat(result.params));

									if(returnValue && returnValue.then){
										returnValue
											.then(resolve)
											.catch(reject);
									}else{
										resolve(returnValue);
									}

								})
								.catch(reject);

						}else{
							resolve(ctx);
						}

					});

				}

				return actionExecFunction.bind(ctx, ctx, scope, el, action);

			}

			/*
			*/
			function _configureWatch(ctx, scope, el, watch) {
				var execQueue =  _createActionQueue(ctx, scope, el, watch.actions),
					watchFn = _synchronize.bind(ctx, execQueue);

				scope.$watch(watch.scopeKey, watchFn);
			}

			function _configureWatches(ctx, scope, el, watches){
				for(var w=0; w<watches.length; w++){
					var watch = watches[w];

					_configureWatch(ctx, scope, el, watch);
				}
			}
			this.configureWatches = _configureWatches;

			function _createActionQueue(ctx, scope, el, actions, fnWrapper){
				var execFns = [];

				for(var a=0; a<actions.length; a++){
					var action = actions[a],
						execFn = fnWrapper ? fnWrapper(ctx, scope, el, action) : _createActionExecFunction(ctx, scope, el, action);

					execFns[a] = execFn;
				}

				return execFns;
			}
			this.createQueue = _createActionQueue;

			function _synchronize(execQueue) {
				var deferred = $q.defer();
				var results = [];
				_recurse(deferred, results, execQueue, 0);
				return deferred.promise;
			}
			this.synchronize =  _synchronize;

		}])
	;

})(angular);
