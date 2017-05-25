//helpers.js
(function(angular) {
	/**
	*	## NoKendoHelpersService
	*
	*	> @service noKendoHelpers
	*
	*	This services provide various helper functions that provide access
	*	details about the a given row of data in a grid, as well as, access to
	*	grid's currently selected row.
	*
	*	> NOTE: A future enhancements will be that it allows for multi-row selection,
	*	> and cell slections.
	*/
	function NoKendoHelpersService($injector, $compile, $q, $state, _) {
		function _newRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				nonav,
				barid;

			grid.addRow();

			nonav = grid.editable.element.find("no-navigation");
			barid = $(nonav.find("navbar")[0]).attr("bar-id") + ".dirty";

			this.changeRowNavBar(ctx, scope, nonav, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, nonav, barid, barid, scope);

		}
		this.newRow = _newRow.bind(this);

		function _editRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				row = this.getGridRow(el),
				barid;

			grid.editRow(row);

			barid = $(el.find("navbar")[0]).attr("bar-id") + ".dirty";

			this.changeRowNavBar(ctx, scope, el, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, el, barid, barid, scope);

		}
		this.editRow = _editRow.bind(this);

		function _cancelRow(ctx, scope, el, gridName, navBarName) {
			var grid = scope[gridName],
				row,
				barid;

			grid.cancelRow();

			row = this.getSelectedGridRow(grid);

			this.ngCompileSelectedRow(ctx, scope, el, gridName);

			barid = $(el.find("navbar")[0]).attr("bar-id");

			this.changeRowNavBar(ctx, scope, el, gridName, navBarName, barid);

			this.changeRowNavBarWatch(ctx, scope, el, barid, barid, scope);

		}
		this.cancelRow = _cancelRow.bind(this);

		function _resolveCurrentNavigationRow(grid, el) {
			var tr;

			if(grid.editable) {
				tr = grid.editable.element;
			} else {
				tr = _getSelectedGridRow(grid);

				if(tr.length === 0) tr = _getGridRow(el);
			}

			// tr = _getGridRow(el);
			//
			// 	if(tr.length === 0) {
			//
			// }

			if(tr.length === 0) throw {error: "Could not resolve current row related to changing the rows navbar state." };

			return tr;
		}

		/*
		*	### @method getConfigMethod
		*
		*	This is a specialty function that helps NoInfoPath wrapped widgets
		*	determine where to read thier configuration data from.
		*
		*	> NOTE: This function may be either deprecated to relocated to
		*	> NoInfoPath Helpers module in the future.
		*/
		this.getConfigMethod = function(type) {
			var cfgFn = {
					"noConfig": function($injector, $compile, $state, attrs, editor) {
						var noConfig = $injector.get("noConfig");
						return noConfig.whenReady()
							.then(function() {
								return noInfoPath.getItem(noConfig.current, attrs.noConfig);
							})
							.catch(function(err) {
								console.error(err);
								return $q.reject(err); //Log in re-throw.
							});
					},
					"noForm": function($injector, $compile, $state, attrs, editor) {
						var noFormConfig = $injector.get("noFormConfig"),
							config = noFormConfig.getFormByRoute($state.current.name, $state.params.entity),
							noForm = noInfoPath.getItem(config, attrs.noForm);

						return angular.copy(noForm);
					},
					"noLookup": function($injector, $compile, $state, noFormKey, editor, scope, container, options) {
						//console.log(this);

						var noFormConfig = $injector.get("noFormConfig"),
							config = noFormConfig.getFormByRoute($state.current.name, $state.params.entity),
							lu = noInfoPath.getItem(config, noFormKey),
							tpl = "<no-kendo-lookup no-form=\"" + noFormKey + "\"></no-kendo-lookup>",
							comp;


						scope[lu.noLookup.scopeKey] = options.model;

						//noInfoPath.setItem(scope, editor.options.noLookup.scopeKey, options.model);

						comp = $compile(tpl)(scope);
						container.append(comp);
					},
					"noid": function($injector, $compile, $state, attrs) {
						var noNCLManager = $injector.get("noNCLManager"),
							hashStore = noNCLManager.getHashStore($state.params.fid || $state.current.name.split(".").pop()),
							ncl = hashStore.get(attrs.noid);

						return ncl.noComponent;
					}
				},
				method = cfgFn[type];

			return (method || cfgFn.noForm).bind(null, $injector, $compile, $state);
		};

		/**
		*	### @method resolveConfigType
		*
		*	This is a specialty function that is typically used in conjection with
		*	`getConfigMethod`. It helps NoInfoPath wrapped widgets
		*	resolve what type of configuration data a directive is using..
		*
		*	> NOTE: This function may be either deprecated to relocated to
		*	> NoInfoPath Helpers module in the future.
		*/
		this.resolveConfigType = function(attrs) {
			var configurationType;

			if (attrs.noConfig) {
				configurationType = "noConfig";
			} else if (attrs.noForm) {
				configurationType = "noForm";
			} else if (attrs.noid) {
				configurationType = "noid";
			} else {
				throw "noKendoGrid requires either a noConfig or noForm attribute";
			}

			return configurationType;
		};

		/**
		*	### @method getGridRow
		*
		*	This method, given a `jQuery` element, returns the closest parent
		*	that matches the `tr[data-uid]` selector, as a jQuery element.
		*
		*	This method is especially useful when used in conjection with
		*	NoInfoPath's noActionQueue service to resolve action parameters
		*	for Kendo Grid methods that require a row element as one of its
		*	parameters. It is usually expected that the action be attached to
		*	button that is child of a given row.
		*
		*/
		function _getGridRow(el) {
			var tr = el.is("[data-uid]") ? el : el.closest("tr[data-uid]");
			return $(tr);
		}
		this.getGridRow = _getGridRow;

		/**
		*	### @method getGridRowUID
		*
		*	This method, given a `jQuery` element, returns the data-uid of the
		*	supplied element's parent row that matches the `tr[data-uid]` selector.
		*
		*	This method is especially useful when used in conjection with
		*	NoInfoPath's noActionQueue service to resolve action parameters
		*	for Kendo Grid methods that require a row data-uid as one of its
		*	parameters. It is usually expected that the action be attached to
		*	button that is child of a given row.
		*
		*/
		function _getGridRowUID(el) {
			var tr = _getGridRow(el),
				uid = tr.attr("data-uid");

			return uid;
		}
		this.getGridRowUID = _getGridRowUID;

		/**
		*	### @method getSelectedGridRow
		*/
		function _getSelectedGridRow(grid) {
			var row;
			try {
				row = grid.select();
			}
			catch(err) {
				row = [];
			}

			return row;
		}
		this.getSelectedGridRow = _getSelectedGridRow;

		/**
		*	### @method getSelectedGridRow
		*/
		function _getCurrentGridRow(scope, tragetGridID) {
			return _getSelectedGridRow(scope[targetGridID]);
		}
		this.getCurrentGridRow = _getCurrentGridRow;

		function _getCurrentGridRowUID(scope, tragetGridID) {
			return _getGridRowUID(_getSelectedGridRow(scope[targetGridID]));
		}
		this.getCurrentGridRowUID = _getCurrentGridRowUID;


		/**
		*	### @method getSelectedGridRowData
		*/
		function _getSelectedGridRowData(grid) {
			var tr = _getSelectedGridRow(grid),
				data = grid.dataItem(tr);

			return data;
		}
		this.getSelectedGridRowData = _getSelectedGridRowData;


		/**
		*	### @method currentGridRowData
		*/
		this.currentGridRowData = function(scope, el) {
			var tr = _getGridRow(el),
				grid = scope.noGrid || tr.scope().noGrid,
				data = grid.dataItem(tr);


			return data;
		};

		/**
		*	### @method currentGridRow
		*/
		this.changeRowNavBar = function(ctx, scope, el, gridScopeId, navBarName, barid) {
			var grid = scope[gridScopeId],
				tr = _resolveCurrentNavigationRow(grid, el),
				uid = noInfoPath.toScopeSafeGuid(_getGridRowUID(tr)),
				barkey = navBarName + "_" + uid,
				scopeKey = "noNavigation." + barkey + ".currentNavBar";

			if(!uid) return;

			if(grid.editable && grid.editable.validatable && grid.editable.validatable.errors().length > 0) return;

			noInfoPath.setItem(scope, scopeKey , barid);

		};

		this.changeRowNavBarWatch = function(ctx, scope, el, barid, o, s) {

			if(barid) {
				el.find("navbar").addClass("ng-hide");
				el.find("navbar[bar-id='" + barid + "']").removeClass("ng-hide");

			}

			// if(!uid) return;
			//
			// if(grid.editable && grid.editable.validatable && grid.editable.validatable.errors().length > 0) return;

			//console.log("changeNavBar", arguments);
			// if(barid === "^") {
			// 	var t = noInfoPath.getItem(scope,  "noNavigation." + barkey + ".currentNavBar"),
			// 		p = t.split(".");
			//
			// 	barid = p[0];
			// }



			//console.info("changeRowNavBarWatch",ctx.component, barid, scope.noNavigation);
			//console.log("scope, grid, tr, scopeKey, barid", scope, grid, tr, scopeKey, barid);
		}.bind(this);

		/**
		*	### @method ngCompileSelectedRow
		*/
		function _ngCompileRow(ctx, scope, el, targetGridID) {
			var grid = scope[targetGridID],
				tr = grid.select();

			$compile(tr)(scope);

			return true;

		}
		this.ngCompileSelectedRow = _ngCompileRow;

		function _addBlankOption(ctx, scope, el, def) {
			// ctx is the result set for the dropdown.
			var blank = {},
				emptyArray = [],
				res;

			// Need to mock a def record
			blank[def.TextField] = "";
			blank[def.SaveColumn] = null;
			blank[def.ValueField] = null;
			blank[def.SortField] = null;

			emptyArray.push(blank);
			res = new noInfoPath.data.NoResults(emptyArray.concat(ctx.paged));

			return res;
		}
		this.addBlankOption = _addBlankOption;

		function _validateAndSave(ctx, scope, el, row) {
			var schema = _getGridSchema(ctx, scope, el),
				valid = true,
				rowData = _.find(scope.noGrid.dataSource.data(), {"uid": row.attr("data-uid")});

			for(var field in schema.model.fields) {
				var obj = schema.model.fields[field];

				if(!obj.validation) continue;

				if(obj.validation.required && !rowData[field]) {
					valid = false;
				}
			}

			if(valid) {
				scope.noGrid.saveRow(rowData);
			} else {
				throw "Row not valid";
			}
		}
		this.validateAndSave = _validateAndSave;

		function _getGridSchema(ctx, scope, el) {
			var schema = scope.noGrid.dataSource.options.schema;

			return schema;
		}
		this.getGridSchema = _getGridSchema;
	}

	function NoKendoInlineGridEditors($state, noLoginService, noKendoDataSourceFactory, noFormConfig) {
		var editors = {
			text: function (scope, def, options) {
				// create an input element
				var input = $("<input class=\"full-width\"/>");

				// set its name to the field to which the column is bound ('name' in this case)
				input.attr("name", options.field);

				return input;
			},
			dropdown: function (scope, def, options) {
				var input = $("<div style=\"position: relative\"><input /></div>"),
					ctx = noFormConfig.getComponentContextByRoute($state.current.name, $state.params.entity, "noKendoGrid", "custom"),
					dataSource;

				ctx.component = {
					noDataSource: {
						"name": def.ListSource,
						"dataProvider": "noIndexedDb",
						"databaseName": "rmEFR2",
						"entityName": def.ListSource,
						"primaryKey": def.ValueField,
						"sort": [{
							"field": def.SortField
						}],
						"actions": {
							"post": [
								{
									"provider": "noKendoHelpers",
									"method": "addBlankOption",
									"params": [
										def
									]
								}
							]
						}
					}
				};

				if(def.Filter){
					ctx.component.noDataSource.filter = def.Filter;
				}

				dataSource = noKendoDataSourceFactory.create("kendoDropDownList", noLoginService.user.userId, ctx.component, scope);

				dataSource.noInfoPath = def;

				input.find("input").attr("name", options.field);

				input.find("input").kendoDropDownList({
					autobind: false,
					dataTextField: def.TextField,
					dataValueField: def.ValueField,
					dataSource: dataSource,
					template: def.Template ? def.Template : undefined,
					optionLabel: def.OptionLabel ? def.OptionLabel : undefined,
					change: function (e) {
						var tr = e.sender.element.closest("TR"),
							grid = e.sender.element.closest("[data-role='grid']").data("kendoGrid"),
							data = grid.dataItem(tr);

						data[def.SaveColumn || "Value"] = this.dataItem();
					}
				});

				angular.element(input).children().first().addClass("full-width");
				return input;
			},
			combobox: function (scope, def, options) {

				var input = $("<div style=\"position: relative\"><input /></div>"),
					ctx = noFormConfig.getComponentContextByRoute($state.current.name, $state.params.entity, "noKendoGrid", "custom"),
					dataSource;

				ctx.component = {
					noDataSource: {
						"name": def.ListSource,
						"dataProvider": "noIndexedDb",
						"databaseName": "rmEFR2",
						"entityName": def.ListSource,
						"primaryKey": def.ValueField,
						"sort": [{
							"field": def.SortField
						}]
					}
				};

				if(def.Filter){
					ctx.component.noDataSource.filter = def.Filter;
				}

				dataSource = noKendoDataSourceFactory.create("combobox", noLoginService.user.userId, ctx.component, scope);

				dataSource.noInfoPath = def;

				input.find("input").attr("name", options.field);

				input.find("input").kendoComboBox({
					autobind: false,
					dataTextField: def.TextField,
					dataValueField: def.ValueField,
					dataSource: dataSource,
					template: def.Template ? def.Template : undefined,
					change: function (e) {
						var tr = e.sender.element.closest("TR"),
							grid = e.sender.element.closest("[data-role='grid']").data("kendoGrid"),
							data = grid.dataItem(tr);

						data[def.SaveColumn || "Value"] = this.dataItem();
					}
				});

				angular.element(input).children().first().addClass("full-width");
				return input;
			},
			timepicker: function(scope, def, options){
				var input = $("<div><input /></div>");

				// set its name to the field to which the column is bound ('name' in this case)
				input.find("input").attr("name", options.field);
				// input.attr("type", "time");
				input.find("input").kendoTimePicker({
					"interval": 10
				});

				return input;
			}
		},
		templates = {
			"text": function (valueObj, def) {
 				var value = angular.isObject(valueObj) ?  valueObj[def.TextField] || valueObj.Description : valueObj || "";
				return value;
			},
			"timepicker": function(valueObj) {
				var value;

				// Test to see if we have a value
				if(valueObj){
					// If it's a JS Date
					if(valueObj.toLocaleTimeString) {
						value = valueObj.toLocaleTimeString();
						// Else make it a JS date
					} else {
						value = new Date(valueObj).toLocaleTimeString();
					}
					// If we have no value, return empty string.
				} else {
					value = "";
				}

				return value;
			}
		},
		templateNameMap = {
			"text": "text",
			"combobox": "text",
			"dropdown": "text",
			"timepicker": "timepicker"
		};

		this.getEditor = function(type) {
			var r = editors[type];

			if(!r) throw "Invalid inline component type: " + type;

			return r;
		};

		this.getTemplate = function(type) {
			var r = templates[templateNameMap[type]];

			if(!r) throw "Invalid inline component type: " + type;

			return r;
		};

		this.renderEditor = function(container, scope, def, options) {
			var	render = this.getEditor(def.InputType),
				input;

			if(render) {
				input = render(scope, def, options);
				input.appendTo(container);
			}
		};

		this.renderTemplate = function(def, col, model) {
			var valueObj = model[col.field],
				value = this.getTemplate(def.InputType)(valueObj, def);

			return value;
		};
	}
	angular.module("noinfopath.helpers")
		.service("noKendoHelpers", ["$injector", "$compile", "$q", "$state", "lodash", NoKendoHelpersService])
		.service("noKendoInlineGridEditors", ["$state", "noLoginService", "noKendoDataSourceFactory", "noFormConfig", NoKendoInlineGridEditors]);
})(angular);
