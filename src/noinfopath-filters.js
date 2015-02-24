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