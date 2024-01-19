function getActiveTab() {
  return chrome.tabs.query({currentWindow: true, active: true});
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
var tabId = ""
getActiveTab().then(sentValuesRequest);

function sentValuesRequest(tabs){
    tabId = tabs[0].id;
    chrome.runtime.sendMessage({ request: "getValues", "tabId":tabId})
    .then(updatePopupContent)
    .catch(error => {
        console.error("Error receiving message:", error);
    });
    //console.log(tabId)
}

function onError(e) {
  console.error(e);
}
function checkboxLoad(results){
    console.log(results);
checkboxText.checked = results.checkboxText;
checkboxImage.checked = results.checkboxImage;
}

var checkboxText = document.querySelector("#checkboxText");
var checkboxImage = document.querySelector("#checkboxImage");


chrome.storage.sync.get(["checkboxText","checkboxImage"]).then(checkboxLoad,onError)


checkboxText.addEventListener('change', checkbox);
checkboxImage.addEventListener('change', checkbox);

function checkbox() {
  let textfield = this.id
  if (this.checked) {
    var value = true;
  } else {
    var value = false;
  }
  chrome.storage.sync.set({
    [textfield]: value
  });
  reload = document.querySelector("#reload");
  reload.style.display = "block"
  reload.onclick = function() {reloadPage(tabId)};
}

function reloadPage(tab) {
  console.log("reloadé")
  chrome.tabs.reload();
  window.close()
}