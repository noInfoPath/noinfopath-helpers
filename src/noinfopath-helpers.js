//helpers.js

/*
 *	# NoInfoPath Helpers
 *
 *	> `Module Name: noinfopath.helpers`
 *
 *	> @version 2.0.24
 *
 *  ## Installation
 *      npm install noinfopath-helpers --save
 *
 *  ## Dependencies
 *  None
 *
 */

(function (angular, undefined) {

	angular.module('noinfopath.helpers', [])

	.service("noUrl", ['$window', '$filter', function ($window, $filter) {

		var SELF = this,
			r20 = /%20/g,
			rbracket = /\[\]$/,
			rCRLF = /\r?\n/g,
			rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
			rsubmittable = /^(?:input|select|textarea|keygen)/i;

		function buildParams(prefix, obj, traditional, add) {
			var name;

			if(angular.isArray(obj)) {
				// Serialize array item.
				angular.forEach(obj, function (i, v) {
					if(traditional || rbracket.test(prefix)) {
						// Treat each array item as a scalar.
						add(prefix, v);

					} else {
						// Item is non-scalar (array or object), encode its numeric index.
						buildParams(
							prefix + "[" + (angular.isObject(v) ? i : "") + "]",
							v,
							traditional,
							add
						);
					}
				});

			} else if(!traditional && angular.isObject(obj)) {
				// Serialize object item.
				for(name in obj) {
					buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
				}

			} else {
				// Serialize scalar item.
				add(prefix, obj);
			}
		}

		this.params = function () {
			var qs = !!$window.location.search ? $window.location.search.substr(1) : "",
				qp = qs.split('&'),
				params = {};

			angular.forEach(qp, function (p) {
				var nvp = p.split('=');
				if(nvp.length > 1) {
					params[nvp[0]] = nvp[1];
				} else if(nvp.length == 1) {
					if(!!nvp[0])
						params[nvp[0]] = true;
				} else {
					angular.noop();
				}
			});

			return params;
		};

		this.serialize = function (a, traditional) {
			var prefix,
				s = [],
				add = function (key, value) {
					// If value is a function, invoke it and return its value
					value = angular.isFunction(value) ? value() : (value === null ? "" : value);
					s[s.length] = key + "=" + value;
				};

			// Set traditional to true for jQuery <= 1.3.2 behavior.
			// if ( traditional === undefined ) {
			// 	traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
			// }

			// If an array was passed in, assume that it is an array of form elements.
			if(angular.isArray(a)) {
				// Serialize the form elements
				angular.forEach(a, function (value, name) {
					add(name, value);
				});

			} else {
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for(prefix in a) {
					var param = a[prefix];
					if(!angular.isFunction(param)) {
						buildParams(prefix, param, traditional, add);
					}
				}
			}

			// Return the resulting serialization
			return s.join("&").replace(r20, "+");
		};

		this.normalizeValue = function (value) {
			if(typeof value === "string") {
				return "'" + value + "'";
			} else if(angular.isDate(value)) {
				return $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
			} else {
				return value;
			}
		};

		this.makeResourceUrl = function (endPointUri, listName, query) {
			var qs = query ? "?" + query : "";
			return endPointUri + "/" + listName + qs;
		};

		this.makeResourceUrls = function (endPointUri, resources) {
			var urls = {};
			angular.forEach(resources, function (resource) {
				var url = SELF.makeResourceUrl(endPointUri, resource.TableName, resource.Query);
				urls[resource.TableName] = url;
			});

			return urls;
		};
		}])

	/**
	 * ## NoXmlService
	 *
	 * Normalizes the XmlDOM and provides parsing and conversion methods.
	 */
	.service("noXml", [function () {
		var parser,
			SELF = this;

		if(window.DOMParser) {
			parser = new DOMParser();
		} else {
			//Downlevel IE support <= 8
			//Normalize on $window for testablility.
			parser = {
				parseFromString: function (text, contenttype) {
					var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = false;
					xmlDoc.loadXML(text);

					return xmlDoc;
				}
			};
		}

		/**
		 *	### Methods
		 *
		 *	#### fromString(xml)
		 *
		 * fromString takes in an xml string and parses it using
		 * the normalized DOMParser created when the service
		 * is instanciated.
		 *
		 *	##### Parameters
		 *
		 *	###### xml `string` (required)
		 *
		 *	A string containing a valid xml document
		 *
		 *	##### Returns `XmlDOMObject`
		 */
		this.fromString = function (xml) {
			var xmlDoc = parser.parseFromString(xml, "text/xml");
			return xmlDoc;
		};

		/**
		 *	#### toObject(node, target)
		 *
		 *	Converts an XmlNode to a pure JavaScript object.
		 *
		 *	##### Parameters
		 *
		 *	###### node
		 *
		 *	XmlNode object that is the source for creating the JavaScript object.
		 *
		 *	###### target
		 *
		 *	This name of the tag to retrive as the source node for the new object.
		 *	If not supplied `node` parameter is used instead.
		 *
		 *	> This code needs to be corrected as it uses getElementsByTagName. instead
		 *	> we should be using XPath.
		 *	> ([See: Introduction to using XPath in JavaScript](https://developer.mozilla.org/en-US/docs/Introduction_to_using_XPath_in_JavaScript) for more information.)
		 *
		 *	##### Returns `Object`
		 */
		this.toObject = function (node, target) {
			if(target) {
				var nodes = node.getElementsByTagName(target);
				node = nodes[0];
			}

			//console.log(angular.toJson(node.firstChild));
			// Create the return object
			var obj = {
				name: node.nodeName,
				value: null,
				attributes: {},
				children: []
			};



			//All elements are added as objects
			if(node.nodeType == 1 /*Element*/ ) {


				if(node.hasAttributes()) {
					angular.forEach(node.attributes, function (val, name) {
						//console.log(name, val.textContent);
						//Using attributes for backwards compatibility for the time being
						obj.attributes[val.name] = val.textContent;
						obj[val.name] = val.textContent;
					});
				}


				if(node.hasChildNodes()) {
					angular.forEach(node.childNodes, function (n) {
						if(n.nodeType == 3) {
							obj.value = n.textContent;
							//obj.children.push(tmp);
						} else {
							obj.children.push(SELF.toObject(n));
						}
					});
				} else {
					obj.value = node.textContent;
				}


			}

			return obj;
		};
		}])


	.service("noScopeHelper", ["$parse", function ($parse) {
		function _setItem(store, key, value) {
			var getter = $parse(key),
				setter = getter.assign;

			setter(store, value);
		}
		this.setItem = _setItem;

		function _getItem(store, key) {
			var getter = $parse(key);
			return getter(store);
		}
		this.getItem = _getItem;
	}])

	;
})(angular);
