const groups_to_owners = new Map();
let current_groupID = -1;

$(document).ready(function() {
    const url = "https://localhost:8080";
    $(".ui.warning.message").hide();
    $(".ui.positive.message").hide();

    const userID = $("#getUserID").text();
    getIndividualPosts();
    $("#individual-posts").show();

    // create elements for adding and deleting users and hide them
    createAddDeleteUserElements();
    $("#username-field").hide();
    $("#add-user-button").hide();
    $("#delete-user-button").hide();

    // link to activity modal
    $("#createActivityLink").click(function(){
        $("#activityDescription").val("");
        $("#activityModalHeader").text("Create Activity");
        $("#submitActivity").text("Submit Activity");
        $("#createActivityModal").modal('show');
    });

    $("#logoutButton").click(function(){
        document.location.href = url + "/";
    });

    //link to summaryModal
    $("#testButton").click(function(){
        var name = "";
        $.ajax({
            type: "GET",
            url: url + "/user/getusername?userID=" + userID,
            success: function(msg) {
                $("#summaryHeader").text(msg + "\'s Achievement Summary");
                $("#totalMileHead").text(msg + "\'s Total Mileage: ");
                $("#bestPaceHead").text(msg + "\'s Fastest Pace: ");
                $.ajax({
                    type: "GET",
                    url: url + "/summary/get?userID=" + userID,
                    success: function(msg) {
                        if(msg=="No available data on user"){
                            $("#totalMile").text("---");
                            $("#bestPace").text("---");
                        } else{
                            $("#totalMile").text(msg.substring(msg.indexOf(':') + 1, msg.indexOf('Q')) + "Miles");
                            let newMsg = msg.substring(msg.indexOf(':') + 1, msg.length);
                            $("#bestPace").text(newMsg.substring(newMsg.indexOf(':') + 1, newMsg.length) + " per Mile");
                        }
                    }
                });
            }
        });
        $("#summaryModal").modal('show');
    });

    //create new activity
    $("#submitActivity").click(function(){
        console.log("on submit " + $("#getActivityID").text());
        let data = {userID : userID,title: $("#activityTitle").val(), description : $("#activityDescription").val(), distance: $("#activityDistance").val(),
            hours: $("#activityHours").val(),minutes: $("#activityMinutes").val(),seconds: $("#activitySeconds").val()};
        if($("#submitActivity").text() == "Submit Update"){
            $.ajax({
                type: "PUT",
                url: url + "/activity/update?activityID=" + $("#getActivityID").text(),
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(msg) {
                    if(msg == -1){
                        $("#warning").show();
                        $("#warning").delay(3000).fadeOut();
                    } else{
                        $("#activityTitle").val("");
                        $("#activityDescription").val("");
                        $("#activityDistance").val("");
                        $("#activityHours").val("");
                        $("#activityMinutes").val("");
                        $("#activitySeconds").val("");
                        $("#activityModalHeader").text("Create Activity");
                        $("#submitActivity").text("Submit Activity");
                        $('.ui.modal').modal('hide');
                        alert("Actvity Updated!");
                    }
                }
            });
        } else{
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
                        $("#activityTitle").val("");
                        $("#activityDescription").val("");
                        $("#activityDistance").val("");
                        $("#activityHours").val("");
                        $("#activityMinutes").val("");
                        $("#activitySeconds").val("");
                        $('.ui.modal').modal('hide');
                        alert("Actvity Created!");
                    }
                }
            });
        }
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
    $("#page-selector").change(function () {
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
            }
        }
    });

    function getIndividualPosts() {
        $.ajax('/individualfeed/get?userID=' + userID,
            {
                success: function (posts) {
                    for (const _post of posts) {
                        // create a new div that a single post can be placed into
                        let new_post_div = $("<div class='content' style='border: 1px solid black; background-color: lightgray;'></div>");
                        new_post_div.attr("id", "post-div-" + _post.post.postID.toString());
                        $("#individual-posts").append(new_post_div);

                        let new_activity_label = $("<div class='extra text' style='font-weight: bold;'></div>");
                        new_activity_label.text(_post.post.activity.title);
                        new_activity_label.attr("id", "activity-label-title");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        new_activity_label = $("<div class='extra text'></div>");
                        new_activity_label.text(_post.post.activity.description);
                        new_activity_label.attr("id", "activity-label-description");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        new_activity_label = $("<div class='extra text'></div>");
                        new_activity_label.text("Distance: " + _post.post.activity.distance.toString());
                        new_activity_label.attr("id", "activity-label-distance");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        new_activity_label = $("<div class='extra text'></div>");
                        new_activity_label.text("Time Elapsed: " + (_post.post.activity.hours.toString() == "0" ? "" : _post.post.activity.hours.toString() + ":") +
                            ("0" + _post.post.activity.minutes).slice(-2) + ":" +
                            ("0" + _post.post.activity.seconds).slice(-2));
                        new_activity_label.attr("id", "activity-label-time_elapsed");
                        $("#post-div-" + _post.post.postID.toString()).append(new_activity_label);

                        var like_span = $("<span style='white-space: nowrap;'></span>");

                        var like_button = $("<div class='meta' style='display: inline-block;'><a class='like'><i class='like icon red'></i></a></div>");
                        like_button.attr("id","like-button-" + _post.post.postID.toString());

                        new_activity_label = $("<label style='display: inline-block;'></label>");
                        new_activity_label.text(_post.post.likes.toString());
                        new_activity_label.attr("id", "post-label-likes-i" + _post.post.postID.toString());

                        like_button.click(function() {
                            $.ajax({
                                url: '/individualfeed/like-post?postID=' + _post.post.postID,
                                method: 'PUT',
                                success: function(val) {
                                    //alert("You liked your post!");
                                    document.getElementById("post-label-likes-i"
                                        + _post.post.postID.toString()).innerHTML = val.toString();
                                },
                                error: function() {
                                    alert("Error in liking post");
                                }
                            })
                        });

                        like_span.append(like_button);
                        like_span.append(new_activity_label);
                        $("#post-div-" + _post.post.postID.toString()).append(like_span);

                        let text_break = $("<br>");
                        $("#post-div-" + _post.post.postID.toString()).append(text_break);

                        var delete_button = $("<button></button>");
                        delete_button.text("Delete Post");
                        delete_button.attr("id", "delete-button-" + _post.post.postID.toString());

                        delete_button.click(function() {
                            $.ajax({
                                url: '/individualfeed/delete-post?postID=' + _post.post.postID + "&userID=" + userID,
                                method: 'DELETE',
                                success: function(val) {
                                    if (val == 1) {
                                        alert("You deleted your post!");
                                        document.getElementById("post-div-" + _post.post.postID.toString()).hidden = true;
                                    }
                                    else
                                        alert("You did not delete your post!");
                                },
                                error: function() {
                                    alert("Error in liking post");
                                }
                            })
                        });
                        $("#post-div-" + _post.post.postID.toString()).append(delete_button);

                        //Update Activity Button
                        var update_button = $("<button></button>");
                        update_button.text("Update Activity");
                        update_button.attr("id", "update-button-" + _post.post.postID.toString());

                        update_button.click(function () {
                            $("#activityTitle").val(_post.post.activity.title);
                            $("#activityDescription").val(_post.post.activity.description);
                            $("#activityDistance").val(_post.post.activity.distance);
                            $("#activityHours").val(_post.post.activity.hours);
                            $("#activityMinutes").val(_post.post.activity.minutes);
                            $("#activitySeconds").val(_post.post.activity.seconds);

                            $("#getActivityID").text(_post.post.activity.activityID);

                            $("#activityModalHeader").text("Update Activity");
                            $("#submitActivity").text("Submit Update");

                            $("#createActivityModal").modal('show');
                        });
                        $("#post-div-" + _post.post.postID.toString()).append(update_button);
                        //End Activity Update

                        text_break = $("<br><br>");
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
                                    uname = response;
                                    new_activity_label.text(uname + " posted");
                                    new_activity_label.attr("id", "post-user");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

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
                                    new_activity_label.text("Time Elapsed: " + (_post.post.activity.hours.toString() == "0" ? "" : _post.post.activity.hours.toString() + ":") +
                                        ("0" + _post.post.activity.minutes).slice(-2) + ":" +
                                        ("0" + _post.post.activity.seconds).slice(-2));
                                    new_activity_label.attr("id", "activity-label-time_elapsed");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    new_activity_label = $("<label></label>");
                                    new_activity_label.text("Likes: " + _post.post.likes.toString());
                                    new_activity_label.attr("id", "post-label-likes-g" + _post.post.postID.toString());
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(new_activity_label);

                                    text_break = $("<br>");
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(text_break);

                                    var like_button = $("<button></button>");
                                    like_button.text("Like");
                                    like_button.attr("id", "like-button-" + _post.post.postID.toString());

                                    like_button.click(function() {
                                       $.ajax({
                                           url: '/groupfeed/like-post?postID=' + _post.post.postID,
                                           method: 'PUT',
                                           success: function(val) {
                                               alert("You liked " + uname + "'s post!");
                                               document.getElementById("post-label-likes-g"
                                                   + _post.post.postID.toString()).innerHTML = "Likes: " + val;
                                           },
                                           error: function() {
                                               alert("Error in liking post");
                                           }
                                       })
                                    });
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(like_button);

                                    var delete_button = $("<button></button>");
                                    delete_button.text("Delete Post");
                                    delete_button.attr("id", "delete-button-" + _post.post.postID.toString());

                                    delete_button.click(function() {
                                        $.ajax({
                                            url: '/groupfeed/delete-post?postID=' + _post.post.postID + "&userID=" + userID,
                                            method: 'DELETE',
                                            success: function(val) {
                                                if (val == 1) {
                                                    alert("You deleted your post!");
                                                    document.getElementById("g-" + groupID + "-" + "post-div-"
                                                        + _post.post.postID.toString()).hidden = true;
                                                }
                                                else
                                                    alert("You did not delete your post!");
                                            },
                                            error: function() {
                                                alert("Error in liking post");
                                            }
                                        })
                                    });
                                    $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(delete_button);

                                    if(_post.post.activity.userID == userID) {
                                        //Update Activity Button
                                        var update_button = $("<button></button>");
                                        update_button.text("Update Activity");
                                        update_button.attr("id", "update-button-" + _post.post.postID.toString());

                                        update_button.click(function () {
                                            $("#activityTitle").val(_post.post.activity.title);
                                            $("#activityDescription").val(_post.post.activity.description);
                                            $("#activityDistance").val(_post.post.activity.distance);
                                            $("#activityHours").val(_post.post.activity.hours);
                                            $("#activityMinutes").val(_post.post.activity.minutes);
                                            $("#activitySeconds").val(_post.post.activity.seconds);

                                            $("#getActivityID").text(_post.post.activity.activityID);

                                            $("#activityModalHeader").text("Update Activity");
                                            $("#submitActivity").text("Submit Update");

                                            $("#createActivityModal").modal('show');
                                        });
                                        $("#g-" + groupID + "-" + "post-div-" + _post.post.postID.toString()).append(update_button);
                                        //End Activity Update
                                    }

                                    text_break = $("<br><br>");
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
                addGroupToFeeds(data, userID);
                alert("New group created: Group " + data.toString());
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
