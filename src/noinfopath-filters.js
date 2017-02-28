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
