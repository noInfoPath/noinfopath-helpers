/**
 * #noinfopath-Helpers
 * @version 0.0.19
 */

//filters.js
(function (angular) {
 
	angular
		.module("noinfopath.filters",[])
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