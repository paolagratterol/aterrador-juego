/* ============================================================
   ATERRADOR 3D - Manager de render + escenas por modo (three.js)
   Un solo WebGLRenderer reutilizado. Expone window.ATScenes
   ============================================================ */
(function () {
  "use strict";

  var T = window.THREE;
  var M = window.ATModels;

  var renderer, clock, canvas;
  var current = null;
  var theme = "none";
  var raf = null;
  var raycaster = new T.Raycaster();
  var ndc = new T.Vector2();

  /* ---------- Manager ---------- */
  function init(canvasEl) {
    canvas = canvasEl;
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    clock = new T.Clock();
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    if (renderer) renderer.setSize(w, h, false);
    if (current && current.onResize) current.onResize(w, h);
  }

  function getNDC(e) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    return ndc;
  }
  function onPointerDown(e) {
    if (!current) return;
    getNDC(e);
    if (current.onPointerDown) {
      raycaster.setFromCamera(ndc, current.camera);
      current.onPointerDown(raycaster, ndc, e);
    }
  }
  function onPointerMove(e) {
    if (!current || !current.onPointerMove) return;
    getNDC(e);
    raycaster.setFromCamera(ndc, current.camera);
    current.onPointerMove(raycaster, ndc, e);
  }
  function onPointerUp(e) {
    if (current && current.onPointerUp) current.onPointerUp(e);
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    var dt = clock.getDelta();
    if (dt > 0.05) dt = 0.05;
    if (current && current.update) current.update(dt);
    if (current) renderer.render(current.scene, current.camera);
  }

  function disposeScene(scene) {
    if (!scene) return;
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
  }

  function activate(controller) {
    stop();
    current = controller;
    show();
    resize();
    if (!raf) loop();
  }
  function stop() {
    if (current) {
      if (current.dispose) current.dispose();
      disposeScene(current.scene);
      current = null;
    }
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }
  function show() { canvas.style.display = "block"; }
  function hide() { canvas.style.display = "none"; }
  function setTheme(t) { theme = t; }
  function setMove(dir, val) { if (current && current.setMove) current.setMove(dir, val); }
  function clearMove() { if (current && current.clearMove) current.clearMove(); }

  /* ---------- Utilidades de escena ---------- */
  function newScene() {
    var scene = new T.Scene();
    M.applyTheme(scene, theme);
    M.standardLights(scene, theme);
    return scene;
  }
  function groundPlane(scene, color, size) {
    var g = new T.Mesh(new T.PlaneGeometry(size || 60, size || 60), M._mat(color, { roughness: 0.95 }));
    g.rotation.x = -Math.PI / 2;
    scene.add(g);
    return g;
  }
  function addFloatingBalloons(scene, n) {
    var arr = [];
    var colors = ["#ff5fa2", "#4db8ff", "#ffd54f", "#b388ff", "#69f0ae"];
    for (var i = 0; i < n; i++) {
      var b = M.buildBalloon(colors[i % colors.length]);
      b.position.set((Math.random() - 0.5) * 24, 3 + Math.random() * 6, -4 - Math.random() * 14);
      b.userData.phase = Math.random() * Math.PI * 2;
      b.userData.baseY = b.position.y;
      scene.add(b);
      arr.push(b);
    }
    return arr;
  }

  /* ============================================================
     INTRO: muñeca girando
     ============================================================ */
  function buildIntro(opts) {
    var scene = newScene();
    groundPlane(scene, theme === "gracioso" ? "#ffd6f0" : (theme === "terror" ? "#1a0a25" : "#2b1055"));
    var doll = M.buildDoll(opts.skinId || "muneca");
    scene.add(doll);
    var balloons = theme === "gracioso" ? addFloatingBalloons(scene, 8) : [];
    var camera = new T.PerspectiveCamera(50, 1, 0.1, 100);

    var c = {
      scene: scene, camera: camera, doll: doll, balloons: balloons, t: 0,
      onResize: function (w, h) {
        camera.aspect = w / h;
        camera.position.set(0, 1.25, w / h < 0.8 ? 5.2 : 4.2);
        camera.lookAt(0, 1.05, 0);
        camera.updateProjectionMatrix();
      },
      update: function (dt) {
        c.t += dt;
        doll.rotation.y += dt * 0.7;
        doll.position.y = Math.sin(c.t * 1.6) * 0.06;
        if (doll.userData.tick) doll.userData.tick(dt, c.t);
        balloons.forEach(function (b) {
          b.position.y = b.userData.baseY + Math.sin(c.t + b.userData.phase) * 0.4;
        });
      }
    };
    return c;
  }

  /* ============================================================
     SKINS: carrusel 3D de la skin actual
     ============================================================ */
  function buildSkins(opts) {
    var scene = newScene();
    groundPlane(scene, theme === "gracioso" ? "#ffe0f5" : "#2b1055", 40);
    var pedestal = M._cyl(1.0, 1.2, 0.3, theme === "gracioso" ? "#ff9ed6" : "#7c4dff");
    pedestal.position.y = 0.15;
    scene.add(pedestal);
    var holder = new T.Group();
    holder.position.y = 0.3;
    scene.add(holder);
    var camera = new T.PerspectiveCamera(50, 1, 0.1, 100);
    var doll = M.buildDoll(opts.skinId || "muneca");
    holder.add(doll);

    var c = {
      scene: scene, camera: camera, holder: holder, t: 0,
      setSkin: function (id) {
        holder.remove(doll);
        disposeObject(doll);
        doll = M.buildDoll(id);
        holder.add(doll);
      },
      onResize: function (w, h) {
        camera.aspect = w / h;
        camera.position.set(0, 1.5, w / h < 0.8 ? 5.4 : 4.4);
        camera.lookAt(0, 1.1, 0);
        camera.updateProjectionMatrix();
      },
      update: function (dt) {
        c.t += dt;
        holder.rotation.y += dt * 0.9;
        if (doll.userData.tick) doll.userData.tick(dt, c.t);
      }
    };
    return c;
  }

  function disposeObject(obj) {
    obj.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  }

  /* ============================================================
     PUERTAS: 30 puertas, click abre y aparece monstruo
     ============================================================ */
  function buildPuertas(opts) {
    var scene = newScene();
    groundPlane(scene, theme === "gracioso" ? "#ffd6f0" : (theme === "terror" ? "#150018" : "#241046"));
    // pared de fondo
    var wall = new T.Mesh(new T.PlaneGeometry(40, 24), M._mat(theme === "gracioso" ? "#ffb3e0" : (theme === "terror" ? "#1c0030" : "#33205c")));
    wall.position.set(0, 4, -1.2);
    scene.add(wall);

    var cols = 6, rows = 5, cellW = 1.35, cellH = 1.85;
    var doors = [];
    var group = new T.Group();
    scene.add(group);
    for (var i = 0; i < 30; i++) {
      var col = i % cols, row = Math.floor(i / cols);
      var tex = M.numberTexture(i + 1);
      var d = M.buildDoor(tex);
      var cx = (col - (cols - 1) / 2) * cellW;
      var cyCenter = (rows - 1 - row) * cellH + 1.0;
      d.position.set(cx, cyCenter - 0.75, 0);
      group.add(d);
      doors.push({ obj: d, opened: false, monster: null, openT: 0, riseT: 0, cx: cx, cyBottom: cyCenter - 0.75 });
    }

    var camera = new T.PerspectiveCamera(50, 1, 0.1, 100);
    var gridW = cols * cellW, gridH = rows * cellH;
    var topY = (rows - 1) * cellH + 1.0;
    var bottomY = 1.0;
    var yC = (topY + bottomY) / 2;
    var extentH = (topY - bottomY) + 1.55; // alto de puerta incluido

    // ---- SALA (cuarto detrás de la puerta) ----
    var SALA = new T.Vector3(200, 0, 0); // lejos del muro de puertas
    var sala = null;          // grupo de la sala actual
    var salaMon = null;       // monstruo de la sala
    var salaT = 0;            // tiempo dentro de la sala
    var inSala = false;
    var camNormal = { pos: new T.Vector3(), look: new T.Vector3(0, yC, 0) };
    var camTarget = { pos: new T.Vector3(), look: new T.Vector3() };
    var lerpK = 0;            // 0 = muro, 1 = sala

    var c = {
      scene: scene, camera: camera, doors: doors, inSala: false,
      onResize: function (w, h) {
        var aspect = w / h;
        camera.aspect = aspect;
        var fov = 50 * Math.PI / 180;
        var distH = (extentH / 2) / Math.tan(fov / 2);
        var distW = ((gridW + 1) / 2) / (Math.tan(fov / 2) * aspect);
        var dist = Math.max(distH, distW) * 1.08 + 1;
        camNormal.pos.set(0, yC, dist);
        camNormal.look.set(0, yC, 0);
        if (!inSala) { camera.position.copy(camNormal.pos); camera.lookAt(camNormal.look); }
        camera.updateProjectionMatrix();
      },
      onPointerDown: function (ray) {
        if (inSala) { exitSala(); return; }   // tocar para volver
        var meshes = [];
        doors.forEach(function (dd) { if (!dd.opened) dd.obj.traverse(function (o) { if (o.isMesh) { o.userData._door = dd; meshes.push(o); } }); });
        var hits = ray.intersectObjects(meshes, false);
        if (hits.length) {
          var dd = hits[0].object.userData._door;
          if (dd && !dd.opened) openDoor(dd);
        }
      },
      update: function (dt) {
        doors.forEach(function (dd) {
          if (dd.opened) {
            if (dd.openT < 1) {
              dd.openT = Math.min(1, dd.openT + dt * 2.2);
              dd.obj.userData.panel.rotation.y = -dd.openT * Math.PI * 0.62;
            }
            if (dd.monster) {
              dd.riseT = Math.min(1, dd.riseT + dt * 2.2);
              var s = 0.78 * dd.riseT;
              dd.monster.scale.set(s, s, s);
              dd.monster.position.z = 0.2 + dd.riseT * 0.5;
              dd.monster.rotation.y += dt * 0.6;
              M.updateMonsterScare(dd.monster, dt, salaT + dd.cx);
            }
          }
        });

        // transición de cámara muro <-> sala
        var goal = inSala ? 1 : 0;
        lerpK += (goal - lerpK) * Math.min(1, dt * 3.2);
        if (lerpK > 0.001) {
          var p = new T.Vector3().lerpVectors(camNormal.pos, camTarget.pos, lerpK);
          var l = new T.Vector3().lerpVectors(camNormal.look, camTarget.look, lerpK);
          camera.position.copy(p);
          camera.lookAt(l);
        } else {
          camera.position.copy(camNormal.pos);
          camera.lookAt(camNormal.look);
        }

        if (inSala && sala) {
          salaT += dt;
          animateSala(dt);
        }
      },
      dispose: function () { if (sala) { scene.remove(sala); disposeObject(sala); sala = null; } }
    };

    function openDoor(dd) {
      dd.opened = true;
      var info = opts.pickMonster();
      var mon = M.buildMonster(info.id, theme);
      mon.position.set(dd.cx, dd.cyBottom + 0.05, 0.2);
      mon.scale.set(0.01, 0.01, 0.01);
      scene.add(mon);
      dd.monster = mon;
      if (opts.onReveal) opts.onReveal(info, dd);
      // entrar a la sala detrás de la puerta
      var action = opts.pickSala ? opts.pickSala() : "sonreir";
      enterSala(info, action);
    }

    function enterSala(info, action) {
      if (sala) { scene.remove(sala); disposeObject(sala); sala = null; }
      sala = new T.Group();
      sala.position.copy(SALA);
      scene.add(sala);

      var room = M.buildRoom(theme);
      sala.add(room);

      // monstruo de la sala
      salaMon = M.buildMonster(info.id, theme);
      salaMon.position.set(0.6, 0, -0.6);
      salaMon.rotation.y = -0.4;
      sala.add(salaMon);

      // otra muñequita que se asusta
      var little = M.buildLittleDoll(theme === "gracioso" ? "#4db8ff" : "#ff5fa2");
      little.position.set(-1.5, 0, 0.4);
      little.rotation.y = 0.5;
      sala.add(little);
      sala.userData.little = little;
      sala.userData.action = action;

      // props según la acción
      if (action === "computadora") {
        var pc = M.buildComputer();
        pc.position.set(0.6, 0, 0.2);
        salaMon.position.set(0.6, 0, -0.35);
        sala.add(pc);
        sala.userData.pc = pc;
      } else if (action === "comer") {
        var leg = M._cyl(0.08, 0.1, 0.5, "#ffd9b3");
        leg.rotation.x = 0.6;
        leg.position.set(0.6, 0.5, 0.2);
        sala.add(leg);
        sala.userData.leg = leg;
        // sangre caricatura
        sala.add(M._pos(M._sph(0.05, "#b3001b"), 0.5, 0.35, 0.35));
      } else if (action === "asustar") {
        if (salaMon.userData.scare) salaMon.userData.scare();
      }

      // cámara objetivo dentro de la sala
      camTarget.pos.set(SALA.x, 1.7, SALA.z + 4.2);
      camTarget.look.set(SALA.x, 1.0, SALA.z - 0.5);

      salaT = 0;
      inSala = true;
      c.inSala = true;
      if (opts.onSala) opts.onSala(info, action);
    }

    function exitSala() {
      inSala = false;
      c.inSala = false;
      if (opts.onSalaExit) opts.onSalaExit();
      // la sala se elimina cuando la cámara ya volvió
      setTimeout(function () {
        if (!inSala && sala) { scene.remove(sala); disposeObject(sala); sala = null; salaMon = null; }
      }, 700);
    }

    function animateSala(dt) {
      var little = sala.userData.little;
      if (little) {
        // tiembla del susto
        little.position.x = -1.5 + Math.sin(salaT * 30) * 0.04;
        little.rotation.z = Math.sin(salaT * 18) * 0.08;
      }
      M.updateMonsterScare(salaMon, dt, salaT);
      var act = sala.userData.action;
      if (act === "comer" && sala.userData.leg) {
        salaMon.rotation.x = Math.sin(salaT * 6) * 0.12; // mastica
      } else if (act === "computadora" && sala.userData.pc) {
        var scr = sala.userData.pc.userData.screen;
        if (scr) scr.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(salaT * 5)) * 0.6;
        salaMon.position.y = Math.sin(salaT * 3) * 0.03;
      } else if (act === "sonreir") {
        salaMon.rotation.y = -0.4 + Math.sin(salaT * 2) * 0.3;
        salaMon.position.y = Math.abs(Math.sin(salaT * 3)) * 0.08;
      } else if (act === "asustar") {
        // se abalanza hacia la cámara
        var lunge = Math.max(0, Math.sin(salaT * 2.2));
        salaMon.position.z = -0.6 + lunge * 1.6;
        salaMon.scale.setScalar(1 + lunge * 0.4);
      }
    }

    return c;
  }

  /* ============================================================
     ESCONDITE: jardín, mover personaje, esconderse, buscador
     ============================================================ */
  function buildEscondite(opts) {
    var scene = newScene();
    var minX = -7, maxX = 7, minZ = -5, maxZ = 5;
    var ground = groundPlane(scene, theme === "terror" ? "#16240e" : "#7cb342", 40);

    // bordes/cerca simple
    var fenceMat = M._mat(theme === "terror" ? "#0d1508" : "#5a8a2b");

    // arbustos y escondites
    var positions = [
      [-5.5, -3], [0, -3.5], [5.5, -3],
      [-6, 0.5], [3.5, 0.5], [6, 1.2],
      [-4, 3], [0.5, 3], [5, 3.2]
    ];
    var lit = {};
    var litCount = 3 + Math.floor(Math.random() * 3);
    while (Object.keys(lit).length < litCount) lit[Math.floor(Math.random() * positions.length)] = true;

    var spots = [];
    positions.forEach(function (p, idx) {
      var bush;
      if (Math.random() < 0.3) bush = M.buildGardenBall();
      else bush = M.buildBush();
      bush.position.set(p[0], 0, p[1]);
      scene.add(bush);
      var spot = { x: p[0], z: p[1], lit: !!lit[idx], glow: null, light: null, used: false };
      if (spot.lit) {
        var ring = new T.Mesh(new T.TorusGeometry(0.7, 0.07, 8, 24), new T.MeshBasicMaterial({ color: 0x00ff66 }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(p[0], 0.06, p[1]);
        scene.add(ring);
        var gl = new T.PointLight(0x00ff66, 1.2, 6);
        gl.position.set(p[0], 1.2, p[1]);
        scene.add(gl);
        spot.glow = ring; spot.light = gl;
      }
      spots.push(spot);
    });

    var player = M.buildDoll(opts.skinId || "muneca");
    player.scale.set(0.7, 0.7, 0.7);
    player.position.set(0, 0, 4);
    scene.add(player);

    var seeker = M.buildMonster(theme === "gracioso" ? "payaso" : (Math.random() < 0.4 ? "aterrador" : "ojos"), theme);
    seeker.position.set(0, 0, -3);
    seeker.userData.target = new T.Vector3(0, 0, -3);
    scene.add(seeker);

    // PODER: torre para esconderse (escondite extra garantizado)
    var powers = opts.powers || {};
    if (powers.torre) {
      var tower = M.buildTower(theme);
      tower.position.set(0, 0, 0.5);
      scene.add(tower);
      spots.push({ x: 0, z: 0.5, lit: true, glow: null, light: null, used: false, tower: true });
      var tring = new T.Mesh(new T.TorusGeometry(0.8, 0.08, 8, 24), new T.MeshBasicMaterial({ color: 0x00ff66 }));
      tring.rotation.x = -Math.PI / 2; tring.position.set(0, 0.06, 0.5);
      scene.add(tring);
      spots[spots.length - 1].glow = tring;
    }

    // PODER: comida (snack) que distrae al buscador
    var food = null;

    var camera = new T.PerspectiveCamera(55, 1, 0.1, 120);
    var keys = {};
    var target = null;
    var groundV = new T.Vector3();

    var c = {
      scene: scene, camera: camera, ended: false, hidden: false, idle: 0, t: 0, seekTimer: 0, dance: 0,
      onResize: function (w, h) {
        camera.aspect = w / h;
        camera.position.set(0, w / h < 0.8 ? 11 : 9, w / h < 0.8 ? 11 : 9.5);
        camera.lookAt(0, 0, -0.5);
        camera.updateProjectionMatrix();
      },
      setMove: function (dir, val) { keys[dir] = val; target = null; if (val) c.idle = 0; },
      clearMove: function () { keys = {}; },
      dropFood: function () {
        if (food || c.ended) return false;
        food = M.buildSnack();
        food.position.set(player.position.x, 0, player.position.z + 0.8);
        food.userData.timer = 6;
        scene.add(food);
        // el buscador va corriendo hacia la comida
        seeker.userData.target.set(food.position.x, 0, food.position.z);
        seeker.userData.distracted = 5;
        return true;
      },
      onPointerDown: function (ray) {
        var hit = ray.intersectObject(ground, false);
        if (hit.length) { target = hit[0].point.clone(); keys = {}; c.idle = 0; }
      },
      update: function (dt) {
        c.t += dt;
        if (player.userData.tick) player.userData.tick(dt, c.t);
        M.updateMonsterScare(seeker, dt, c.t);
        if (food) {
          food.rotation.y += dt * 2;
          food.position.y = 0.05 + Math.abs(Math.sin(c.t * 4)) * 0.05;
          food.userData.timer -= dt;
          if (food.userData.timer <= 0) { scene.remove(food); disposeObject(food); food = null; }
        }
        if (seeker.userData.distracted > 0) seeker.userData.distracted -= dt;
        // brillo verde
        spots.forEach(function (s) {
          if (s.glow && !s.used) {
            var k = 0.5 + 0.5 * Math.sin(c.t * 4);
            s.glow.material.color.setRGB(0, 0.4 + 0.6 * k, 0.25 + 0.2 * k);
            if (s.light) s.light.intensity = 0.6 + k;
          }
        });
        if (c.ended) return;

        // mover jugador
        var sp = 5.0, vx = 0, vz = 0;
        if (keys.up) vz -= 1;
        if (keys.down) vz += 1;
        if (keys.left) vx -= 1;
        if (keys.right) vx += 1;
        if (target) {
          var tdx = target.x - player.position.x, tdz = target.z - player.position.z;
          var dd = Math.sqrt(tdx * tdx + tdz * tdz);
          if (dd > 0.15) { vx += tdx / dd; vz += tdz / dd; c.idle = 0; }
          else target = null;
        }
        var vlen = Math.sqrt(vx * vx + vz * vz);
        if (vlen > 0.01 && !c.hidden) {
          vx /= vlen; vz /= vlen;
          player.position.x = Math.max(minX, Math.min(maxX, player.position.x + vx * sp * dt));
          player.position.z = Math.max(minZ, Math.min(maxZ, player.position.z + vz * sp * dt));
          player.rotation.y = Math.atan2(vx, vz);
          c.idle = 0;
        } else {
          c.idle += dt;
        }
        player.position.y = Math.abs(Math.sin(c.t * 6)) * 0.05 * (vlen > 0.01 ? 1 : 0);

        // esconderse
        if (!c.hidden) {
          spots.forEach(function (s) {
            if (s.lit && !s.used) {
              var dx = s.x - player.position.x, dz = s.z - player.position.z;
              if (dx * dx + dz * dz < 1.0) {
                c.hidden = true; s.used = true;
                if (s.glow) { scene.remove(s.glow); s.glow.geometry.dispose(); s.glow.material.dispose(); s.glow = null; }
                if (s.light) { scene.remove(s.light); s.light = null; }
                player.scale.set(0.35, 0.35, 0.35);
                player.position.set(s.x, 0, s.z);
                c.idle = 0;
                if (opts.onStatus) opts.onStatus("¡Bien escondida! Quédate atenta... 🤫");
              }
            }
          });
        }

        // buscador
        if (c.dance > 0) {
          c.dance += dt;
          seeker.rotation.z = Math.sin(c.t * 12) * 0.4;
          seeker.position.y = Math.abs(Math.sin(c.t * 10)) * 0.3;
        } else {
          var st = seeker.userData.target;
          var sdx = st.x - seeker.position.x, sdz = st.z - seeker.position.z;
          var sdist = Math.sqrt(sdx * sdx + sdz * sdz);
          if (sdist < 0.3) {
            if (seeker.userData.distracted <= 0) {
              seeker.userData.target.set(minX + Math.random() * (maxX - minX), 0, minZ + Math.random() * (maxZ - minZ));
            }
          } else {
            seeker.position.x += (sdx / sdist) * 2.4 * dt;
            seeker.position.z += (sdz / sdist) * 2.4 * dt;
            seeker.rotation.y = Math.atan2(sdx, sdz);
          }
          // encontrar (no si está distraído con la comida)
          if (c.hidden && seeker.userData.distracted <= 0) {
            var fdx = seeker.position.x - player.position.x, fdz = seeker.position.z - player.position.z;
            if (fdx * fdx + fdz * fdz < 2.2) found();
          }
        }

        // quieto demasiado tiempo
        if (!c.hidden && c.idle > 8) {
          c.ended = true;
          if (opts.onIdleOut) opts.onIdleOut();
        }
      }
    };

    function found() {
      c.ended = true;
      // el monstruo pone cara fea, abre la boca y se acerca corriendo
      if (seeker.userData.scare) seeker.userData.scare();
      seeker.position.set(player.position.x, 0, player.position.z + 1.4);
      seeker.lookAt(player.position.x, 0.5, player.position.z);
      seeker.scale.setScalar(1.3);
      if (theme === "gracioso") { c.dance = 0.001; }
      if (opts.onFound) opts.onFound(theme);
    }

    return c;
  }

  /* ============================================================
     CARRERA: runner 3D, monstruo persigue, cajitas
     ============================================================ */
  function buildCarrera(opts) {
    var scene = newScene();
    var bound = 7;
    var ground = groundPlane(scene, theme === "gracioso" ? "#ffe0f5" : (theme === "terror" ? "#1a0a25" : "#2d1b4e"), 40);
    if (theme === "gracioso") addFloatingBalloons(scene, 6);

    var runner = M.buildDoll(opts.skinId || "muneca");
    runner.scale.set(0.7, 0.7, 0.7);
    runner.position.set(0, 0, 5);
    scene.add(runner);

    var chaser = M.buildMonster(opts.monsterId, theme);
    chaser.position.set(0, 0, -6.5);
    scene.add(chaser);

    var powers = opts.powers || {};
    var speed = 4.2, chaserSpeed = 2.6;
    if (powers.fire) speed += 2.0;
    if (powers.fly) speed += 1.1;
    if (powers.invisible) chaserSpeed *= 0.55;
    if (powers.invisible) runner.traverse(function (o) { if (o.material) { o.material.transparent = true; o.material.opacity = 0.5; } });

    var total = opts.totalBoxes || 8;
    var boxes = [];
    for (var i = 0; i < total; i++) {
      var isPower = Math.floor(Math.random() * 3) === 0;
      var bg = new T.Group();
      var cube = M._box(0.5, 0.5, 0.5, isPower ? "#ff5fa2" : "#c8862b");
      bg.add(cube);
      if (isPower) {
        bg.add(M._pos(M._sph(0.12, "#ffd54f"), 0, 0.32, 0));
        bg.add(M._pos(M._box(0.55, 0.1, 0.1, "#ffd54f"), 0, 0.15, 0));
      }
      bg.position.set((Math.random() - 0.5) * (bound * 1.7), 0.4, (Math.random() - 0.5) * (bound * 1.7));
      scene.add(bg);
      boxes.push({ g: bg, grabbed: false, power: isPower ? opts.pickPower() : null });
    }

    var camera = new T.PerspectiveCamera(55, 1, 0.1, 150);
    var keys = {};
    var target = null;
    var camAspect = 1;

    var c = {
      scene: scene, camera: camera, over: false,
      time: 30, money: 0, grabbed: 0, hudTimer: 0, t: 0,
      onResize: function (w, h) { camAspect = w / h; camera.aspect = camAspect; camera.updateProjectionMatrix(); },
      setMove: function (dir, val) { keys[dir] = val; target = null; },
      clearMove: function () { keys = {}; },
      onPointerDown: function (ray) {
        var hit = ray.intersectObject(ground, false);
        if (hit.length) { target = hit[0].point.clone(); keys = {}; }
      },
      onPointerMove: function (ray, n, e) {
        if (e.buttons) { var hit = ray.intersectObject(ground, false); if (hit.length) { target = hit[0].point.clone(); keys = {}; } }
      },
      update: function (dt) {
        c.t += dt;
        if (runner.userData.tick) runner.userData.tick(dt, c.t);
        M.updateMonsterScare(chaser, dt, c.t);
        if (!c.over) {
          c.time -= dt;
          if (c.time <= 0) { c.time = 0; end("tiempo"); }
          c.hudTimer += dt;
          if (c.hudTimer > 0.2) { c.hudTimer = 0; hud(); }
        }
        // mover runner
        if (!c.over) {
          var vx = 0, vz = 0;
          if (keys.up) vz -= 1;
          if (keys.down) vz += 1;
          if (keys.left) vx -= 1;
          if (keys.right) vx += 1;
          if (target) {
            var tdx = target.x - runner.position.x, tdz = target.z - runner.position.z;
            var dd = Math.sqrt(tdx * tdx + tdz * tdz);
            if (dd > 0.2) { vx += tdx / dd; vz += tdz / dd; } else target = null;
          }
          var vl = Math.sqrt(vx * vx + vz * vz);
          if (vl > 0.01) {
            vx /= vl; vz /= vl;
            runner.position.x = clamp(runner.position.x + vx * speed * dt, -bound, bound);
            runner.position.z = clamp(runner.position.z + vz * speed * dt, -bound, bound);
            runner.rotation.y = Math.atan2(vx, vz);
            runner.position.y = Math.abs(Math.sin(c.t * 12)) * 0.08;
          }
          // chaser (con pequeña ventaja inicial de ~1.4s)
          var cdx = runner.position.x - chaser.position.x, cdz = runner.position.z - chaser.position.z;
          var cdist = Math.sqrt(cdx * cdx + cdz * cdz) || 1;
          if (c.t > 1.4) {
            chaser.position.x += (cdx / cdist) * chaserSpeed * dt;
            chaser.position.z += (cdz / cdist) * chaserSpeed * dt;
          }
          chaser.rotation.y = Math.atan2(cdx, cdz);
          // color/feo del "lindo" al perseguir
          if (chaser.userData.monsterId === "lindo" && chaser.userData.bodyMesh) {
            chaser.userData.bodyMesh.material.color.set(chaser.userData.uglyColor);
            chaser.userData.horns.forEach(function (hn) { hn.visible = true; });
          }
          // cajitas
          boxes.forEach(function (b) {
            if (b.grabbed) return;
            var bx = b.g.position.x - runner.position.x, bz = b.g.position.z - runner.position.z;
            if (bx * bx + bz * bz < 0.7) grab(b);
            b.g.rotation.y += dt * 2;
            b.g.position.y = 0.4 + Math.sin(c.t * 3 + b.g.position.x) * 0.1;
          });
          // atrapada
          if (cdist < 0.9 && !powers.fly) { if (chaser.userData.scare) chaser.userData.scare(); end("atrapado"); }
        }
        // camara sigue
        var cx = runner.position.x * 0.6;
        camera.position.set(cx, camAspect < 0.8 ? 10 : 8.5, runner.position.z + (camAspect < 0.8 ? 9 : 8));
        camera.lookAt(runner.position.x * 0.6, 0.5, runner.position.z - 1);
      }
    };

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function hud() {
      if (opts.onHud) opts.onHud(c.money, c.grabbed, total, Math.ceil(c.time));
    }
    function grab(b) {
      b.grabbed = true;
      scene.remove(b.g);
      disposeObject(b.g);
      c.grabbed++;
      var per = Math.floor(940000 / total);
      c.money += per - Math.floor(Math.random() * 2000);
      if (b.power && opts.onAwardPower) opts.onAwardPower(b.power);
      if (c.grabbed === total) { c.money = 940000; end("todas"); }
      hud();
    }
    function end(reason) {
      if (c.over) return;
      c.over = true;
      var earned;
      if (reason === "todas") earned = c.money;
      else if (c.grabbed === 0) earned = Math.random() < 0.5 ? 0 : 1;
      else earned = c.money;
      earned = Math.max(0, earned);
      hud();
      if (opts.onFinish) opts.onFinish(reason, earned, c.grabbed, total);
    }

    return c;
  }

  /* ============================================================
     PREGUNTAS: cara a cara con un personaje
     ============================================================ */
  function buildPreguntas(opts) {
    var scene = newScene();
    groundPlane(scene, theme === "gracioso" ? "#ffd6f0" : (theme === "terror" ? "#150018" : "#241046"));
    var mon = M.buildMonster(theme === "gracioso" ? "payaso" : (opts.monsterId || "ojos"), theme);
    mon.position.set(0, 0, 0);
    scene.add(mon);
    var camera = new T.PerspectiveCamera(50, 1, 0.1, 100);

    var c = {
      scene: scene, camera: camera, mon: mon, t: 0, mood: "angry", dance: 0,
      onResize: function (w, h) {
        camera.aspect = w / h;
        camera.position.set(0, 1.1, w / h < 0.8 ? 4.4 : 3.6);
        camera.lookAt(0, 0.9, 0);
        camera.updateProjectionMatrix();
      },
      setMood: function (m) { c.mood = m; if (m === "dance") c.dance = 0.001; },
      update: function (dt) {
        c.t += dt;
        M.updateMonsterScare(mon, dt, c.t);
        if (c.dance > 0) {
          c.dance += dt;
          mon.rotation.z = Math.sin(c.t * 12) * 0.3;
          mon.position.y = Math.abs(Math.sin(c.t * 10)) * 0.25;
          mon.rotation.y += dt * 1.5;
        } else if (c.mood === "angry") {
          mon.position.x = Math.sin(c.t * 18) * 0.04;
          mon.position.y = 0;
        } else {
          mon.rotation.y += dt * 0.4;
          mon.position.y = Math.sin(c.t * 2) * 0.05;
        }
      }
    };
    return c;
  }

  /* ---------- Dispatcher ---------- */
  var builders = {
    intro: buildIntro, skins: buildSkins, puertas: buildPuertas,
    escondite: buildEscondite, carrera: buildCarrera, preguntas: buildPreguntas
  };
  function go(name, opts) {
    var c = builders[name](opts || {});
    activate(c);
    return c;
  }

  window.ATScenes = {
    init: init, setTheme: setTheme, show: show, hide: hide, stop: stop,
    setMove: setMove, clearMove: clearMove, resize: resize, go: go
  };
})();
