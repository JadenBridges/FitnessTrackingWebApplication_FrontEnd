$(document).ready(function() {

    var url = "https://localhost:8080";

    $(".ui.warning.message").hide();
    $(".ui.positive.message").hide();

    $(".close.icon").click(function(){
        $(".ui.warning.message").hide();
    });

    $("#signUpLink").click(function(){
        $('.ui.modal').modal('show');
    });

    $("#signUpButton").click(function(){
        if($("#signUpName").val() == "" || $("#signUpPass").val() == ""){
            $("#signUpWarning").show();
        } else {
            let data = {username: $("#signUpName").val(), password : $("#signUpPass").val()};
            $.ajax({
                type: "POST",
                url: url + "/user/create",
                data: data,
                dataType: "json",
                success: function(msg) {
                    if(msg == -1){
                        $("#usernameTaken").show();
                        $("#signUpName").val("");
                        $("#signUpPass").val("");
                    }else{
                        $("#signUpName").val("");
                        $("#signUpPass").val("");
                        $('.ui.modal').modal('hide');
                        $("#signUpSuccess").show();
                    }
                }
            });
        }
    });

    $("#loginButton").click(function(){
        console.log("Here");
        $("#loginWarning").show();
    });
});