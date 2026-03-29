const list = document.getElementById("surahList");
const detail = document.getElementById("ayatDetail");
const search = document.getElementById("search");
const backBtn = document.getElementById("backBtn");

let allSurah = [];

// LOAD SURAH
async function loadSurah() {
  const res = await fetch("https://api.quran.gading.dev/surah");
  const json = await res.json();

  allSurah = json.data;
  renderSurah(allSurah);
}

function renderSurah(data) {
  list.innerHTML = "";

  data.forEach(s => {
    const el = document.createElement("div");

    el.innerHTML = `
      <span>${s.number}. ${s.name.transliteration.id}</span>
      <span>${s.name.short}</span>
    `;

    el.onclick = () => openSurah(s.number);
    list.appendChild(el);
  });
}

// SEARCH
search.oninput = () => {
  const value = search.value.toLowerCase();

  const filtered = allSurah.filter(s =>
    s.name.transliteration.id.toLowerCase().includes(value)
  );

  renderSurah(filtered);
};

// OPEN SURAH
async function openSurah(n) {
  list.classList.add("hidden");
  detail.classList.remove("hidden");
  backBtn.classList.remove("hidden");

  const res = await fetch(`https://api.quran.gading.dev/surah/${n}`);
  const json = await res.json();

  detail.innerHTML = "";

  json.data.verses.forEach((v, i) => {
    const el = document.createElement("div");
    el.className = "ayat";

    const audio = new Audio(v.audio.primary);

    el.innerHTML = `
      <div class="arab">${v.text.arab}</div>
      <div class="latin">${v.text.transliteration.en}</div>
      <div>${v.translation.id}</div>
      <button>▶</button>
    `;

    const btn = el.querySelector("button");

    btn.onclick = () => {
      audio.play();

      audio.onended = () => {
        const next = detail.children[i + 1];
        if (next) next.querySelector("button").click();
      };
    };

    detail.appendChild(el);
  });
}

// BACK
backBtn.onclick = () => {
  detail.classList.add("hidden");
  list.classList.remove("hidden");
  backBtn.classList.add("hidden");
};

// DARK MODE
const toggle = document.getElementById("themeToggle");

toggle.onclick = () => {
  document.body.classList.toggle("dark");
  toggle.textContent = document.body.classList.contains("dark") ? "🌙" : "☀️";
};

loadSurah();