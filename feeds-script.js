const groups_to_owners = new Map();
let current_groupID = -1;

$(document).ready(function() {
    const url = "https://localhost:8080";
    $(".ui.warning.message").hide();
    $(".ui.positive.message").hide();

    const userID = $("#getUserID").text();

    // create elements for adding and deleting users and hide them
    createAddDeleteUserElements();
    $("#username-field").hide();
    $("#add-user-button").hide();
    $("#delete-user-button").hide();

    // link to activity modal
    $("#createActivityLink").click(function(){
        $("#createActivityModal").modal('show');
    });

    //link to summaryModal
    $("#testButton").click(function(){
        var name = "";
        $.ajax({
            type: "GET",
            url: url + "/user/getusername?userid=" + userID,
            success: function(msg) {
                $("#summaryHeader").text(msg + "\'s Achievement Summary");
                $("#totalMileHead").text(msg + "\'s Total Mileage: ");
                $("#bestPaceHead").text(msg + "\'s Fastest Pace: ");
                $.ajax({
                    type: "GET",
                    url: url + "/summary/get?userID=" + userID,
                    success: function(msg) {
                        $("#totalMile").text(msg.substring(msg.indexOf(':') + 1, msg.indexOf('Q')) + "Miles");
                        let newMsg = msg.substring(msg.indexOf(':') + 1, msg.length);
                        console.log(newMsg);
                        $("#bestPace").text(newMsg.substring(newMsg.indexOf(':') + 1, newMsg.length) + " per Mile");
                    }
                });
            }
        });
        $("#summaryModal").modal('show');
    });

    //create new activity
    $("#submitActivity").click(function(){
        let data = {userID : userID,title: $("#activityTitle").val(), description : $("#activityDescription").val(), distance: $("#activityDistance").val(),
            hours: $("#activityHours").val(),minutes: $("#activityMinutes").val(),seconds: $("#activitySeconds").val()};
        $.ajax({
            type: "POST",
            url: url + "/activity/create",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(msg) {
                if(msg == -1){
                    $("#warning").show();
                    $("#warning").delay(3000).fadeOut();
                } else{
                    $("#createActivitySuccess").show();
                    $("#createActivitySuccess").delay(3000).fadeOut();
                }
            }
        });
    });

    // get the groups and populate the selector with them
    $.ajax('/groupfeed/getgroups?userID=' + userID,
        {
            success: function(response) {
                console.log(userID);
                // for each group received
                for (const item of response) {
                    addGroupToFeeds(item.groupID, item.owner);
                }
            },
            error: function () {
                alert("Error");
            }
        });

    // select a feed to view
    $("#feed-button").click(function () {
        // hide any elements for add or delete user
        $("#username-field").hide();
        $("#add-user-button").hide();
        $("#delete-user-button").hide();
        // hide all groups
        $("group").hide();
        // if individual feed selected
        let selectedIndex = document.getElementById("page-selector").selectedIndex;
        console.log(selectedIndex);
        if (selectedIndex == "0") {
            $("#individual-posts").show();
            var ind_posts = document.getElementById("individual-posts");
            ind_posts.innerHTML = "";
            getIndividualPosts();
        } else {
            let groupID = document.getElementById("page-selector").options[selectedIndex].text;
            $("#group-div-" + groupID).show();
            var group_posts = document.getElementById("group-div-" + groupID);
            group_posts.innerHTML = "";
            getGroupPosts(groupID);

            // if user is the owner of this group, add elements to allow them to add and delete users
            if(groups_to_owners.get(parseInt(groupID)) == userID) {
                current_groupID = groupID;
                $("#username-field").show();
                $("#add-user-button").show();
                $("#delete-user-button").show();
                // // field to enter username
                // let username_field = $("<input>");
                // username_field.attr("type", "text");
                // username_field.attr("id", "username-field");
                // // button to add user
                // let add_user_button = $("<button></button>");
                // add_user_button.attr("id", "add-user-button");
                // add_user_button.text("Add User");
                // // button to delete user
                // let delete_user_button = $("<button></button>");
                // delete_user_button.attr("id", "delete-user-button");
                // delete_user_button.text("Delete User");
                // // put into body
                // $("body").append(username_field, add_user_button, delete_user_button);
            }
        }
    });

    function getIndividualPosts() {
        $.ajax('/individualfeed/get?userID=' + userID,
            {
                success: function (posts) {
                    for (const _post of posts) {
                        // create a new div that a single post can be placed into
                        let new_post_div = $("<post></post>");
                        new_post_div.attr("id", "post-div-" + _post.post.postID.toString());
                        $("#individual-posts").append(new_post_div);

                        let new_activity_label = $("<label></label>");
                        new_activity_label.text("Title: " + _post.post.activity.title);
                        new_activity_label.attr("id", "activity-label-title");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        let text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);

                        new_activity_label = $("<label></label>");
                        new_activity_label.text("Description: " + _post.post.activity.description);
                        new_activity_label.attr("id", "activity-label-description");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);

                        new_activity_label = $("<label></label>");
                        new_activity_label.text("Distance: " + _post.post.activity.distance.toString());
                        new_activity_label.attr("id", "activity-label-distance");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);

                        new_activity_label = $("<label></label>");
                        new_activity_label.text("Time Elapsed: " + _post.post.activity.hours.toString() + ":" +
                            _post.post.activity.minutes.toString() + ":" +
                            _post.post.activity.seconds.toString());
                        new_activity_label.attr("id", "activity-label-time_elapsed");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);

                        new_activity_label = $("<label></label>");
                        new_activity_label.text("Likes: " + _post.post.likes.toString());
                        new_activity_label.attr("id", "post-label-likes");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);
                        text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);
                    }
                },
                error: function () {
                    alert("Error");
                }
            });
    }

    function getGroupPosts(groupID)
    {
        $.ajax('/groupfeed/get?groupID=' + groupID,
            {
                success: function (posts) {
                    for (const _post of posts) {
                        // create a new div that a single post can be placed into
                        let new_post_div = $("<post></post>");
                        new_post_div.attr("id", "g-" + groupID + "-" + "post-div-" + _post.post.postID.toString());
                        $("#group-div-" + groupID).append(new_post_div);
                        var postUserID = _post.post.activity.userID;

                        $.ajax('/user/getusername?userID=' + postUserID,
                            {
                                success: function(response) {
                                    var uname = "";
                                    let new_activity_label = $("<h2></h2>");
                                    console.log("line 147: " + response);
                                    uname = response;
                                    console.log("line 154");
                                    new_activity_label.text(uname + " posted");
                                    new_activity_label.attr("id", "post-user");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    let text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Title: " + _post.post.activity.title);
                                    new_activity_label.attr("id", "activity-label-title");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Description: " + _post.post.activity.description);
                                    new_activity_label.attr("id", "activity-label-description");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Distance: " + _post.post.activity.distance.toString());
                                    new_activity_label.attr("id", "activity-label-distance");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Time Elapsed: " + _post.post.activity.hours.toString() + ":" +
                                        _post.post.activity.minutes.toString() + ":" +
                                        _post.post.activity.seconds.toString());
                                    new_activity_label.attr("id", "activity-label-time_elapsed");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Likes: " + _post.post.likes.toString());
                                    new_activity_label.attr("id", "post-label-likes");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);
                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);
                                },
                                error: function() {
                                    alert("Error in getting username");
                                }
                            });

                    }
                },
                error: function () {
                    alert("Error");
                }
            });
    }

    // create a new group
    $("#new-group-button").click(function(){
        $.post('/groupfeed/create?userID=' + userID,
            function(data, status) {
                console.log("New group: " + data);
                addGroupToFeeds(data, userID);
            });
    });

    function addGroupToFeeds(groupID, ownerID) {
        // create a new html element
        let new_group_option = $("<option></option>");
        new_group_option.text(groupID.toString());
        new_group_option.id = "group-option-" + groupID.toString();
        // add it to the selector
        $("#page-selector").append(new_group_option);

        // create a new div that the posts can be placed into
        let new_group_div = $("<group></group>");
        new_group_div.text("Group " + groupID.toString()); // temporary
        new_group_div.attr("id","group-div-" + groupID.toString());
        new_group_div.hide();
        $("body").append(new_group_div);

        // update the groups and owners map
        groups_to_owners.set(groupID, ownerID);
    }

    function createAddDeleteUserElements() {
        // field to enter username
        const username_field = $("<input>");
        username_field.attr("type", "text");
        username_field.attr("id", "username-field");
        // button to add user
        const add_user_button = $("<button></button>");
        add_user_button.attr("id", "add-user-button");
        add_user_button.text("Add User");
        // button to delete user
        const delete_user_button = $("<button></button>");
        delete_user_button.attr("id", "delete-user-button");
        delete_user_button.text("Delete User");
        // put into body
        $("body").append(username_field, add_user_button, delete_user_button);

    }

    // add a user to a group
    $("#add-user-button").click(function(){
        // get the username from the input text field
        let username = document.getElementById("username-field").value;
        // convert the username to a userID
        $.ajax('/user/getuserid?username=' + username,
            {
                success: function(response) {
                    console.log("userID: " + response);
                    // make the request to add the user to the group
                    $.post('/groupfeed/adduser?userID=' + response.toString() + '&groupID=' + current_groupID.toString(),
                        function(data, status) {
                            alert(username + " successfully added to Group " + current_groupID + "!");
                        });
                }
            })
    });

    // delete a user from a group
    $("#delete-user-button").click(function(){
        // get the username from the input text field
        let username = document.getElementById("username-field").value;
        // convert the username to a userID
        $.ajax('/user/getuserid?username=' + username,
            {
                success: function(response) {
                    console.log("userID: " + response);
                    // make the request to delete the user from the group
                    $.ajax({
                        url: '/groupfeed/removeuser?userID=' + response.toString() + '&groupID=' + current_groupID.toString(),
                        method: 'PUT',
                        success: function(data) {
                            alert(username + " successfully removed from Group " + current_groupID + "!");
                        }
                    })

                }
            })
    });
    
});
