const list = document.getElementById("surahList");
const detail = document.getElementById("ayatDetail");
const search = document.getElementById("search");

let allSurah = [];

// AUDIO SYSTEM
let audio = new Audio();
let playlist = [];
let currentIndex = 0;
let currentSurah = "";

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
  renderSurah(allSurah.filter(s =>
    s.name.transliteration.id.toLowerCase().includes(value)
  ));
};

// OPEN SURAH
async function openSurah(n) {
  window.scrollTo({ top: 0 });

  list.classList.add("hidden");
  detail.classList.remove("hidden");

  const res = await fetch(`https://api.quran.gading.dev/surah/${n}`);
  const json = await res.json();

  detail.innerHTML = "";

  // PLAY BUTTON
  const btn = document.createElement("button");
  btn.textContent = "▶ Play Full Surah";
  btn.onclick = () => playSurahFull(json.data.verses, json.data.name.transliteration.id);
  detail.appendChild(btn);

  json.data.verses.forEach(v => {
    const el = document.createElement("div");
    el.className = "ayat";

    el.innerHTML = `
      <div class="arab">${v.text.arab}</div>
      <div class="latin">${v.text.transliteration.en}</div>
      <div>${v.translation.id}</div>
    `;

    detail.appendChild(el);
  });
}
// efek klik halus
document.addEventListener("click", e => {
  if (e.target.closest("#surahList div")) {
    e.target.closest("#surahList div").style.transform = "scale(0.97)";
    setTimeout(() => {
      e.target.closest("#surahList div").style.transform = "scale(1)";
    }, 100);
  }
});
// AUDIO SYSTEM
function playSurahFull(verses, name) {
  playlist = verses.map(v => v.audio.primary);
  currentIndex = 0;
  currentSurah = name;

  document.getElementById("miniPlayer").classList.remove("hidden");
  playTrack();
}

function playTrack() {
  if (currentIndex >= playlist.length) return;

  audio.src = playlist[currentIndex];
  audio.play();

  document.getElementById("trackTitle").textContent = currentSurah;
  document.getElementById("trackAyat").textContent = "Ayat " + (currentIndex + 1);

  audio.onended = () => {
    currentIndex++;
    playTrack();
  };
}

function togglePlay() {
  audio.paused ? audio.play() : audio.pause();
}

function nextTrack() {
  currentIndex++;
  playTrack();
}

function prevTrack() {
  currentIndex--;
  playTrack();
}

// DARK MODE
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// FOCUS MODE
document.getElementById("focusBtn").onclick = () => {
  document.body.classList.toggle("focus");
};

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

loadSurah();
