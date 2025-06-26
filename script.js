// Pokedex App Script

const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/pokedex.json";
const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon/";

let allPokemon = [];
let currentList = [];
let listStart = 0;
const LIST_STEP = 20;
let currentIndex = 0;

window.addEventListener("DOMContentLoaded", async () => {
  toggleSpinner(true);
  await fetchAllPokemon();
  render(currentList = allPokemon.slice(0, LIST_STEP), true);
  toggleSpinner(false);

  document.getElementById("load-more").addEventListener("click", loadMore);
  document.querySelector("form").addEventListener("submit", searchPokemon);
  document.getElementById("mySearch").addEventListener("input", searchLive);

  document.getElementById("overlay-close").addEventListener("click", closeOverlay);
  document.getElementById("next-btn").addEventListener("click", showNext);
  document.getElementById("prev-btn").addEventListener("click", showPrev);
  document.getElementById("overlay-bg").addEventListener("click", (e) => {
    if (e.target.id === "overlay-bg") closeOverlay();
  });
});

async function fetchAllPokemon() {
  try {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    allPokemon = Object.values(data);

    // Hole ID aus PokeAPI und sortiere
    allPokemon = await Promise.all(allPokemon.map(async p => {
      try {
        const res = await fetch(POKEAPI_URL + p.name.toLowerCase());
        const apiData = await res.json();
        return { ...p, id: apiData.id };
      } catch {
        return { ...p, id: 9999 }; // fallback
      }
    }));

    allPokemon.sort((a, b) => a.id - b.id);
  } catch (err) {
    console.error("Fehler beim Laden der Pokémon:", err);
  }
}

function render(list, replace = false) {
  const box = document.getElementById("content");
  if (replace) box.innerHTML = "";
  list.forEach((p) => {
    const div = document.createElement("div");
    div.className = "pokemon-card";
    div.innerHTML = `
      <img src="${p.sprite}" alt="${p.name}" class="pokemon-img" />
      <p class="pokemon-name">#${p.id} ${capitalize(p.name)}</p>
      <div class="type-container">
        ${p.types.map(t => `<span class="type-badge type-${t.toLowerCase()}">${t}</span>`).join("")}
      </div>
    `;
    div.onclick = () => showOverlay(p);
    box.appendChild(div);
  });
}

async function loadMore() {
  toggleSpinner(true); // Spinner AN

  await new Promise(resolve => setTimeout(resolve, 300)); // Spinner sichtbar lassen

  const nextChunk = allPokemon.slice(currentList.length, currentList.length + LIST_STEP);
  currentList = [...currentList, ...nextChunk];
  render(nextChunk);

  toggleSpinner(false); // Spinner AUS
}

function searchPokemon(e) {
  e.preventDefault();
  const val = document.getElementById("mySearch").value.toLowerCase();
  if (val.length < 3) return;
  const filtered = allPokemon.filter(p => p.name.toLowerCase().includes(val));
  render(filtered, true);
}

function searchLive() {
  const val = document.getElementById("mySearch").value.toLowerCase();
  if (val.length >= 3) {
    const filtered = allPokemon.filter(p => p.name.toLowerCase().includes(val));
    render(filtered, true);
  } else {
    render(currentList, true);
  }
}

function toggleSpinner(show) {
  document.getElementById('spinner').style.display = show ? 'flex' : 'none';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function showOverlay(pokemon) {
  document.body.classList.add('noscroll');
  const overlayCard = document.getElementById('overlay-card');
  const overlayBg = document.getElementById('overlay-bg');
  document.getElementById('overlay-img').src = pokemon.sprite;
  document.getElementById('overlay-name').textContent = capitalize(pokemon.name);
  document.getElementById('overlay-types').innerHTML = renderTypes(pokemon.types);

  overlayCard.className = ''; // Reset
  overlayCard.classList.add('type-bg-' + pokemon.types[0].toLowerCase());

  const { statsHTML, abilities, flavor, evolution } = await fetchPokemonDetails(pokemon.name);
  document.getElementById('overlay-info').innerHTML = renderInfo({ flavor, abilities, statsHTML, evolution });
  overlayBg.style.display = 'flex';

  currentIndex = allPokemon.findIndex(p => p.name === pokemon.name);
}

function renderTypes(types) {
  return types.map(t => `<span class="type-tag type-${t.toLowerCase()}">${t}</span>`).join('');
}

function renderInfo({ flavor, abilities, statsHTML, evolution }) {
  return `
    <br><div>${flavor}</div>
    <br><div><strong>Abilities:</strong> ${abilities}</div>
    <div><strong>Stats:</strong><br>${statsHTML}</div><br>
    <div><strong>Evolution:</strong> ${evolution}</div><br>
  `;
}

async function fetchPokemonDetails(name) {
  try {
    const res = await fetch(`${POKEAPI_URL}${name.toLowerCase()}`);
    const data = await res.json();

    const statsHTML = data.stats.map(s => `<div><strong>${s.stat.name}</strong>: ${s.base_stat}</div>`).join('');
    const abilities = data.abilities.map(a => a.ability.name).join(', ');

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const flavor = speciesData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') ?? '-';

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    const evolution = parseEvolutionChain(evoData.chain);

    return { statsHTML, abilities, flavor, evolution };
  } catch (e) {
    console.warn("Fehler bei Details:", e);
    return { statsHTML: '-', abilities: '-', flavor: '-', evolution: '-' };
  }
}

function parseEvolutionChain(chain) {
  const evos = [chain.species.name];
  while (chain.evolves_to?.[0]) {
    chain = chain.evolves_to[0];
    evos.push(chain.species.name);
  }
  return evos.join(' → ');
}

function closeOverlay() {
  document.getElementById('overlay-bg').style.display = 'none';
  document.body.classList.remove('noscroll');
}

function showNext() {
  if (currentIndex < allPokemon.length - 1) {
    showOverlay(allPokemon[currentIndex + 1]);
  }
}

function showPrev() {
  if (currentIndex > 0) {
    showOverlay(allPokemon[currentIndex - 1]);
  }
}
