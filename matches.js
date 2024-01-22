const symbols = ['🤬', '❌', '🙅', '👎','✋','😡','😠','🤢','🤮','😤','👿','🔥','💨'];
const symbolsLow = ['!', '@', '#', '$', '%', '^', '&', '*'];

function deterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.codePointAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
    if (str.charCodeAt(i) >= 0xD800 && str.charCodeAt(i) <= 0xDBFF) {
      i++; // If a high surrogate is found, skip the next code unit
    }
  }
  return hash;
}

function getRandomCensorString(inputString) {
  let result = '';
  const hash = deterministicHash(inputString);
  const symbolsLen = symbols.length

  for (let i = 0; i < inputString.length; i++) {
    // Check if the character is a space or the first letter of a word
    if (inputString[i] === ' ') {
      result += inputString[i];
    } else {
      const index = Math.abs((hash + i) % symbolsLen);
      result += symbols[index];
    }
  }
  return result;
}

function getRandomCensorStringLow(inputString) {
  let result = '';
  const hash = deterministicHash(inputString);
  const symbolsLen = symbolsLow.length

  for (let i = 0; i < inputString.length; i++) {
    // Check if the character is a space or the first letter of a word
    if (inputString[i] === ' ' || i === 0 || inputString[i - 1] === ' ') {
      result += inputString[i];
    } else {
      const index = Math.abs((hash + i) % symbolsLen);
      result += symbolsLow[index];
    }
  }

  return result;
}

function checkAndCensorText(node) {
  let text = removeAccents(node.textContent);
  let censored = false;
  //console.log(text)
  regexPatterns.forEach(regex => {
    if (regex.test(text)) {
      text = text.replace(regex, match => getRandomCensorString(match));
      censored = true;
      veryBadCounter += 1
    }
  });

  regexPatternsSupport.forEach(regex => {
    if (regex.test(text)) {
      text = text.replace(regex, match => getRandomCensorStringLow(match));
      censored = true;
      badCounter += 1
    }
  });

  if (censored) {
    const newTextNode = document.createTextNode(text);
    node.parentNode.replaceChild(newTextNode, node);
  }
}

function blurImage(img, level) {
  if (level === 'high') {
    img.style.filter = 'blur(20px)'; // Higher blur for veryBadCounter
  } else if (level === 'low') {
    img.style.filter = 'blur(8px)'; // Lower blur for badCounter
  }
}

function checkAndBlurImage(imgNode) {
  let altText = removeAccents(imgNode.alt);
  let blurLevel = null;

  // Check against the more severe patterns
  regexPatterns.forEach(regex => {
    if (regex.test(altText)) {
      veryBadCounter += 1;
      blurLevel = 'high';
    }
  });

  // Check against the less severe patterns
  regexPatternsSupport.forEach(regex => {
    if (regex.test(altText)) {
      badCounter += 1;
      if (!blurLevel) {
        blurLevel = 'low';
      }
    }
  });

  if (blurLevel) {
    blurImage(imgNode, blurLevel);
  }
}

function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE && censorText) {
    checkAndCensorText(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName === 'IMG' && node.hasAttribute('alt') && censorImg) {
      checkAndBlurImage(node);
    }
    Array.from(node.childNodes).forEach(child => processNode(child));
  }
}

function observeMutations() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => processNode(node));
    });
    sentCounter();
    observer.takeRecords()
  });

  observer.observe(document.body, { childList: true, subtree: true ,characterData: true});
}

function scanPage(restoredSettings) {
  censorText = restoredSettings[0].checkboxText;
  censorImg = restoredSettings[0].checkboxImage;
  if (censorText || censorImg){
    regexPatterns = restoredSettings[1].regexPatterns.map(patternString => {
                  let match = patternString.match(/\/(.+)\/(.*)/);
                  return new RegExp(match[1], match[2]);
    });
    regexPatternsSupport = restoredSettings[1].regexPatternsSupport.map(patternString => {
                  let match = patternString.match(/\/(.+)\/(.*)/);
                  return new RegExp(match[1], match[2]);
    });
    //console.log(regexPatterns,regexPatternsSupport);
    document.querySelectorAll('body').forEach(element => processNode(element));
    sentCounter();//setInterval(func, delay)
    observeMutations();
  }
  else{
    sentCounter();
  }
}
function sentCounter() {
  chrome.runtime.sendMessage({"veryBadCounter": veryBadCounter ,"badCounter":badCounter});
  //console.log(veryBadCounter,badCounter)
}

function onError(e) {
  console.error(e);
}

var regexPatterns = [];
var regexPatternsSupport = [];
var badCounter = 0;
var veryBadCounter = 0;

var censorText = true;
var censorImg = true;

let localStorage = chrome.storage.local.get()
let localSync = chrome.storage.sync.get(["checkboxText","checkboxImage"])

Promise.all([localSync,localStorage]).then(scanPage, onError);