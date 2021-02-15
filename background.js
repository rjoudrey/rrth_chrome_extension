chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
    chrome.tabs.executeScript(tab.id, {
        "file": "content.js"
    }, function () {
        console.log("RRTH script Executed.");
    });
});