$( document ).ready(function() {

	// show log in form
	$("#log-in-with-mail-btn").on("click",function() {
		$("#log-in-with-mail-form").show();
		$("#log-in-with-mail-btn").hide();
	});

	//show sign up form
	$("#sign-up-with-mail-btn").on("click",function() {
		$("#sign-up-with-mail-form").show();
		$("#sign-up-with-mail-btn").hide();
	});

	$("#sign-in-form").submit(function( event ) {
		event.preventDefault();
		clearWarnings();
		$.post( "/login", $(this).serialize(), function(data) {
			if (data.msg == "incorrect" ) { // data is incorrect
				 $("#sign-in-form > .form-group").addClass("has-warning");
				 $("#warnLogInMsg").show();
			} else if (data.msg == "ok") { // successful login
				window.location.replace("/");
			} else { // unexpected error
				$("#errorLogInMsg").show();
			}
		}, "json");
	});

	// post a form using ajax
	$("#sign-up-form").submit(function( event ) {
		event.preventDefault();
		if (validate()) {
			$.post( "/signup", $(this).serialize(), function( data ) {
				if (data.msg == "ok") { // registration is successful
					window.location.replace("/");
				} else if(data.msg == "registered") { // email is already taken
					$("#warnSignUpMsg").show();
				} else { // unexpected error
					$("#errorSignUpMsg").show();
				}
			}, "json");
		}
	});

	$("#forgot-password-form").submit(function( event ) {
		event.preventDefault();
		clearWarnings();
		$.post( "/forgot_password", $(this).serialize(), function(data) {
			if (data.msg == "notexist" ) { // data is incorrect
				 $("#warnForgotPasswordMsg").show();
			} else if (data.msg == "ok") { // successful login
				$("#forgot-password-form-div").hide();
				$("#forgot-password-success-div").show();
				$("#reset-password-email").html($("#reset-email").val());
			} else { // unexpected error
				$("#errorForgotPasswordMsg").show();
			}
		}, "json");
	});

});

function validate() {

	clearWarnings();

	var ok = true;

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

	var mail=$("#email").val();
	var filter=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (mail==null || mail=="") {
		$("#email").parent().addClass("has-warning");
		$("#email").parent().find("p").text("You can't leave this empty.");
		ok = false;
	} else if (!(filter.test(mail))) {
		$("#email").parent().addClass("has-warning");
		$("#email").parent().find("p").text("Please give a correct email.");
		ok = false;
	}

	var password = $("#password").val();
	var confirmpassword = $("#confirm-password").val();
	if (password==null || password=="" || password.length < 6) {
		$("#password").parent().addClass("has-warning");
		$("#password").parent().find("p").text("Password must be at least 6 characters.");
		ok = false;
	} else if (password != confirmpassword) {
		$("#password").parent().addClass("has-warning");
		$("#password").parent().find("p").text("Passwords don't match.");
		ok = false;
	}

	return ok;
}



function clearWarnings() {
	$("#name").parent().removeClass("has-warning");
	$("#name").parent().find("p").text("");

	$("#email").parent().removeClass("has-warning");
	$("#email").parent().find("p").text("");

	$("#password").parent().removeClass("has-warning");
	$("#password").parent().find("p").text("");

	$("#sign-in-form > .form-group").removeClass("has-warning");
	$("#warnLogInMsg").hide();
}
