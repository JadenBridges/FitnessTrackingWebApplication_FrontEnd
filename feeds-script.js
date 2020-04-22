$(document).ready(function() {

    var url = "http://localhost:8080";

    $.ajax({
        url: url + "/groupfeed/getgroups?userID=1",
        type: "get",
        contentType: "application/json",
        success: function (got) {
            return alert("Received: " + got);
        }
    })

    // $("#group-1-posts").hide();
    // $("#group-2-posts").hide();
    //
    // // when the feed button is pressed, load the feed for that page by getting response and creating html elements from it
    // $("#feed-button").click(function(){
    //
    //     var selector = document.getElementById("page-selector");
    //
    //
    // });
});
