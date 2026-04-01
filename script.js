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

// RENDER SURAH
function renderSurah(data) {
  list.innerHTML = "";

  data.forEach(s => {
    const el = document.createElement("div");
    el.className = "surah-item";

    el.innerHTML = `
      <div class="surah-left">
        <span class="surah-number">${s.number}</span>
        <div>
          <div class="surah-name">${s.name.transliteration.id}</div>
          <div class="surah-meaning">${s.name.translation.id}</div>
        </div>
      </div>

      <div class="surah-arab">${s.name.short}</div>
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
  const surah = json.data;

  detail.innerHTML = "";

  // 🔙 BACK BUTTON
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Kembali";
  backBtn.onclick = () => {
    detail.classList.add("hidden");
    list.classList.remove("hidden");
    audio.pause();
  };
  detail.appendChild(backBtn);

  // ▶ PLAY FULL
  const playBtn = document.createElement("button");
  playBtn.textContent = "▶ Play Full Surah";
  playBtn.onclick = () => playSurahFull(surah.verses, surah.name.transliteration.id);
  detail.appendChild(playBtn);

  // 🕌 BISMILLAH (kecuali At-Taubah)
  if (n !== 9) {
    const bismillah = document.createElement("div");
    bismillah.className = "bismillah";
    bismillah.innerHTML = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
    detail.appendChild(bismillah);
  }

  // 📖 AYAT
  surah.verses.forEach(v => {
    const el = document.createElement("div");
    el.className = "ayat";

    el.innerHTML = `
      <div class="arab">
        ${v.text.arab}
        <span class="nomor">${v.number.inSurah}</span>
      </div>
      <div class="latin">${v.text.transliteration.en}</div>
      <div class="arti">${v.translation.id}</div>
    `;

    // 🔊 AUDIO PER AYAT
    el.onclick = () => {
      audio.src = v.audio.primary;
      audio.play();

      document.getElementById("miniPlayer").classList.remove("hidden");
      document.getElementById("trackTitle").textContent = currentSurah;
      document.getElementById("trackAyat").textContent = "Ayat " + v.number.inSurah;
    };

    detail.appendChild(el);
  });
}

// AUDIO FULL SURAH
function playSurahFull(verses, name) {
  playlist = verses.map(v => v.audio.primary);
  currentIndex = 0;
  currentSurah = name;

  document.getElementById("miniPlayer").classList.remove("hidden");

  playTrack();
}

// PLAY TRACK
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

// CONTROL
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

// EFEK KLIK HALUS
document.addEventListener("click", e => {
  if (e.target.closest(".surah-item")) {
    const el = e.target.closest(".surah-item");
    el.style.transform = "scale(0.97)";
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 100);
  }
});

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// INIT
loadSurah();
