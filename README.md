# NoInfoPath Helpers

> `Module Name: noinfopath.helpers`

> @version 2.0.30

 ## Installation
     npm install noinfopath-helpers --save

 ## Dependencies
 None


## NoXmlService

Normalizes the XmlDOM and provides parsing and conversion methods.

### Methods

#### fromString(xml)

fromString takes in an xml string and parses it using
the normalized DOMParser created when the service
is instanciated.

##### Parameters

###### xml `string` (required)

A string containing a valid xml document

##### Returns `XmlDOMObject`

#### toObject(node, target)

Converts an XmlNode to a pure JavaScript object.

##### Parameters

###### node

XmlNode object that is the source for creating the JavaScript object.

###### target

This name of the tag to retrive as the source node for the new object.
If not supplied `node` parameter is used instead.

> This code needs to be corrected as it uses getElementsByTagName. instead
> we should be using XPath.
> ([See: Introduction to using XPath in JavaScript](https://developer.mozilla.org/en-US/docs/Introduction_to_using_XPath_in_JavaScript) for more information.)

##### Returns `Object`

## format Filter

Uses the arbitrary arguments list passed to the filter to
replace numbered placeholders.

```js
var i = "Today is {1}";

$filter("format")(i, "sunny");

//Output:  "Today is sunny"
```

## NoActionQueueService

> Service Name: noActionQueue

### configuration


	[{
	 "scope": "current|parent|root"
	 "scopeKey": "projectTabs",
	 "action": {
		 "provider": "noNavigationManager",
		 "method": "changeNavBar",
		 "params": [
			 {
				 "provider": "scope|scope.$parent|scope.$root",
				 "property": "projectTabs.btnBar"
			 }
		 ]
	 }
	}]




## NoStateHelperService

> Service Name: noStateHelper

### Methods

#### resolveParams(params)

> TODO: What does this method actuallu do?

##### Parameters

###### params `Array`

An arrray of parameters name to extract from $stateParams.

##### Returns `object`

> TODO: Describe what is in the objec returned.

### Remarks


When a parameter is an array then it is a name value pair.
The first element of the array is the name, and the second
is the value.

```json

	{
		"params": [
			["foo", 1000],
			["bar", false],
			"pid"
		]
	}

```

When a parameter is a string, then it is the name
of a $stateParams value.

When a parameter is an array then it is a name value pair.
The first element of the array is the name, and the second
is the value. resolveParams only looks at the second element
of the array. The first element is used by the caller.

```json

	{
		"params": [
			["foo", 1000],
			["bar", false],
			"pid"
		]
	}

```

## NoDocumentReadyService  (a/k/a noDocumentReady)

This service, when enabled in a controller, keeps track of how many resources
being loaded via the $templateCache service. It maintains a running count
based on the `$includeContentRequested`, `$includeContentLoaded`, and
`$includeContentError` event handlers.


### @method whenReady()

#### Parameters
none

#### Returns `Promise`

Loading errors not rejected, but will raise a notification
on the promise.  The service will also raise progress notifications as the
running total increases and decrease with out errors. The promise will
resolve when the doucment reduces to zero.



## NoAreaLoaderService

The purpose of this services it to keep track of the async loading of all
noInfoPath components. The idea is to mitigate issues with ngFormControllers
being set to dirty while an area is loading.

## NoKendoHelpersService

> @service noKendoHelpers

This services provide various helper functions that provide access
details about the a given row of data in a grid, as well as, access to
grid's currently selected row.

> NOTE: A future enhancements will be that it allows for multi-row selection,
> and cell slections.

### @method getConfigMethod

This is a specialty function that helps NoInfoPath wrapped widgets
determine where to read thier configuration data from.

> NOTE: This function may be either deprecated to relocated to
> NoInfoPath Helpers module in the future.

### @method resolveConfigType

This is a specialty function that is typically used in conjection with
`getConfigMethod`. It helps NoInfoPath wrapped widgets
resolve what type of configuration data a directive is using..

> NOTE: This function may be either deprecated to relocated to
> NoInfoPath Helpers module in the future.

### @method getGridRow

This method, given a `jQuery` element, returns the closest parent
that matches the `tr[data-uid]` selector, as a jQuery element.

This method is especially useful when used in conjection with
NoInfoPath's noActionQueue service to resolve action parameters
for Kendo Grid methods that require a row element as one of its
parameters. It is usually expected that the action be attached to
button that is child of a given row.


### @method getGridRowUID

This method, given a `jQuery` element, returns the data-uid of the
supplied element's parent row that matches the `tr[data-uid]` selector.

This method is especially useful when used in conjection with
NoInfoPath's noActionQueue service to resolve action parameters
for Kendo Grid methods that require a row data-uid as one of its
parameters. It is usually expected that the action be attached to
button that is child of a given row.


### @method getSelectedGridRow

### @method getSelectedGridRow

### @method getSelectedGridRowData

### @method currentGridRowData

### @method currentGridRow

### @method ngCompileSelectedRow

