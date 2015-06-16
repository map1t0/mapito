
$( document ).ready(function() {

	$("#change-password-form").submit(function( event ) {
		event.preventDefault();
		if (validatePassword()) {
			$.post( "/user/password", $(this).serialize(), function( data ) {
				if (data.status == "ok") {
					window.location.replace("/user/account");
				} else if (data.status == "incorrect") {
					$("#warnPasswordMsg").show();
					$("#current-password").parent().addClass("has-warning");
				} else {
					$("#errorMsg").show();
				}

			}, "json");
		}
	});

	$("#update-account-form").submit(function( event ) {
		event.preventDefault();
		if (validateAccount()) {
			$.post( "/user/account", $(this).serialize(), function( data ) {
				if (data.status == "ok") {
					window.location.replace("/user/account");
				} else {
					$("#errorMsg").show();
				}

			}, "json");
		}
	});

	$("#delete-account-form").submit(function( event ) {
		event.preventDefault();

		$('#modal-delete-account').modal('show');
	});

	$("#confirm-delete-account").click(function(event) {
		$('#modal-delete-account').modal('hide');

		$.post( "/user/delete", $("#delete-account-form").serialize(), function( data ) {
			if (data.status == "ok") {
				window.location.replace("/");
			} else if (data.status == "incorrect") {
				$("#password").parent().find("p").text("Your password is incorrect.")
				$("#password").parent().addClass("has-warning");
			} else {
				$("#errorMsg").show();
			}
		}, "json");
	});

});

function validatePassword() {

	clearWarnings();

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

function validateAccount() {

	clearWarnings();

	var ok = true;

	// check name
	var name=$("#name").val().trim();
	var regex_name=/^[A-Za-z][A-Za-z\s]+$/;

	if (name==null || name=="") {
		$("#name").parent().addClass("has-warning");
		$("#name").parent().find("p").text("You can't leave this empty.")
		ok = false;
	} else if(name.length < 2 || !(regex_name.test(name))) {
		$("#name").parent().addClass("has-warning");
		$("#name").parent().find("p").text("Please give a corrent name. Use only letters(a-z).");
		ok = false;
	}

	var mail=$("#mail").val();
	var filter=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (mail==null || mail=="") {
		$("#mail").parent().addClass("has-warning");
		$("#mail").parent().find("p").text("You can't leave this empty.");
		ok = false;
	} else if (!(filter.test(mail))) {
		$("#mail").parent().addClass("has-warning");
		$("#mail").parent().find("p").text("Please give a correct email.");
		ok = false;
	}

	return ok;
}




function clearWarnings() {
	$("#name").parent().removeClass("has-warning");
	$("#name").parent().find("p").text("");

	$("#email").parent().removeClass("has-warning");
	$("#email").parent().find("p").text("");

	$("#new-password").parent().removeClass("has-warning");
	$("#new-password").parent().find("p").text("");

	$("#warnPasswordMsg").hide();
	$("#current-password").parent().removeClass("has-warning");

	$("#errorAccountMsg").hide();

	$("#password").parent().removeClass("has-warning");
	$("#password").parent().parent().find("p").text("");

	$("#errorDeleteMsg").hide();
}
