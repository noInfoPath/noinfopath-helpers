var tests = [
	{
		raw: "Avalon Memory Care (Billing Records)\n7140 U.S. 287 Frontage Road\nArlington, TX 76001",
		expected: {
			city: 'Arlington',
  		state: 'TX',
  		zip: '76001',
  		address1: '7140 U.S. 287 Frontage Road',
  		name1: 'Avalon Memory Care (Billing Records)'
		}
	},
	{
		raw: "Avalon Memory Care (Radiology Records)\n7140 U.S. 287 Frontage Road\nArlington, TX 76001",
		expected: {
			city: 'Arlington',
  		state: 'TX',
  		zip: '76001',
  		address1: '7140 U.S. 287 Frontage Road',
  		name1: 'Avalon Memory Care (Radiology Records)'
		}
	},
	{
		raw: "Dr. Marvetta Scott (Medical Records)\nVisiting Physicians Network\n5440 Harvest Hill Road, Suite 182\nDallas, TX 75230",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75230',
  		address1: '5440 Harvest Hill Road',
			address2: 'Suite 182',
  		name1: 'Dr. Marvetta Scott (Medical Records)',
			name2: 'Visiting Physicians Network'
		}
	},
	{
		raw: "Home Quest Home Health (Medical Records)\n5001 Rowlett Road, Suite 300\nRowlett, TX 75088",
		expected: {
			city: 'Rowlett',
  		state: 'TX',
  		zip: '75088',
  		address1: '5001 Rowlett Road',
			address2: 'Suite 300',
  		name1: 'Home Quest Home Health (Medical Records)'
		}
	},
	{
		raw: "Discover Credit Card Company (Banking Records)\nc/o CT Corporation System, Registered Agent\n1999 Bryan Street, Suite 900\nDallas, TX 75201",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75201',
  		address1: '1999 Bryan Street',
			address2: 'Suite 900',
  		name1: 'Discover Credit Card Company (Banking Records)',
			name2: 'c/o CT Corporation System, Registered Agent'
		}
	},
	{
		raw: "Frost Bank c/o Stan McCormick, Executive Vice President (Banking Records)\n100 W. Houston Street, Suite 1270\nSan Antonio, TX 78205",
		expected: {
			city: 'San Antonio',
  		state: 'TX',
  		zip: '78205',
  		address1: '100 W. Houston Street',
			address2: 'Suite 1270',
  		name1: 'Frost Bank c/o Stan McCormick, Executive Vice President (Banking Records)'
		}
	},
	{
		raw: "Fort Worth InterBank (Banking Records)\n4255 Camp Bowie Boulevard\nFort Worth, TX. 76107",
		expected: {
			city: 'Fort Worth',
  		state: 'TX',
  		zip: '76107',
  		address1: '4255 Camp Bowie Boulevard',
  		name1: 'Fort Worth InterBank (Banking Records)'
		}
	},
	{
		raw: "Park Cities Bank (Banking Records)\n5307 E. Mockingbird, Suite 200\nDallas, TX 75206",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75206',
  		address1: '5307 E. Mockingbird',
			address2: 'Suite 200',
  		name1: 'Park Cities Bank (Banking Records)'
		}
	},
	{
		raw: "RBC Wealth Management (Banking Records)\n100 Crescent Court, Suite 1500\nDallas, TX 75201",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75201',
  		address1: '100 Crescent Court',
			address2: 'Suite 1500',
  		name1: 'RBC Wealth Management (Banking Records)'
		}
	},
	{
		raw: "Avalon Memory Care (Billing Records),7140 U.S. 287 Frontage Road,Arlington, TX. 76001",
		expected: {
			city: 'Arlington',
  		state: 'TX',
  		zip: '76001',
  		address1: '7140 U.S. 287 Frontage Road',
  		name1: 'Avalon Memory Care (Billing Records)'
		}
	},
	{
		raw: "Avalon Memory Care (Radiology Records),7140 U.S. 287 Frontage Road,Arlington, TX. 76001",
		expected: {
			city: 'Arlington',
  		state: 'TX',
  		zip: '76001',
  		address1: '7140 U.S. 287 Frontage Road',
  		name1: 'Avalon Memory Care (Radiology Records)'
		}
	},
	{
		raw: "Dr. Marvetta Scott (Medical Records),Visiting Physicians Network,5440 Harvest Hill Road, Suite 182,Dallas, TX 75230",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75230',
  		address1: '5440 Harvest Hill Road',
			address2: 'Suite 182',
  		name1: 'Dr. Marvetta Scott (Medical Records)',
			name2: 'Visiting Physicians Network'
		}
	},
	{
		raw: "Home Quest Home Health (Medical Records),5001 Rowlett Road, Suite 300,Rowlett, TX 75088",
		expected: {
			city: 'Rowlett',
  		state: 'TX',
  		zip: '75088',
  		address1: '5001 Rowlett Road',
			address2: 'Suite 300',
  		name1: 'Home Quest Home Health (Medical Records)'
		}
	},
	{
		raw: "Discover Credit Card Company (Banking Records),c/o CT Corporation System, Registered Agent,1999 Bryan Street, Suite 900,Dallas, TX 75201",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75201',
  		address1: '1999 Bryan Street',
			address2: 'Suite 900',
  		name1: 'Discover Credit Card Company (Banking Records)',
			name2: 'c/o CT Corporation System, Registered Agent'
		}
	},
	{
		raw: "Frost Bank c/o Stan McCormick, Executive Vice President (Banking Records),100 W. Houston Street, Suite 1270,San Antonio, TX 78205",
		expected: {
			city: 'San Antonio',
  		state: 'TX',
  		zip: '78205',
  		address1: '100 W. Houston Street',
			address2: 'Suite 1270',
  		name1: 'Frost Bank c/o Stan McCormick',
			name2: 'Executive Vice President (Banking Records)'
		}
	},
	{
		raw: "Fort Worth InterBank (Banking Records),4255 Camp Bowie Boulevard,Fort Worth, TX 76107",
		expected: {
			city: 'Fort Worth',
  		state: 'TX',
  		zip: '76107',
  		address1: '4255 Camp Bowie Boulevard',
  		name1: 'Fort Worth InterBank (Banking Records)'
		}
	},
	{
		raw: "Park Cities Bank (Banking Records),5307 E. Mockingbird, Suite 200,Dallas, TX 75206",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75206',
  		address1: '5307 E. Mockingbird',
			address2: 'Suite 200',
  		name1: 'Park Cities Bank (Banking Records)'
		}
	},
	{
		raw: "RBC Wealth Management (Banking Records),100 Crescent Court, Suite 1500,Dallas, TX 75201",
		expected: {
			city: 'Dallas',
  		state: 'TX',
  		zip: '75201',
  		address1: '100 Crescent Court',
			address2: 'Suite 1500',
  		name1: 'RBC Wealth Management (Banking Records)'
		}
	},
];

describe("Testing address parser", function(){
	var parseAddressService;

	beforeEach(function(){
		module("noinfopath.helpers");

		inject(function($injector){
			parseAddressService = $injector.get("noAddressParser");
		});
	});

	for(var d = 0; d < tests.length; d++){
		it("Testing address " + d, function(d){
			var test = tests[d],
				raw = test.raw,
				expected = test.expected,
				actual = parseAddressService.parseAddress(raw);

			expect(actual).toEqual(expected);
		}.bind(this, d))
	}
});
