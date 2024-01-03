function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}
//reply from background script for bad and support values for the current tab
function updatePopupContent(response) {
    let text = ""
    if (response.values[0] > 0){
        text += response.values[0]+" Nom(s) de 🤮😡😠🤬";
    }
    if (response.values[0] > 0 && response.values[1] > 0){
        text += " et "
    }
    if (response.values[1] > 0){
        text += response.values[1]+" Nom(s) de Supporteur";
    }
    if (response.values[0] > 0 && response.values[1] > 0){
        text += " ont était censuré"
    }

    if (text =="") {text = "c'est clean ici"}
    let node = document.createTextNode(text)
    document.getElementById("header-title").appendChild(node);
}

getActiveTab().then(sentValuesRequest);

function sentValuesRequest(tabs){
    let tabId = tabs[0].id;
    browser.runtime.sendMessage({ request: "getValues", "tabId":tabId})
    .then(updatePopupContent)
    .catch(error => {
        console.error("Error receiving message:", error);
    });
    //console.log(tabId)
}