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
