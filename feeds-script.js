var userID = '1';

$(document).ready(function() {

    // get the groups and populate the selector with them
    $.ajax('/groupfeed/getgroups?userID=' + userID,
        {
            success: function(response) {
                // for each group received
                for(const item of response) {
                    // create a new html element
                    let new_group_option = $("<option></option>");
                    new_group_option.text(item.groupID.toString());
                    new_group_option.id = "group-option-" + item.groupID.toString();
                    // add it to the selector
                    $("#page-selector").append(new_group_option);

                    // create a new div that the posts can be placed into
                    let new_group_div = $("<group></group>");
                    new_group_div.text("Group " + item.groupID.toString()); // temporary
                    new_group_div.attr("id","group-div-" + item.groupID.toString());
                    new_group_div.hide();
                    $("body").append(new_group_div);
                }

            },
            error: function() {
                alert("Error");
            }
        });

    $("#feed-button").click(function(){
        $("group").hide();
        // if individual feed selected
        let selectedIndex = document.getElementById("page-selector").selectedIndex;
        console.log(selectedIndex);
        if(selectedIndex == "0") {
            $("#individual-posts").show();
        }
        else {
            let groupID = document.getElementById("page-selector").options[selectedIndex].text;
            $("#group-div-"+groupID).show();
        }
    });
});
