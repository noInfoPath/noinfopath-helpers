(function(angular, undefined){
	"use strict";

	function NoAddressParser() {
		this.parseAddress = function(address){
			try {

				var record = {},
					parsedAddress = address.trim().split('\n'),
					completedLines = 0;

				if(parsedAddress.length < 2){

					parsedAddress = parsedAddress[0].trim().split(',');

					if(parsedAddress.length < 2) {
						return;
					}

					if(isNumber(parsedAddress[0].trim().substr(0,1))){
						commaParseCityStateZip();
						commaParseAddress();
					} else {
						commaParseCityStateZip();
						commaParseAddress();
						commaParseName();
					}

					return record;
				} else {
					if(isNumber(parsedAddress[0].trim())){
						newLineParseCityStateZip();
						newLineParseAddress();
					} else {
						newLineParseCityStateZip();
						newLineParseAddress();
						newLineParseName();
					}

					return record;
				}

				function newLineParseCityStateZip(){
					var cityStateZip = parsedAddress[parsedAddress.length - 1].trim().split(',');

					if(cityStateZip.length == 2){
						record.city = cityStateZip[0];

						var temp = cityStateZip[1].trim().split(' ');
						record.state = temp[0].substr(0,2);
						record.zip = temp[1];
					} else {
						record.city = cityStateZip[0].replace(',', '');
						record.state = cityStateZip[1].substr(0,2);
						record.zip = cityStateZip[2];
					}
				}
				function newLineParseAddress(){
					var rawAddress = parsedAddress[parsedAddress.length - 2].split(',');

					if (rawAddress.length == 1) {
						record.address1 = rawAddress[0].trim();
					} else {
						record.address1 = rawAddress[0].trim();
						record.address2 = rawAddress[1].trim();
					}
				}
				function newLineParseName(){
					var remainingLength = parsedAddress.length - 2;

					switch(remainingLength) {
						case 0:
							break;
						case 1:
							record.name1 = parsedAddress[0].trim();
							break;
						case 2:
							record.name1 = parsedAddress[0].trim();
							record.name2 = parsedAddress[1].trim();
							break;
						default:
							break;
					}
				}

				function commaParseCityStateZip(){
					var stateZip = parsedAddress[parsedAddress.length - 1].trim().split(' ');

					record.state = stateZip[0].substr(0,2);
					record.zip = stateZip[1];
					record.city = parsedAddress[parsedAddress.length - 2].trim();

					completedLines = completedLines + 2;
				}
				function commaParseAddress(){
					for(var l = 0; l <= parsedAddress.length - 2; l++){

						var line = parsedAddress[l].trim();
						if(!isNumber(line.substr(0,1))) continue;

						var remaining = (parsedAddress.length - 2) - (l + 1);
						// If there is any remaining, there is another line before we get to city/state/zip and need to put that line as address2
						if(remaining === 0){
							record.address1 = line;

							completedLines = completedLines + 1;
						} else {
							record.address1 = line;
							record.address2 = parsedAddress[l + 1].trim();

							completedLines = completedLines + 2;
						}
						break;
					}
				}
				function commaParseName(){
					var remainingLines = parsedAddress.length - completedLines;

					switch(remainingLines) {
						case 0:
							break;
						case 1:
							record.name1 = parsedAddress[0].trim();
							break;
						default:
							record.name1 = parsedAddress[0].trim();
							// treat all remaining lines as name2, so join remaining lines together separated by ','
							var name2Array = [];
							for(var rem = 1; rem < remainingLines; rem++){
								name2Array.push(parsedAddress[rem].trim());
							}
							record.name2 = name2Array.join(", ");
							break;
					}

					// if (remainingLines === 1){
					// 	record.name1 = parsedAddress[0].trim();
					// } else {
					// 	record.name1 = parsedAddress[0].trim();
					// 	// treat all remaining lines as name2, so join remaining lines together separated by ','
					// 	var name2Array = [];
					// 	for(var rem = 1; rem < remainingLines; rem++){
					// 		name2Array.push(parsedAddress[rem].trim());
					// 	}
					// 	record.name2 = name2Array.join(", ");
					// }
				}

				function isNumber(i) {
					return !Number.isNaN(Number(i)) && i !== null;
				}

			} catch(err){
				console.error(err);
			}
		};
	}

	angular.module("noinfopath.helpers")
		.service("noAddressParser", [NoAddressParser])
	;
})(angular);
