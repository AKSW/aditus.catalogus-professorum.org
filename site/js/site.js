
var owCon = new OntoWikiConnection(urlBase + 'jsonrpc');

// click edit btn
$("#rdform-edit-btn").click(function() {
		var container = $('<div class="rdform-container"></div>');
		var template = "form_catalogus-professorum-" + $(this).attr("data-resourceTemplate") + ".html";
		var resourceIri = $(this).attr("data-resourceIri");

		$("body").append(container);

		owCon.getResource( modelIri, resourceIri, function( resData ) {
			var hash = resData.dataHash;
			var owRdform = new OntoWikiRDForm({
				$container: container,
				template: template,
				hooks: "owrdform_hooks.js",
				lang: "de.js",
				data: resData.data
			});
			owRdform.init( function(result){ 
				owCon.updateResource( modelIri, resourceIri, hash, result, function( updateResult ) {
					window.location.href = decodeURIComponent(result["@id"]);
				});
			});

			owRdform.settings.$elem.data("resourceIri", resourceIri);
			owRdform.settings.$elem.prepend('<div id="rdform-drag-header"></div>');
			owRdform.settings.$elem.prepend('<p><button class="btn btn-default close-rdform-btn pull-right" alt="Close title="Close"><span class="glyphicon glyphicon-remove"></span></button></p>');
			owRdform.settings.$elem.find(".rdform-submit-btn-group div").prepend('<button type="reset" class="btn btn-default close-rdform-btn">Abbrechen</button>  ');
			window.scrollTo(0,0);
			drag_init();	
		});				
		
		return false;
});

// click new btn
$("#rdform-new-btn").click(function() {
		var container = $('<div class="rdform-container"></div>');
		var template = "form_pfarrerbuch-" + $(this).attr("data-resourceTemplate") + ".html";

		$("body").append(container);

		var owRdform = new OntoWikiRDForm({
			$container: container,
			template: template,
			hooks: "hooks_pfarrerbuch.js",
			lang: "pfarrerbuch_de.js",
		});
		owRdform.init( function(result){ 
			var hash = '40cd750bba9870f18aada2478b24840a';
			owCon.updateResource( modelIri, result["@id"], hash, result, function( updateResult ) {
				window.location.href = decodeURIComponent(result["@id"]);
			});
		});
		owRdform.settings.$elem.prepend('<div id="rdform-drag-header"></div>');
		owRdform.settings.$elem.prepend('<p><button class="btn btn-default close-rdform-btn pull-right" alt="Close title="Close"><span class="glyphicon glyphicon-remove"></span></button></p>');
		owRdform.settings.$elem.find(".rdform-submit-btn-group div").prepend('<button type="reset" class="btn btn-default close-rdform-btn">Abbrechen</button>  ');

		drag_init();
		
		return false;
});

// close the current form window
$("body").on("click", ".close-rdform-btn", function() {
	var form = $(this).parentsUntil(".rdform-container");
	form.hide( "fast", function() {
					form.parent().remove();
				});
	return false;
})

// close a subform
$("body").on("click", ".close-subrdform-btn", function() {
	var form = $(this).parentsUntil(".rdform");
	$(this).parentsUntil(".rdform").parent().parentsUntil(".col-xs-9").parent().find("input,button").show();
	form.hide( "fast", function() {
					form.parent().remove();
				});	
	return false;
})


// drag and drop functionality for the root form
function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
} 
function drag_over(event) { 
    event.preventDefault(); 
    return false; 
} 
function drop(event) { 
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var dm = document.getElementsByTagName("form")[0];
    
    var dm1 = document.getElementById("rdform-drag-header");
    
    //console.log(event.clientX, event.dataTransfer.getData("text/plain"), parseInt(offset[0],10));
    //dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    dm.style.left = (event.clientX + 470 - Math.abs( ( parseInt(offset[0],10) ) + event.clientX ) ) + 'px';
    //dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    dm.style.top = (event.clientY) + 'px';
    event.preventDefault();
    return false;
}
function drag_init() {
	return false;
	//var dm = document.getElementsByTagName("form")[0];
	var dm = document.getElementById("rdform-drag-header");
	$(dm).attr("draggable", "true");
	dm.addEventListener('dragstart',drag_start,false); 
	document.body.addEventListener('dragover',drag_over,false); 
	document.body.addEventListener('drop',drop,false);
}

