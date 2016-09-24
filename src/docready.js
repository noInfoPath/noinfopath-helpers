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
