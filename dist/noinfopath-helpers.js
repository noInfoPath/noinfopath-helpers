//helpers.js

/*
 *	# NoInfoPath Helpers
 *
 *	> `Module Name: noinfopath.helpers`
 *
 *	> @version 2.0.30
 *
 *  ## Installation
 *      npm install noinfopath-helpers --save
 *
 *  ## Dependencies
 *  None
 *
 */

(function (angular, undefined) {

	angular.module('noinfopath.helpers', [])

	.service("noUrl", ['$window', '$filter', function ($window, $filter) {

		var SELF = this,
			r20 = /%20/g,
			rbracket = /\[\]$/,
			rCRLF = /\r?\n/g,
			rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
			rsubmittable = /^(?:input|select|textarea|keygen)/i;

		function buildParams(prefix, obj, traditional, add) {
			var name;

			if(angular.isArray(obj)) {
				// Serialize array item.
				angular.forEach(obj, function (i, v) {
					if(traditional || rbracket.test(prefix)) {
						// Treat each array item as a scalar.
						add(prefix, v);

					} else {
						// Item is non-scalar (array or object), encode its numeric index.
						buildParams(
							prefix + "[" + (angular.isObject(v) ? i : "") + "]",
							v,
							traditional,
							add
						);
					}
				});

			} else if(!traditional && angular.isObject(obj)) {
				// Serialize object item.
				for(name in obj) {
					buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
				}

			} else {
				// Serialize scalar item.
				add(prefix, obj);
			}
		}

		this.params = function () {
			var qs = !!$window.location.search ? $window.location.search.substr(1) : "",
				qp = qs.split('&'),
				params = {};

			angular.forEach(qp, function (p) {
				var nvp = p.split('=');
				if(nvp.length > 1) {
					params[nvp[0]] = nvp[1];
				} else if(nvp.length == 1) {
					if(!!nvp[0])
						params[nvp[0]] = true;
				} else {
					angular.noop();
				}
			});

			return params;
		};

		this.serialize = function (a, traditional) {
			var prefix,
				s = [],
				add = function (key, value) {
					// If value is a function, invoke it and return its value
					value = angular.isFunction(value) ? value() : (value === null ? "" : value);
					s[s.length] = key + "=" + value;
				};

			// Set traditional to true for jQuery <= 1.3.2 behavior.
			// if ( traditional === undefined ) {
			// 	traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
			// }

			// If an array was passed in, assume that it is an array of form elements.
			if(angular.isArray(a)) {
				// Serialize the form elements
				angular.forEach(a, function (value, name) {
					add(name, value);
				});

			} else {
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for(prefix in a) {
					var param = a[prefix];
					if(!angular.isFunction(param)) {
						buildParams(prefix, param, traditional, add);
					}
				}
			}

			// Return the resulting serialization
			return s.join("&").replace(r20, "+");
		};

		this.normalizeValue = function (value) {
			if(typeof value === "string") {
				return "'" + value + "'";
			} else if(angular.isDate(value)) {
				return $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
			} else {
				return value;
			}
		};

		this.makeResourceUrl = function (endPointUri, listName, query) {
			var qs = query ? "?" + query : "";
			return endPointUri + "/" + listName + qs;
		};

		this.makeResourceUrls = function (endPointUri, resources) {
			var urls = {};
			angular.forEach(resources, function (resource) {
				var url = SELF.makeResourceUrl(endPointUri, resource.TableName, resource.Query);
				urls[resource.TableName] = url;
			});

			return urls;
		};
		}])

	/**
	 * ## NoXmlService
	 *
	 * Normalizes the XmlDOM and provides parsing and conversion methods.
	 */
	.service("noXml", [function () {
		var parser,
			SELF = this;

		if(window.DOMParser) {
			parser = new DOMParser();
		} else {
			//Downlevel IE support <= 8
			//Normalize on $window for testablility.
			parser = {
				parseFromString: function (text, contenttype) {
					var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = false;
					xmlDoc.loadXML(text);

					return xmlDoc;
				}
			};
		}

		/**
		 *	### Methods
		 *
		 *	#### fromString(xml)
		 *
		 * fromString takes in an xml string and parses it using
		 * the normalized DOMParser created when the service
		 * is instanciated.
		 *
		 *	##### Parameters
		 *
		 *	###### xml `string` (required)
		 *
		 *	A string containing a valid xml document
		 *
		 *	##### Returns `XmlDOMObject`
		 */
		this.fromString = function (xml) {
			var xmlDoc = parser.parseFromString(xml, "text/xml");
			return xmlDoc;
		};

		/**
		 *	#### toObject(node, target)
		 *
		 *	Converts an XmlNode to a pure JavaScript object.
		 *
		 *	##### Parameters
		 *
		 *	###### node
		 *
		 *	XmlNode object that is the source for creating the JavaScript object.
		 *
		 *	###### target
		 *
		 *	This name of the tag to retrive as the source node for the new object.
		 *	If not supplied `node` parameter is used instead.
		 *
		 *	> This code needs to be corrected as it uses getElementsByTagName. instead
		 *	> we should be using XPath.
		 *	> ([See: Introduction to using XPath in JavaScript](https://developer.mozilla.org/en-US/docs/Introduction_to_using_XPath_in_JavaScript) for more information.)
		 *
		 *	##### Returns `Object`
		 */
		this.toObject = function (node, target) {
			if(target) {
				var nodes = node.getElementsByTagName(target);
				node = nodes[0];
			}

			//console.log(angular.toJson(node.firstChild));
			// Create the return object
			var obj = {
				name: node.nodeName,
				value: null,
				attributes: {},
				children: []
			};



			//All elements are added as objects
			if(node.nodeType == 1 /*Element*/ ) {


				if(node.hasAttributes()) {
					angular.forEach(node.attributes, function (val, name) {
						//console.log(name, val.textContent);
						//Using attributes for backwards compatibility for the time being
						obj.attributes[val.name] = val.textContent;
						obj[val.name] = val.textContent;
					});
				}


				if(node.hasChildNodes()) {
					angular.forEach(node.childNodes, function (n) {
						if(n.nodeType == 3) {
							obj.value = n.textContent;
							//obj.children.push(tmp);
						} else {
							obj.children.push(SELF.toObject(n));
						}
					});
				} else {
					obj.value = node.textContent;
				}


			}

			return obj;
		};
		}])


	.service("noScopeHelper", ["$parse", function ($parse) {
		function _setItem(store, key, value) {
			var getter = $parse(key),
				setter = getter.assign;

			setter(store, value);
		}
		this.setItem = _setItem;

		function _getItem(store, key) {
			var getter = $parse(key);
			return getter(store);
		}
		this.getItem = _getItem;
	}])

	;
})(angular);

