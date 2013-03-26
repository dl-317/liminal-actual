$(document).ready(function() {
    $.ajax({
        url: "/me",
        dataType: "json",
        success: function(data, status, xhr) {
            if (data)
                $("#identification").text(data.handle);
            else
                $("#identification").html("<a href=\"/auth\">Log In</a>");
        },
        error: function(xhr, status, err) {
            if (err instanceof SyntaxError)
                $("#identification").text("bad response");
            else {
                $("#identification").text("error");
            }
        }
    });
});
