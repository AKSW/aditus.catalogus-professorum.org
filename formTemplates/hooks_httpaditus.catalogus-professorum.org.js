/*
RDForm Hooks-File - to hook in on certain points of application execution

Variables:
_this.rdform 	- The RDForm-class. Plublic functions can accessed like: _this.rdform.showAlert( "info", "...");
_this.$elem 	- The form element
*/
RDForm_OntoWiki_Hooks.prototype = {

	// after model is parsed - init form handlers
	__initFormHandlers : function () {
		var _this = this;
				
	},

	__writeWildcardValue : function( elem, wldVal ) {
		var _this = this;

		// make resource uris lower case an replace nderline with dash
		if ( $(elem).attr("name") == _this.rdform._ID_+"-classUri" ) { // make wcdVal as resouce uri
			wldVal = wldVal.toLowerCase();
			wldVal = wldVal.replace(/_+/g, '-');
		}

		return wldVal;
	},

	__insertResourceData : function(i, data) {
		var _this = this;
		
		var resourceUri = _this.rdform.data[0]["@id"];

		if ( data["@type"][0] == "http://catalogus-professorum.org/cpd/Family" ) {
			if ( data.hasOwnProperty("http://catalogus-professorum.org/cpd/familyChild") ) {
				$.each(data["http://catalogus-professorum.org/cpd/familyChild"], function(n,child) {
					if ( child["@id"] == resourceUri ) {
						data["@type"][0] = "http://catalogus-professorum.org/cpd/ParentFamily";
						return true;
					}
				});
			}

		}

		return data;
	},

	// after instert existing data into the form
	__afterInsertData : function() {
		var _this = this;
		
	},

	// after adding a property
	__afterAddProperty : function ( thisPropertyContainer) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after adding a property
	__afterDuplicateProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after adding a property
	__beforeRemoveProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after leave an external resource input field
	__afterBlurExternalResource : function( thisResource ) {
		var _this = this;
	},

	// on click edit-subform btn
	__editSubform: function( resContainer ) {
		var _this = this;
		var resource = $(resContainer).find("input."+_this.rdform._ID_+"-property");
	},

	// on click new-subofrm btn
	__newSubform : function( resContainer ) {
		var _this = this;
	},

	// validate form-input on change value or on submit the form
	__userInputValidation : function ( property ) {
		var _this = this;

		// validate if from is a smaller date than to
		if ( $(property).attr("name") == "cpd:from" ) {
			var from = Date.parse( $(property).val() );
			var toEl = $(property).parentsUntil(".rdform-literal-group").parent().next().find('input[name="cpd:to"]');
			var to = Date.parse( toEl.val() );	
			if ( from >= to ) {
				return false;
			} else {
				if ( $(property).parentsUntil(".rdform-literal-group").parent().next().hasClass("has-error") ) {
					_this.rdform.userInputValidation( toEl );
				}
			}
		}
		else if ( $(property).attr("name") == "cpd:to" ) {
			var to = Date.parse( $(property).val() );
			var fromEl = $(property).parentsUntil(".rdform-literal-group").parent().prev().find('input[name="cpd:from"]');
			var from = Date.parse( fromEl.val() );
			if ( from >= to ) {
				return false;
			} else {
				if ( $(property).parentsUntil(".rdform-literal-group").parent().prev().hasClass("has-error") ) {
					_this.rdform.userInputValidation( fromEl );
				}
			}
		}

		// manually fix DNB-URL
		if ( $(property).attr("name") == "cpd:gnd" ) {
			if ( $(property).val().search(/^http/) == -1 ) {
				$(property).val( "http://d-nb.info/gnd/" + $(property).val() );
			}
		}

		return true;
	},

	// get the the item for the result-search list on autocomplete
	__autocompleteGetItem : function( item ) {
		// e.g. change the label as: item.label.value = "My val: " + item.label.value;
		var _this = this;
		

		return item;
	},

	__restoreResource: function( resource, result ) {
		var _this = this;
		var resultUri = result["@id"];
		var resourceLabel = "";
		var resContainer = $(resource).parentsUntil(".form-group").parent();
	},


	// before creating the result object from the html form
	__createResult : function() {
		var _this = this;
	},

	// before creating the class properties from input values
	__createResultClassProperty : function( propertyContainer ) {
		var _this = this;
	},

	// before generating the class object from input values and properties
	__createClass : function ( thisClass ) {
		var _this = this;
	},

}

function RDForm_OntoWiki_Hooks( rdform, hooks ) {
	var _this = this;
	_this.rdform = rdform;
	_this.$elem = rdform.$elem;
	_this.hooks = hooks;
}