/* ============================================================
   ATERRADOR 3D - Lógica del juego (JavaScript clásico, sin módulos)
   Juego para Isabella. Todo el texto en español.
   Usa window.ATScenes (three.js) para el render 3D.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Estado guardado (localStorage) ---------- */
  var STORAGE_KEY = "aterrador_save_v1";
  var DEFAULT_STATE = {
    coins: 0,
    selectedSkin: "muneca",
    ownedSkins: ["muneca"],
    ownedPowers: [],
    medioEnfrentamientoWon: false
  };
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_STATE);
      var data = JSON.parse(raw);
      return {
        coins: typeof data.coins === "number" ? data.coins : 0,
        selectedSkin: data.selectedSkin || "muneca",
        ownedSkins: Array.isArray(data.ownedSkins) ? data.ownedSkins : ["muneca"],
        ownedPowers: Array.isArray(data.ownedPowers) ? data.ownedPowers : [],
        medioEnfrentamientoWon: !!data.medioEnfrentamientoWon
      };
    } catch (e) {
      return clone(DEFAULT_STATE);
    }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    updateTopbar();
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rand(arr.length)]; }
  function fmtMoney(n) { return "$" + Number(n).toLocaleString("es-ES"); }

  var currentTheme = "none";
  var currentScreen = "inicio";
  var screenHistory = [];

  // Controladores 3D activos (para llamarles métodos)
  var skinsCtrl = null;
  var preguntasCtrl = null;
  var esconditeCtrl = null;
  var enfrentamientoCtrl = null;
  var carrerametaCtrl = null;
  var pintarCtrl = null;
  var paintColor = "#e0241b";
  var paintDrawing = false;
  var currentPaintShape = null;

  /* ============================================================
     SKINS (solo decoración)
     ============================================================ */
  var SKINS = [
    { id: "muneca",      name: "Muñeca (vestido rojo)", price: 0 },
    { id: "sirena",      name: "Barbie sirena", price: 0 },
    { id: "lol",         name: "LOL Surprise", price: 0 },
    { id: "taza",        name: "Taza", price: 0 },
    { id: "mono",        name: "Mono", price: 0 },
    { id: "dino",        name: "Dinosaurio rojo", price: 0 },
    { id: "lolmejorada", name: "LOL Mejorada ✨", price: 6000 },
    { id: "arcoiris",    name: "Humano Arcoíris 🌈", price: 10000 }
  ];

  /* ============================================================
     MONSTRUOS (variados, para Puertas y Carrera)
     ============================================================ */
  var MONSTERS = [
    { id: "ojos",    nameT: "Ojos Verdes con Globo", nameG: "Ojitos Globo" },
    { id: "puya",    nameT: "El de la Puya", nameG: "Pinchacitos" },
    { id: "pierna",  nameT: "Comepiernas", nameG: "Don Comilón" },
    { id: "lindo",   nameT: "El Lindo que se vuelve Feo", nameG: "Bonitín" },
    { id: "fantasma",nameT: "Fantasma Aullador", nameG: "Boo el Tierno" },
    { id: "calavera",nameT: "Calavera Crujiente", nameG: "Huesitos" },
    { id: "arana",   nameT: "Araña Gigante", nameG: "Patitas" },
    { id: "diablo",  nameT: "Diablillo", nameG: "Travieso" },
    { id: "alien",   nameT: "Alien Verde", nameG: "Marcianito" },
    { id: "payaso",  nameT: "Payaso Maléfico", nameG: "Payaso Risas" },
    { id: "vampiro", nameT: "Vampiro Mordelón", nameG: "Murcielaguito" },
    { id: "robot",   nameT: "Robot Aplastador", nameG: "Robotín" },
    { id: "dragon",  nameT: "Dragón de Fuego", nameG: "Dragoncito" },
    { id: "ogro",    nameT: "Ogro Hambriento", nameG: "Ogrito" },
    { id: "aterrador", nameT: "EL ATERRADOR", nameG: "Barriguitas" }
  ];

  function monsterName(m) { return currentTheme === "gracioso" ? m.nameG : m.nameT; }
  function randomMonster() { return pick(MONSTERS); }

  /* ============================================================
     PODERES (tienda)
     ============================================================ */
  var POWERS = [
    { id: "saltar",    name: "Saltar alto", ico: "🦘", price: 0 },
    { id: "invisible", name: "Invisible", ico: "🫥", price: 1 },
    { id: "comida",    name: "Crear comida", ico: "🍔", price: 3000 },
    { id: "fuego",     name: "Correr rapidísimo con fuego", ico: "🔥", price: 5000 },
    { id: "torre",     name: "Crear una torre para esconderse", ico: "🏰", price: 8000 },
    { id: "volar",     name: "Volar", ico: "🦋", price: 20000 }
  ];

  /* ============================================================
     NAVEGACIÓN ENTRE PANTALLAS
     ============================================================ */
  var SCREENS = ["inicio", "tema", "menu", "puertas", "escondite", "carrera", "preguntas", "skins", "poderes", "enfrentamiento", "carrerameta", "pintar"];
  var USES_3D = { inicio: 1, puertas: 1, escondite: 1, carrera: 1, preguntas: 1, skins: 1, enfrentamiento: 1, carrerameta: 1, pintar: 1 };

  function showScreen(name, skipHistory) {
    // detener cualquier escena 3D activa
    if (window.ATScenes) ATScenes.stop();
    skinsCtrl = null;
    preguntasCtrl = null;
    esconditeCtrl = null;
    enfrentamientoCtrl = null;
    carrerametaCtrl = null;
    pintarCtrl = null;
    hideScare();
    hideMacarenaBanner();

    if (!skipHistory && currentScreen && currentScreen !== name) {
      screenHistory.push(currentScreen);
    }
    SCREENS.forEach(function (s) {
      var el = $("screen-" + s);
      if (!el) return;
      if (s === "menu") {
        el.classList.toggle("active", name === "menu" && currentTheme !== "medio");
      } else {
        el.classList.toggle("active", s === name);
      }
    });
    var menuMedio = $("screen-menu-medio");
    if (menuMedio) menuMedio.classList.toggle("active", name === "menu" && currentTheme === "medio");
    currentScreen = name;

    $("topbar").classList.toggle("hidden", name === "inicio");

    if (!USES_3D[name] && window.ATScenes) ATScenes.hide();

    if (name === "inicio") initInicio();
    if (name === "puertas") initPuertas();
    if (name === "escondite") initEscondite();
    if (name === "carrera") initCarrera();
    if (name === "preguntas") initPreguntas();
    if (name === "skins") initSkins();
    if (name === "poderes") renderPowers();
    if (name === "menu") {
      buildFloaters(currentTheme === "medio" ? $("floatersMenuMedio") : $("floatersMenu"));
    }
    if (name === "enfrentamiento") initEnfrentamiento();
    if (name === "carrerameta") initCarreraMeta();
    if (name === "pintar") initPintar();

    window.scrollTo(0, 0);
  }

  function goBack() {
    if (screenHistory.length > 0) {
      var prev = screenHistory.pop();
      showScreen(prev, true);
    } else {
      showScreen("menu", true);
    }
  }

  /* ============================================================
     TEMAS
     ============================================================ */
  function setTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove("theme-none", "theme-terror", "theme-gracioso", "theme-medio");
    document.body.classList.add("theme-" + theme);
    if (window.ATScenes) ATScenes.setTheme(theme);
  }

  function buildFloaters(container) {
    if (!container) return;
    container.innerHTML = "";
    if (currentTheme === "gracioso") {
      var balloons = ["🎈", "🎈", "🎈", "🎉", "🌸"];
      for (var i = 0; i < 12; i++) {
        var b = document.createElement("div");
        b.className = "balloon";
        b.textContent = pick(balloons);
        b.style.left = rand(100) + "%";
        b.style.animationDuration = (6 + rand(8)) + "s";
        b.style.animationDelay = (-rand(8)) + "s";
        b.style.fontSize = (28 + rand(26)) + "px";
        container.appendChild(b);
      }
    } else if (currentTheme === "terror") {
      for (var j = 0; j < 14; j++) {
        var d = document.createElement("div");
        d.className = "blood";
        d.textContent = "🩸";
        d.style.left = rand(100) + "%";
        d.style.animationDuration = (4 + rand(6)) + "s";
        d.style.animationDelay = (-rand(6)) + "s";
        d.style.fontSize = (18 + rand(22)) + "px";
        container.appendChild(d);
      }
    } else if (currentTheme === "medio") {
      var sparks = ["💜", "🎈", "👹", "✨", "🔪", "🩸"];
      for (var k = 0; k < 10; k++) {
        var sp = document.createElement("div");
        sp.className = "medio-spark";
        sp.textContent = pick(sparks);
        sp.style.left = rand(100) + "%";
        sp.style.animationDuration = (5 + rand(7)) + "s";
        sp.style.animationDelay = (-rand(7)) + "s";
        container.appendChild(sp);
      }
    }
  }

  /* ============================================================
     TOPBAR
     ============================================================ */
  function updateTopbar() {
    $("coinsLabel").textContent = state.coins.toLocaleString("es-ES");
    var skin = SKINS.filter(function (s) { return s.id === state.selectedSkin; })[0];
    $("skinLabel").textContent = skin ? skin.name.split(" ")[0] : "Muñeca";
  }

  /* ============================================================
     MENSAJE GRANDE
     ============================================================ */
  var bigMsgTimer = null;
  function bigMessage(html, ms) {
    $("bigMsgInner").innerHTML = html;
    $("bigMsg").classList.remove("hidden");
    if (bigMsgTimer) clearTimeout(bigMsgTimer);
    if (ms) bigMsgTimer = setTimeout(function () { $("bigMsg").classList.add("hidden"); }, ms);
  }
  function hideBigMessage() { $("bigMsg").classList.add("hidden"); }

  /* ============================================================
     CARA ATERRADORA EN PANTALLA (overlay) + "AH AH AH"
     ============================================================ */
  var scareTimer = null;
  var macarenaTimer = null;
  function showScare(ms, label, variant) {
    var ov = $("scareOverlay");
    if (!ov) return;
    variant = variant || "terror";
    ov.classList.remove("scare-mild", "scare-terror-funny");
    if (variant === "mild") ov.classList.add("scare-mild");
    else if (variant === "terror-funny") ov.classList.add("scare-terror-funny");
    var silly = $("scareSilly");
    if (silly) silly.classList.toggle("hidden", variant !== "mild" && variant !== "terror-funny");
    $("scareText").textContent = label || "AH AH AH";
    ov.classList.remove("hidden");
    ov.classList.remove("scare-anim");
    void ov.offsetWidth;
    ov.classList.add("scare-anim");
    if (scareTimer) clearTimeout(scareTimer);
    if (ms) scareTimer = setTimeout(hideScare, ms);
  }
  function hideScare() {
    var ov = $("scareOverlay");
    if (ov) {
      ov.classList.add("hidden");
      ov.classList.remove("scare-mild", "scare-terror-funny");
    }
    var silly = $("scareSilly");
    if (silly) silly.classList.add("hidden");
  }
  function showMacarenaBanner(ms) {
    var el = $("macarenaBanner");
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.remove("macarena-anim");
    void el.offsetWidth;
    el.classList.add("macarena-anim");
    if (macarenaTimer) clearTimeout(macarenaTimer);
    if (ms) macarenaTimer = setTimeout(hideMacarenaBanner, ms);
  }
  function hideMacarenaBanner() {
    var el = $("macarenaBanner");
    if (el) el.classList.add("hidden");
  }

  /* ============================================================
     INICIO (intro: minions → desfile de skins → muñeca girando)
     ============================================================ */
  var introCtrl = null;

  function initInicio() {
    var btn = $("btnJugar");
    var overlay = $("introOverlay");
    if (btn) btn.classList.add("hidden");
    if (overlay) overlay.classList.remove("hidden");
    setIntroPhaseLabel("¡Minions!");
    if (window.ATScenes) {
      introCtrl = ATScenes.go("intro", {
        skinId: state.selectedSkin,
        skins: SKINS.map(function (s) { return { id: s.id, name: s.name, price: s.price }; }),
        onPhaseChange: function (phase, label) {
          setIntroPhaseLabel(label);
          var coinHint = $("introCoinHint");
          if (coinHint) coinHint.classList.toggle("hidden", phase !== "parade");
        },
        onIntroComplete: function () {
          if (overlay) overlay.classList.add("hidden");
          if (btn) btn.classList.remove("hidden");
        }
      });
    }
  }

  function setIntroPhaseLabel(text) {
    var el = $("introPhaseLabel");
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  }

  function skipIntro() {
    if (introCtrl && introCtrl.skip) introCtrl.skip();
  }

  /* ============================================================
     MINI-JUEGO 1: PUERTAS
     ============================================================ */
  var SALA_ACTIONS = ["comer", "computadora", "sonreir", "asustar"];
  var SALA_TEXT = {
    comer: { t: "🦵 ¡Se está comiendo una pierna! 😱", g: "🍗 ¡Está comiendo rico! 😋" },
    computadora: { t: "💻 Está en la computadora... y te mira 👀", g: "💻 ¡Está jugando en la compu! 🎮" },
    sonreir: { t: "🙂 Te sonríe... pero da escalofríos 😬", g: "😄 ¡Te saluda con una sonrisa! 👋" },
    asustar: { t: "😱 ¡SUSTO! ¡Se abalanza hacia ti! 👹", g: "🤪 ¡BUU! ¡Te quiso asustar! 🎉" }
  };

  function initPuertas() {
    $("puertasReveal").classList.add("hidden");
    $("puertasInfo").textContent = currentTheme === "gracioso"
      ? "Toca una puerta... entra a la sala y mira qué pasa 😄"
      : "Toca una puerta... entra a la sala... ¿qué hay dentro? 👀";
    ATScenes.go("puertas", {
      pickMonster: function () {
        var m = randomMonster();
        return { id: m.id, name: monsterName(m) };
      },
      pickSala: function () { return pick(SALA_ACTIONS); },
      onReveal: function (info) {
        $("puertasMonsterName").textContent = "¡Salió " + info.name + "!";
        $("puertasReveal").classList.remove("hidden");
        $("puertasInfo").textContent = currentTheme === "terror"
          ? "¡Buuu! 😱 Toca la sala para volver, luego otra puerta..."
          : "¡Jaja! 🤣 Toca la sala para volver, luego otra puerta...";
        if (currentTheme === "gracioso") {
          showScare(850, "¡AH AH!", "mild");
        } else if (info.id === "payaso") {
          showScare(1200, "AH AH AH... 🤡", "terror-funny");
        }
      },
      onSala: function (info, action) {
        var copy = SALA_TEXT[action] || SALA_TEXT.sonreir;
        $("puertasMonsterName").textContent = (currentTheme === "gracioso" ? copy.g : copy.t);
        $("puertasReveal").classList.remove("hidden");
        if (currentTheme === "gracioso" && (action === "asustar" || info.id === "aterrador")) {
          showScare(950, action === "asustar" ? "¡BUU! 😜" : "¡AH! 🤡", "mild");
        } else if (currentTheme === "terror" && (action === "asustar" || info.id === "aterrador")) {
          showScare(1500, action === "asustar" ? "AH AH AH... 🤡" : "AH AH AH", "terror-funny");
        } else if (currentTheme === "terror" && info.id === "payaso") {
          showScare(1100, "AH AH... ¡jaja! 🤡", "terror-funny");
        }
      },
      onSalaExit: function () {
        $("puertasInfo").textContent = currentTheme === "gracioso"
          ? "¡Toca otra puerta! 🚪😄" : "¡Toca otra puerta! 🚪👀";
      }
    });
  }

  /* ============================================================
     MINI-JUEGO 2: ESCONDITE
     ============================================================ */
  function initEscondite() {
    $("esconditeStatus").textContent = "";
    var hasTorre = state.ownedPowers.indexOf("torre") >= 0;
    var hasComida = state.ownedPowers.indexOf("comida") >= 0;
    $("esconditeInfo").textContent = currentTheme === "gracioso"
      ? "¡Escóndete del payaso! Camina a un arbusto con luz verde 💚"
      : "¡Escóndete del monstruo! Camina a un arbusto con luz verde 💚";
    // botón de comida solo si tienes el poder
    $("btnEsconditeComida").classList.toggle("hidden", !hasComida);
    esconditeCtrl = ATScenes.go("escondite", {
      skinId: state.selectedSkin,
      powers: { torre: hasTorre, comida: hasComida },
      onStatus: function (txt) { $("esconditeStatus").textContent = txt; },
      onFound: function (theme) {
        if (theme === "gracioso") {
          $("esconditeStatus").textContent = "¡Te encontró el payaso! 🤡 ¡Van al escenario a bailar! 💃";
          showScare(700, "¡TE VI! 😜", "mild");
          showMacarenaBanner(7200);
        } else {
          $("esconditeStatus").textContent = "¡El monstruo te encontró! 😱 ¡Corre!";
          showScare(2200, "AH AH AH... 🤡", "terror-funny");
        }
      },
      onDanceComplete: function () {
        $("esconditeStatus").textContent = "¡Qué baile tan chévere! 🤡💃 ¡Con tu mini peluche LOL! 🧸";
        bigMessage(
          "🤡 ¡TE ENCONTRÉ EN LA CUEVITA! 🎉<br><span style='font-size:22px'>¡MACARENA JUNTOS! 💃🕺🧸</span>",
          3200
        );
      },
      onIdleOut: function () {
        bigMessage("😴 ¡TE SALES DEL JUEGO! 😴<br><span style='font-size:18px'>(Te quedaste quieta mucho tiempo)</span>", 2600);
        $("esconditeStatus").textContent = "Te saliste del juego por quedarte quieta 😅";
      }
    });
  }

  /* ============================================================
     MINI-JUEGO 3: CARRERA
     ============================================================ */
  function initCarrera() {
    $("carreraOver").classList.add("hidden");
    $("carreraInfo").textContent = currentTheme === "gracioso"
      ? "¡Agarra todas las cajitas y escapa del payaso! 🤡"
      : "¡Agarra todas las cajitas y huye del monstruo! 👹";
    var monster = randomMonster();
    var total = 8;
    $("carreraMoney").textContent = "$0";
    $("carreraBoxes").textContent = "0/" + total;
    $("carreraTime").textContent = "30";

    ATScenes.go("carrera", {
      skinId: state.selectedSkin,
      monsterId: monster.id,
      totalBoxes: total,
      powers: {
        fire: state.ownedPowers.indexOf("fuego") >= 0,
        jump: state.ownedPowers.indexOf("saltar") >= 0,
        fly: state.ownedPowers.indexOf("volar") >= 0,
        invisible: state.ownedPowers.indexOf("invisible") >= 0
      },
      pickPower: function () { return pick(["saltar", "invisible", "comida", "fuego", "torre", "volar"]); },
      onHud: function (money, grabbed, tot, time) {
        $("carreraMoney").textContent = fmtMoney(money);
        $("carreraBoxes").textContent = grabbed + "/" + tot;
        $("carreraTime").textContent = time;
      },
      onAwardPower: function (powerId) {
        if (state.ownedPowers.indexOf(powerId) < 0) {
          state.ownedPowers.push(powerId);
          saveState();
          var p = POWERS.filter(function (x) { return x.id === powerId; })[0];
          bigMessage("🎁 ¡Ganaste un poder!<br>" + (p ? p.ico + " " + p.name : ""), 1600);
        }
      },
      onFinish: function (reason, earned, grabbed) {
        state.coins += earned;
        saveState();
        var msg;
        if (reason === "todas") msg = "🏆 ¡AGARRASTE TODAS! Ganaste " + fmtMoney(earned) + " 🤑";
        else if (reason === "atrapado") {
          msg = currentTheme === "gracioso"
            ? "🤡 ¡Te atrapó el payaso! Pero te llevas " + fmtMoney(earned)
            : "😱 ¡Te atrapó! Pero te llevas " + fmtMoney(earned);
          if (currentTheme === "terror") showScare(1800, "AH AH AH... 🤡", "terror-funny");
          else showScare(900, "¡AH AH! 😜", "mild");
        }
        else msg = "⏱️ ¡Se acabó el tiempo! Ganaste " + fmtMoney(earned);
        if (grabbed === 0 && reason !== "todas") msg += " 😅 (no agarraste cajitas)";
        $("carreraResult").textContent = msg;
        $("carreraOver").classList.remove("hidden");
      }
    });
  }

  /* ============================================================
     MINI-JUEGO 4: PREGUNTAS
     ============================================================ */
  var QUESTIONS = [
    { q: "¿En qué país nació la reina Isabel II?", opts: ["Inglaterra", "Brasil", "Japón"], a: 0 },
    { q: "¿De qué color es el vestido de la muñeca principal?", opts: ["Rojo", "Azul", "Verde"], a: 0, dress: true },
    { q: "¿Cuántas puertas hay en el juego de Puertas?", opts: ["10", "30", "100"], a: 1 },
    { q: "¿Qué animal hace 'miau'?", opts: ["Perro", "Gato", "Vaca"], a: 1 },
    { q: "¿Cuánto es 2 + 2?", opts: ["3", "4", "5"], a: 1 },
    { q: "¿Qué globo flota en el modo gracioso?", opts: ["🎈", "🪨", "🚗"], a: 0 },
    { q: "¿De qué color son los ojos del monstruo del globo?", opts: ["Verdes", "Negros", "Rosados"], a: 0 },
    { q: "¿Con qué se compran los poderes?", opts: ["Monedas", "Dinero real", "Caramelos"], a: 0 },
    { q: "¿Qué fruta es amarilla y curva?", opts: ["Manzana", "Banana", "Uva"], a: 1 },
    { q: "¿Cuál es un poder del juego?", opts: ["Volar", "Dormir", "Cocinar"], a: 0 }
  ];
  var quiz = null;

  function initPreguntas() {
    quiz = { score: 0, order: shuffle(QUESTIONS.slice()), index: 0 };
    $("quizScore").textContent = "0";
    $("btnPreguntasOtra").classList.add("hidden");
    preguntasCtrl = ATScenes.go("preguntas", { monsterId: randomMonster().id });
    if (currentTheme === "gracioso" && preguntasCtrl.setMood) preguntasCtrl.setMood("angry");
    nextQuestion();
  }

  function nextQuestion() {
    if (quiz.index >= quiz.order.length) {
      var bonus = quiz.score * 100;
      state.coins += bonus;
      saveState();
      $("quizBubble").innerHTML = "¡Terminaste! Acertaste " + quiz.score + " de " + quiz.order.length + ". +" + fmtMoney(bonus) + " 💰";
      $("quizOptions").innerHTML = "";
      $("btnPreguntasOtra").classList.remove("hidden");
      if (currentTheme === "gracioso" && preguntasCtrl && preguntasCtrl.setMood) preguntasCtrl.setMood("dance");
      return;
    }
    var item = quiz.order[quiz.index];
    var dressHint = item.dress
      ? "<br><small style='color:#c0392b;font-weight:bold'>👗 La muñeca principal (Isabella) del inicio lleva vestido rojo</small>"
      : "";
    if (currentTheme === "gracioso") {
      $("quizBubble").innerHTML = "😠 ¡Estoy enojado! Alégrame: " + item.q + dressHint + "<br><small>(o dame mi peluche 🧸 / baila macarena 💃)</small>";
    } else {
      $("quizBubble").innerHTML = item.q + dressHint;
    }
    var opts = $("quizOptions");
    opts.innerHTML = "";
    item.opts.forEach(function (text, i) {
      var b = document.createElement("button");
      b.className = "quiz-opt";
      b.textContent = text;
      b.addEventListener("click", function () { answer(b, i, item); });
      opts.appendChild(b);
    });
    if (currentTheme === "gracioso") {
      var extra1 = document.createElement("button");
      extra1.className = "quiz-opt";
      extra1.textContent = "🧸 Darle su peluche";
      extra1.addEventListener("click", function () { cheerClown("peluche"); });
      opts.appendChild(extra1);
      var extra2 = document.createElement("button");
      extra2.className = "quiz-opt";
      extra2.textContent = "💃 Bailar macarena";
      extra2.addEventListener("click", function () { cheerClown("macarena"); });
      opts.appendChild(extra2);
    }
  }

  function answer(btn, i, item) {
    var buttons = $("quizOptions").querySelectorAll(".quiz-opt");
    buttons.forEach(function (b) { b.disabled = true; });
    if (i === item.a) {
      btn.classList.add("correct");
      quiz.score++;
      $("quizScore").textContent = quiz.score;
    } else {
      btn.classList.add("wrong");
      if (buttons[item.a]) buttons[item.a].classList.add("correct");
    }
    quiz.index++;
    setTimeout(nextQuestion, 900);
  }

  function cheerClown(how) {
    if (preguntasCtrl && preguntasCtrl.setMood) preguntasCtrl.setMood("dance");
    if (how === "macarena") {
      showMacarenaBanner(3500);
      $("quizBubble").textContent = "🤡 ¡Jajaja! ¡MACARENA! 💃🕺 ¡Bailas súper bien!";
    } else {
      $("quizBubble").textContent = "🤡 ¡Mi peluche! 🧸 ¡Gracias, ya no estoy enojado! 😄";
    }
    quiz.score++;
    $("quizScore").textContent = quiz.score;
    setTimeout(function () { quiz.index++; nextQuestion(); }, 1500);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = rand(i + 1);
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ============================================================
     SKINS - galería 3D
     ============================================================ */
  function initSkins() {
    skinsCtrl = ATScenes.go("skins", { skinId: state.selectedSkin });
    renderSkins();
  }

  function skinOwned(id) { return state.ownedSkins.indexOf(id) >= 0; }

  function renderSkins() {
    var grid = $("skinsGrid");
    grid.innerHTML = "";
    SKINS.forEach(function (skin) {
      var owned = skin.price === 0 || skinOwned(skin.id);
      var btn = document.createElement("button");
      btn.className = "skin-chip";
      if (state.selectedSkin === skin.id) btn.classList.add("selected");
      if (!owned) btn.classList.add("locked");
      if (state.selectedSkin === skin.id) {
        btn.innerHTML = "✅ " + skin.name;
      } else if (owned) {
        btn.innerHTML = skin.name;
      } else {
        btn.innerHTML = "🔒 " + skin.name + " · " + fmtMoney(skin.price);
        if (state.coins < skin.price) btn.disabled = true;
      }
      btn.addEventListener("click", function () {
        if (!owned) { buySkin(skin); return; }
        state.selectedSkin = skin.id;
        saveState();
        if (skinsCtrl && skinsCtrl.setSkin) skinsCtrl.setSkin(skin.id);
        renderSkins();
        bigMessage("🎀 ¡Ahora eres " + skin.name + "!", 1200);
      });
      grid.appendChild(btn);
    });
  }

  function buySkin(skin) {
    if (skinOwned(skin.id)) return;
    if (state.coins < skin.price) {
      bigMessage("😢 No te alcanza para " + skin.name + ".<br>Gana monedas en la Carrera 🏃", 1700);
      return;
    }
    state.coins -= skin.price;
    state.ownedSkins.push(skin.id);
    state.selectedSkin = skin.id;
    saveState();
    if (skinsCtrl && skinsCtrl.setSkin) skinsCtrl.setSkin(skin.id);
    renderSkins();
    bigMessage("✨ ¡Compraste " + skin.name + "! 🎀", 1600);
  }

  /* ============================================================
     PODERES - tienda
     ============================================================ */
  function renderPowers() {
    var grid = $("powersGrid");
    grid.innerHTML = "";
    POWERS.forEach(function (power) {
      var card = document.createElement("div");
      card.className = "power-card";
      var ico = document.createElement("div");
      ico.className = "power-ico";
      ico.textContent = power.ico;
      var name = document.createElement("div");
      name.className = "power-name";
      name.textContent = power.name;
      var price = document.createElement("div");
      price.className = "power-price";
      price.textContent = power.price === 0 ? "¡GRATIS! 🎉" : "Precio: " + fmtMoney(power.price);
      var btn = document.createElement("button");
      btn.className = "card-btn";
      var owned = state.ownedPowers.indexOf(power.id) >= 0;
      if (owned) {
        btn.textContent = "✅ Comprado";
        btn.classList.add("owned");
        btn.disabled = true;
      } else {
        btn.textContent = "Comprar";
        btn.disabled = state.coins < power.price;
        btn.addEventListener("click", function () { buyPower(power); });
      }
      card.appendChild(ico);
      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function buyPower(power) {
    if (state.ownedPowers.indexOf(power.id) >= 0) return;
    if (state.coins < power.price) {
      bigMessage("😢 No te alcanza.<br>Gana monedas en la Carrera 🏃", 1600);
      return;
    }
    state.coins -= power.price;
    state.ownedPowers.push(power.id);
    saveState();
    renderPowers();
    bigMessage("✨ ¡Compraste " + power.name + "! " + power.ico, 1500);
  }

  /* ============================================================
     MODO MEDIO — ENFRENTAMIENTO
     ============================================================ */
  function initEnfrentamiento() {
    $("enfrentamientoResult").classList.add("hidden");
    $("btnEnfrentamientoRetry").classList.add("hidden");
    $("btnEnfrentamientoOtra").classList.add("hidden");
    $("enfrentamientoRange").classList.add("hidden");
    $("enfrentamientoInfo").textContent = "¡Corta la cabeza del monstruo morado cuando esté cerca! 🔪";
    $("enfrentamientoTimer").textContent = "12";

    enfrentamientoCtrl = ATScenes.go("enfrentamiento", {
      skinId: state.selectedSkin,
      onHud: function (time, inRange) {
        $("enfrentamientoTimer").textContent = time;
        $("enfrentamientoRange").classList.toggle("hidden", !inRange);
      },
      onWin: function () {
        state.medioEnfrentamientoWon = true;
        state.coins += 500;
        saveState();
        $("enfrentamientoResultText").textContent = "🏆 ¡Le cortaste la cabeza! +500 monedas 💰";
        $("enfrentamientoResult").classList.remove("hidden");
        $("btnEnfrentamientoOtra").classList.remove("hidden");
        $("enfrentamientoInfo").textContent = "¡Lo lograste! Ahora puedes jugar Pintar Igual 🎨";
        bigMessage("✂️ ¡CABEZA CORTADA! 🎉<br><span style='font-size:20px'>+500 monedas</span>", 2200);
      },
      onLose: function () {
        state.coins = Math.max(0, state.coins - 1000);
        saveState();
        showScare(2800, "BU BU BU", "terror-funny");
        setTimeout(function () {
          bigMessage(
            "😱 <b>PIERDES</b><br><span style='font-size:20px'>-1000 puntos 💸</span><br><br>💻 Inténtalo otra vez",
            0
          );
        }, 1200);
        $("enfrentamientoResultText").textContent = "PIERDES — -1000 puntos 😱";
        $("enfrentamientoResult").classList.remove("hidden");
        $("btnEnfrentamientoRetry").classList.remove("hidden");
        $("enfrentamientoInfo").textContent = "No llegaste a tiempo... ¡Inténtalo otra vez!";
      }
    });
  }

  function doKnifeAttack() {
    var btn = $("btnKnifeAttack");
    if (btn) {
      btn.classList.remove("swing");
      void btn.offsetWidth;
      btn.classList.add("swing");
    }
    if (enfrentamientoCtrl && enfrentamientoCtrl.tryAttack) enfrentamientoCtrl.tryAttack();
  }

  /* ============================================================
     MODO MEDIO — CARRERA META
     ============================================================ */
  function initCarreraMeta() {
    $("carrerametaOver").classList.add("hidden");
    $("btnCarrerametaRetry").classList.add("hidden");
    $("carrerametaInfo").textContent = "¡Corre hasta la meta! Salta obstáculos y agarra cajitas 📦";
    $("carrerametaBoxes").textContent = "0/5";
    $("carrerametaDist").textContent = "0";

    carrerametaCtrl = ATScenes.go("carrerameta", {
      skinId: state.selectedSkin,
      onHud: function (grabbed, total, dist) {
        $("carrerametaBoxes").textContent = grabbed + "/" + total;
        $("carrerametaDist").textContent = dist;
      },
      onFinish: function (reason, grabbed, total) {
        var msg;
        if (reason === "meta") {
          var bonus = 200 + grabbed * 100;
          state.coins += bonus;
          saveState();
          msg = "🏁 ¡LLEGASTE A LA META! +" + fmtMoney(bonus) + " 🎉";
          bigMessage("🏁 ¡META! 🎉<br>Cajitas: " + grabbed + "/" + total, 2000);
        } else {
          msg = "😱 ¡Te atrapó el monstruo! PIERDES";
          showScare(2000, "BU BU BU", "terror-funny");
        }
        $("carrerametaResult").textContent = msg;
        $("carrerametaOver").classList.remove("hidden");
        $("btnCarrerametaRetry").classList.remove("hidden");
      }
    });
  }

  function runnerJump() {
    if (carrerametaCtrl && carrerametaCtrl.jump) carrerametaCtrl.jump();
  }

  /* ============================================================
     MODO MEDIO — PINTAR IGUAL
     ============================================================ */
  var PAINT_SHAPES = ["circle", "star", "face", "blob"];

  function initPintar() {
    $("pintarResult").classList.add("hidden");
    $("btnPintarOtra").classList.add("hidden");
    if (!state.medioEnfrentamientoWon) {
      $("pintarInfo").textContent = "⚠️ Primero debes pasar Enfrentamiento (Nivel 1)";
    } else {
      $("pintarInfo").textContent = "Copia la figura del monstruo en tu lienzo ✏️";
    }

    pintarCtrl = ATScenes.go("pintar", {});

    currentPaintShape = pick(PAINT_SHAPES);
    var refColor = pick(["#e0241b", "#b388ff", "#ff79c6", "#4db8ff", "#ffd54f"]);
    paintColor = refColor;
    drawPaintRef(currentPaintShape, refColor);
    clearPaintDraw();
    updatePaintColorUI();
  }

  function drawPaintRef(shape, color) {
    var canvas = $("paintRef");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    var cx = w / 2, cy = h / 2;
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "star") {
      drawStar(ctx, cx, cy, 5, 52, 22);
      ctx.fill();
    } else if (shape === "face") {
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(cx - 18, cy - 10, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 18, cy - 10, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(cx - 18, cy - 10, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 18, cy - 10, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy + 12, 22, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy);
      ctx.bezierCurveTo(cx - 50, cy - 55, cx + 50, cy - 45, cx + 42, cy + 10);
      ctx.bezierCurveTo(cx + 30, cy + 55, cx - 30, cy + 50, cx - 40, cy);
      ctx.fill();
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    var rot = Math.PI / 2 * 3;
    var step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (var i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }

  function clearPaintDraw() {
    var canvas = $("paintDraw");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function updatePaintColorUI() {
    Array.prototype.slice.call(document.querySelectorAll(".paint-color")).forEach(function (btn) {
      btn.classList.toggle("selected", btn.dataset.color === paintColor);
    });
  }

  function paintAt(canvas, x, y) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = paintColor;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function getCanvasPos(canvas, e) {
    var r = canvas.getBoundingClientRect();
    var sx = canvas.width / r.width;
    var sy = canvas.height / r.height;
    var cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    var cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
  }

  function bindPaintCanvas() {
    var canvas = $("paintDraw");
    if (!canvas) return;
    function start(e) { e.preventDefault(); paintDrawing = true; paintAt(canvas, getCanvasPos(canvas, e).x, getCanvasPos(canvas, e).y); }
    function move(e) {
      if (!paintDrawing) return;
      e.preventDefault();
      var p = getCanvasPos(canvas, e);
      paintAt(canvas, p.x, p.y);
    }
    function end() { paintDrawing = false; }
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointerleave", end);
  }

  function comparePaintCanvases() {
    if (!state.medioEnfrentamientoWon) {
      bigMessage(
        "⚠️ Tienes que pasar por el primer nivel<br><span style='font-size:18px'>¡Juega <b>Enfrentamiento</b> primero!</span>",
        3200
      );
      setTimeout(function () { showScreen("enfrentamiento"); }, 1500);
      return;
    }
    var ref = $("paintRef");
    var draw = $("paintDraw");
    if (!ref || !draw) return;
    var size = 32;
    var tmpRef = document.createElement("canvas");
    var tmpDraw = document.createElement("canvas");
    tmpRef.width = tmpDraw.width = size;
    tmpRef.height = tmpDraw.height = size;
    tmpRef.getContext("2d").drawImage(ref, 0, 0, size, size);
    tmpDraw.getContext("2d").drawImage(draw, 0, 0, size, size);
    var refData = tmpRef.getContext("2d").getImageData(0, 0, size, size).data;
    var drawData = tmpDraw.getContext("2d").getImageData(0, 0, size, size).data;
    var refFilled = 0, drawFilled = 0, overlap = 0;
    for (var i = 0; i < refData.length; i += 4) {
      var rFill = refData[i] < 240 || refData[i + 1] < 240 || refData[i + 2] < 240;
      var dFill = drawData[i] < 240 || drawData[i + 1] < 240 || drawData[i + 2] < 240;
      if (rFill) refFilled++;
      if (dFill) drawFilled++;
      if (rFill && dFill) overlap++;
    }
    var score = refFilled > 0 ? overlap / refFilled : 0;
    var drawRatio = refFilled > 0 ? drawFilled / refFilled : 0;
    var passed = score >= 0.35 && drawRatio >= 0.25 && drawRatio <= 2.5;

    if (passed) {
      state.coins += 800;
      saveState();
      $("pintarResultText").textContent = "🎨 ¡Lo pintaste igual! +800 monedas";
      $("pintarResult").classList.remove("hidden");
      $("btnPintarOtra").classList.remove("hidden");
      bigMessage("🎨 ¡Lo pintaste igual! 🎉<br>+800 monedas 💰", 2500);
    } else {
      $("pintarResultText").textContent = "😅 No quedó igual... ¡Inténtalo otra vez!";
      $("pintarResult").classList.remove("hidden");
      bigMessage("😅 Casi... pinta más parecido a la figura", 2200);
    }
  }

  /* ============================================================
     ENTRADA / EVENTOS
     ============================================================ */
  function bindEvents() {
    $("btnJugar").addEventListener("click", function () { showScreen("tema"); });

    var introOv = $("introOverlay");
    if (introOv) introOv.addEventListener("click", skipIntro);
    var gl = $("gl");
    if (gl) gl.addEventListener("click", function () {
      if (currentScreen === "inicio") skipIntro();
    });

    $("btnTemaTerror").addEventListener("click", function () { setTheme("terror"); showScreen("menu"); });
    $("btnTemaGracioso").addEventListener("click", function () { setTheme("gracioso"); showScreen("menu"); });
    $("btnTemaMedio").addEventListener("click", function () { setTheme("medio"); showScreen("menu"); });

    Array.prototype.slice.call(document.querySelectorAll(".menu-card")).forEach(function (card) {
      card.addEventListener("click", function () { showScreen(card.dataset.go); });
    });
    $("btnCambiarTema").addEventListener("click", function () { showScreen("tema"); });
    $("btnCambiarTemaMedio").addEventListener("click", function () { showScreen("tema"); });

    $("btnHome").addEventListener("click", function () { screenHistory = []; showScreen("inicio", true); });
    $("btnBack").addEventListener("click", goBack);

    $("btnPuertasOtra").addEventListener("click", initPuertas);
    $("btnEsconditeOtra").addEventListener("click", initEscondite);
    $("btnEsconditeComida").addEventListener("click", function () {
      if (esconditeCtrl && esconditeCtrl.dropFood) {
        var ok = esconditeCtrl.dropFood();
        $("esconditeStatus").textContent = ok
          ? "🍔 ¡Tiraste comida! El buscador va hacia ella 😋"
          : "Espera a que se acabe la comida anterior...";
      }
    });
    $("btnCarreraOtra").addEventListener("click", initCarrera);
    $("btnPreguntasOtra").addEventListener("click", initPreguntas);

    $("btnKnifeAttack").addEventListener("click", doKnifeAttack);
    $("btnEnfrentamientoRetry").addEventListener("click", function () { hideBigMessage(); initEnfrentamiento(); });
    $("btnEnfrentamientoOtra").addEventListener("click", initEnfrentamiento);

    $("btnRunnerJump").addEventListener("pointerdown", function (e) { e.preventDefault(); runnerJump(); });
    $("btnCarrerametaRetry").addEventListener("click", initCarreraMeta);

    $("btnPaintCheck").addEventListener("click", comparePaintCanvases);
    $("btnPaintClear").addEventListener("click", clearPaintDraw);
    $("btnPintarOtra").addEventListener("click", initPintar);
    Array.prototype.slice.call(document.querySelectorAll(".paint-color")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        paintColor = btn.dataset.color;
        updatePaintColorUI();
      });
    });
    bindPaintCanvas();

    $("bigMsg").addEventListener("click", hideBigMessage);
    $("scareOverlay").addEventListener("click", hideScare);

    bindDpad();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  }

  function bindDpad() {
    var dpads = document.querySelectorAll(".dpad");
    Array.prototype.slice.call(dpads).forEach(function (pad) {
      var dir = pad.dataset.dir;
      pad.addEventListener("pointerdown", function (e) { e.preventDefault(); if (window.ATScenes) ATScenes.setMove(dir, true); });
      pad.addEventListener("pointerup", function (e) { e.preventDefault(); if (window.ATScenes) ATScenes.setMove(dir, false); });
      pad.addEventListener("pointerleave", function () { if (window.ATScenes) ATScenes.setMove(dir, false); });
      pad.addEventListener("pointercancel", function () { if (window.ATScenes) ATScenes.setMove(dir, false); });
    });
  }

  var KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right"
  };
  function movableScreen() {
    return currentScreen === "carrera" || currentScreen === "escondite" || currentScreen === "carrerameta";
  }
  function onKeyDown(e) {
    if (KEYMAP[e.key] && movableScreen()) { e.preventDefault(); ATScenes.setMove(KEYMAP[e.key], true); }
    if ((e.key === " " || e.key === "ArrowUp") && currentScreen === "carrerameta") {
      e.preventDefault();
      runnerJump();
    }
    if ((e.key === " " || e.key === "Enter") && currentScreen === "enfrentamiento") {
      e.preventDefault();
      doKnifeAttack();
    }
  }
  function onKeyUp(e) {
    if (KEYMAP[e.key] && movableScreen()) ATScenes.setMove(KEYMAP[e.key], false);
  }

  /* ============================================================
     ARRANQUE
     ============================================================ */
  function init() {
    if (window.ATScenes) ATScenes.init($("gl"));
    bindEvents();
    updateTopbar();
    setTheme("none");
    showScreen("inicio", true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
