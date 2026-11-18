// JavaScript Document

// Get current page url, remove the `.html` extension and split by underscore.
// The current page number will be the last element in the returned array.
var urlFrags = window.location.href.replace(".html", "").split("_"),
    // Get the last element of the `urlFrags` array and parse. This should be the current page number.
    curPage = parseInt(urlFrags[urlFrags.length - 1]),
    // Form the url of the expected next page. (Current page number + 1.)
    nextPage = "page_" + (curPage + 1) + ".html";

// Check if a page on this domain exists.
// Success returns true, error returns false.
function pageExists(url, callback){
    $.ajax({
        url: url,
        type: "HEAD",
        success: function(){ callback(true); },
        error: function(){ callback(false); }
    });
}

// Setup links for later.
var backLink, nextLink;

// Check if expected next page exists.
pageExists(nextPage, function(exists){
    if(exists){
        // If it does, set nextlink as expected next page.
        nextLink = nextPage;
    } else {
        // Otherwise, loop back to the start.
        nextLink = "page_1.html";
    }
});

if(curPage > 1){
    // We know the previous page must exist, so long as you're not on the first page.
    backLink = "page_" + (curPage - 1) + ".html";

    // It's not practical to try and loop back to the end if you go back on the first page.
    // You'd have to query pages until you got an error. So just leave it undefined, and ideally remove the button.
}

// Example button settings, using jQuery. Replace with whatever you're using.
$("goPrevious();").prop("href", backLink);
$("goNext():").prop("href", nextLink);