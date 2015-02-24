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

		describe("Testing noUrl.params", function(){
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
				console.log(p);
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
		});

		describe("Testing noUrl.serialize", function(){
			it("should exist", function(){
				expect(noUrl.serialize).toBeDefined();
			});

			it("given nothing should return an empty string", function(){
				var result = noUrl.serialize();
				console.log("serialize: " + result);
				expect(result).toEqual("");
			});

			it("given {} should return an empty string", function(){
				var result = noUrl.serialize({});
				console.log("serialize: " + result);
				expect(result).toEqual("");
			});

			it("given {test: 'x'} should return test=x", function(){
				var result = noUrl.serialize({test: 'x'});
				console.log("serialize: " + result);
				expect(result).toEqual("test=x");
			});

			it("given {foo: 'x', bar: 1} should return foo=x&bar=1", function(){
				var result = noUrl.serialize({foo: 'x', bar: 1});
				console.log("serialize: " + result);
				expect(result).toEqual("foo=x&bar=1");
			});
		});
	})

	describe("Testing noXml service", function(){
		var noXml;

		beforeEach(function(){
			inject(function($injector){
				noXml = $injector.get("noXml");
			})
		});


		it("should exist", function(){
			expect(noXml).toBeDefined();
		});

		it("should have a fromString method", function(){
			expect(noXml.fromString).toBeDefined();
		});

		it("should return an XmlDOM object", function(){
			var dom = noXml.fromString("<hello>world</hello>");
			expect(dom).toBeDefined();
		});


		it("should have a toObject method", function(){
			expect(noXml.fromString).toBeDefined();
		});

		it("given a simple one element xml node should return a JavaScript object", function(){
			var dom = noXml.fromString("<hello>world</hello>"),
				obj = noXml.toObject(dom.firstChild),
				expected = {"name":"hello","value":"world","attributes":{},"children":[]};


			expect(obj).toBeDefined();
			expect(obj).toEqual(expected);
		});

		it("given a simple element, nested in an element should return a JavaScript object", function(){
			var dom = noXml.fromString("<hello><world>1</world></hello>"),
				obj = noXml.toObject(dom.firstChild),
				expected = {"name":"hello","value":null,"attributes":{},"children":[{"name":"world","value":"1","attributes":{},"children":[]}]};

			expect(obj).toBeDefined();
			expect(obj).toEqual(expected);
		});

		it("given a more complex nest set of elements should return a JavaScript object", function(){
			var dom = noXml.fromString("<hello><world>1</world><world><test>A</test><xxx>12312.002</xxx></world></hello>"),
				obj = noXml.toObject(dom.firstChild),
				expected = {"name":"hello","value":null,"attributes":{},"children":[{"name":"world","value":"1","attributes":{},"children":[]},{"name":"world","value":null,"attributes":{},"children":[{"name":"test","value":"A","attributes":{},"children":[]},{"name":"xxx","value":"12312.002","attributes":{},"children":[]}]}]};

			expect(obj).toBeDefined();
			expect(obj).toEqual(expected);
		});

		it("given a SOAP response should return a JavaScript object", function(){
			var response = '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soap:Body><AlterToDoResponse xmlns="http://schemas.microsoft.com/sharepoint/soap/workflow/"><AlterToDoResult><fSuccess>1</fSuccess></AlterToDoResult></AlterToDoResponse></soap:Body></soap:Envelope>',
				dom = noXml.fromString(response),
				obj = noXml.toObject(dom.firstChild, "AlterToDoResult"),
				expected = {"name":"AlterToDoResult","value":null,"attributes":{},"children":[{"name":"fSuccess","value":"1","attributes":{},"children":[]}]};

			console.log("\n\n" + angular.toJson(obj));

			expect(obj).toBeDefined();
			expect(obj).toEqual(expected);
		});
	})
})