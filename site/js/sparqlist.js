/*
List Professors with simple navigation and search
*/
(function( $ ) {
	function SparQList( elem ) {
		this.$elem = $(elem);
		this.offset = 0;
		this.limit = 5;
		this.list = [];
		return this;
	}

	SparQList.prototype = {
		init : function() {
			var _this = this;
			_this.$elem.addClass("sparqlist loading");
			_this.fetch(function(list) {
				_this.list = list;
				_this.write();
				_this.$elem.removeClass("loading");
				_this.$elem.addClass("panel panel-default");
			});
		},
		write : function() {
			var _this = this;
			var searchField = $('<input type="search" class="form-control pull-right" style="width:30%;" placeholder="Suche ...">');
			_this.$elem.append( $('<div class="panel-heading" style="height:55px;"></div>').append(searchField) );
			_this.$elem.append('<ul class="sparqlist-list list-group"></ul>');
			_this.$elem.append( $('<div class="panel-footer"></div>').append('<div class="sparqlist-nav btn-group"></div><div class="sparqlist-counter pull-right"></p>') );		
			_this.page(_this.list);			
			searchField.keyup(function() {
				var filtered = _this.filter( $(this).val() );
				_this.offset = 0;
				_this.page(filtered);
				
			});
		},
		page : function(list) {
			var _this = this;
			var $list = _this.$elem.find(".sparqlist-list").html("");
			var $nav = _this.$elem.find(".sparqlist-nav").html("");
			var $counter = _this.$elem.find(".sparqlist-counter").html("");
			
			for (var i = _this.offset; i < list.length; i++) {
				if (i >= (_this.offset + _this.limit) ) { break; }
				$list.append('<li class="sparqlist-entry list-group-item"><a href="'+list[i].item.value+'">'+list[i].label.value+'</a></li>');
			};

			if ( list.length == 0 ) {
				$list.append('<li class="sparqlist-entry list-group-item">Kein entsprechender Eintrag gefunden.</li>');	
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
				_this.page(_this.list);
				return false;
			});
			prevBtn.click(function() {
				_this.offset = _this.offset - _this.limit;
				_this.page(_this.list);
				return false;
			});			
		},

		filter : function(search) {
			var _this = this;
			var search = new RegExp( search, "gi");
			return $.grep(_this.list, function(item) {
				return ( item.label.value.search(search) !== -1 )
			} );
		},

		fetch : function(callback) {
			var _this = this;
			$.ajax({
				url: urlBase + "sparql",
				dataType: "json",
				data: {
					query: "SELECT DISTINCT * WHERE { { ?item rdf:type <http://catalogus-professorum.org/cpm/Person> } UNION { ?item rdf:type <http://catalogus-professorum.org/cpm/Professor> } ?item rdfs:label ?label . OPTIONAL { ?item <http://catalogus-professorum.org/cpm/surname> ?surname } } ORDER BY ?surname ?label LIMIT 9999",
					//LIMIT "+_this.limit+" OFFSET "+_this.offset
					//FILTER regex(?label,%s,'i')
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

	
	$.fn.SparQList = function( query ) {
		this.query = query;
		return this.each(function() {
			var sparqlist = new SparQList( this );
			sparqlist.init();
		});		
	};
})(jQuery);