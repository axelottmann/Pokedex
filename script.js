const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";

let pokemons = [];
let offset = 0;
const PAGE_SIZE = 40;

function showSpinner() {
  document.getElementById('spinner').style.display = 'flex';
}
function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

async function loadAndShowPkm() {
  showSpinner();
  const response = await fetch(`${BASE_URL}/pokedex.json`);
  pokemons = Object.values(await response.json());
  offset = 0;
  await new Promise(resolve => setTimeout(resolve, 1000));
  hideSpinner();
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
    card.onclick = () => {
      showOverlay(p, i + 1);
    };
    pokedexDiv.appendChild(card);
  }

  if (end < pokemons.length) {
    const btn = document.createElement("button");
    btn.textContent = "Skip More";
    btn.className = "read-more";
    btn.onclick = () => { offset += PAGE_SIZE; renderPokemons(); };
    pokedexDiv.appendChild(btn);
  }
}

function showOverlay(pokemon, number) {
  const overlay = document.getElementById('pokemon-overlay');
  const content = document.getElementById('overlay-content');
  content.innerHTML = `
    <button class="close-btn" onclick="closeOverlay()">&times;</button>
    <span class="number">#${number}</span>
    <img src="${pokemon.sprite}" alt="${pokemon.name}" />
    <h2>${pokemon.name}</h2>
    <div class="types">${pokemon.types.map(t => `<span class="type ${t}">${t}</span>`).join("")}</div>
  `;
  overlay.style.display = 'flex';
}

function closeOverlay() {
  document.getElementById('pokemon-overlay').style.display = 'none';
}

document.getElementById('pokemon-overlay').onclick = function(e) {
  if (e.target === this) closeOverlay();
};

function showOverlay(pokemon, number) {
  const overlay = document.getElementById('pokemon-overlay');
  const content = document.getElementById('overlay-content');
  content.innerHTML = `
    <button class="close-btn" onclick="closeOverlay()">&times;</button>
    <span class="number">#${number}</span>
    <img src="${pokemon.sprite}" alt="${pokemon.name}" />
    <h2>${pokemon.name}</h2>
    <div class="types">${pokemon.types.map(t => `<span class="type ${t}">${t}</span>`).join("")}</div>
    ${pokemon.height ? `<div>Größe: ${pokemon.height}</div>` : ""}
    ${pokemon.weight ? `<div>Gewicht: ${pokemon.weight}</div>` : ""}
    ${pokemon.description ? `<div>${pokemon.description}</div>` : ""}
  `;
  overlay.style.display = 'flex';
}

window.addEventListener("DOMContentLoaded", loadAndShowPkm);