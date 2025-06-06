const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";

function getColorCode(colorName) {
  const colorMap = {
    black: "#333",
    blue: "#85C1E9",
    brown: "#A04000",
    gray: "#B2BABB",
    green: "#58D68D",
    pink: "#F5B7B1",
    purple: "#BB8FCE",
    red: "#EC7063",
    white: "#FDFEFE",
    yellow: "#F9E79F"
  };
  return colorMap[colorName] || "#fff";
}

async function loadFromFirebase() {
  const response = await fetch(`${BASE_URL}/pokedex.json`);
  const data = await response.json();

  const pokedexDiv = document.getElementById("pokedex");
  pokedexDiv.innerHTML = "";

  for (const name in data) {
    const pokemon = data[name];
    const color = getColorCode(pokemon.color);

    const div = document.createElement("div");
    div.style.backgroundColor = color;
    div.style.borderRadius = "8px";
    div.style.padding = "10px";
    div.style.textAlign = "center";
    div.style.width = "120px";

    div.innerHTML = `
      <h3>${pokemon.name}</h3>
      <img src="${pokemon.sprite}" alt="${pokemon.name}" />
      <p>Typen: ${pokemon.types.join(", ")}</p>
    `;
    pokedexDiv.appendChild(div);
  }
}

async function fetchAndStorePokemons() {
  const existing = await fetch(`${BASE_URL}/pokedex.json`);
  const existingData = await existing.json();

  if (existingData) {
    alert("Pokédex ist bereits befüllt.");
    return;
  }

  for (let i = 1; i <= 40; i++) {
    try {
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const pokeData = await pokeRes.json();

      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
      const speciesData = await speciesRes.json();

      const pokemon = {
        name: pokeData.name,
        sprite: pokeData.sprites.front_default,
        types: pokeData.types.map(t => t.type.name),
        color: speciesData.color.name,
      };

      await fetch(`${BASE_URL}/pokedex/${pokemon.name}.json`, {
        method: "PUT",
        body: JSON.stringify(pokemon),
      });

      console.log(`${pokemon.name} gespeichert`);

    } catch (error) {
      console.error("Fehler:", error);
    }
  }

  alert("Pokédex erfolgreich gefüllt!");
}

window.addEventListener("DOMContentLoaded", loadFromFirebase);
