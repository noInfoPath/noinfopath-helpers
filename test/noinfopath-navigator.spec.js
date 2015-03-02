//noinfopath-navigator.spec.js
describe("Testing noinfopath-navigator", function(){
	var noGeo, $httpBackend, $timeout;

	beforeEach(function(){

		//Load what we are testing
		module("noinfopath.navigator");

		//Load any providers that need testing
		angular.module('dummyModule', [])
	  		.config([function() {
	  		}]);

		module('dummyModule');

		//Inject any dependencies required by the tests.
		inject(function($injector){
			noGeo = $injector.get("noGeo");
			//$httpBackend = $injector.get('$httpBackend');
			$timeout = $injector.get('$timeout');
		})		
	});

	describe("Testing noGeo", function(){
		it("Should exist", function(){
			expect(noGeo).toBeDefined();
		})

		describe("Testing noGeo.getCurrentPosition()", function(){
			it("Should exist", function(){
				expect(noGeo.getCurrentPosition).toBeDefined();
				console.log("Is Mocked: ", noGeo.isMocked);
			})

			it("Should return a promise to return a postion", function(done){
				
				noGeo.getCurrentPosition()
					.then(function(position){
						console.log(angular.toJson(position));
						expect(position).toEqual(noGeoMock.postion);
						done();
					})
					.catch(function(err){
						console.log(err);
						done();
					})
				
				$timeout.flush();
			})
		})
	})
})