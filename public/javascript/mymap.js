
$(document).ready(function() {

	$("#create-map").click(function(event) {
		if($("#map-name").val() != "") {
			$("#new-map-form").submit();
		}
		else {
			$("#map-name").parent().addClass("has-warning");
			$("#map-name").parent().find("p").text("Please give a name.")
		}
	});

	$(".delete-map").click(function(event) {
		var tr = $(this).closest('tr');
		var td = tr.find("td:first");

		$("#delete-map-id").val(td.text());
		$('#modal-delete').modal();
	});

	$("#confirm-delete-map").click(function(event) {
		$("#delete-map-form").submit();
	});

	$(".public-url-btn").click(function () {
		var tr = $(this).closest('tr');
		var td = tr.find("td:first");

		$("#public-url").val("http://www.mapito.org/view?m=" + td.text());
		$("#modal-url").modal('show');
	});

});
