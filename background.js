if (typeof importScripts !== "undefined"){
  importScripts('common.js')
}

function updateBadge(activeInfo) {
  if (activeInfo.tabId) {var id = activeInfo.tabId}
  else {var id = activeInfo}

  let value = getStoredBadgeValue(id); // Retrieve the stored value
  let result = value[0] + value[1];

  if (result == 0 || isNaN(result)) { result = '';}
  //chrome.action.setBadgeTextColor({ color: "blue",tabId: activeInfo.tabId });
  if (result >= 5){
    chrome.action.setBadgeBackgroundColor({ color: "#FF391F",tabId: id });
  }
  else if (result >= 2){
    chrome.action.setBadgeBackgroundColor({ color: "#FFE063",tabId: id });
  }
  else{
    chrome.action.setBadgeBackgroundColor({ color: "#C4C4C4",tabId: id });
  }
  chrome.action.setBadgeText({
    text: result.toString(),
    tabId: id
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.veryBadCounter !== undefined && message.badCounter !== undefined) {
    storeBadgeValue(sender.tab.id, message.veryBadCounter,message.badCounter);
    if (sender.tab.active) {
      updateBadge(sender.tab.id);
    }
    return
  }
  if (message.request === "getValues") {
    const value = getStoredBadgeValue(message.tabId);
    sendResponse({ "values": value });
  }
});

function storeBadgeValue(tabId, veryBadValue,badValue) {
  badgeValues[tabId] = [veryBadValue,badValue];
}

function getStoredBadgeValue(tabId) {
  return badgeValues[tabId] || '';
}

function load() {
  function loadResult(result) {
    let badUrls = result.badUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/bad.csv";
    let supportUrls = result.supportUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/support.csv";
    let badsCustom = result.badsCustom || "";
    let supportsCustom = result.supportsCustom || "";
    loadList(badUrls,supportUrls,badsCustom,supportsCustom);
  }
  function onError(error) {
    console.log(`Error: ${error}`);
  }
  let getting = chrome.storage.sync.get();
  getting.then(loadResult, onError);
}

var badgeValues = [];
load();


chrome.tabs.onUpdated.addListener(updateBadge);
chrome.tabs.onActivated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener((tabId) => {
  delete badgeValues[tabId];
});