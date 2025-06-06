const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";

let pokemons = [];
let offset = 0;
const PAGE_SIZE = 40;

async function loadFromFirebase() {
  const response = await fetch(`${BASE_URL}/pokedex.json`);
  pokemons = Object.values(await response.json());
  offset = 0;
  renderPokemons();
}

function renderPokemons() {
  const pokedexDiv = document.getElementById("pokedex");
  pokedexDiv.innerHTML = "";
  const end = Math.min(offset + PAGE_SIZE, pokemons.length);

  for (let i = 0; i < end; i++) {
    const p = pokemons[i];
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <span class="number">#${i + 1}</span>
      <img src="${p.sprite}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <div class="types">${p.types.map(t => `<span class="type ${t}">${t}</span>`).join("")}</div>
    `;
    pokedexDiv.appendChild(card);
  }

  if (end < pokemons.length) {
    const btn = document.createElement("button");
    btn.textContent = "Read More";
    btn.className = "read-more";
    btn.onclick = () => { offset += PAGE_SIZE; renderPokemons(); };
    pokedexDiv.appendChild(btn);
  }
}

window.addEventListener("DOMContentLoaded", loadFromFirebase);