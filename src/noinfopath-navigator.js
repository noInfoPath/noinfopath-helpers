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