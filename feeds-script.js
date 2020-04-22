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
            getIndividualPosts();
        }
        else {
            let groupID = document.getElementById("page-selector").options[selectedIndex].text;
            $("#group-div-"+groupID).show();
        }
    });

    function getIndividualPosts()
    {
        $.ajax('/individualfeed/get?userID=' + userID,
            {
                success: function(posts) {
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

                    // for(const item of posts[postID].post.activity)
                    // {
                    //     alert("HELLO");
                    //     if(!(index == 0 || index == 1))
                    //     {
                    //         alert("YOU IN");
                    //         let new_activity_item = $("<label></label>");
                    //         if(typeof stringValue)
                    //         {
                    //             new_activity_item.text(descriptors[index - 2] + element);
                    //         }
                    //         else
                    //         {
                    //             new_activity_item.text(descriptors[index - 2] + element.toString());
                    //         }
                    //         new_activity_item.attr("id","activity-item-" + (index - 2).toString())
                    //         $("#post-div-" + postID).append(new_activity_item);
                    //     }
                    // }
                    // "Title: " + posts[postID].post.activity.title  +
                    // "Description: " + posts[postID].post.activity.description +
                    // "Distance: " + posts[postID].post.activity.distance.toString() +
                    // "Hours: " + posts[postID].post.activity.hours.toString() +
                    // "Minutes: " + posts[postID].post.activity.minutes.toString() +
                    // "Seconds: " + posts[postID].post.activity.seconds.toString() +
                    // "Likes: " + posts[postID].post.likes.toString() );
                },
                error: function() {
                    alert("Error");
                }
            });
    }
});
