const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/";
let currentPkList = [];
let listStart = 0;
const LIST_STEP = 20;

async function loadAndShowPkm() {
  showLoadingSpinner();
  try {
    await loadPkms(listStart, listStart + LIST_STEP);
    renderList();
  } catch (err) {
    console.error("❌ Fehler beim Laden:", err);
  } finally {
    hideLoadingSpinner();
  }
}

async function loadPkms(start, end) {
  const response = await fetch(`${BASE_URL}/pokedex.json`);
  const allPkm = Object.values(await response.json());
  // Statt Überschreiben: anhängen!
  if (start === 0) {
    currentPkList = allPkm.slice(start, end);
  } else {
    currentPkList = currentPkList.concat(allPkm.slice(start, end));
  }
}

function renderList() {
  const contentBox = document.getElementById("content");
  contentBox.innerHTML = "";

  currentPkList.forEach(p => {
    const item = document.createElement("div");
    item.className = "pkm-item";
    item.innerHTML = `
      <img src="${p.sprite}" alt="${p.name}" />
      <span>${p.name}</span>
    `;
    item.onclick = () => showOverlay(p);
    contentBox.appendChild(item);
  });
}

function renderFilteredList(filteredList) {
  const contentBox = document.getElementById("content");
  contentBox.innerHTML = "";

  filteredList.forEach(p => {
    const item = document.createElement("div");
    item.className = "pkm-item";
    item.innerHTML = `
      <img src="${p.sprite}" alt="${p.name}" />
      <span>${p.name}</span>
    `;
    item.onclick = () => showOverlay(p);
    contentBox.appendChild(item);
  });
}

document.querySelector("form").addEventListener("submit", function (e) { // Suchfunktion
  e.preventDefault();

  const searchTerm = document.getElementById("mySearch").value.toLowerCase();

  const filtered = currentPkList.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );

  renderFilteredList(filtered);
});

function showLoadingSpinner() {
  document.getElementById('spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

document.getElementById("load-more").addEventListener("click", async () => {
  showLoadingSpinner();
  try {
    listStart += LIST_STEP;
    await loadPkms(listStart, listStart + LIST_STEP);
    renderList();
  } catch (err) {
    console.error("❌ Fehler beim Nachladen:", err);
  } finally {
    hideLoadingSpinner();
  }
});

async function showOverlay(pokemon) {
  const img = document.getElementById('overlay-img');
  const name = document.getElementById('overlay-name');
  const types = document.getElementById('overlay-types');
  const info = document.getElementById('overlay-info');

  img.src = pokemon.sprite;
  name.textContent = pokemon.name;
  types.innerHTML = pokemon.types.map(t =>
    `<span class="type-tag type-${t.toLowerCase()}">${t}</span>`
  ).join('');

  let species = '-', flavorText = '-', abilities = '-', stats = '-', height = '-', weight = '-', evolution = '-';

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();

    abilities = data.abilities.map(a => a.ability.name).join(", ");
    stats = data.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(", ");
    height = data.height;
    weight = data.weight;

    const speciesRes = await fetch(data.species.url);
    if (speciesRes.ok) {
      const speciesData = await speciesRes.json();

      species = speciesData.genera.find(g => g.language.name === 'en')?.genus ?? '-';

      const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
      flavorText = entry?.flavor_text.replace(/[\n\f]/g, ' ') ?? '-';

      const evoRes = await fetch(speciesData.evolution_chain.url);
      if (evoRes.ok) {
        const evoData = await evoRes.json();
        const evoLine = evoData.chain;
        const evolutions = [evoLine.species.name];

        let next = evoLine.evolves_to?.[0];
        while (next) {
          evolutions.push(next.species.name);
          next = next.evolves_to?.[0];
        }

        evolution = evolutions.join(" → ");
      }
    }

  } catch (e) {
    console.warn("Fehler beim Laden:", e);
  }

  info.innerHTML = `
  <div class="pkm-entry-title">Pokédex Entry</div>
  <div class="pkm-text">${flavorText}</div>

  <div class="pkm-grid">
    <div><strong>Height</strong><br><span>${height / 10} m</span></div>
    <div><strong>Weight</strong><br><span>${weight / 10} kg</span></div>
  </div>

  <div class="pkm-section">
    <strong>Abilities</strong>
    <div>${abilities}</div>
  </div>

  <div class="pkm-section">
    <strong>Stats</strong>
    <div>${stats}</div>
  </div>

  <div class="pkm-section">
    <strong>Evolution</strong>
    <div>${evolution}</div>
  </div>
`;
  document.getElementById('detail-panel').style.display = 'block';
}

window.addEventListener("DOMContentLoaded", loadAndShowPkm);