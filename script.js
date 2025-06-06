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

// Zeigt alle Pokémon aus Firebase im DOM an
async function loadFromFirebase() {
  const response = await fetch(`${BASE_URL}/pokedex.json`);
  const data = await response.json();

  if (!data) {
    console.warn("Keine Daten in Firebase.");
    return;
  }

  const pokedexDiv = document.getElementById("pokedex");
  pokedexDiv.innerHTML = "";

  Object.values(data).forEach(pokemon => {
    const color = getColorCode(pokemon.color);

    const div = document.createElement("div");
    div.style.backgroundColor = color;
    div.style.borderRadius = "8px";
    div.style.padding = "10px";
    div.style.textAlign = "center";
    div.style.width = "120px";
    div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    div.style.flex = "0 0 auto";

    div.innerHTML = `
      <h3>${pokemon.name}</h3>
      <img src="${pokemon.sprite}" alt="${pokemon.name}" />
      <p>Typen: ${pokemon.types.join(", ")}</p>
    `;

    pokedexDiv.appendChild(div);
  });
}

// Lädt 151 Pokémon von der API und speichert sie in Firebase
async function fetchAndStorePokemons() {
  await fetch(`${BASE_URL}/pokedex.json`, { method: "DELETE" }); // vorab alles löschen

  for (let i = 1; i <= 151; i++) {
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
      console.error("Fehler bei Pokémon ID", i, error);
    }
  }

  alert("Pokédex erfolgreich gefüllt!");
  await loadFromFirebase(); // direkt anzeigen
}

// Beim Laden der Seite automatisch Pokémon anzeigen
window.addEventListener("DOMContentLoaded", async () => {
  await loadFromFirebase();
});
