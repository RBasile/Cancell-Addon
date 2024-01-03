function updateBadge(activeInfo) {
  if (activeInfo.tabId) {id = activeInfo.tabId}
  else {id = activeInfo}

  let value = getStoredBadgeValue(id); // Retrieve the stored value
  let result = value[0] + value[1];

  if (result == 0 || isNaN(result)) { result = '';}
  //browser.browserAction.setBadgeTextColor({ color: "blue",tabId: activeInfo.tabId });
  if (result >= 5){
    browser.browserAction.setBadgeBackgroundColor({ color: "#FF391F",tabId: id });
  }
  else if (result >= 2){
    browser.browserAction.setBadgeBackgroundColor({ color: "#FFE063",tabId: id });
  }
  else{
    browser.browserAction.setBadgeBackgroundColor({ color: "#C4C4C4",tabId: id });
  }
  browser.browserAction.setBadgeText({
    text: result.toString(),
    tabId: id
  });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    badUrls = result.badUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/bad.csv";
    supportUrls = result.supportUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/support.csv";
    badsCustom = result.badsCustom || "";
    supportsCustom = result.supportsCustom || "";
    loadList(badUrls,supportUrls,badsCustom,supportsCustom);
  }
  function onError(error) {
    console.log(`Error: ${error}`);
  }
  let getting = browser.storage.sync.get();
  getting.then(loadResult, onError);
}

badgeValues = [];
load();

browser.tabs.onUpdated.addListener(updateBadge);
browser.tabs.onActivated.addListener(updateBadge);
browser.tabs.onRemoved.addListener((tabId) => {
  delete badgeValues[tabId];
});