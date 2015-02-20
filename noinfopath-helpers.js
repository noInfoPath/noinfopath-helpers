/**
 * #noinfopath-helpers
 * NoInfoPath Helpers
 */

(function(angular,undefined){

	angular.module('noinfopath.helpers',[])
		.service("noUrl",['$window', function($window){
			this.params = function() {
				var qs = !!$window.location.search ? $window.location.search.substr(1) : "",
					qp = qs.split('&'),
					params = {};

				angular.forEach(qp, function(p){
					var nvp = p.split('=');
					if(nvp.length > 1){
						params[nvp[0]] = nvp[1];
					}else if(nvp.length == 1){
						if(!!nvp[0])
						params[nvp[0]] = true;
					}else{
						angular.noop();
					}
				})

				return params;
			}
		}])

		.service("noXml",[function(){
			var parser,
				SELF = this;

			if (window.DOMParser)
			{
				parser = new DOMParser();
			}
			else 
			{ 
				//Downlevel IE support <= 8
				//Normalize on $window for testablility.
				parser = {
					parseFromString: function(text, contenttype){
						var xmlDoc =new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async=false;
						xmlDoc.loadXML(text); 

						return xmlDoc;						
					}
				}
			} 

			this.fromString = function(xml){
			 	var xmlDoc = parser.parseFromString(xml,"text/xml");
			 	return xmlDoc
			};

			this.toObject = function(node){
				//console.log(angular.toJson(node.firstChild));
				// Create the return object
				var obj = {
						name: node.nodeName,
						value: null,
						attributes: {},
						children: []
					};

				

				//All elements are added as objects
				if(node.nodeType == 1 /*Element*/){
					
					
					if(node.hasAttributes()){
						angular.forEach(node.attributes, function(val, name){
							//console.log(name, val.textContent);
							obj.attributes[name] = val.textContent;
						});
					}


					if(node.hasChildNodes()){
						angular.forEach(node.childNodes, function(n){
							if(n.nodeType == 3){
								obj.value = n.textContent;
								//obj.children.push(tmp);
							}else{
								obj.children.push(SELF.toObject(n));
							}
						});
					}else{
						obj.value = node.textContent;
						
					}


				}
				
				return obj;
			};			
		}])
	;
})(angular)