var row;

$( document ).ready(function() {

	$("#generate-new-token").click(function () {
		$("#view-token").hide();
		$("#form-in-modal").show();
		$(".before-gen").show();
		$(".after-gen").hide();

		$("#form-token-id").val("");
		$("input[name='descr']").val("");
		$("input[name='map_read']").prop("checked", false);
		$("input[name='map_modify']").prop("checked", false);
		$("input[name='actions_read']").prop("checked", false);
		$("input[name='actions_modify']").prop("checked", false);
		$("input[name='routes_read']").prop("checked", false);
		$("input[name='routes_modify']").prop("checked", false);

		$("#gen-token-btn").html("Generate token");
		$("#form-action").val("add");
		$("#modal-token").modal("show");
	});

	$("#gen-token-btn").click(function(){
		$("#generate-token").submit();
	});

	$("#generate-token").submit(function( event ) {
		event.preventDefault();
		if ($("#form-action").val() == "add") {
			$.post( "/generate_access_token", $(this).serialize(), function( data ) {
				$('table tr:last').after("<tr>" + $('table tr').eq(1).html() + "</tr>");
				row = $('table tr:last');
				tableRow(data.id);
				$("#form-in-modal").hide();
				$(".before-gen").hide();
				$(".after-gen").show();
				$("#view-token").show();
				$("#new-token").val(data.token);
				$("#not-found-tokens").hide();
			}, "json");
		} else if ($("#form-action").val() == "update") {
			$.post( "/update_access_token", $(this).serialize(), function( data ) {
				if (data.status != "ok") {
					alert("Error. Please try again.")
				} else {
					tableRow();
				}
				$("#modal-token").modal("hide");
			}, "json");
		}
	});

	$(document).on("click", ".edit-token", function () {
		$("#view-token").hide();
		$("#form-in-modal").show();
		row = $(this).closest("tr");
		var id = row.find(".input-token-id").val();
		//alert(id)
		$("#form-token-id").val(id);
		$("#form-action").val("update");
		$("input[name='descr']").val(row.find(".input-token-descr").val());
		$("input[name='map_read']").prop("checked", row.find(".input-token-map-read").val() == "true");
		$("input[name='map_modify']").prop("checked", row.find(".input-token-map-modify").val() == "true");
		$("input[name='actions_read']").prop("checked", row.find(".input-token-actions-read").val() == "true");
		$("input[name='actions_modify']").prop("checked", row.find(".input-token-actions-modify").val() == "true");
		$("input[name='routes_read']").prop("checked", row.find(".input-token-routes-read").val() == "true");
		$("input[name='routes_modify']").prop("checked", row.find(".input-token-routes-modify").val() == "true");

		$("#gen-token-btn").html("Update token");
		$("#form-action").val("update");
		$("#modal-token").modal("show");
	});

	$(document).on("click", ".delete-token", function () {
		row = $(this).closest("tr");
		$("#modal-delete-token").modal("show");
	});

	$("#confirm-delete-token").click(function () {

		var id = row.find(".input-token-id").val();
		$.post("/delete_access_token", { token_id : id }, function (data) {
			if (data.status != "ok") {
				alert("Error. Please try again.")
			} else {
				row.remove();
				$("#modal-delete-token").modal("hide");
			}
		})
	});

});

function tableRow(token_id) {
	if( typeof token_id != "undefined") {
		row.find(".input-token-id").val(token_id);
	}

	row.find(".input-token-descr").val($("input[name='descr']").val());
	row.find(".input-token-map-read").val($("input[name='map_read']").prop("checked"));
	row.find(".input-token-map-modify").val($("input[name='map_modify']").prop("checked"));
	row.find(".input-token-actions-read").val($("input[name='actions_read']").prop("checked"));
	row.find(".input-token-actions-modify").val($("input[name='actions_modify']").prop("checked"));
	row.find(".input-token-routes-read").val($("input[name='routes_read']").prop("checked"));
	row.find(".input-token-routes-modify").val($("input[name='routes_modify']").prop("checked"));

	row.find("td:eq(1)").html($("input[name='descr']").val());

	var scopes = row.find("td:eq(2)");
	scopes.html("");

	if ($("input[name='map_read']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">maps:read</span> ");
	}
	if ($("input[name='map_modify']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">maps:modify</span> ");
	}
	if ($("input[name='actions_read']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">actions:read</span> ");
	}
	if ($("input[name='actions_modify']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">actions:modify</span> ");
	}
	if ($("input[name='routes_read']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">routes:read</span> ");
	}
	if ($("input[name='routes_modify']").prop("checked")) {
		scopes.append("<span class=\"label label-default\">routes:modify</span> ");
	}
}
