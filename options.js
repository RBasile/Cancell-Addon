function saveOptionText(textfield)
{  let value = document.querySelector("#"+textfield).value
  if (value == false) {
    value = ""
  }
  browser.storage.sync.set({
    [textfield]: value
  });
  return value;
}

function saveOptions(e) {
  e.preventDefault();

  badUrls = saveOptionText("badUrls");
  supportUrls = saveOptionText("supportUrls");
  badsCustom = saveOptionText("badsCustom");
  supportsCustom = saveOptionText("supportsCustom");

  loadList(badUrls,supportUrls,badsCustom,supportsCustom);
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#badUrls").value = result.badUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/bad.csv";
    document.querySelector("#supportUrls").value = result.supportUrls || "https://raw.githubusercontent.com/RBasile/Cancell-Addon/main/lists/support.csv";
    document.querySelector("#badsCustom").value = result.badsCustom || "";
    document.querySelector("#supportsCustom").value = result.supportsCustom || "";
  }
  function onError(error) {
    console.log(`Error: ${error}`);
  }
  let getting = browser.storage.sync.get();
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);