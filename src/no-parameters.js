(function (angular, undefined) {
	function NoParametersService() {
		function _resolveProvider(param, scope) {
			var prov;

			if(angular.isObject(param)) {
				switch(param.provider) {
					case "scope":
						prov = scope;
						break;

					// case "local":
					// 	prov = locals;
					// 	break;

					default:

						prov = $injector.get(param.provider);
						break;

				}

			}

			return prov;
		}

		function _resolveMethod(param, prov) {
			if(param.method && param.property) {

			} else {
				return prov[param.method];
			}
		}

		function _processParameters(ctx, scope, el, params) {
			var promises = [];

			for(var pi = 0; pi < params.length; pi++) {
				promises.push( _processParameter(ctx, scope, el, params[pi]) );
			}

			return $q.all(promises);
		}
		this.resolve = _processParameters;

		function _processParameter(ctx, scope, el, param) {
			var promises = [],
				prov = _resolveProvider(param, scope),
				meth = _resolveMethod(param, prov),
				prop = _resolveProperty(param, prov);

			if(prov) {

			} else {

			}

			// if(angular.isObject(param)) {
			// 	if(param.provider === "scope") {
			// 		promises.push($q.when(noInfoPath.getItem(scope, param.property)));
			// 	} else if(param.provider) {
			// 		var prov = _resolveActionProvider(param),
			// 			method = prov ? prov[param.method] : undefined,
			// 			methparams = param.params,
			// 			property = param.property ? noInfoPath.getItem(prov, param.property) : undefined,
			// 			tmpArgs = [];
			//
			// 		if(method) {
			// 			if(param.passLocalScope) tmpArgs.push(scope);
			// 			if(param.passElement) tmpArgs.push(el);
			// 			tmpArgs.push(methparams);
			// 			promises.push($q.when(method.apply(el, tmpArgs)));
			// 		} else if(property) {
			// 			promises.push($q.when(property));
			// 		} else {
			// 			promises.push($q.reject({
			// 				"error": "Invalid parameter",
			// 				data: param
			// 			}));
			// 		}
			// 	} else {
			// 		promises.push($q.when(param));
			// 	}
			// } else {
			// 	promises.push($q.when(param));
			// }



			return $q.when([]); //$q.all(promises);
		}
	}

	angular.module("noinfopath.helpers")
		.service("noParameters", [NoParametersService]);
})(angular);
