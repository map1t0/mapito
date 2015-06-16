
$( document ).ready(function() {

	$("#reset-password-form").submit(function( event ) {
		event.preventDefault();
		if (validatePassword()) {
			$.post( "/resetPassword", $(this).serialize(), function( data ) {
				if (data.status == "ok") {
					window.location.replace("/");
				} else {
					$("#errorMsg").show();
				}
			}, "json");
		}
	});

});

function validatePassword() {
	var ok = true;

	var password = $("#new-password").val();
	var confirmpassword = $("#confirm-password").val();
	if (password==null || password=="" || password.length < 6) {
		$("#new-password").parent().addClass("has-warning");
		$("#new-password").parent().find("p").text("Password must be at least 6 characters.");
		ok = false;
	} else if (password != confirmpassword) {
		$("#new-password").parent().addClass("has-warning");
		$("#new-password").parent().find("p").text("Passwords don't match.");
		ok = false;
	}

	return ok;
}