(function (angular) {

	angular
		.module("noinfopath.helpers")
			/**
			*	## format Filter
			*
			*	Uses the arbitrary arguments list passed to the filter to
			*	replace numbered placeholders.
			*
			*	```js
			*	var i = "Today is {1}";
			*
			*	$filter("format")(i, "sunny");
			*
			*	//Output:  "Today is sunny"

			*	```
			*/
			.filter("format", function () {
				return function (input) {
					var args = arguments;

					return input.replace(/\{(\d+)\}/g, function (match, capture) {

						return args[1*capture + 1];
					});
				};
			})

			.filter("nonulls", function () {
				return function (input) {
					return input ? input : "";
				};
			})

			.filter("tostring", function () {
				return function (input, pattern) {
					return kendo.toString(input, pattern);
				};
			})
		;

})(angular);

var noGeoMock;
(function(angular,undefined){
	"use strict";
	angular.module("noinfopath.helpers")

		.factory("noGeo", ['$timeout', '$q', function($timeout, $q){


			var _positionFake = {
				    latitude: 0.0,
				    longitude: 0.0,
				    altitude: null,
				    accuracy: 0.0,
				    altitudeAccuracy: null,
				    heading: null,
				    speed: null
				},
				_mock = {},
				_service = {isMocked: false},
				 _geo,
				 _watchId;

	        if (navigator.geolocation) {
	           _geo = navigator.geolocation;
	        } else {
	           _geo = _mock;
	           _service.isMocked = true;
	        }


			_mock.getCurrentPosition =	function(successCallback, errorCallback, options){
				if(!successCallback){ throw "successCallback is required"; }
				successCallback(_positionFake);
			};

			_mock.watchPosition = function(successCallback, errorCallback, options){ return 1;};

   			_mock.clearWatch = function(watchId){};

   			_service.getCurrentPosition = function(options){
   				var deferred = $q.defer();
   				_geo.getCurrentPosition(deferred.resolve, deferred.reject, options);
   				return deferred.promise;
   			};

  			_service.watchPosition = function(options){
   				var deferred = $q.defer();
   				_watchId = _geo.watchPosition(deferred.resolve, deferred.reject, options);
   				return deferred.promise;
  			};

  			_service.clearWatch = function(){
  				_geo.clearWatch(_watchId);
  			};

  			noGeoMock = {
  				postion: _positionFake
  			};

			return _service;
		}])

		.factory("noStatus", ['$rootScope', '$timeout', function($rootScope, $timeout){
			var _isOnTheLine = !!navigator.onLine;

			function _service(){
				Object.defineProperties(this,{
					"onLine" : {
						"get" : function(){
							return _isOnTheLine;
						}
					}
				});

				$timeout(function() {_broadcast();}, 10);

				function _broadcast(){
					 $rootScope.$broadcast("noStatus::online", _isOnTheLine);
				}
				window.addEventListener("online", function(){
					_isOnTheLine = true;
					_broadcast();
				});

				window.addEventListener("offline", function(){
					_isOnTheLine = false;
					_broadcast();
				});
			}

			return new _service();
		}])

		.directive("noWhenOnline", ['noStatus', function(noStatus){
			var link = function(scope, el, attr){
				scope.$root.$on("noStatus::online", function(){
					console.warn("TODO: Enhancement");
					switch(attr.noWhenOnline){
						case "hide":
							if( noStatus.onLine )
								{ el.hide(); }
							else
								{ el.show(); }
							break;
						case "show":
							if( noStatus.onLine )
								{ el.show(); }
							else
								{ el.hide(); }
							break;
					}
				})
			};

			var directive = {
				restrict: "A",
				link: link
			}
			return directive;
		}])
})(angular);

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
					deferred.notify({state: "noActionQueue", current: i,  total: execQueue.length});
					action()
						.then(function(deferred, results, execQueue, i, data){
							results[i] = data;

							deferred.notify({state: "end", current: i,  total: execQueue.length});
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

// no-state-params-helper.js
(function(angular, undefined) {
	angular.module('noinfopath.helpers')
		/**
		*	## NoStateHelperService
		*
		*	> Service Name: noStateHelper
		*/
		.service("noStateHelper", ["$injector", "$stateParams", function($injector, $stateParams){
			var locals = {};

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

			this.makeStateParams = function(scope, el, params) {
				var values = _resolveParams(params, scope, el),
					results = {};

				for(var i=0; i < params.length; i++) {
					var param = params[i],
						value = values[i],
						key = param.key;

					if(!key && angular.isArray(param)){
						key = param[0];
					}

					if(angular.isObject(value)) {
						if(!param.field) throw new Error("Field property is required when value is an object.");

						value = value[param.field];
					}

					results[key] = value;
				}

				//console.log("makeStateParams", results);

				return results;
			};

			locals.kendoRowData = function (scope, el, fields) {
				var tr = el.closest("tr"),
					grid = scope.noGrid,
					data = grid.dataItem(tr);


				return data;
			};

			function _resolveProvider(param, scope) {
				var prov;

				switch(param.provider) {
					case "scope":
						prov = scope;
						break;

					case "local":
						prov = locals;
						break;

					default:
						prov = $injector.get(param.provider);
						break;

				}

				return prov;
			}

			function _resolveParams(taskParams, scope, el) {
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
							*			"params": [
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
							var prov = _resolveProvider(param, scope),
								meth = param.method ? prov[param.method] : undefined,
								prop = param.property ? noInfoPath.getItem(prov, param.property) : undefined;

							if(prop) {
								params.push(prop);
							} else if(meth) {
								params.push(meth(scope, el));
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

			// noInfoPath.resolveParams = resolveParams.bind(this, $injector);
		}])
	;
})(angular);

/**
*	## NoDocumentReadyService  (a/k/a noDocumentReady)
*
*	This service, when enabled in a controller, keeps track of how many resources
*	being loaded via the $templateCache service. It maintains a running count
*	based on the `$includeContentRequested`, `$includeContentLoaded`, and
*	`$includeContentError` event handlers.
*
*/
(function (angular, undefined) {
	function NoDocumentReadyService($rootScope, $q, $timeout) {
		var c = 0;

		/*
		*	### @method whenReady()
		*
		*	#### Parameters
		*	none
		*
		*	#### Returns `Promise`
		*
		*	Loading errors not rejected, but will raise a notification
		*	on the promise.  The service will also raise progress notifications as the
		*	running total increases and decrease with out errors. The promise will
		*	resolve when the doucment reduces to zero.
		*
		*
		*/
		this.whenReady = function() {
			var deferred = $q.defer();

			$rootScope.$on("$includeContentRequested", function(e, f){
				deferred.notify({"reason": "progress", "before": c, "after": ++c, "file": f});
			});

			$rootScope.$on("$includeContentLoaded", function(e, f){
				deferred.notify({"reason": "progress", "before": c, "after": --c, "file": f});

				if(c === 0) {
					$timeout(deferred.resolve.bind(null,{"reason": "complete"}));
				}

			});

			$rootScope.$on("$includeContentError", function(e, f){
				deferred.notify({"reason": "error", "before": c, "after": --c, "file": f});

			});

			return deferred.promise;

		};

	}


	angular.module("noinfopath.helpers")
		.service("noDocumentReady", ["$rootScope", "$q", "$timeout", NoDocumentReadyService]);
})(angular);

(function (angular, undefined) {
	function NoPrintingService() {

		var oHiddFrame = $("<iframe></iframe>");

		this.getHiddenPrintWindow = function (url) {
			oHiddFrame.css("display", "none");
			// oHiddFrame.css("width", "100%");
			// oHiddFrame.css("height", "11in");
			$("body").append(oHiddFrame);
			oHiddFrame[0].src = url;

			// oHiddFrame.style.position = "relative";
			// oHiddFrame.style.width = "100%";
			// oHiddFrame.style.height = "100vh";
			//oHiddFrame.src = sURL;

			//document.body.appendChild(oHiddFrame);
			//pollIframe(oHiddFrame, iframeDoc);

			return oHiddFrame;

		};

		this.destroyPrintWindow = function() {
			$("body").remove(oHiddFrame);
		};
	}
	angular.module("noinfopath.helpers")
		.service("noPrinting", [NoPrintingService]);
})(angular);

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

//helpers.js
(function(angular) {
	/**
	*	## NoKendoHelpersService
	*
	*	> @service noKendoHelpers
	*
	*	This services provide various helper functions that provide access
	*	details about the a given row of data in a grid, as well as, access to
	*	grid's currently selected row.
	*
	*	> NOTE: A future enhancements will be that it allows for multi-row selection,
	*	> and cell slections.
	*/
	function NoKendoHelpersService($injector, $compile, $q, $state, _) {
		function _newRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				nonav,
				barid;

			grid.addRow();

			nonav = grid.editable.element.find("no-navigation");
			barid = $(nonav.find("navbar")[0]).attr("bar-id") + ".dirty";

			this.changeRowNavBar(ctx, scope, nonav, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, nonav, barid, barid, scope);

		}
		this.newRow = _newRow.bind(this);

		function _editRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				row = this.getGridRow(el),
				barid;

			grid.editRow(row);

			barid = $(el.find("navbar")[0]).attr("bar-id") + ".dirty";

			this.changeRowNavBar(ctx, scope, el, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, el, barid, barid, scope);

		}
		this.editRow = _editRow.bind(this);

		function _cancelRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				row,
				barid;

			grid.cancelRow();

			row = this.getSelectedGridRow(grid);

			this.ngCompileSelectedRow(ctx, scope, el, gridName);

			barid = $(el.find("navbar")[0]).attr("bar-id");

			this.changeRowNavBar(ctx, scope, el, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, el, barid, barid, scope);

		}
		this.cancelRow = _cancelRow.bind(this);

		function _resolveCurrentNavigationRow(grid, el) {
			var tr;

			if(grid.editable) {
				tr = grid.editable.element;
			} else {
				tr = _getSelectedGridRow(grid);

				if(tr.length === 0) tr = _getGridRow(el);
			}

			// tr = _getGridRow(el);
			//
			// 	if(tr.length === 0) {
			//
			// }

			if(tr.length === 0) throw {error: "Could not resolve current row related to changing the rows navbar state." };

			return tr;
		}

		/*
		*	### @method getConfigMethod
		*
		*	This is a specialty function that helps NoInfoPath wrapped widgets
		*	determine where to read thier configuration data from.
		*
		*	> NOTE: This function may be either deprecated to relocated to
		*	> NoInfoPath Helpers module in the future.
		*/
		this.getConfigMethod = function(type) {
			var cfgFn = {
					"noConfig": function($injector, $compile, $state, attrs, editor) {
						var noConfig = $injector.get("noConfig");
						return noConfig.whenReady()
							.then(function() {
								return noInfoPath.getItem(noConfig.current, attrs.noConfig);
							})
							.catch(function(err) {
								console.error(err);
								return $q.reject(err); //Log in re-throw.
							});
					},
					"noForm": function($injector, $compile, $state, attrs, editor) {
						var noFormConfig = $injector.get("noFormConfig"),
							config = noFormConfig.getFormByRoute($state.current.name, $state.params.entity),
							noForm = noInfoPath.getItem(config, attrs.noForm);

						return angular.copy(noForm);
					},
					"noLookup": function($injector, $compile, $state, noFormKey, editor, scope, container, options) {
						//console.log(this);

						var noFormConfig = $injector.get("noFormConfig"),
							config = noFormConfig.getFormByRoute($state.current.name, $state.params.entity),
							lu = noInfoPath.getItem(config, noFormKey),
							tpl = "<no-kendo-lookup no-form=\"" + noFormKey + "\"></no-kendo-lookup>",
							comp;


						scope[lu.noLookup.scopeKey] = options.model;

						//noInfoPath.setItem(scope, editor.options.noLookup.scopeKey, options.model);

						comp = $compile(tpl)(scope);
						container.append(comp);
					},
					"noid": function($injector, $compile, $state, attrs) {
						var noNCLManager = $injector.get("noNCLManager"),
							hashStore = noNCLManager.getHashStore($state.params.fid || $state.current.name.split(".").pop()),
							ncl = hashStore.get(attrs.noid);

						return ncl.noComponent;
					}
				},
				method = cfgFn[type];

			return (method || cfgFn.noForm).bind(null, $injector, $compile, $state);
		};

		/**
		*	### @method resolveConfigType
		*
		*	This is a specialty function that is typically used in conjection with
		*	`getConfigMethod`. It helps NoInfoPath wrapped widgets
		*	resolve what type of configuration data a directive is using..
		*
		*	> NOTE: This function may be either deprecated to relocated to
		*	> NoInfoPath Helpers module in the future.
		*/
		this.resolveConfigType = function(attrs) {
			var configurationType;

			if (attrs.noConfig) {
				configurationType = "noConfig";
			} else if (attrs.noForm) {
				configurationType = "noForm";
			} else if (attrs.noid) {
				configurationType = "noid";
			} else {
				throw "noKendoGrid requires either a noConfig or noForm attribute";
			}

			return configurationType;
		};

		/**
		*	### @method getGridRow
		*
		*	This method, given a `jQuery` element, returns the closest parent
		*	that matches the `tr[data-uid]` selector, as a jQuery element.
		*
		*	This method is especially useful when used in conjection with
		*	NoInfoPath's noActionQueue service to resolve action parameters
		*	for Kendo Grid methods that require a row element as one of its
		*	parameters. It is usually expected that the action be attached to
		*	button that is child of a given row.
		*
		*/
		function _getGridRow(el) {
			var tr = el.is("[data-uid]") ? el : el.closest("tr[data-uid]");
			return $(tr);
		}
		this.getGridRow = _getGridRow;

		/**
		*	### @method getGridRowUID
		*
		*	This method, given a `jQuery` element, returns the data-uid of the
		*	supplied element's parent row that matches the `tr[data-uid]` selector.
		*
		*	This method is especially useful when used in conjection with
		*	NoInfoPath's noActionQueue service to resolve action parameters
		*	for Kendo Grid methods that require a row data-uid as one of its
		*	parameters. It is usually expected that the action be attached to
		*	button that is child of a given row.
		*
		*/
		function _getGridRowUID(el) {
			var tr = _getGridRow(el),
				uid = tr.attr("data-uid");

			return uid;
		}
		this.getGridRowUID = _getGridRowUID;

		/**
		*	### @method getSelectedGridRow
		*/
		function _getSelectedGridRow(grid) {
			var row;
			try {
				row = grid.select();
			}
			catch(err) {
				row = [];
			}

			return row;
		}
		this.getSelectedGridRow = _getSelectedGridRow;

		/**
		*	### @method getSelectedGridRow
		*/
		function _getCurrentGridRow(scope, tragetGridID) {
			return _getSelectedGridRow(scope[targetGridID]);
		}
		this.getCurrentGridRow = _getCurrentGridRow;

		function _getCurrentGridRowUID(scope, tragetGridID) {
			return _getGridRowUID(_getSelectedGridRow(scope[targetGridID]));
		}
		this.getCurrentGridRowUID = _getCurrentGridRowUID;


		/**
		*	### @method getSelectedGridRowData
		*/
		function _getSelectedGridRowData(grid) {
			var tr = _getSelectedGridRow(grid),
				data = grid.dataItem(tr);

			return data;
		}
		this.getSelectedGridRowData = _getSelectedGridRowData;


		/**
		*	### @method currentGridRowData
		*/
		this.currentGridRowData = function(scope, el) {
			var tr = _getGridRow(el),
				grid = scope.noGrid || tr.scope().noGrid,
				data = grid.dataItem(tr);


			return data;
		};

		/**
		*	### @method currentGridRow
		*/
		this.changeRowNavBar = function(ctx, scope, el, gridScopeId, navBarName, barid) {
			var grid = scope[gridScopeId],
				tr = _resolveCurrentNavigationRow(grid, el),
				uid = noInfoPath.toScopeSafeGuid(_getGridRowUID(tr)),
				barkey = navBarName + "_" + uid,
				scopeKey = "noNavigation." + barkey + ".currentNavBar";

			if(!uid) return;

			if(grid.editable && grid.editable.validatable && grid.editable.validatable.errors().length > 0) return;

			noInfoPath.setItem(scope, scopeKey , barid);

		};

		this.changeRowNavBarWatch = function(ctx, scope, el, barid, o, s) {

			if(barid) {
				el.find("navbar").addClass("ng-hide");
				el.find("navbar[bar-id='" + barid + "']").removeClass("ng-hide");

			}

			// if(!uid) return;
			//
			// if(grid.editable && grid.editable.validatable && grid.editable.validatable.errors().length > 0) return;

			//console.log("changeNavBar", arguments);
			// if(barid === "^") {
			// 	var t = noInfoPath.getItem(scope,  "noNavigation." + barkey + ".currentNavBar"),
			// 		p = t.split(".");
			//
			// 	barid = p[0];
			// }



			//console.info("changeRowNavBarWatch",ctx.component, barid, scope.noNavigation);
			//console.log("scope, grid, tr, scopeKey, barid", scope, grid, tr, scopeKey, barid);
		}.bind(this);

		/**
		*	### @method ngCompileSelectedRow
		*/
		function _ngCompileRow(ctx, scope, el, targetGridID) {
			var grid = scope[targetGridID],
				tr = grid.select();

			$compile(tr)(scope);

			return true;

		}
		this.ngCompileSelectedRow = _ngCompileRow;

		function _addBlankOption(ctx, scope, el, def) {
			// ctx is the result set for the dropdown.
			var blank = {},
				emptyArray = [],
				res;

			// Need to mock a def record
			blank[def.TextField] = "";
			blank[def.SaveColumn] = null;
			blank[def.ValueField] = null;
			blank[def.SortField] = null;

			emptyArray.push(blank);
			res = new noInfoPath.data.NoResults(emptyArray.concat(ctx.paged));

			return res;
		}
		this.addBlankOption = _addBlankOption;

		function _validateAndSave(ctx, scope, el, row) {
			var schema = _getGridSchema(ctx, scope, el),
				valid = true,
				rowData = _.find(scope.noGrid.dataSource.data(), {"uid": row.attr("data-uid")});

			for(var field in schema.model.fields) {
				var obj = schema.model.fields[field];

				if(!obj.validation) continue;

				if(obj.validation.required && !rowData[field]) {
					valid = false;
				}
			}

			if(valid) {
				scope.noGrid.saveRow(rowData);
			} else {
				throw "Row not valid";
			}
		}
		this.validateAndSave = _validateAndSave;

		function _getGridSchema(ctx, scope, el) {
			var schema = scope.noGrid.dataSource.options.schema;

			return schema;
		}
		this.getGridSchema = _getGridSchema;
	}

	function NoKendoInlineGridEditors($state, noLoginService, noKendoDataSourceFactory, noFormConfig) {
		var editors = {
			text: function (scope, def, options) {
				// create an input element
				var input = $("<input class=\"full-width\"/>");

				// set its name to the field to which the column is bound ('name' in this case)
				input.attr("name", options.field);

				return input;
			},
			dropdown: function (scope, def, options) {
				var input = $("<div style=\"position: relative\"><input /></div>"),
					ctx = noFormConfig.getComponentContextByRoute($state.current.name, $state.params.entity, "noKendoGrid", "custom"),
					dataSource;

				ctx.component = {
					noDataSource: {
						"name": def.ListSource,
						"dataProvider": "noIndexedDb",
						"databaseName": "rmEFR2",
						"entityName": def.ListSource,
						"primaryKey": def.ValueField,
						"sort": [{
							"field": def.SortField
						}],
						"actions": {
							"post": [
								{
									"provider": "noKendoHelpers",
									"method": "addBlankOption",
									"params": [
										def
									]
								}
							]
						}
					}
				};

				if(def.Filter){
					ctx.component.noDataSource.filter = def.Filter;
				}

				dataSource = noKendoDataSourceFactory.create("kendoDropDownList", noLoginService.user.userId, ctx.component, scope);

				dataSource.noInfoPath = def;

				input.find("input").attr("name", options.field);

				input.find("input").kendoDropDownList({
					autobind: false,
					dataTextField: def.TextField,
					dataValueField: def.ValueField,
					dataSource: dataSource,
					template: def.Template ? def.Template : undefined,
					optionLabel: def.OptionLabel ? def.OptionLabel : undefined,
					change: function (e) {
						var tr = e.sender.element.closest("TR"),
							grid = e.sender.element.closest("[data-role='grid']").data("kendoGrid"),
							data = grid.dataItem(tr);

						data[def.SaveColumn || "Value"] = this.dataItem();
					}
				});

				angular.element(input).children().first().addClass("full-width");
				return input;
			},
			combobox: function (scope, def, options) {

				var input = $("<div style=\"position: relative\"><input /></div>"),
					ctx = noFormConfig.getComponentContextByRoute($state.current.name, $state.params.entity, "noKendoGrid", "custom"),
					dataSource;

				ctx.component = {
					noDataSource: {
						"name": def.ListSource,
						"dataProvider": "noIndexedDb",
						"databaseName": "rmEFR2",
						"entityName": def.ListSource,
						"primaryKey": def.ValueField,
						"sort": [{
							"field": def.SortField
						}]
					}
				};

				if(def.Filter){
					ctx.component.noDataSource.filter = def.Filter;
				}

				dataSource = noKendoDataSourceFactory.create("combobox", noLoginService.user.userId, ctx.component, scope);

				dataSource.noInfoPath = def;

				input.find("input").attr("name", options.field);

				input.find("input").kendoComboBox({
					autobind: false,
					dataTextField: def.TextField,
					dataValueField: def.ValueField,
					dataSource: dataSource,
					template: def.Template ? def.Template : undefined,
					change: function (e) {
						var tr = e.sender.element.closest("TR"),
							grid = e.sender.element.closest("[data-role='grid']").data("kendoGrid"),
							data = grid.dataItem(tr);

						data[def.SaveColumn || "Value"] = this.dataItem();
					}
				});

				angular.element(input).children().first().addClass("full-width");
				return input;
			},
			timepicker: function(scope, def, options){
				var input = $("<div><input /></div>");

				// set its name to the field to which the column is bound ('name' in this case)
				input.find("input").attr("name", options.field);
				// input.attr("type", "time");
				input.find("input").kendoTimePicker({
					"interval": 10
				});

				return input;
			}
		},
		templates = {
			"text": function (valueObj, def) {
 				var value = angular.isObject(valueObj) ?  valueObj[def.TextField] || valueObj.Description : valueObj || "";
				return value;
			},
			"timepicker": function(valueObj) {
				var value;

				// Test to see if we have a value
				if(valueObj){
					// If it's a JS Date
					if(valueObj.toLocaleTimeString) {
						value = valueObj.toLocaleTimeString();
						// Else make it a JS date
					} else {
						value = new Date(valueObj).toLocaleTimeString();
					}
					// If we have no value, return empty string.
				} else {
					value = "";
				}

				return value;
			}
		},
		templateNameMap = {
			"text": "text",
			"combobox": "text",
			"dropdown": "text",
			"timepicker": "timepicker"
		};

		this.getEditor = function(type) {
			var r = editors[type];

			if(!r) throw "Invalid inline component type: " + type;

			return r;
		};

		this.getTemplate = function(type) {
			var r = templates[templateNameMap[type]];

			if(!r) throw "Invalid inline component type: " + type;

			return r;
		};

		this.renderEditor = function(container, scope, def, options) {
			var	render = this.getEditor(def.InputType),
				input;

			if(render) {
				input = render(scope, def, options);
				input.appendTo(container);
			}
		};

		this.renderTemplate = function(def, col, model) {
			var valueObj = model[col.field],
				value = this.getTemplate(def.InputType)(valueObj, def);

			return value;
		};
	}
	angular.module("noinfopath.helpers")
		.service("noKendoHelpers", ["$injector", "$compile", "$q", "$state", "lodash", NoKendoHelpersService])
		.service("noKendoInlineGridEditors", ["$state", "noLoginService", "noKendoDataSourceFactory", "noFormConfig", NoKendoInlineGridEditors]);
})(angular);

(function(angular, undefined){
	"use strict";

	function NoAddressParser() {
		this.parseAddress = function(address){
			try {

				var record = {},
					parsedAddress = address.trim().split('\n'),
					completedLines = 0;

				if(parsedAddress.length < 2){

					parsedAddress = parsedAddress[0].trim().split(',');

					if(parsedAddress.length < 2) {
						return;
					}

					if(isNumber(parsedAddress[0].trim().substr(0,1))){
						commaParseCityStateZip();
						commaParseAddress();
					} else {
						commaParseCityStateZip();
						commaParseAddress();
						commaParseName();
					}

					return record;
				} else {
					if(isNumber(parsedAddress[0].trim())){
						newLineParseCityStateZip();
						newLineParseAddress();
					} else {
						newLineParseCityStateZip();
						newLineParseAddress();
						newLineParseName();
					}

					return record;
				}

				function newLineParseCityStateZip(){
					var cityStateZip = parsedAddress[parsedAddress.length - 1].trim().split(',');

					if(cityStateZip.length == 2){
						record.city = cityStateZip[0];

						var temp = cityStateZip[1].trim().split(' ');
						record.state = temp[0].substr(0,2);
						record.zip = temp[1];
					} else {
						record.city = cityStateZip[0].replace(',', '');
						record.state = cityStateZip[1].substr(0,2);
						record.zip = cityStateZip[2];
					}
				}
				function newLineParseAddress(){
					var rawAddress = parsedAddress[parsedAddress.length - 2].split(',');

					if (rawAddress.length == 1) {
						record.address1 = rawAddress[0].trim();
					} else {
						record.address1 = rawAddress[0].trim();
						record.address2 = rawAddress[1].trim();
					}
				}
				function newLineParseName(){
					var remainingLength = parsedAddress.length - 2;

					switch(remainingLength) {
						case 0:
							break;
						case 1:
							record.name1 = parsedAddress[0].trim();
							break;
						case 2:
							record.name1 = parsedAddress[0].trim();
							record.name2 = parsedAddress[1].trim();
							break;
						default:
							break;
					}
				}

				function commaParseCityStateZip(){
					var stateZip = parsedAddress[parsedAddress.length - 1].trim().split(' ');

					record.state = stateZip[0].substr(0,2);
					record.zip = stateZip[1];
					record.city = parsedAddress[parsedAddress.length - 2].trim();

					completedLines = completedLines + 2;
				}
				function commaParseAddress(){
					for(var l = 0; l <= parsedAddress.length - 2; l++){

						var line = parsedAddress[l].trim();
						if(!isNumber(line.substr(0,1))) continue;

						var remaining = (parsedAddress.length - 2) - (l + 1);
						// If there is any remaining, there is another line before we get to city/state/zip and need to put that line as address2
						if(remaining === 0){
							record.address1 = line;

							completedLines = completedLines + 1;
						} else {
							record.address1 = line;
							record.address2 = parsedAddress[l + 1].trim();

							completedLines = completedLines + 2;
						}
						break;
					}
				}
				function commaParseName(){
					var remainingLines = parsedAddress.length - completedLines;

					switch(remainingLines) {
						case 0:
							break;
						case 1:
							record.name1 = parsedAddress[0].trim();
							break;
						default:
							record.name1 = parsedAddress[0].trim();
							// treat all remaining lines as name2, so join remaining lines together separated by ','
							var name2Array = [];
							for(var rem = 1; rem < remainingLines; rem++){
								name2Array.push(parsedAddress[rem].trim());
							}
							record.name2 = name2Array.join(", ");
							break;
					}

					// if (remainingLines === 1){
					// 	record.name1 = parsedAddress[0].trim();
					// } else {
					// 	record.name1 = parsedAddress[0].trim();
					// 	// treat all remaining lines as name2, so join remaining lines together separated by ','
					// 	var name2Array = [];
					// 	for(var rem = 1; rem < remainingLines; rem++){
					// 		name2Array.push(parsedAddress[rem].trim());
					// 	}
					// 	record.name2 = name2Array.join(", ");
					// }
				}

				function isNumber(i) {
					return !Number.isNaN(Number(i)) && i !== null;
				}

			} catch(err){
				console.error(err);
			}
		};
	}

	angular.module("noinfopath.helpers")
		.service("noAddressParser", [NoAddressParser])
	;
})(angular);
