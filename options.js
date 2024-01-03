
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
    document.querySelector("#badUrls").value = result.badUrls || "https://data.rbasile.fr/bad.csv";
    document.querySelector("#supportUrls").value = result.supportUrls || "https://gist.githubusercontent.com/RBasile/09d9d5011cf0cbb8161306cf2d5a9401/raw/e2bf2edb28338875767de2bd68cbc839962e3de1/.csv";
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