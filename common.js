function getBrowser() {
    if (typeof chrome !== "undefined") {
      if (typeof browser !== "undefined") {
        return "Firefox";
      } else {
        return "Chrome";
      }
    } else {
      return "Edge";
    }
  }

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateRegexPatterns(actor,strong) {
  const firstName = removeAccents(actor.firstName);
  const lastName = removeAccents(actor.lastName);
  const shortFirstName = firstName.charAt(0);
  if (strong) {
    return [
    new RegExp(`\\b${firstName} ${lastName}\\b`, 'gi').toString(),
    new RegExp(`\\b${lastName} ${firstName}\\b`, 'gi').toString(),
    new RegExp(`\\b${lastName}\\b`, 'gi').toString(),
    new RegExp(`\\b${shortFirstName}\\.? ${lastName}\\b`, 'gi').toString(),
  ];
  }
  else{
    return [
    new RegExp(`\\b${firstName} ${lastName}\\b`, 'gi').toString(),
    new RegExp(`\\b${lastName} ${firstName}\\b`, 'gi').toString(),
    new RegExp(`\\b${shortFirstName}\\.? ${lastName}\\b`, 'gi').toString(),
  ];
  }
}

function generateSavePatterns(actors,actorsSupport) {
  let regexPatterns = []
  actors.forEach(actor => {
    regexPatterns = regexPatterns.concat(generateRegexPatterns(actor,false));
  });
  //console.log(regexPatterns);
  chrome.storage.local.set({regexPatterns});
  
  let regexPatternsSupport = []
  actorsSupport.forEach(actor => {
    regexPatternsSupport = regexPatternsSupport.concat(generateRegexPatterns(actor,false));
  });

  //console.log(regexPatternsSupport);
  chrome.storage.local.set({regexPatternsSupport});
}

async function loadAndParseCSV(urls) {
  let allActors = [];

  urls = urls.split('\n');

  for (const url of urls) {
    try {
      // Fetch the CSV file
      const response = await fetch(url);
      const csvText = await response.text();

      // Parse the CSV text and add to allActors array
      const actors = csvText.trim().split('\n').map(line => {
        const [firstName, lastName] = line.split(',').map(item => item.trim());
        return { firstName, lastName };
      });
      allActors = allActors.concat(actors);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  }
  return allActors;
}

async function parseCustomText(text) {
  let allActors = [];
  if (text == "") {return allActors;}
      // Parse the text and add to allActors array
      const actors = text.trim().split('\n').map(line => {
        const [firstName, lastName] = line.split(',').map(item => item.trim());
        return { firstName, lastName };
      });
      allActors = allActors.concat(actors);
  return allActors;
}

function loadList(badUrls,supportUrls,badsCustom,supportsCustom) {
  // Create promises for parsing operations
  let actorsPromise = loadAndParseCSV(badUrls);
  let supportsPromise = loadAndParseCSV(supportUrls);
  let actorsCustomPromise = parseCustomText(badsCustom);
  let supportsCustomPromise = parseCustomText(supportsCustom);

  // Use Promise.all to wait for both promises to resolve
  Promise.all([actorsPromise, supportsPromise,actorsCustomPromise,supportsCustomPromise]).then(values => {
    let allActors = values[0].concat(values[2]);
    let allSupports = values[1].concat(values[3]);

    //console.log(allActors,allSupports);

    generateSavePatterns(allActors, allSupports);
  });
}