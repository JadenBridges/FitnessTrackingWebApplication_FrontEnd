$(document).ready(function() {

    const url = "https://localhost:8080";

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
            $("#signUpWarning").delay(3000).fadeOut();
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
                        $("#usernameTaken").delay(3000).fadeOut();
                        $("#signUpName").val("");
                        $("#signUpPass").val("");
                    }else{
                        $("#signUpName").val("");
                        $("#signUpPass").val("");
                        $('.ui.modal').modal('hide');
                        $("#signUpSuccess").show();
                        $("#signUpSuccess").delay(3000).fadeOut();
                    }
                }
            });
        }
    });

    $("#loginButton").click(function(){
        let data = {username: $("#loginName").val(), password : $("#loginPass").val()};

        $.ajax({
            type: "GET",
            url: url + "/user/login",
            data: data,
            dataType: "json",
            success: function(msg) {
                console.log(msg);
                if(msg == -1){
                    $("#loginWarning").show();
                    $("#loginWarning").delay(3000).fadeOut();
                } else{
                    document.location.href = url + "/feeds?userID=" + msg;
                }
            }
        });
    });
});