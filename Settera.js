var numberOfCountries = 195



const primaryButton = document.getElementsByClassName("button_sizeLarge__2AJaj")[0];
const secondaryButton = document.getElementsByClassName("button_button__HOmVR")[0];

if (primaryButton) {
    primaryButton.addEventListener("click", solveAllCountries);
}

if (secondaryButton) {
    secondaryButton.addEventListener("click", solveAllCountries);
}
function solveAllCountries(){
    for (var i = 0; i < numberOfCountries*100; i += 100){
        setTimeout(() => {
            solveCountry();
        }, 100+i);
    }
}

// Some names are not consitant with their IDs
let exclusionsName = {
    "SURINAME" : "SURINAM",
    "TÜRKIYE" : "TURKEY",
    "GEORGIA" : "GEORGIEN",
    "CZECHREPUBLIC(CZECHIA)" : "CZECHREPUBLIC",
    "SÃOTOMÉANDPRÍNCIPE" : "SAOTOMEANDPRINCIPE",
    "LUXEMBOURG" : "LUXEMBURG",
    "BELARUS" : "BELORUSSIA",
    "ESWATINI" : "SWAZILAND",
    "REPUBLICOFTHECONGO" : "THECONGO",
    "NORTHMACEDONIA" : "MACEDONIA",
    "VATICANCITY" : "VATICAN",
    "THEFEDERATEDSTATESOFMICRONESIA" : "MICRONESIA",
    "CAPEVERDE" : "CABOVERDE",
     "SAINTVINCENTANDTHEGRENADINES" : "SAINTVINCENT"
}
//Ditto except with area vs city
let exclusionsType = {
    "BAHRAIN" : "#CITY_"
}

function normalizeCountry(rawName) {
  let normalized = rawName.toUpperCase().replace(/[\s-]+/g, "");

  // Apply name exceptions first
  let baseName = exclusionsName[normalized] ?? normalized;

  // Determine base type
  let baseType = exclusionsType[baseName] ?? "#AREA_";

  // Possible combinations to try
  const attempts = [
    { type: baseType, name: baseName },
    { type: baseType, name: "THE" + baseName },
    { type: "#CITY_", name: baseName },
    { type: "#CITY_", name: "THE" + baseName }
  ];

  // Return first selector that exists
  for (const attempt of attempts) {
    if (document.querySelector(attempt.type + attempt.name)) {
      return attempt.type + attempt.name;
    }
  }

  // Fallback to first attempt just in case
  return attempts[0].type + attempts[0].name;
}

function solveCountry(){
    const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
    });


    var countryName = normalizeCountry(document.querySelector(".game-header_pinQuestionTextBackground__sBJKI").children[0].innerText) // grabs the counter name, and removes all white space.     

    document.querySelector(countryName).children[0].dispatchEvent(clickEvent); //dispatches the click and applies exclusions
}
