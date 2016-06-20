(function(angular, undefined) {
	angular.module('noinfopath.helpers')

	.service("noActionQueue", ["$q", function($q) {
		function _recurse(deferred, results, execQueue, i){
			var action = execQueue[i];
			if(action){
				action()
				.then(function(deferred, results, execQueue, i, data){
					results[i] = data;
					console.log("execAction finished", i, data);
					_recurse(deferred, results, execQueue, ++i);
				}.bind(null, deferred, results, execQueue, i))
				.catch(deferred.reject);
			}else {
				deferred.resolve(results);
			}
		}

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
