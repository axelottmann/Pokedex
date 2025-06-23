const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";
let currentPkList = [];
let listStart = 0;
const LIST_STEP = 20;
let currentIndex = 0;
let allPokemon = [];

window.addEventListener("DOMContentLoaded", () => {
  loadAndShowPkm();

  document.getElementById("load-more").addEventListener("click", loadMore);
  document.querySelector("form").addEventListener("submit", searchPokemon);

  document.getElementById('overlay-close').addEventListener('click', closeOverlay);
  document.getElementById('next-btn').addEventListener('click', showNext);
  document.getElementById('prev-btn').addEventListener('click', showPrev);
  document.getElementById('overlay-bg').addEventListener('click', (e) => {
    if (e.target.id === 'overlay-bg') closeOverlay();
  });
});

async function loadAndShowPkm() {
  toggleSpinner(true);
  await loadPkms(listStart, listStart + LIST_STEP);
  render(currentPkList, true);
  toggleSpinner(false);
}

async function loadPkms(start, end) {
  const res = await fetch(BASE_URL + "/pokedex.json");
  const data = await res.json();
  currentPkList = Object.values(data).slice(start, end);
}

function render(list, replace = false) {
  const box = document.getElementById("content");
  if (replace) box.innerHTML = "";
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "pkm-item";
    div.innerHTML = `<img src="${p.sprite}" alt="${p.name}" /><span>${p.name}</span>`;
    div.onclick = () => showOverlay(p);
    box.appendChild(div);
  });

  renderIndexList(list);
}

function renderIndexList(pokemons) {
  allPokemon = pokemons;
}

function searchPokemon(e) {
  e.preventDefault();
  const val = document.getElementById("mySearch").value.toLowerCase();
  const filtered = currentPkList.filter(p => p.name.toLowerCase().includes(val));
  render(filtered, true);
}

async function loadMore() {
  document.body.classList.remove('noscroll');
  toggleSpinner(true);
  listStart += LIST_STEP;
  await loadPkms(listStart, listStart + LIST_STEP);
  render(currentPkList);
  toggleSpinner(false);
}

function toggleSpinner(show) {
  document.getElementById('spinner').style.display = show ? 'flex' : 'none';
}

async function showOverlay(pokemon) {
  document.body.classList.add('noscroll');
  document.getElementById('overlay-img').src = pokemon.sprite;
  document.getElementById('overlay-name').textContent = pokemon.name;
  document.getElementById('overlay-types').innerHTML = renderTypes(pokemon.types);

  const overlayCard = document.getElementById('overlay-card');
  overlayCard.className = `type-bg-${pokemon.types[0].toLowerCase()}`;

  const { statsHTML, abilities, flavor, evolution } = await fetchPokemonDetails(pokemon.name);
  document.getElementById('overlay-info').innerHTML = renderInfo({ flavor, abilities, statsHTML, evolution });

  document.getElementById('overlay-bg').style.display = 'flex';
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
    <br><div><strong>Evolution:</strong> ${evolution}</div><br>
  `;
}

async function fetchPokemonDetails(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const data = await res.json();

    const statsHTML = data.stats.map(s => `<div><strong>${s.stat.name}</strong>: ${s.base_stat}</div>`).join('');
    const abilities = data.abilities.map(a => a.ability.name).join(', ');

    const speciesData = await (await fetch(data.species.url)).json();
    const flavor = speciesData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') ?? '-';

    const evoData = await (await fetch(speciesData.evolution_chain.url)).json();
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
