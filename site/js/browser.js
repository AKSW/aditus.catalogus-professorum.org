/*
List Professors with simple navigation and search
*/
(function( $ ) {
	function Browser( elem ) {
		this.$elem = $(elem);
		this.classes = null;
		this.model = null;
		this.selection = null;
		this.offset = 0;
		this.limit = 10;
		this.list = [];
		this.prefixes = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
		return this;
	}

	Browser.prototype = {
		init : function() {
			var _this = this;	
			if ( _this.selection == null ) { // set init selection
				for (var prop in _this.classes) {
					_this.selection = prop;
					break;
				}				
			}
			_this.offset = 0;
			_this.$elem.find(".panel-footer").addClass("loading");
			_this.fetch(function(list) {
				_this.list = list;
				_this.printPage(_this.list);
				_this.$elem.find(".panel-footer").removeClass("loading");

				if ( $(".search-field").attr("data-value") != "" ) {
					$(".browser-search").val( $(".search-field").attr("data-value") ).trigger("keyup");
				} 
			});
			_this.printNewResBtn();
		},		

		printClassNavigation : function() {
			var _this = this;
			var navContainer = $('<ul class="browser-class-nav nav nav-tabs"></ul>');
			var i = 0;
			$.each(_this.classes, function(label,classes) {
				var element = $( '<li><a href="#" data-item="'+label+'">'+label+'</a></li>' );
				$(navContainer).append( element );
			});
			_this.$elem.append( navContainer );

			$(navContainer).children().first().addClass("active");

			$(navContainer).find("a").click(function() {
				$(this).parent().siblings().removeClass("active");
				$(this).parent().addClass("active");
				$(".browser-list").html("");
				$(".browser-nav").html("");
				$(".browser-counter").html("");
				_this.selection = $(this).attr("data-item");				
				_this.init();
				return false;
			});
		},

		printBrowser : function() {
			var _this = this;
			var browser = $( '<div class="browser panel panel-default"></div>' );
			var searchField = $('<input type="search" class="form-control browser-search pull-right" style="width:30%" placeholder="Suche ...">');

			$(browser).append( $('<div class="panel-heading" style="height:55px"></div>').append(searchField) );
			$(browser).append('<ul class="browser-list list-group"></ul>');
			$(browser).append( $('<div class="panel-footer"></div>').append('<div class="browser-nav btn-group"></div><div class="browser-counter pull-right"></p>') );

			_this.$elem.append( browser );
			
			searchField.keyup(function() {
				var filtered = _this.filter( $(this).val() );
				_this.offset = 0;
				_this.printPage(filtered);
				
			});			
		},

		printNewResBtn : function() {
			var _this = this;
			var $container = $(".panel-heading");			
			$(".new-resource-button", $container).remove();
			var $dropdown = $('<div class="dropdown new-resource-button pull-right" style="margin:0 10px"></div>' );

			if ( _this.classes[_this.selection].length == 1 ) {
				var label = _this.classes[_this.selection][0].split("/").reverse()[0];
				$dropdown.append( '<a href="#" data-resource="' + _this.classes[_this.selection] + '" class="btn btn-default">Neue Resource: ' + label + '</a>' );
			} else {
				var $listContainer = $( '<ul class="dropdown-menu" role="menu" aria-labelledby="newResource"></ul>' );
				$.each( _this.classes[_this.selection], function(k,v) {
					var label = v.split("/").reverse()[0];
					$listContainer.append( '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-resource="' + v + '">' + label + '</a></li>' );
				} );

				$dropdown.append ( '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Neue Resource... <span class="caret"></span></button>' );
				$dropdown.append( $listContainer );

				
			}
			$container.append( $dropdown );

			$("a", $listContainer).click(function() {
				var template = $(this).attr("data-resource").split("/").reverse()[0];
				$("#resourceTemplate").val( template );
				resourceTemplate = template;
				if ( _this.model != null ) {
					modelIri =  _this.model;
					$("#modelIri").val( _this.model );
				}
				createForm();
			});
			


		},

		printPage : function(list) {
			var _this = this;
			var $list = $(".browser-list").html("");
			var $nav = $(".browser-nav").html("");
			var $counter = $(".browser-counter").html("");
			
			for (var i = _this.offset; i < list.length; i++) {
				if (i >= (_this.offset + _this.limit) ) { break; }
				var label = (list[i].label !== undefined) ? list[i].label.value : list[i].resourceUri.value.split("/").reverse()[0];
				$list.append('<li class="browser-entry list-group-item"><a href="'+list[i].resourceUri.value+'">'+label+'</a></li>');				
			};

			if ( list.length == 0 ) {
				$list.append('<li class="browser-entry list-group-item">Kein entsprechender Eintrag gefunden.</li>');	
			}

			var prevBtn = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-arrow-left"></span> zurück</button> ');
			var nextBtn = $('<button type="button" class="btn btn-default btn-sm">weiter <span class="glyphicon glyphicon-arrow-right"></span></button>');

			if ( _this.offset > 0 && list.length > _this.limit ) {
				$nav.append(prevBtn);
			}
			if ( list.length > ( _this.offset + _this.limit ) ) {
				$nav.append(nextBtn);
			}

			$counter.text("gesamt: " + list.length);

			nextBtn.click(function() {
				_this.offset = _this.offset + _this.limit;
				_this.printPage(_this.list);
				return false;
			});
			prevBtn.click(function() {
				_this.offset = _this.offset - _this.limit;
				_this.printPage(_this.list);
				return false;
			});			
		},

		filter : function(search) {
			var _this = this;
			var search = new RegExp( search, "gi");
			return $.grep(_this.list, function(item) {
				var label = (item.label !== undefined) ? item.label.value : item.resourceUri.value;
				return ( label.search(search) !== -1 )
			} );
		},

		fetch : function(callback) {
			var _this = this;
			var filter = "?body = <" + _this.classes[_this.selection].join("> || ?body = <") + ">";			
			var from = "";
			if (_this.model != null) {
				from = " FROM " + _this.model;
			}

			$.ajax({
				url: urlBase + "sparql",
				dataType: "json",
				data: {
					query: _this.prefixes + "SELECT DISTINCT * "+from+" WHERE { ?resourceUri rdf:type ?body . OPTIONAL { ?resourceUri rdfs:label ?label . } FILTER ( "+filter+" ) } ORDER BY ?label ?resourceUri",
					format: "json"
				},
				success: function( data ) {
					callback(data.results.bindings);
				},
				error: function(e) {
					console.log( 'Error on autocomplete: ', e );
					callback([]);
				},
			});
		}
	};

	
	$.fn.Browser = function( settings ) {
		return this.each(function() {
			var browser = new Browser( this );
			browser.classes = settings["classes"];
			if ( settings["model"] !== undefined ) {
				browser.model = settings["model"];
			}
			browser.printClassNavigation();
			browser.printBrowser();
			browser.init();
		});		
	};
})(jQuery);