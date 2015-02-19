describe("Testing NoInfoPath Helpers module", function(){
	beforeEach(function(){
		module("noinfopath.helpers");
	});

	describe("Testing noUrl service", function(){
		var $window, noUrl;


		beforeEach(function(){
			$window = {
				location: {search: "?test=1"}
			}

			module(function($provide) {
	        	$provide.value('$window', $window);
	      	});

			inject(function($injector){
				noUrl = $injector.get("noUrl");
			})
		});


		it("should exist", function(){
			expect(noUrl).toBeDefined();
		});

		it("should have a params method", function(){
			expect(noUrl.params).toBeDefined();
		});

		it("no query string test should return {}", function(){
			$window.location.search = "";
			var p = noUrl.params();
			console.log(p);
			expect(p).toEqual({});
		});

		it("single query string param test should return {test: 1}", function(){
			$window.location.search = "?test=1";
			var p = noUrl.params();
			// console.log(p);
			expect(p).toEqual({test: '1'});
		});

		it("two query string param test should return {test: '1', foo: 'bar'}", function(){
			$window.location.search = "?test=1&foo=bar";
			var p = noUrl.params();
			// console.log(p);
			expect(p).toEqual({test: '1', foo: 'bar'});
		});

		it("query param without an equal sign should return {test: '1', foo: true}", function(){
			$window.location.search = "?test=1&foo";
			var p = noUrl.params();
			console.log(p);
			expect(p).toEqual({test: '1', foo: true});
		});

		it("query param without a value should return {test: '', foo: true}", function(){
			$window.location.search = "?test=&foo=bar";
			var p = noUrl.params();
			console.log(p);
			expect(p).toEqual({test: '', foo: 'bar'});
		});

		describe("warning: the next test is fringe case, which should never happen.", function(){
			it("duplicate query string param test should return {foo: 'bar'}", function(){
				$window.location.search = "?foo=1&foo=bar";
				var p = noUrl.params();
				//console.log(p);
				expect(p).toEqual({foo: 'bar'});
			});
		})


	})
})