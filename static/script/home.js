$(document).ready(function() {
    $.ajax({
        url: "/me",
        dataType: "json",
        success: function(data, status, xhr) {
            console.log(data);
            if (data)
                $("#identification").text(JSON.stringify(data));
            else
                $("#identification").html("<a href=\"/auth\">Log In</a>");
        },
        error: function(xhr, status, err) {
            if (err instanceof SyntaxError)
                $("#identification").text("bad response");
            else {
                console.log(err);
                $("#identification").text("error");
            }
        }
    });
});
