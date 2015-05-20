/**
 * #noinfopath-filters
 * @version 0.0.18
 * NoInfoPath Filters
 */
(function (angular) {
 
	angular
		.module("noinfopath.filters",[])
		.filter("format", function () {
			return function (input) {
				var args = arguments;
//console.log("args: ", angular.toJson(args));
				return input.replace(/\{(\d+)\}/g, function (match, capture) {
					//console.log(angular.toJson(args))
					return args[1*capture + 1];
				});
			};
		});
 
})(angular);
/**
 * #noinfopath-helpers
 * @version 0.0.18
 * NoInfoPath Helpers
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
				})

				return params;
			};

			this.serialize = function( a, traditional ) {
				var prefix,
					s = [],
					add = function( key, value ) {
						// If value is a function, invoke it and return its value
						value = angular.isFunction( value ) ? value() : ( value == null ? "" : value );
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
				}
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
			 	return xmlDoc
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
})(angular)



/**
 * #noinfopath-navigator
 * @version 0.0.18
 * NoInfoPath Navigator
 */
var noGeoMock;
(function(angular,undefined){
	"use strict";
	angular.module("noinfopath.navigator", [])

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
/**
 * #noinfopath-require
 * @version 0.0.18
 * NoInfoPath Require
 */
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.require",[])
		.provider("noRequire", [function (){

			function _service($injector, $q){
				this.loadScript = function(url){

					var deferred = $q.defer(),
						script = document.createElement("script");

					script.setAttribute("src", url);
					script.setAttribute("type","text/javascript");

					script.onload = function(e) {
						deferred.resolve(url);
						//register($injector, providers, [moduleName])
						//var fn = angular.module(moduleName); //initialize the module????

					};				

					script.onerror = function(e) {
						deferred.reject(e);
					};

					document.body.appendChild(script);	

					return deferred.promise;			
				}				
			}
	
			this.$get = ['$injector', '$q', function($injector, $q){
				return new _service($injector, $q);
			}];

		}])
	;

})(angular)