//helpers.js

/*
 * # NoInfoPath Helpers (noinfopath.helpers)
 * @version 2.0.3
 *
 */

(function(angular,undefined){

	angular.module('noinfopath.helpers',[])

		.service("noUrl",['$window', '$filter', function($window, $filter){

			var SELF = this,
				r20 = /%20/g,
				rbracket = /\[\]$/,
				rCRLF = /\r?\n/g,
				rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
				rsubmittable = /^(?:input|select|textarea|keygen)/i;

			function buildParams( prefix, obj, traditional, add ) {
				var name;

				if ( angular.isArray( obj ) ) {
					// Serialize array item.
					angular.forEach( obj, function( i, v ) {
						if ( traditional || rbracket.test( prefix ) ) {
							// Treat each array item as a scalar.
							add( prefix, v );

						} else {
							// Item is non-scalar (array or object), encode its numeric index.
							buildParams(
								prefix + "[" + (angular.isObject(v) ? i : "" ) + "]",
								v,
								traditional,
								add
							);
						}
					});

				} else if ( !traditional && angular.isObject( obj )) {
					// Serialize object item.
					for ( name in obj ) {
						buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
					}

				} else {
					// Serialize scalar item.
					add( prefix, obj );
				}
			}

			this.params = function() {
				var qs = !!$window.location.search ? $window.location.search.substr(1) : "",
					qp = qs.split('&'),
					params = {};

				angular.forEach(qp, function(p){
					var nvp = p.split('=');
					if(nvp.length > 1){
						params[nvp[0]] = nvp[1];
					}else if(nvp.length == 1){
						if(!!nvp[0])
						params[nvp[0]] = true;
					}else{
						angular.noop();
					}
				});

				return params;
			};

			this.serialize = function( a, traditional ) {
				var prefix,
					s = [],
					add = function( key, value ) {
						// If value is a function, invoke it and return its value
						value = angular.isFunction( value ) ? value() : ( value === null ? "" : value );
						s[ s.length ] =  key + "=" + value;
					};

				// Set traditional to true for jQuery <= 1.3.2 behavior.
				// if ( traditional === undefined ) {
				// 	traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
				// }

				// If an array was passed in, assume that it is an array of form elements.
				if (angular.isArray( a )) {
					// Serialize the form elements
					angular.forEach( a, function(value, name) {
						add( name, value );
					});

				} else {
					// If traditional, encode the "old" way (the way 1.3.2 or older
					// did it), otherwise encode params recursively.
					for ( prefix in a ) {
						var param = a[ prefix ];
						if(!angular.isFunction(param))
						{
							buildParams( prefix, param, traditional, add );
						}
					}
				}

				// Return the resulting serialization
				return s.join( "&" ).replace( r20, "+" );
			};

			this.normalizeValue = function(value){
				if(typeof value === "string"){
					return "'" + value + "'";
				}else if(angular.isDate(value)){
					 return  $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
				}else{
					return value;
				}
			};

			this.makeResourceUrl = function(endPointUri, listName, query){
				var qs = query ? "?" + query : "";
				return endPointUri + "/" + listName + qs;
			};

			this.makeResourceUrls = function(endPointUri, resources){
				var urls = {};
				angular.forEach(resources, function(resource){
					var url = SELF.makeResourceUrl(endPointUri, resource.TableName, resource.Query);
					urls[resource.TableName] = url;
				});

				return urls;
			};
		}])

		/**
		 * @service
		 * @name  noXml
		 * @description normalized the XmlDOM and provides parsing and conversion methods.
		 */
		.service("noXml",[function(){
			var parser,
				SELF = this;

			if (window.DOMParser)
			{
				parser = new DOMParser();
			}
			else
			{
				//Downlevel IE support <= 8
				//Normalize on $window for testablility.
				parser = {
					parseFromString: function(text, contenttype){
						var xmlDoc =new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async=false;
						xmlDoc.loadXML(text);

						return xmlDoc;
					}
				};
			}

			/**
			 * @method
			 * @name  fromString
			 * fromString takes in an xml string and parses it using
			 * the normalized DOMParser created when the service
			 * is instanciated.
			 * @param  {string} xml a string containing a valid xml document
			 * @return {object} XmlDOM object
			 */
			this.fromString = function(xml){
			 	var xmlDoc = parser.parseFromString(xml,"text/xml");
			 	return xmlDoc;
			};

			/**
			 * @method
			 * @name  toObject
			 * @description Converts an XmlNode to a JavaScript object.
			 * @param  {object} node XmlNode object.
			 * @param  {string} target the name of an element start at.
			 * @return {object} a JavaScript object.
			 */
			this.toObject = function(node, target){
				if(target){
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
				if(node.nodeType == 1 /*Element*/){


					if(node.hasAttributes()){
						angular.forEach(node.attributes, function(val, name){
							//console.log(name, val.textContent);
							//Using attributes for backwards compatibility for the time being
							obj.attributes[val.name] = val.textContent;
							obj[val.name] = val.textContent;
						});
					}


					if(node.hasChildNodes()){
						angular.forEach(node.childNodes, function(n){
							if(n.nodeType == 3){
								obj.value = n.textContent;
								//obj.children.push(tmp);
							}else{
								obj.children.push(SELF.toObject(n));
							}
						});
					}else{
						obj.value = node.textContent;
					}


				}

				return obj;
			};
		}])
	;
})(angular);

/**
 * #noinfopath-Helpers
 * @version 2.0.2
 */

(function (angular) {

	angular
		.module("noinfopath.helpers")
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

		.service("noActionQueue", ["$injector", "$q", "$timeout", function($injector, $q, $timeout) {
			function _recurse(deferred, results, execQueue, i){
				var action = execQueue[i];
				if(action){
					action()
					.then(function(deferred, results, execQueue, i, data){
						results[i] = data;
						console.log("execAction finished", i, data);
						if(data && data.stopActionQueue) {
							deferred.resolve(results);
						} else if (data && data.pauseFor) {
							$timeout(function() {
								_recurse(deferred, results, execQueue, ++i);
							}, data.pauseFor);
						} else {
							_recurse(deferred, results, execQueue, ++i);
						}
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
					console.error("invalid action provider: ", action);
					return;
				}
			}

			function _resolveActionParams(scope, params){
				var promises = [];

				for(var p=0; p<params.length; p++){
					var param = params[p];

					if(angular.isObject(param)){
						if(param.provider === "scope"){
							promises.push($q.when(noInfoPath.getItem(scope, param.property)));
						}else if(param.provider){
							var prov = _resolveActionProvider(param),
								method = prov ? prov[param.method] : undefined,
								methodParams = param.params ? param.params : undefined,
								property = param.property ? noInfoPath.getItem(prov, param.property) : undefined;

							if(method){
								promises.push($q.when(method(methodParams)));
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

			function _resolveActionMethodAndParams(scope, action){
				var prov = _resolveActionProvider(action),
					method = prov ? prov[action.method] : _noop.bind(null, action);

				return _resolveActionParams(scope, action.params || [])
					.then(function(params){
						return {method: method ||  _noop.bind(null, action), params: params};
					})
					.catch(function(err){
						console.error(err);
					});

			}

			function _createActionExecFunction(ctx, scope, el, action){
				function actionExecFunction(ctx, scope, el, action){
					return $q(function(resolve, reject){
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
				* 	```json
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
				* 	```
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
				
				console.log(returnObj);
				return returnObj;
			};
		}])
	;
})(angular);