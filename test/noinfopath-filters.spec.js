describe("Testing noinfopath.filters", function(){
	var formatFilter;

	beforeEach(function(){

		//Load what we are testing
		module("noinfopath.filters");

		//Load any providers that need testing
		angular.module('dummyModule', [])
	  		.config([function() {
	  		}]);

		module('dummyModule');

		//Inject any dependencies required by the tests.
		inject(function($injector){
			formatFilter = $injector.get("formatFilter");
		})		
	});
	
	describe("test formatFilter", function(){
		it("should exist", function(){
			expect(formatFilter).toBeDefined();
		});

		it("replace {0} {1} for Test Foo", function(){
			var result = formatFilter("{0} {1}","Test", "Foo");
			//console.log(result);
			expect(result).toEqual("Test Foo");
		});
	});
})