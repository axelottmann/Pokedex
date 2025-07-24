const BASE_URL = "https://pokemonapp-c8246-default-rtdb.europe-west1.firebasedatabase.app/.json";

let allPokemon = [];
let currentList = [];
let listStart = 0;
const LIST_STEP = 20;
let currentIndex = 0;

window.addEventListener("DOMContentLoaded", async () => {
  toggleSpinner(true);
  await fetchAllPokemon();
  currentList = allPokemon.slice(0, LIST_STEP);
  render(currentList, true);
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

    if (!data) {
      console.error("Keine Pokémon-Daten gefunden!");
      allPokemon = [];
      return;
    }

    allPokemon = Object.values(data).sort((a, b) => a.number - b.number);
  } catch (e) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", e);
    allPokemon = [];
  }
}

function render(list, replace = false) {
  const box = document.getElementById("content");
  if (replace) box.innerHTML = "";
  list.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "pkm-item";
    item.innerHTML = `
      <span class="pkm-number">#${p.number ?? '-'}</span>
      <img src="${p.sprite}" alt="${capitalizeName(p.name)}" />
      <span>${capitalizeName(p.name)}</span>
    `;
    item.onclick = () => showOverlay(p);
    box.appendChild(item);
  });
}

async function loadMore() {
  toggleSpinner(true);
  await new Promise(resolve => setTimeout(resolve, 300));
  const nextChunk = allPokemon.slice(currentList.length, currentList.length + LIST_STEP);
  currentList = [...currentList, ...nextChunk];
  render(nextChunk);
  toggleSpinner(false);
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
  if (val.length >= 1) {
    const filtered = allPokemon.filter(p => p.name.toLowerCase().includes(val));
    render(filtered, true);
    document.getElementById("load-more").style.display = "none";
  } else {
    render(currentList, true);
    document.getElementById("load-more").style.display = "block";
  }
}

function toggleSpinner(show) {
  document.getElementById('spinner').style.display = show ? 'flex' : 'none';
}

function capitalizeName(name) {
  if (!name) return '-';
  return name
    .split(/[\s\-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(name.includes('-') ? '-' : ' ');
}

async function showOverlay(pokemon) {
  document.body.classList.add('noscroll');
  const overlayCard = document.getElementById('overlay-card');
  const overlayBg = document.getElementById('overlay-bg');
  document.getElementById('overlay-img').src = pokemon.sprite;
  document.getElementById('overlay-name').textContent = capitalizeName(pokemon.name);
  document.getElementById('overlay-type').innerHTML = renderType(pokemon.type);

  overlayCard.className = '';
  const type = Array.isArray(pokemon.type) && pokemon.type.length > 0
  ? pokemon.type[0].toLowerCase()
  : 'normal';
  overlayCard.classList.add('type-bg-' + type);

  document.getElementById('overlay-info').innerHTML = renderInfo(pokemon);
  overlayBg.style.display = 'flex';

  currentIndex = allPokemon.findIndex(p => p.name === pokemon.name);
}

function renderType(type) {
  if (!Array.isArray(type)) return '<span>-</span>';
  let html = '';
  for (let i = 0; i < type.length; i++) {
    html += `<span class="type-tag type-${type[i].toLowerCase()}">${type[i]}</span>`;
  }
  return html;
}

function renderInfo(pokemon) {
  return `

    <div class="pkm-grid">
      <div><strong>Größe:</strong><br><span>${pokemon.height ? pokemon.height + ' m' : '-'}</span></div><br>
      <div><strong>Gewicht:</strong><br><span>${pokemon.weight ? pokemon.weight + ' kg' : '-'}</span></div>
    </div>
    <div class="pkm-section">
      <strong>Fähigkeiten:</strong>
      <div>${pokemon.abilities ? pokemon.abilities.join(", ") : '-'}</div>
    </div>
    <div class="pkm-section">
      <strong>Werte:</strong>
      <ul>
        ${
          pokemon.stats
            ? pokemon.stats
                .map(stat => `<li>${stat.name}: ${stat.base}</li>`)
                .join("")
            : "<li>-</li>"
        }
      </ul>
    </div>
    <div class="pkm-section">
      <strong>Entwicklung:</strong>
      <div>${pokemon.evolution ? pokemon.evolution.join(" → ") : '-'}</div>
    </div>
  `;
}


function closeOverlay() {
  document.body.classList.remove('noscroll');
  document.getElementById('overlay-bg').style.display = 'none';
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