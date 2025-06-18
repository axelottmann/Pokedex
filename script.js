const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";
let currentPkList = [];
let listStart = 0;
const LIST_STEP = 20;

window.addEventListener("DOMContentLoaded", loadAndShowPkm);
document.getElementById("load-more").addEventListener("click", loadMore);
document.querySelector("form").addEventListener("submit", searchPokemon);

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
}

function searchPokemon(e) {
  e.preventDefault();
  const val = document.getElementById("mySearch").value.toLowerCase();
  const filtered = currentPkList.filter(p => p.name.toLowerCase().includes(val));
  render(filtered, true);
}

async function loadMore() {
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
  document.getElementById('overlay-img').src = pokemon.sprite;
  document.getElementById('overlay-name').textContent = pokemon.name;
  document.getElementById('overlay-types').innerHTML =
    pokemon.types.map(t => `<span class="type-tag type-${t.toLowerCase()}">${t}</span>`).join('');

  let info = { flavor: '-', genus: '-', abilities: '-', stats: '-', height: '-', weight: '-', evo: '-' };

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`);
    const data = await res.json();

    info.abilities = data.abilities.map(a => a.ability.name).join(", ");
    info.stats = data.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(", ");
    info.height = data.height / 10;
    info.weight = data.weight / 10;

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    info.genus = speciesData.genera.find(g => g.language.name === 'en')?.genus ?? '-';
    info.flavor = speciesData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') ?? '-';

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    let evoLine = evoData.chain;
    const evos = [evoLine.species.name];
    while (evoLine.evolves_to?.[0]) {
      evoLine = evoLine.evolves_to[0];
      evos.push(evoLine.species.name);
    }
    info.evo = evos.join(" → ");
  } catch (e) {
    console.warn("Fehler beim Laden:", e);
  }

  document.getElementById('overlay-info').innerHTML = `
    <div class="pkm-entry-title">Pokédex Entry</div>
    <div class="pkm-text">${info.flavor}</div>
    <div class="pkm-grid">
      <div><strong>Height</strong><br><span>${info.height} m</span></div>
      <div><strong>Weight</strong><br><span>${info.weight} kg</span></div>
    </div>
    <div class="pkm-section"><strong>Abilities</strong><div>${info.abilities}</div></div>
    <div class="pkm-section"><strong>Stats</strong><div>${info.stats}</div></div>
    <div class="pkm-section"><strong>Evolution</strong><div>${info.evo}</div></div>
  `;

  document.getElementById('detail-panel').style.display = 'block';
}
