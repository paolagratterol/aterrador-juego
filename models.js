/* ============================================================
   ATERRADOR 3D - Modelos procedurales (three.js)
   Todo se construye con primitivas agrupadas. Sin archivos externos.
   Expone window.ATModels
   ============================================================ */
(function () {
  "use strict";

  var T = window.THREE;

  /* ---------- Helpers de materiales y formas ---------- */
  function mat(color, opts) {
    var o = { color: new T.Color(color), roughness: 0.65, metalness: 0.08 };
    if (opts) for (var k in opts) o[k] = opts[k];
    return new T.MeshStandardMaterial(o);
  }
  function box(w, h, d, color, opts) {
    return new T.Mesh(new T.BoxGeometry(w, h, d), mat(color, opts));
  }
  function sph(r, color, opts, seg) {
    return new T.Mesh(new T.SphereGeometry(r, seg || 18, seg || 18), mat(color, opts));
  }
  function cyl(rt, rb, h, color, opts, seg) {
    return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 18), mat(color, opts));
  }
  function cone(r, h, color, opts, seg) {
    return new T.Mesh(new T.ConeGeometry(r, h, seg || 18), mat(color, opts));
  }
  function tor(r, t, color, opts) {
    return new T.Mesh(new T.TorusGeometry(r, t, 12, 24), mat(color, opts));
  }
  function pos(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }
  // material brillante con emisión (para piezas que brillan)
  function glowMat(color, emi, intensity) {
    return new T.MeshStandardMaterial({
      color: new T.Color(color),
      emissive: new T.Color(emi || color),
      emissiveIntensity: intensity == null ? 0.8 : intensity,
      roughness: 0.25, metalness: 0.4
    });
  }

  var SKIN = "#ffd9b3"; // piel humana
  var RED = "#d40000";
  var RED2 = "#ff3b3b";
  var REDHAIR = "#e0241b";
  var GOLD = "#ffd700";
  var SILVER = "#cfd8dc";

  /* ============================================================
     PROTAGONISTA Y SKINS
     Cada builder devuelve un THREE.Group con los pies en y=0.
     ============================================================ */

  // ojos lindos con brillo (devuelve nada, agrega al grupo)
  function cuteEyes(g, y, z, sep, eyeColor, scale) {
    var s = scale || 1;
    [-1, 1].forEach(function (sgn) {
      g.add(pos(sph(0.06 * s, "#ffffff"), sgn * sep, y, z));
      g.add(pos(sph(0.04 * s, eyeColor || "#3a2a1a"), sgn * sep, y, z + 0.035 * s));
      g.add(pos(sph(0.016 * s, "#ffffff"), sgn * sep + 0.018 * s, y + 0.02 * s, z + 0.05 * s));
      // pestañas
      var lash = box(0.09 * s, 0.012, 0.02, "#2a1a10");
      lash.rotation.z = sgn * 0.2;
      g.add(pos(lash, sgn * sep, y + 0.07 * s, z + 0.02 * s));
    });
  }

  function buildMuneca() {
    var g = new T.Group();
    // piernas
    g.add(pos(cyl(0.115, 0.13, 0.62, SKIN), -0.14, 0.45, 0));
    g.add(pos(cyl(0.115, 0.13, 0.62, SKIN), 0.14, 0.45, 0));
    // medias (detalle)
    g.add(pos(cyl(0.135, 0.135, 0.12, "#ffffff"), -0.14, 0.28, 0));
    g.add(pos(cyl(0.135, 0.135, 0.12, "#ffffff"), 0.14, 0.28, 0));
    // botas rojas con suela
    g.add(pos(cyl(0.16, 0.18, 0.22, "#b30000"), -0.14, 0.13, 0.02));
    g.add(pos(cyl(0.16, 0.18, 0.22, "#b30000"), 0.14, 0.13, 0.02));
    g.add(pos(box(0.22, 0.05, 0.34, "#3a0000"), -0.14, 0.025, 0.05));
    g.add(pos(box(0.22, 0.05, 0.34, "#3a0000"), 0.14, 0.025, 0.05));
    // falda (vestido) rojo acampanada
    var skirt = cyl(0.18, 0.56, 0.62, RED);
    g.add(pos(skirt, 0, 0.95, 0));
    // volante inferior
    g.add(pos(tor(0.55, 0.07, "#ff6b6b"), 0, 0.66, 0));
    // cinturón dorado
    var belt = cyl(0.235, 0.235, 0.09, GOLD, { metalness: 0.9, roughness: 0.25 });
    g.add(pos(belt, 0, 1.16, 0));
    // torso del vestido
    g.add(pos(cyl(0.22, 0.24, 0.36, RED2), 0, 1.36, 0));
    // lazo en el pecho
    g.add(pos(sph(0.05, "#ffd54f"), 0, 1.46, 0.2));
    // cuello
    g.add(pos(cyl(0.09, 0.09, 0.12, SKIN), 0, 1.58, 0));
    // collar de oro
    var neck = tor(0.16, 0.035, GOLD, { metalness: 0.9, roughness: 0.25 });
    neck.rotation.x = Math.PI / 2;
    g.add(pos(neck, 0, 1.56, 0));
    var pend = sph(0.05, GOLD, { metalness: 0.9, roughness: 0.25 });
    g.add(pos(pend, 0, 1.47, 0.13));
    // cabeza
    var head = sph(0.28, SKIN);
    g.add(pos(head, 0, 1.88, 0));
    // pelo rojo (gorro + mechones + flequillo)
    var hair = sph(0.32, REDHAIR);
    pos(hair, 0, 1.95, -0.04);
    g.add(hair);
    g.add(pos(box(0.5, 0.16, 0.16, REDHAIR), 0, 2.02, 0.12)); // flequillo
    g.add(pos(cyl(0.075, 0.05, 0.6, REDHAIR), -0.27, 1.66, -0.02));
    g.add(pos(cyl(0.075, 0.05, 0.6, REDHAIR), 0.27, 1.66, -0.02));
    // lacito rosado en el pelo
    g.add(pos(sph(0.07, "#ff5fa2"), -0.2, 2.08, 0));
    // ojos azules lindos
    cuteEyes(g, 1.9, 0.25, 0.1, "#2a6cff", 1.0);
    // nariz pequeña
    g.add(pos(sph(0.02, "#e8b48f"), 0, 1.84, 0.27));
    // boquita sonriente
    var sm = tor(0.05, 0.016, "#c1364f"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 1.78, 0.25));
    // cachetes
    g.add(pos(sph(0.05, "#ffb3c1", { transparent: true, opacity: 0.7 }), -0.18, 1.82, 0.22));
    g.add(pos(sph(0.05, "#ffb3c1", { transparent: true, opacity: 0.7 }), 0.18, 1.82, 0.22));
    // brazos
    var armL = cyl(0.065, 0.07, 0.55, SKIN);
    armL.rotation.z = 0.35; pos(armL, -0.3, 1.3, 0); g.add(armL);
    var armR = cyl(0.065, 0.07, 0.55, SKIN);
    armR.rotation.z = -0.35; pos(armR, 0.3, 1.3, 0); g.add(armR);
    // manitos
    g.add(pos(sph(0.07, SKIN), -0.42, 1.08, 0.02));
    g.add(pos(sph(0.07, SKIN), 0.42, 1.08, 0.02));
    // espadita en la mano derecha
    var sword = new T.Group();
    var blade = box(0.05, 0.5, 0.05, SILVER, { metalness: 0.85, roughness: 0.25 });
    sword.add(pos(blade, 0, 0.3, 0));
    sword.add(pos(box(0.2, 0.05, 0.05, GOLD, { metalness: 0.9 }), 0, 0.05, 0));
    sword.add(pos(cyl(0.03, 0.03, 0.12, "#8d5a2b"), 0, -0.04, 0));
    pos(sword, 0.46, 1.02, 0.05);
    sword.rotation.z = -0.2;
    g.add(sword);
    return g;
  }

  function buildSirena() {
    var g = new T.Group();
    // cola de sirena con escamas brillantes
    var tail = cyl(0.18, 0.5, 1.0, "#1f8fff", { roughness: 0.3, metalness: 0.45 });
    g.add(pos(tail, 0, 0.7, 0));
    // escamas (pequeños toros)
    for (var s = 0; s < 4; s++) {
      var ring = tor(0.3 + s * 0.05, 0.03, "#5fd0ff", { roughness: 0.3, metalness: 0.5 });
      ring.rotation.x = Math.PI / 2;
      g.add(pos(ring, 0, 0.45 + s * 0.18, 0));
    }
    var fin = cone(0.5, 0.45, "#19c3c3", { roughness: 0.3, metalness: 0.4 });
    fin.rotation.x = Math.PI;
    g.add(pos(fin, 0, 0.18, 0));
    // aletas laterales
    var finL = cone(0.18, 0.4, "#19c3c3"); finL.rotation.z = 1.4; g.add(pos(finL, -0.32, 0.5, 0));
    var finR = cone(0.18, 0.4, "#19c3c3"); finR.rotation.z = -1.4; g.add(pos(finR, 0.32, 0.5, 0));
    // top (conchas)
    g.add(pos(sph(0.12, "#ff7ac3"), -0.1, 1.32, 0.16));
    g.add(pos(sph(0.12, "#ff7ac3"), 0.1, 1.32, 0.16));
    g.add(pos(cyl(0.2, 0.22, 0.28, "#19c3c3"), 0, 1.36, -0.02));
    // cuello + cabeza
    g.add(pos(cyl(0.08, 0.08, 0.1, SKIN), 0, 1.56, 0));
    g.add(pos(sph(0.27, SKIN), 0, 1.86, 0));
    // pelo dorado largo
    g.add(pos(sph(0.31, "#ffd34d"), 0, 1.92, -0.05));
    g.add(pos(box(0.46, 0.14, 0.14, "#ffd34d"), 0, 2.0, 0.12));
    g.add(pos(cyl(0.09, 0.05, 0.8, "#ffd34d"), -0.27, 1.55, -0.02));
    g.add(pos(cyl(0.09, 0.05, 0.8, "#ffd34d"), 0.27, 1.55, -0.02));
    // corona
    var crown = cyl(0.18, 0.2, 0.12, GOLD, { metalness: 0.9, roughness: 0.2 }, 6);
    g.add(pos(crown, 0, 2.14, 0));
    g.add(pos(sph(0.05, "#ff2e63", { metalness: 0.6 }), 0, 2.22, 0.1)); // joya
    // ojos lindos
    cuteEyes(g, 1.88, 0.25, 0.1, "#2a2a6a", 1.0);
    var sm = tor(0.05, 0.015, "#c1364f"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 1.77, 0.25));
    // brazos
    var aL = cyl(0.06, 0.06, 0.5, SKIN); aL.rotation.z = 0.4; g.add(pos(aL, -0.28, 1.32, 0));
    var aR = cyl(0.06, 0.06, 0.5, SKIN); aR.rotation.z = -0.4; g.add(pos(aR, 0.28, 1.32, 0));
    return g;
  }

  function buildLol() {
    var g = new T.Group();
    // piernas cortas
    g.add(pos(cyl(0.09, 0.09, 0.4, SKIN), -0.13, 0.3, 0));
    g.add(pos(cyl(0.09, 0.09, 0.4, SKIN), 0.13, 0.3, 0));
    // zapatitos
    g.add(pos(box(0.2, 0.12, 0.26, "#e84393"), -0.13, 0.06, 0.02));
    g.add(pos(box(0.2, 0.12, 0.26, "#e84393"), 0.13, 0.06, 0.02));
    g.add(pos(sph(0.05, "#fff"), -0.13, 0.13, 0.14));
    g.add(pos(sph(0.05, "#fff"), 0.13, 0.13, 0.14));
    // vestidito con volante
    g.add(pos(cyl(0.2, 0.36, 0.5, "#ff6fb5"), 0, 0.75, 0));
    g.add(pos(tor(0.35, 0.05, "#ffd1ec"), 0, 0.52, 0));
    g.add(pos(cyl(0.22, 0.22, 0.2, "#9b59b6"), 0, 1.08, 0));
    // bracitos
    var aL = cyl(0.05, 0.05, 0.34, SKIN); aL.rotation.z = 0.5; g.add(pos(aL, -0.26, 0.95, 0));
    var aR = cyl(0.05, 0.05, 0.34, SKIN); aR.rotation.z = -0.5; g.add(pos(aR, 0.26, 0.95, 0));
    // cabezota grande
    g.add(pos(sph(0.45, "#ffe0ec"), 0, 1.62, 0));
    // ojos enormes con brillo
    g.add(pos(sph(0.13, "#fff"), -0.15, 1.66, 0.34));
    g.add(pos(sph(0.13, "#fff"), 0.15, 1.66, 0.34));
    g.add(pos(sph(0.08, "#5b3a9b"), -0.15, 1.65, 0.41));
    g.add(pos(sph(0.08, "#5b3a9b"), 0.15, 1.65, 0.41));
    g.add(pos(sph(0.03, "#fff"), -0.12, 1.69, 0.47));
    g.add(pos(sph(0.03, "#fff"), 0.18, 1.69, 0.47));
    g.add(pos(sph(0.07, "#ff9eb8", { transparent: true, opacity: 0.7 }), -0.32, 1.55, 0.28));
    g.add(pos(sph(0.07, "#ff9eb8", { transparent: true, opacity: 0.7 }), 0.32, 1.55, 0.28));
    // boquita
    var sm = tor(0.05, 0.018, "#d6336c"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 1.5, 0.4));
    // coletas
    g.add(pos(sph(0.17, "#9b59b6"), -0.42, 1.92, -0.05));
    g.add(pos(sph(0.17, "#9b59b6"), 0.42, 1.92, -0.05));
    g.add(pos(sph(0.1, "#9b59b6"), -0.46, 1.7, -0.05));
    g.add(pos(sph(0.1, "#9b59b6"), 0.46, 1.7, -0.05));
    return g;
  }

  /* ---- LOL Mejorada (skin de pago): cuerpo brillante que cambia de color ---- */
  function buildLolMejorada() {
    var g = new T.Group();
    // piernas con piecitos chiquitos
    g.add(pos(cyl(0.08, 0.08, 0.3, SKIN), -0.12, 0.32, 0));
    g.add(pos(cyl(0.08, 0.08, 0.3, SKIN), 0.12, 0.32, 0));
    g.add(pos(sph(0.1, "#ff7ac3"), -0.12, 0.12, 0.04)); // piecito
    g.add(pos(sph(0.1, "#ff7ac3"), 0.12, 0.12, 0.04));

    // CUERPO BRILLANTE (cambia de color con el tiempo)
    var bodyMat = glowMat("#ff2e63", "#ff2e63", 0.9);
    var body = new T.Mesh(new T.SphereGeometry(0.3, 22, 22), bodyMat);
    body.scale.set(1, 1.15, 1);
    g.add(pos(body, 0, 0.78, 0));
    // vestido rosado encima del cuerpo
    var dress = cyl(0.22, 0.42, 0.5, "#ff6fb5", { roughness: 0.35, metalness: 0.2 });
    g.add(pos(dress, 0, 0.72, 0));
    g.add(pos(tor(0.42, 0.05, "#ffd1ec"), 0, 0.5, 0));
    // CORAZÓN ROJO en el vestido
    var heart = new T.Group();
    var hm = mat("#ff0000", { emissive: new T.Color("#7a0000"), emissiveIntensity: 0.5 });
    var hl = new T.Mesh(new T.SphereGeometry(0.06, 14, 14), hm);
    var hr = new T.Mesh(new T.SphereGeometry(0.06, 14, 14), hm);
    var hb = new T.Mesh(new T.ConeGeometry(0.085, 0.13, 14), hm);
    hl.position.set(-0.045, 0.04, 0); hr.position.set(0.045, 0.04, 0);
    hb.position.set(0, -0.05, 0); hb.rotation.x = Math.PI;
    heart.add(hl); heart.add(hr); heart.add(hb);
    pos(heart, 0, 0.82, 0.34);
    g.add(heart);

    // brazo derecho que sostiene la botella
    var aR = cyl(0.045, 0.05, 0.34, SKIN); aR.rotation.z = -0.7; g.add(pos(aR, 0.28, 0.95, 0.05));
    var aL = cyl(0.045, 0.05, 0.34, SKIN); aL.rotation.z = 0.5; g.add(pos(aL, -0.27, 0.92, 0));

    // BOTELLA / POTE DE AGUA ROSADO con pitillo
    var bottle = new T.Group();
    bottle.add(pos(cyl(0.07, 0.08, 0.26, "#ff8fcf", { transparent: true, opacity: 0.85, roughness: 0.2 }), 0, 0.13, 0));
    bottle.add(pos(cyl(0.05, 0.05, 0.05, "#ff3ea5"), 0, 0.29, 0)); // tapa
    bottle.add(pos(cyl(0.06, 0.07, 0.18, "#ff5fb0", { transparent: true, opacity: 0.7 }), 0, 0.1, 0)); // agua
    // pitillo (pajita) inclinado
    var straw = cyl(0.012, 0.012, 0.32, "#ffffff");
    straw.rotation.z = 0.35;
    bottle.add(pos(straw, 0.05, 0.36, 0));
    pos(bottle, 0.44, 0.72, 0.08);
    g.add(bottle);

    // cabezota brillante
    var head = sph(0.44, "#ffe0ec");
    g.add(pos(head, 0, 1.62, 0));
    // PELO ROJO con coletas
    g.add(pos(sph(0.46, REDHAIR), 0, 1.72, -0.06));
    g.add(pos(box(0.6, 0.18, 0.16, REDHAIR), 0, 1.86, 0.18)); // flequillo
    g.add(pos(sph(0.18, REDHAIR), -0.44, 1.92, -0.05));
    g.add(pos(sph(0.18, REDHAIR), 0.44, 1.92, -0.05));
    g.add(pos(sph(0.11, REDHAIR), -0.5, 1.66, -0.05));
    g.add(pos(sph(0.11, REDHAIR), 0.5, 1.66, -0.05));
    // OJOS AZULES grandes
    g.add(pos(sph(0.14, "#fff"), -0.15, 1.66, 0.34));
    g.add(pos(sph(0.14, "#fff"), 0.15, 1.66, 0.34));
    g.add(pos(sph(0.09, "#1f6bff"), -0.15, 1.65, 0.42));
    g.add(pos(sph(0.09, "#1f6bff"), 0.15, 1.65, 0.42));
    g.add(pos(sph(0.035, "#fff"), -0.11, 1.7, 0.49));
    g.add(pos(sph(0.035, "#fff"), 0.19, 1.7, 0.49));
    g.add(pos(sph(0.07, "#ff9eb8", { transparent: true, opacity: 0.7 }), -0.33, 1.55, 0.28));
    g.add(pos(sph(0.07, "#ff9eb8", { transparent: true, opacity: 0.7 }), 0.33, 1.55, 0.28));
    var sm = tor(0.05, 0.018, "#d6336c"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 1.5, 0.4));

    // animación: el cuerpo y el corazón cambian de color (neón)
    g.userData.tick = function (dt, t) {
      var hue = (t * 0.18) % 1;
      bodyMat.color.setHSL(hue, 0.95, 0.6);
      bodyMat.emissive.setHSL(hue, 0.95, 0.45);
      bodyMat.emissiveIntensity = 0.7 + Math.sin(t * 4) * 0.3;
      heart.rotation.y = Math.sin(t * 2) * 0.3;
      heart.scale.setScalar(1 + Math.sin(t * 6) * 0.08);
    };
    return g;
  }

  /* ---- Humano Arcoíris (skin de pago) ---- */
  function buildArcoiris() {
    var g = new T.Group();
    // piernas con pantalón rojo
    g.add(pos(cyl(0.12, 0.12, 0.7, "#e02020"), -0.15, 0.5, 0));
    g.add(pos(cyl(0.12, 0.12, 0.7, "#e02020"), 0.15, 0.5, 0));
    // franjas oro y plata en el pantalón
    g.add(pos(cyl(0.125, 0.125, 0.08, GOLD, { metalness: 0.9, roughness: 0.2 }), -0.15, 0.62, 0));
    g.add(pos(cyl(0.125, 0.125, 0.08, GOLD, { metalness: 0.9, roughness: 0.2 }), 0.15, 0.62, 0));
    g.add(pos(cyl(0.125, 0.125, 0.08, SILVER, { metalness: 0.9, roughness: 0.2 }), -0.15, 0.4, 0));
    g.add(pos(cyl(0.125, 0.125, 0.08, SILVER, { metalness: 0.9, roughness: 0.2 }), 0.15, 0.4, 0));
    // zapatillas
    g.add(pos(box(0.2, 0.12, 0.34, "#222"), -0.15, 0.12, 0.04));
    g.add(pos(box(0.2, 0.12, 0.34, "#222"), 0.15, 0.12, 0.04));
    g.add(pos(box(0.21, 0.04, 0.36, "#fff"), -0.15, 0.05, 0.04));
    g.add(pos(box(0.21, 0.04, 0.36, "#fff"), 0.15, 0.05, 0.04));

    // CAMISA ARCOÍRIS (franjas rosa + morado + rojo)
    var torso = cyl(0.26, 0.28, 0.6, "#9b30ff");
    g.add(pos(torso, 0, 1.2, 0));
    var stripes = ["#ff2e63", "#ff5fa2", "#9b30ff", "#c44bff", "#ff2e63"];
    for (var i = 0; i < stripes.length; i++) {
      var st = cyl(0.272, 0.282, 0.12, stripes[i], { roughness: 0.4, metalness: 0.15 });
      g.add(pos(st, 0, 0.95 + i * 0.12, 0));
    }
    // cuello camisa
    g.add(pos(cyl(0.15, 0.15, 0.06, "#ff5fa2"), 0, 1.52, 0));
    // brazos con mangas arcoíris
    var armL = cyl(0.07, 0.075, 0.6, "#ff5fa2"); armL.rotation.z = 0.35; g.add(pos(armL, -0.34, 1.18, 0));
    var armR = cyl(0.07, 0.075, 0.6, "#9b30ff"); armR.rotation.z = -0.35; g.add(pos(armR, 0.34, 1.18, 0));
    g.add(pos(sph(0.075, SKIN), -0.47, 0.92, 0)); // manos
    g.add(pos(sph(0.075, SKIN), 0.47, 0.92, 0));

    // cuello + cabeza
    g.add(pos(cyl(0.09, 0.09, 0.12, SKIN), 0, 1.6, 0));
    g.add(pos(sph(0.28, SKIN), 0, 1.9, 0));
    // pelo (mechones de colores)
    g.add(pos(sph(0.31, "#3a2a1a"), 0, 1.98, -0.04));
    g.add(pos(sph(0.1, "#ff2e63"), -0.18, 2.12, 0));
    g.add(pos(sph(0.1, "#9b30ff"), 0.18, 2.12, 0));
    g.add(pos(sph(0.1, "#ff5fa2"), 0, 2.18, -0.02));
    // ojos lindos
    cuteEyes(g, 1.92, 0.25, 0.1, "#3a2a1a", 1.0);
    var sm2 = tor(0.06, 0.018, "#a83246"); sm2.rotation.x = Math.PI / 2; sm2.rotation.z = Math.PI;
    g.add(pos(sm2, 0, 1.8, 0.25));
    return g;
  }

  function buildTaza() {
    var g = new T.Group();
    // cuerpo taza
    var cup = cyl(0.5, 0.42, 1.0, "#ffffff", { roughness: 0.4 });
    g.add(pos(cup, 0, 0.6, 0));
    // borde
    g.add(pos(tor(0.5, 0.05, "#ff7ac3"), 0, 1.1, 0));
    // asa
    var handle = tor(0.28, 0.06, "#ff7ac3");
    handle.rotation.y = Math.PI / 2;
    g.add(pos(handle, 0.55, 0.7, 0));
    // cara
    g.add(pos(sph(0.07, "#222"), -0.16, 0.78, 0.45));
    g.add(pos(sph(0.07, "#222"), 0.16, 0.78, 0.45));
    g.add(pos(sph(0.07, "#ffb3d1"), -0.3, 0.66, 0.36));
    g.add(pos(sph(0.07, "#ffb3d1"), 0.3, 0.66, 0.36));
    // cafe + vapor
    g.add(pos(cyl(0.46, 0.46, 0.05, "#7a4a2b"), 0, 1.12, 0));
    var steam = sph(0.06, "#ffffff", { transparent: true, opacity: 0.5 });
    g.add(pos(steam, -0.1, 1.35, 0));
    g.add(pos(sph(0.06, "#ffffff", { transparent: true, opacity: 0.5 }), 0.12, 1.5, 0));
    return g;
  }

  function buildMono() {
    var g = new T.Group();
    var brown = "#8d5524", light = "#e0ac69";
    // cuerpo
    g.add(pos(cyl(0.26, 0.32, 0.7, brown), 0, 0.6, 0));
    // piernas
    g.add(pos(cyl(0.1, 0.1, 0.4, brown), -0.16, 0.2, 0));
    g.add(pos(cyl(0.1, 0.1, 0.4, brown), 0.16, 0.2, 0));
    // brazos
    var aL = cyl(0.09, 0.09, 0.5, brown); aL.rotation.z = 0.5; g.add(pos(aL, -0.32, 0.7, 0));
    var aR = cyl(0.09, 0.09, 0.5, brown); aR.rotation.z = -0.5; g.add(pos(aR, 0.32, 0.7, 0));
    // cabeza
    g.add(pos(sph(0.36, brown), 0, 1.35, 0));
    // orejas
    g.add(pos(sph(0.14, brown), -0.34, 1.4, 0));
    g.add(pos(sph(0.14, brown), 0.34, 1.4, 0));
    g.add(pos(sph(0.08, light), -0.36, 1.4, 0.05));
    g.add(pos(sph(0.08, light), 0.36, 1.4, 0.05));
    // hocico
    g.add(pos(sph(0.22, light), 0, 1.26, 0.22));
    g.add(pos(sph(0.05, "#222"), -0.1, 1.42, 0.3));
    g.add(pos(sph(0.05, "#222"), 0.1, 1.42, 0.3));
    g.add(pos(sph(0.03, "#222"), 0, 1.28, 0.42));
    // cola
    var tail = tor(0.25, 0.05, brown);
    tail.rotation.x = Math.PI / 2;
    g.add(pos(tail, 0.3, 0.35, -0.25));
    return g;
  }

  function buildDino() {
    var g = new T.Group();
    var c = "#e74c3c";
    // cuerpo
    var body = sph(0.4, c); body.scale.set(1, 0.9, 1.3); g.add(pos(body, 0, 0.7, 0));
    // patas
    g.add(pos(cyl(0.12, 0.12, 0.5, "#c0392b"), -0.2, 0.25, 0.1));
    g.add(pos(cyl(0.12, 0.12, 0.5, "#c0392b"), 0.2, 0.25, 0.1));
    // cola
    var tail = cone(0.22, 0.9, c);
    tail.rotation.x = -Math.PI / 2.2;
    g.add(pos(tail, 0, 0.7, -0.6));
    // cuello + cabeza
    g.add(pos(cyl(0.14, 0.16, 0.5, c), 0, 1.15, 0.25));
    var head = sph(0.27, c); head.scale.set(1, 0.9, 1.2);
    g.add(pos(head, 0, 1.45, 0.4));
    g.add(pos(sph(0.05, "#fff"), -0.1, 1.52, 0.6));
    g.add(pos(sph(0.05, "#fff"), 0.1, 1.52, 0.6));
    g.add(pos(sph(0.025, "#222"), -0.1, 1.52, 0.64));
    g.add(pos(sph(0.025, "#222"), 0.1, 1.52, 0.64));
    // picos en la espalda
    for (var i = 0; i < 4; i++) {
      var spike = cone(0.08, 0.22, "#ffb3b3");
      g.add(pos(spike, 0, 1.05 - i * 0.0 + 0.05, 0.25 - i * 0.22));
      spike.position.y = 1.05 - i * 0.06;
    }
    return g;
  }

  var DOLLS = {
    muneca: buildMuneca,
    sirena: buildSirena,
    lol: buildLol,
    taza: buildTaza,
    mono: buildMono,
    dino: buildDino,
    lolmejorada: buildLolMejorada,
    arcoiris: buildArcoiris
  };

  function buildDoll(skinId) {
    var fn = DOLLS[skinId] || buildMuneca;
    return fn();
  }

  /* Minion procedural (cuerpo amarillo, gafas, overol azul) */
  function buildMinion(variant) {
    var g = new T.Group();
    var yellow = variant === 1 ? "#ffe566" : (variant === 2 ? "#ffd633" : "#ffeb3b");
    var blue = "#1e5fa8";
    var strap = "#3a3a3a";
    // piernas cortas
    g.add(pos(cyl(0.09, 0.1, 0.22, blue), -0.1, 0.14, 0));
    g.add(pos(cyl(0.09, 0.1, 0.22, blue), 0.1, 0.14, 0));
    g.add(pos(box(0.14, 0.08, 0.2, "#222"), -0.1, 0.04, 0.03));
    g.add(pos(box(0.14, 0.08, 0.2, "#222"), 0.1, 0.04, 0.03));
    // cuerpo cápsula (cilindro + domo)
    g.add(pos(cyl(0.22, 0.24, 0.42, yellow), 0, 0.48, 0));
    var belly = sph(0.24, yellow);
    belly.scale.set(1, 0.85, 0.9);
    g.add(pos(belly, 0, 0.52, 0.04));
    // overol azul (peto)
    g.add(pos(box(0.34, 0.34, 0.12, blue), 0, 0.5, 0.14));
    g.add(pos(box(0.1, 0.22, 0.08, blue), -0.14, 0.44, 0.16));
    g.add(pos(box(0.1, 0.22, 0.08, blue), 0.14, 0.44, 0.16));
    // bolsillo del overol
    g.add(pos(box(0.12, 0.1, 0.04, "#174a82"), 0, 0.42, 0.2));
    // brazos
    var aL = cyl(0.055, 0.06, 0.28, yellow); aL.rotation.z = 0.55; g.add(pos(aL, -0.28, 0.56, 0));
    var aR = cyl(0.055, 0.06, 0.28, yellow); aR.rotation.z = -0.55; g.add(pos(aR, 0.28, 0.56, 0));
    g.add(pos(sph(0.065, "#222"), -0.38, 0.44, 0.02));
    g.add(pos(sph(0.065, "#222"), 0.38, 0.44, 0.02));
    // cabeza
    g.add(pos(sph(0.26, yellow), 0, 0.92, 0));
    // gafas (dos lentes + puente)
    g.add(pos(cyl(0.11, 0.11, 0.05, "#555", { metalness: 0.7, roughness: 0.3 }), -0.13, 0.94, 0.2));
    g.add(pos(cyl(0.11, 0.11, 0.05, "#555", { metalness: 0.7, roughness: 0.3 }), 0.13, 0.94, 0.2));
    g.add(pos(box(0.08, 0.03, 0.04, strap), 0, 0.94, 0.21));
    g.add(pos(box(0.42, 0.025, 0.03, strap), 0, 0.98, 0.05));
    // ojos detrás de las gafas
    g.add(pos(sph(0.05, "#fff"), -0.13, 0.94, 0.24));
    g.add(pos(sph(0.05, "#fff"), 0.13, 0.94, 0.24));
    g.add(pos(sph(0.025, "#222"), -0.13, 0.93, 0.28));
    g.add(pos(sph(0.025, "#222"), 0.13, 0.93, 0.28));
    // boquita sonriente
    var sm = tor(0.06, 0.018, "#5a1020"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 0.84, 0.24));
    // pelo (1-3 pelitos)
    if (variant !== 2) {
      g.add(pos(cyl(0.012, 0.012, 0.08, "#222"), -0.04, 1.14, 0.02));
      g.add(pos(cyl(0.012, 0.012, 0.1, "#222"), 0, 1.16, 0));
      g.add(pos(cyl(0.012, 0.012, 0.07, "#222"), 0.05, 1.13, -0.02));
    }
    g.userData.bouncePhase = (variant || 0) * 1.3;
    g.userData.stride = 0.8 + (variant || 0) * 0.15;
    return g;
  }

  /* Oscurece un personaje (skins de pago en el desfile) */
  function darkenGroup(g, factor) {
    if (!g) return;
    var k = factor == null ? 0.62 : factor;
    g.traverse(function (o) {
      if (!o.isMesh || !o.material) return;
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(function (m) {
        if (!m.userData._origColor) {
          m.userData._origColor = m.color.clone();
        }
        m.color.copy(m.userData._origColor).multiplyScalar(k);
        if (m.emissive) m.emissiveIntensity = (m.emissiveIntensity || 0) * k * 0.7;
      });
    });
  }

  /* Moneda flotante (sprite 3D) sobre skins de pago */
  function buildCoinSprite() {
    var c = document.createElement("canvas");
    c.width = 96; c.height = 96;
    var ctx = c.getContext("2d");
    ctx.font = "72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🪙", 48, 52);
    var tex = new T.CanvasTexture(c);
    var mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var spr = new T.Sprite(mat);
    spr.scale.set(0.55, 0.55, 1);
    spr.position.y = 2.35;
    spr.userData.isCoin = true;
    return spr;
  }

  /* Mini peluche LOL (para macarena en escondite gracioso) */
  function buildMiniLolPlush(skinId) {
    var g = new T.Group();
    var dressC = "#ff6fb5", hairC = "#9b59b6", accent = "#e84393";
    if (skinId === "muneca") { dressC = RED; hairC = REDHAIR; accent = "#ff5fa2"; }
    else if (skinId === "sirena") { dressC = "#19c3c3"; hairC = "#ffd34d"; accent = "#5fd0ff"; }
    else if (skinId === "lolmejorada") { dressC = "#ff2e63"; hairC = REDHAIR; accent = "#ff7ac3"; }
    else if (skinId === "arcoiris") { dressC = "#9b30ff"; hairC = "#3a2a1a"; accent = "#ff5fa2"; }
    // piernitas
    g.add(pos(cyl(0.045, 0.045, 0.18, SKIN), -0.07, 0.14, 0));
    g.add(pos(cyl(0.045, 0.045, 0.18, SKIN), 0.07, 0.14, 0));
    g.add(pos(box(0.1, 0.06, 0.12, accent), -0.07, 0.04, 0.01));
    g.add(pos(box(0.1, 0.06, 0.12, accent), 0.07, 0.04, 0.01));
    // vestidito
    g.add(pos(cyl(0.1, 0.16, 0.22, dressC), 0, 0.32, 0));
    g.add(pos(tor(0.16, 0.025, "#ffd1ec"), 0, 0.22, 0));
    // cabezota grande (estilo LOL)
    g.add(pos(sph(0.22, "#ffe0ec"), 0, 0.62, 0));
    g.add(pos(sph(0.23, hairC), 0, 0.68, -0.02));
    g.add(pos(sph(0.09, hairC), -0.2, 0.74, -0.02));
    g.add(pos(sph(0.09, hairC), 0.2, 0.74, -0.02));
    // ojos enormes con brillo
    g.add(pos(sph(0.07, "#fff"), -0.08, 0.64, 0.17));
    g.add(pos(sph(0.07, "#fff"), 0.08, 0.64, 0.17));
    g.add(pos(sph(0.045, "#5b3a9b"), -0.08, 0.63, 0.21));
    g.add(pos(sph(0.045, "#5b3a9b"), 0.08, 0.63, 0.21));
    g.add(pos(sph(0.018, "#fff"), -0.065, 0.67, 0.24));
    g.add(pos(sph(0.018, "#fff"), 0.095, 0.67, 0.24));
    g.add(pos(sph(0.035, "#ff9eb8", { transparent: true, opacity: 0.75 }), -0.16, 0.56, 0.14));
    g.add(pos(sph(0.035, "#ff9eb8", { transparent: true, opacity: 0.75 }), 0.16, 0.56, 0.14));
    var sm = tor(0.035, 0.012, "#d6336c"); sm.rotation.x = Math.PI / 2; sm.rotation.z = Math.PI;
    g.add(pos(sm, 0, 0.52, 0.2));
    // bracitos para que parezca que la sostienen
    var aL = cyl(0.028, 0.028, 0.16, SKIN); aL.rotation.z = 0.6; g.add(pos(aL, -0.14, 0.38, 0.02));
    var aR = cyl(0.028, 0.028, 0.16, SKIN); aR.rotation.z = -0.6; g.add(pos(aR, 0.14, 0.38, 0.02));
    g.userData.tick = function (dt, t) {
      g.rotation.z = Math.sin(t * 5) * 0.08;
      g.position.y = Math.sin(t * 8) * 0.02;
    };
    return g;
  }

  /* Hombros articulados para macarena (muñecas y monstruos sin hombros) */
  function ensureMacarenaShoulders(g) {
    if (!g || !g.userData) return null;
    if (g.userData.macShoulders) return g.userData.macShoulders;
    var shY = g.userData.macShY != null ? g.userData.macShY : 1.02;
    var armSkin = g.userData.macArmColor || SKIN;
    var shoulderL = new T.Group();
    shoulderL.position.set(-0.26, shY, 0);
    var armLMesh = cyl(0.055, 0.05, 0.42, armSkin);
    armLMesh.position.y = -0.21;
    shoulderL.add(armLMesh);
    g.add(shoulderL);
    var shoulderR = new T.Group();
    shoulderR.position.set(0.26, shY, 0);
    var armRMesh = cyl(0.055, 0.05, 0.42, armSkin);
    armRMesh.position.y = -0.21;
    shoulderR.add(armRMesh);
    g.add(shoulderR);
    g.userData.macShoulders = { L: shoulderL, R: shoulderR };
    return g.userData.macShoulders;
  }

  /* ============================================================
     MONSTRUOS (variados, para Puertas y Carrera)
     buildMonster(id, theme) -> THREE.Group (pies en y=0)
     theme: "terror" | "gracioso" | "none"
     ============================================================ */

  function funny(theme) { return theme === "gracioso"; }

  // ojos blancos con pupila + boca curva (sonrisa o enojo)
  function addFace(g, cy, cz, smile, eyeColor) {
    g.add(pos(sph(0.09, "#ffffff"), -0.13, cy, cz));
    g.add(pos(sph(0.09, "#ffffff"), 0.13, cy, cz));
    g.add(pos(sph(0.045, eyeColor || "#222"), -0.13, cy, cz + 0.06));
    g.add(pos(sph(0.045, eyeColor || "#222"), 0.13, cy, cz + 0.06));
    g.add(pos(sph(0.015, "#fff"), -0.11, cy + 0.02, cz + 0.1));
    g.add(pos(sph(0.015, "#fff"), 0.15, cy + 0.02, cz + 0.1));
    var mouth = tor(0.09, 0.025, "#5a1020");
    mouth.rotation.x = Math.PI / 2;
    if (smile) mouth.rotation.z = Math.PI; // arco hacia arriba
    g.add(pos(mouth, 0, cy - 0.16, cz));
  }

  // boca aterradora abierta con dientes y sangre (oculta por defecto).
  // Devuelve el grupo y lo deja en g.userData.scaryMouth para animar.
  function addScaryMouth(g, cy, cz) {
    var sm = new T.Group();
    // boca roja oscura
    var inner = new T.Mesh(new T.SphereGeometry(0.16, 16, 16), mat("#2a0000", { emissive: new T.Color("#3a0000"), emissiveIntensity: 0.4 }));
    inner.scale.set(1, 1.1, 0.6);
    sm.add(pos(inner, 0, 0, 0.04));
    // dientes superiores e inferiores
    for (var d = 0; d < 6; d++) {
      var tx = -0.13 + d * 0.052;
      var tu = cone(0.025, 0.09, "#fff"); tu.rotation.x = Math.PI; sm.add(pos(tu, tx, 0.12, 0.12));
      var tl = cone(0.025, 0.09, "#fff"); sm.add(pos(tl, tx, -0.12, 0.12));
    }
    // lengua
    sm.add(pos(sph(0.07, "#c1364f"), 0, -0.03, 0.13));
    // gotas de sangre (caricatura)
    for (var b = 0; b < 3; b++) {
      var drop = sph(0.03, "#b3001b");
      sm.add(pos(drop, -0.1 + b * 0.1, -0.18 - b * 0.02, 0.14));
    }
    pos(sm, 0, cy, cz + 0.05);
    sm.visible = false;
    g.add(sm);
    g.userData.scaryMouth = sm;
    return sm;
  }

  function buildMonster(id, theme) {
    var g = new T.Group();
    var fun = funny(theme);

    switch (id) {
      case "ojos": {
        // ojos verdes con un globo
        var body = sph(0.5, fun ? "#9be15d" : "#2e7d32");
        g.add(pos(body, 0, 0.55, 0));
        var ge = glowMat("#aaff00", "#66ff00", 1.1);
        var gE1 = new T.Mesh(new T.SphereGeometry(0.18, 16, 16), ge);
        var gE2 = new T.Mesh(new T.SphereGeometry(0.18, 16, 16), ge);
        g.add(pos(gE1, -0.18, 0.7, 0.4));
        g.add(pos(gE2, 0.18, 0.7, 0.4));
        g.add(pos(sph(0.08, "#114400"), -0.18, 0.7, 0.55));
        g.add(pos(sph(0.08, "#114400"), 0.18, 0.7, 0.55));
        addFace(g, 0.45, 0.5, fun, "#114400");
        // brazo con globo
        var arm = cyl(0.05, 0.05, 0.4, fun ? "#9be15d" : "#2e7d32"); arm.rotation.z = -0.5;
        g.add(pos(arm, 0.45, 0.7, 0));
        var str = cyl(0.01, 0.01, 0.7, "#ffffff"); g.add(pos(str, 0.65, 1.15, 0));
        var balloon = sph(0.25, fun ? "#ff5fa2" : "#ff2e63");
        g.add(pos(balloon, 0.65, 1.55, 0));
        break;
      }
      case "puya": {
        var b = sph(0.45, fun ? "#b39ddb" : "#4a148c"); g.add(pos(b, 0, 0.5, 0));
        addFace(g, 0.55, 0.42, fun);
        // gran puya/pincho arriba
        var spike = cone(0.14, 0.7, "#cfd8dc", { metalness: 0.7, roughness: 0.3 });
        g.add(pos(spike, 0, 1.15, 0));
        // pinchitos alrededor
        for (var i = 0; i < 8; i++) {
          var a = (i / 8) * Math.PI * 2;
          var p = cone(0.06, 0.18, "#9e9e9e");
          p.position.set(Math.cos(a) * 0.45, 0.5, Math.sin(a) * 0.45);
          p.lookAt(p.position.x * 2, 0.5, p.position.z * 2);
          p.rotateX(Math.PI / 2);
          g.add(p);
        }
        break;
      }
      case "pierna": {
        // comepiernas: boca grande mordiendo una pierna
        var bd = sph(0.5, fun ? "#80deea" : "#00695c"); bd.scale.set(1, 0.9, 1); g.add(pos(bd, 0, 0.55, 0));
        // boca abierta
        g.add(pos(sph(0.22, "#3a0000"), 0, 0.5, 0.42));
        // dientes
        for (var d = 0; d < 6; d++) {
          var t2 = cone(0.04, 0.12, "#fff");
          t2.rotation.x = Math.PI;
          g.add(pos(t2, -0.18 + d * 0.072, 0.62, 0.5));
        }
        g.add(pos(sph(0.1, "#fff"), -0.2, 0.78, 0.4));
        g.add(pos(sph(0.1, "#fff"), 0.2, 0.78, 0.4));
        g.add(pos(sph(0.05, "#a00"), -0.2, 0.78, 0.48));
        g.add(pos(sph(0.05, "#a00"), 0.2, 0.78, 0.48));
        // pierna que se come
        var leg = cyl(0.07, 0.09, 0.45, SKIN); leg.rotation.x = 0.5;
        g.add(pos(leg, 0, 0.7, 0.7));
        g.add(pos(box(0.18, 0.08, 0.22, "#fff"), 0, 0.55, 0.92)); // pie
        if (!fun) {
          // sangre de caricatura en el mordisco
          g.add(pos(sph(0.05, "#b3001b"), -0.05, 0.55, 0.55));
          g.add(pos(sph(0.04, "#d40000"), 0.06, 0.5, 0.58));
          g.add(pos(sph(0.03, "#b3001b"), 0, 0.42, 0.6));
        }
        break;
      }
      case "lindo": {
        // lindo que se vuelve feo y cambia de color al correr
        var color = fun ? "#ffd1dc" : "#ff9ec4";
        var bod = sph(0.5, color); g.add(pos(bod, 0, 0.55, 0));
        // dos caras: linda (visible) y fea (oculta) controladas por userData
        addFace(g, 0.6, 0.45, true);
        g.add(pos(sph(0.06, "#ff80ab"), -0.32, 0.5, 0.32));
        g.add(pos(sph(0.06, "#ff80ab"), 0.32, 0.5, 0.32));
        // cuernitos que aparecen cuando es feo
        var horn1 = cone(0.07, 0.22, "#7a1f1f"); horn1.visible = false;
        var horn2 = cone(0.07, 0.22, "#7a1f1f"); horn2.visible = false;
        g.add(pos(horn1, -0.22, 1.0, 0));
        g.add(pos(horn2, 0.22, 1.0, 0));
        g.userData.bodyMesh = bod;
        g.userData.horns = [horn1, horn2];
        g.userData.niceColor = color;
        g.userData.uglyColor = "#7b1fa2";
        break;
      }
      case "fantasma": {
        var ghost = sph(0.45, "#f3f3ff", { transparent: true, opacity: 0.85 });
        g.add(pos(ghost, 0, 0.9, 0));
        var skirt = cone(0.45, 0.7, "#f3f3ff", { transparent: true, opacity: 0.85 });
        skirt.rotation.x = Math.PI;
        g.add(pos(skirt, 0, 0.45, 0));
        g.add(pos(sph(0.08, "#222"), -0.15, 0.95, 0.4));
        g.add(pos(sph(0.08, "#222"), 0.15, 0.95, 0.4));
        var m = tor(0.1, 0.04, "#222"); m.rotation.x = Math.PI / 2;
        g.add(pos(m, 0, 0.78, 0.4));
        break;
      }
      case "calavera": {
        g.add(pos(cyl(0.16, 0.16, 0.8, "#eeeeee"), 0, 0.4, 0)); // cuerpo huesos
        var sk = sph(0.32, "#f5f5f5"); g.add(pos(sk, 0, 1.05, 0));
        g.add(pos(sph(0.09, "#111"), -0.12, 1.08, 0.26));
        g.add(pos(sph(0.09, "#111"), 0.12, 1.08, 0.26));
        g.add(pos(box(0.22, 0.1, 0.05, "#f5f5f5"), 0, 0.88, 0.28)); // mandibula
        break;
      }
      case "arana": case "araña": {
        var ab = sph(0.4, fun ? "#7e57c2" : "#1a1a1a"); g.add(pos(ab, 0, 0.55, 0));
        g.add(pos(sph(0.25, fun ? "#7e57c2" : "#1a1a1a"), 0, 0.6, 0.35));
        addFace(g, 0.65, 0.55, fun, "#ff3b3b");
        for (var li = 0; li < 8; li++) {
          var side = li < 4 ? -1 : 1;
          var idx = li % 4;
          var leg2 = cyl(0.03, 0.03, 0.6, fun ? "#5e35b1" : "#000");
          leg2.rotation.z = side * (0.6 + idx * 0.1);
          g.add(pos(leg2, side * 0.35, 0.55, -0.2 + idx * 0.14));
        }
        break;
      }
      case "diablo": {
        var db = sph(0.45, "#c62828"); g.add(pos(db, 0, 0.55, 0));
        addFace(g, 0.6, 0.42, fun, "#ffeb3b");
        var h1 = cone(0.08, 0.25, "#7a1f1f"); g.add(pos(h1, -0.2, 1.05, 0));
        var h2 = cone(0.08, 0.25, "#7a1f1f"); g.add(pos(h2, 0.2, 1.05, 0));
        // tridente
        var fork = cyl(0.03, 0.03, 0.9, "#5d4037"); g.add(pos(fork, 0.5, 0.6, 0));
        g.add(pos(cone(0.07, 0.2, GOLD), 0.5, 1.1, 0));
        break;
      }
      case "alien": {
        var head = sph(0.4, "#76ff03"); head.scale.set(1, 1.2, 1); g.add(pos(head, 0, 1.05, 0));
        g.add(pos(cyl(0.18, 0.22, 0.6, "#64dd17"), 0, 0.5, 0));
        // ojos negros grandes
        var e1 = sph(0.13, "#000"); e1.scale.set(0.7, 1.4, 0.5); g.add(pos(e1, -0.14, 1.1, 0.32));
        var e2 = sph(0.13, "#000"); e2.scale.set(0.7, 1.4, 0.5); g.add(pos(e2, 0.14, 1.1, 0.32));
        // antenas
        g.add(pos(cyl(0.015, 0.015, 0.25, "#64dd17"), -0.12, 1.5, 0));
        g.add(pos(cyl(0.015, 0.015, 0.25, "#64dd17"), 0.12, 1.5, 0));
        g.add(pos(sph(0.05, "#ffeb3b"), -0.12, 1.65, 0));
        g.add(pos(sph(0.05, "#ffeb3b"), 0.12, 1.65, 0));
        break;
      }
      case "payaso": {
        g.add(pos(cyl(0.22, 0.36, 0.6, fun ? "#ff80ab" : "#7b1fa2"), 0, 0.5, 0));
        g.add(pos(sph(0.06, GOLD), 0, 0.65, 0.34));
        g.add(pos(sph(0.06, "#4db8ff"), 0, 0.45, 0.36));
        var ch = sph(0.32, "#fff6e9"); g.add(pos(ch, 0, 1.15, 0)); // cara
        g.add(pos(sph(0.1, "#ff1744"), 0, 1.05, 0.3)); // nariz roja
        addFace(g, 1.22, 0.28, true);
        // pelo de colores
        g.add(pos(sph(0.13, "#ff1744"), -0.3, 1.25, 0));
        g.add(pos(sph(0.13, "#2979ff"), 0.3, 1.25, 0));
        g.add(pos(sph(0.13, "#ffea00"), 0, 1.45, 0));
        // sombrero
        g.add(pos(cone(0.18, 0.3, fun ? "#4db8ff" : "#311b92"), 0, 1.6, 0));
        // brazos articulados (para macarena)
        var shoulderL = new T.Group();
        shoulderL.position.set(-0.28, 0.85, 0);
        var armLMesh = cyl(0.06, 0.05, 0.45, "#fff6e9");
        armLMesh.position.y = -0.22;
        shoulderL.add(armLMesh);
        g.add(shoulderL);
        var shoulderR = new T.Group();
        shoulderR.position.set(0.28, 0.85, 0);
        var armRMesh = cyl(0.06, 0.05, 0.45, "#fff6e9");
        armRMesh.position.y = -0.22;
        shoulderR.add(armRMesh);
        g.add(shoulderR);
        g.userData.macShoulders = { L: shoulderL, R: shoulderR };
        break;
      }
      case "vampiro": {
        g.add(pos(cone(0.4, 0.9, "#1a1a2e"), 0, 0.45, 0)); // capa
        g.add(pos(sph(0.28, "#e6d2b5"), 0, 1.05, 0));
        addFace(g, 1.08, 0.26, fun, "#b71c1c");
        // colmillos
        g.add(pos(cone(0.03, 0.08, "#fff"), -0.06, 0.92, 0.26));
        g.add(pos(cone(0.03, 0.08, "#fff"), 0.06, 0.92, 0.26));
        // pelo negro
        g.add(pos(sph(0.3, "#000"), 0, 1.18, -0.03));
        // capa cuello
        var collar = cone(0.3, 0.3, "#7b0000"); g.add(pos(collar, 0, 0.95, -0.1));
        break;
      }
      case "robot": {
        g.add(pos(box(0.5, 0.6, 0.4, "#b0bec5", { metalness: 0.8, roughness: 0.3 }), 0, 0.6, 0));
        g.add(pos(box(0.4, 0.4, 0.35, "#90a4ae", { metalness: 0.8, roughness: 0.3 }), 0, 1.1, 0));
        g.add(pos(sph(0.08, "#00e5ff"), -0.1, 1.15, 0.2));
        g.add(pos(sph(0.08, "#00e5ff"), 0.1, 1.15, 0.2));
        g.add(pos(cyl(0.015, 0.015, 0.2, "#90a4ae"), 0, 1.4, 0));
        g.add(pos(sph(0.05, "#ff1744"), 0, 1.52, 0));
        g.add(pos(cyl(0.07, 0.07, 0.4, "#78909c"), -0.32, 0.6, 0));
        g.add(pos(cyl(0.07, 0.07, 0.4, "#78909c"), 0.32, 0.6, 0));
        g.add(pos(cyl(0.09, 0.09, 0.3, "#607d8b"), -0.15, 0.15, 0));
        g.add(pos(cyl(0.09, 0.09, 0.3, "#607d8b"), 0.15, 0.15, 0));
        break;
      }
      case "dragon": {
        var body = sph(0.45, fun ? "#69f0ae" : "#2e7d32"); body.scale.set(1, 1, 1.3);
        g.add(pos(body, 0, 0.6, 0));
        g.add(pos(cyl(0.13, 0.16, 0.5, fun ? "#69f0ae" : "#2e7d32"), 0, 1.05, 0.2));
        g.add(pos(sph(0.24, fun ? "#69f0ae" : "#2e7d32"), 0, 1.35, 0.35));
        g.add(pos(sph(0.05, "#ffeb3b"), -0.1, 1.42, 0.55));
        g.add(pos(sph(0.05, "#ffeb3b"), 0.1, 1.42, 0.55));
        // fuego
        g.add(pos(cone(0.1, 0.3, "#ff6d00"), 0, 1.3, 0.7));
        g.add(pos(cone(0.06, 0.2, "#ffea00"), 0, 1.3, 0.8));
        // alas
        var wing = box(0.4, 0.02, 0.5, fun ? "#b9f6ca" : "#1b5e20"); wing.rotation.z = 0.4;
        g.add(pos(wing, -0.45, 0.85, -0.1));
        var wing2 = box(0.4, 0.02, 0.5, fun ? "#b9f6ca" : "#1b5e20"); wing2.rotation.z = -0.4;
        g.add(pos(wing2, 0.45, 0.85, -0.1));
        // cola
        var tail = cone(0.15, 0.7, fun ? "#69f0ae" : "#2e7d32"); tail.rotation.x = -Math.PI / 2.2;
        g.add(pos(tail, 0, 0.6, -0.7));
        break;
      }
      case "ogro": {
        g.add(pos(cyl(0.35, 0.45, 0.8, fun ? "#aed581" : "#558b2f"), 0, 0.55, 0));
        g.add(pos(sph(0.4, fun ? "#aed581" : "#558b2f"), 0, 1.2, 0));
        addFace(g, 1.25, 0.36, fun, "#fff");
        // colmillos hacia arriba
        g.add(pos(cone(0.04, 0.12, "#fff"), -0.1, 1.12, 0.34));
        g.add(pos(cone(0.04, 0.12, "#fff"), 0.1, 1.12, 0.34));
        // garrote
        var club = cyl(0.06, 0.1, 0.7, "#5d4037"); club.rotation.z = -0.4;
        g.add(pos(club, 0.5, 0.9, 0));
        g.add(pos(sph(0.18, "#4e342e"), 0.72, 1.18, 0));
        // brazos
        var aL = cyl(0.1, 0.1, 0.5, fun ? "#aed581" : "#558b2f"); aL.rotation.z = 0.4; g.add(pos(aL, -0.42, 0.75, 0));
        break;
      }
      case "aterrador": {
        // EL ATERRADOR: cuerpo oscuro con una gran cara roja en la barriga que se mueve
        var bodyC = fun ? "#7e57c2" : "#1b0026";
        var torso = cyl(0.42, 0.5, 1.0, bodyC, { roughness: 0.7 });
        g.add(pos(torso, 0, 0.6, 0));
        g.add(pos(sph(0.3, bodyC), 0, 1.2, 0)); // cabeza pequeña arriba
        // ojos rojos brillantes en la cabeza
        var eHi = glowMat("#ff0000", "#ff0000", 1.2);
        var eye1 = new T.Mesh(new T.SphereGeometry(0.05, 12, 12), eHi);
        var eye2 = new T.Mesh(new T.SphereGeometry(0.05, 12, 12), eHi);
        g.add(pos(eye1, -0.1, 1.24, 0.27));
        g.add(pos(eye2, 0.1, 1.24, 0.27));
        // brazos largos
        var aL = cyl(0.07, 0.06, 0.7, bodyC); aL.rotation.z = 0.6; g.add(pos(aL, -0.45, 0.7, 0.1));
        var aR = cyl(0.07, 0.06, 0.7, bodyC); aR.rotation.z = -0.6; g.add(pos(aR, 0.45, 0.7, 0.1));
        g.add(pos(sph(0.09, bodyC), -0.62, 0.42, 0.18));
        g.add(pos(sph(0.09, bodyC), 0.62, 0.42, 0.18));
        // GRAN CARA ROJA en la barriga (se mueve)
        var face = new T.Group();
        var faceMat = mat("#d40000", { emissive: new T.Color("#5a0000"), emissiveIntensity: 0.6 });
        var faceDisc = new T.Mesh(new T.SphereGeometry(0.3, 20, 20), faceMat);
        faceDisc.scale.set(1, 1, 0.5);
        face.add(faceDisc);
        // ojos blancos furiosos
        face.add(pos(sph(0.08, "#fff"), -0.12, 0.08, 0.18));
        face.add(pos(sph(0.08, "#fff"), 0.12, 0.08, 0.18));
        face.add(pos(sph(0.04, "#000"), -0.12, 0.08, 0.24));
        face.add(pos(sph(0.04, "#000"), 0.12, 0.08, 0.24));
        // cejas enojadas
        var br1 = box(0.12, 0.025, 0.02, "#000"); br1.rotation.z = -0.5; face.add(pos(br1, -0.12, 0.18, 0.22));
        var br2 = box(0.12, 0.025, 0.02, "#000"); br2.rotation.z = 0.5; face.add(pos(br2, 0.12, 0.18, 0.22));
        // boca abierta con dientes
        var mo = new T.Mesh(new T.SphereGeometry(0.13, 16, 16), mat("#1a0000"));
        mo.scale.set(1, 0.8, 0.5); face.add(pos(mo, 0, -0.1, 0.2));
        for (var dd = 0; dd < 5; dd++) {
          var tt = cone(0.022, 0.07, "#fff"); tt.rotation.x = Math.PI;
          face.add(pos(tt, -0.09 + dd * 0.045, -0.02, 0.27));
        }
        pos(face, 0, 0.55, 0.46);
        g.add(face);
        g.userData.bellyFace = face;
        break;
      }
      default: {
        var gb = sph(0.45, fun ? "#ff80ab" : "#4a148c"); g.add(pos(gb, 0, 0.5, 0));
        addFace(g, 0.55, 0.42, fun);
      }
    }

    // boca aterradora oculta + función de susto para TODOS los monstruos
    var faceY = ({
      ojos: 0.45, puya: 0.55, pierna: 0.55, lindo: 0.6, fantasma: 0.85,
      calavera: 1.0, arana: 0.6, "araña": 0.6, diablo: 0.6, alien: 1.05,
      payaso: 1.1, vampiro: 1.0, robot: 1.1, dragon: 1.3, ogro: 1.2, aterrador: 0.55
    })[id] || 0.55;
    var faceZ = (id === "aterrador") ? 0.48 : 0.45;
    addScaryMouth(g, faceY, faceZ);
    g.userData.faceY = faceY;
    g.userData.scaring = 0;
    // activa la cara fea: abre boca, tiembla, ojos rojos
    g.userData.scare = function () { g.userData.scaring = 0.001; if (g.userData.scaryMouth) g.userData.scaryMouth.visible = true; };
    g.userData.monsterId = id;
    return g;
  }

  /* ============================================================
     ELEMENTOS DE ENTORNO
     ============================================================ */
  function buildBush(lit) {
    var g = new T.Group();
    var c = "#2e7d32";
    g.add(pos(sph(0.4, c), 0, 0.35, 0));
    g.add(pos(sph(0.3, "#388e3c"), -0.3, 0.3, 0.1));
    g.add(pos(sph(0.3, "#388e3c"), 0.3, 0.3, 0.1));
    g.add(pos(cyl(0.08, 0.1, 0.2, "#5d4037"), 0, 0.1, 0));
    return g;
  }
  function buildGardenBall() {
    var g = new T.Group();
    g.add(pos(sph(0.35, "#43a047", { roughness: 0.2, metalness: 0.3 }), 0, 0.35, 0));
    return g;
  }
  function buildDoor(numTexture) {
    var g = new T.Group();
    // marco
    var frame = box(1.05, 1.55, 0.12, "#3d2410");
    g.add(pos(frame, 0, 0.75, -0.04));
    // panel (pivota en el borde izquierdo)
    var panel = new T.Group();
    var leaf = box(0.9, 1.4, 0.1, "#8b5a2b");
    pos(leaf, 0.45, 0, 0); // desplazado para pivotar en x=0 (bisagra)
    panel.add(leaf);
    // pomo
    panel.add(pos(sph(0.05, GOLD, { metalness: 0.9 }), 0.8, 0, 0.08));
    // numero
    if (numTexture) {
      var plate = new T.Mesh(new T.PlaneGeometry(0.5, 0.5), new T.MeshBasicMaterial({ map: numTexture, transparent: true }));
      pos(plate, 0.45, 0.35, 0.06);
      panel.add(plate);
    }
    pos(panel, -0.45, 0.75, 0.03);
    g.add(panel);
    g.userData.panel = panel;
    return g;
  }

  function numberTexture(n) {
    var c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#ffe0b0";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), 64, 70);
    var tex = new T.CanvasTexture(c);
    return tex;
  }

  function buildBalloon(color) {
    var g = new T.Group();
    g.add(pos(sph(0.3, color || "#ff5fa2"), 0, 0, 0));
    g.add(pos(cone(0.06, 0.1, color || "#ff5fa2"), 0, -0.3, 0));
    g.add(pos(cyl(0.005, 0.005, 0.6, "#ffffff"), 0, -0.6, 0));
    return g;
  }

  // Animación de susto de un monstruo (llamar en el loop de render)
  function updateMonsterScare(mon, dt, t) {
    if (!mon || !mon.userData) return;
    if (mon.userData.macarena > 0) {
      updateMacarena(mon, mon.userData.macarena);
      return;
    }
    if (mon.userData.bellyFace) {
      // la cara roja se mueve por la barriga
      var f = mon.userData.bellyFace;
      f.position.x = Math.sin(t * 3) * 0.18;
      f.position.y = 0.55 + Math.sin(t * 4.5) * 0.12;
      f.scale.setScalar(1 + Math.sin(t * 8) * 0.05);
    }
    if (mon.userData.scaring > 0) {
      mon.userData.scaring += dt;
      var s = mon.userData.scaring;
      // temblor
      mon.position.x += Math.sin(s * 45) * 0.012;
      var sm = mon.userData.scaryMouth;
      if (sm) { sm.visible = true; sm.scale.setScalar(0.8 + Math.abs(Math.sin(s * 14)) * 0.6); }
    }
  }

  // Macarena: secuencia de brazos reconocible (payaso con hombros articulados)
  var MACARENA_STEPS = [
    { lz: 1.45, rz: -1.45, lx: 0, rx: 0, ly: 0, ry: 0 },       // brazos al frente
    { lz: 0.35, rz: -0.35, lx: 0.55, rx: -0.55, ly: 0.1, ry: 0.1 }, // cruzados
    { lz: -0.35, rz: 0.35, lx: -0.55, rx: 0.55, ly: 0.1, ry: 0.1 }, // cruzados al revés
    { lz: -2.4, rz: 2.4, lx: 0.9, rx: -0.9, ly: 0.35, ry: 0.35 },   // manos en la nuca
    { lz: -2.9, rz: 2.9, lx: 0, rx: 0, ly: 0, ry: 0 }               // brazos arriba
  ];
  function lerpMac(a, b, k) {
    return {
      lz: a.lz + (b.lz - a.lz) * k, rz: a.rz + (b.rz - a.rz) * k,
      lx: a.lx + (b.lx - a.lx) * k, rx: a.rx + (b.rx - a.rx) * k,
      ly: a.ly + (b.ly - a.ly) * k, ry: a.ry + (b.ry - a.ry) * k
    };
  }
  function applyMacPose(sh, p) {
    sh.L.rotation.z = p.lz; sh.L.rotation.x = p.lx; sh.L.rotation.y = p.ly;
    sh.R.rotation.z = p.rz; sh.R.rotation.x = p.rx; sh.R.rotation.y = p.ry;
  }
  function updateMacarena(mon, danceTime) {
    var sh = mon.userData.macShoulders;
    if (!sh) {
      mon.rotation.z = Math.sin(danceTime * 12) * 0.35;
      mon.position.y = Math.abs(Math.sin(danceTime * 10)) * 0.25;
      return;
    }
    var stepDur = 0.65;
    var total = MACARENA_STEPS.length;
    var idx = Math.floor(danceTime / stepDur) % total;
    var next = (idx + 1) % total;
    var blend = (danceTime % stepDur) / stepDur;
    var pose = lerpMac(MACARENA_STEPS[idx], MACARENA_STEPS[next], blend);
    applyMacPose(sh, pose);
    mon.rotation.y = Math.sin(danceTime * 2.8) * 0.25;
    mon.rotation.z = Math.sin(danceTime * 6) * 0.08;
    mon.position.y = Math.abs(Math.sin(danceTime * 8)) * 0.18;
  }
  function startMacarena(mon) {
    if (!mon || !mon.userData) return;
    ensureMacarenaShoulders(mon);
    mon.userData.macarena = 0.001;
    if (mon.userData.scaryMouth) mon.userData.scaryMouth.visible = false;
    mon.userData.scaring = 0;
  }
  function stopMacarena(mon) {
    if (mon && mon.userData) mon.userData.macarena = 0;
  }

  // Cuarto/sala detrás de una puerta
  function buildRoom(theme) {
    var g = new T.Group();
    var wallC = theme === "gracioso" ? "#ffd6f0" : (theme === "terror" ? "#1a0a25" : "#241046");
    var floorC = theme === "gracioso" ? "#ffb3e0" : (theme === "terror" ? "#0d0014" : "#160a2c");
    var floor = new T.Mesh(new T.PlaneGeometry(7, 6), mat(floorC, { roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; g.add(floor);
    var back = new T.Mesh(new T.PlaneGeometry(7, 4.5), mat(wallC));
    back.position.set(0, 2.25, -3); g.add(back);
    var left = new T.Mesh(new T.PlaneGeometry(6, 4.5), mat(wallC));
    left.rotation.y = Math.PI / 2; left.position.set(-3.5, 2.25, 0); g.add(left);
    var right = new T.Mesh(new T.PlaneGeometry(6, 4.5), mat(wallC));
    right.rotation.y = -Math.PI / 2; right.position.set(3.5, 2.25, 0); g.add(right);
    // cuadro/ventana decorativa
    g.add(pos(box(1.0, 0.7, 0.06, theme === "terror" ? "#3a0030" : "#7c4dff"), -1.8, 2.6, -2.9));
    g.add(pos(box(1.0, 0.7, 0.06, theme === "terror" ? "#3a0030" : "#ff7ac3"), 1.8, 2.6, -2.9));
    // alfombra
    var rug = new T.Mesh(new T.CircleGeometry(1.4, 24), mat(theme === "gracioso" ? "#ff9ed6" : "#5a1020", { roughness: 0.9 }));
    rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; g.add(rug);
    return g;
  }

  // Computadora sobre un escritorio
  function buildComputer() {
    var g = new T.Group();
    g.add(pos(box(1.0, 0.08, 0.5, "#5d4037"), 0, 0.7, 0)); // mesa
    g.add(pos(cyl(0.04, 0.04, 0.7, "#3e2723"), -0.4, 0.35, 0.18));
    g.add(pos(cyl(0.04, 0.04, 0.7, "#3e2723"), 0.4, 0.35, 0.18));
    g.add(pos(cyl(0.04, 0.04, 0.7, "#3e2723"), -0.4, 0.35, -0.18));
    g.add(pos(cyl(0.04, 0.04, 0.7, "#3e2723"), 0.4, 0.35, -0.18));
    // monitor
    g.add(pos(box(0.6, 0.4, 0.04, "#111"), 0, 1.05, -0.1));
    var screen = new T.Mesh(new T.PlaneGeometry(0.54, 0.34), glowMat("#22d3ee", "#22d3ee", 0.9));
    g.add(pos(screen, 0, 1.05, -0.07));
    g.add(pos(cyl(0.06, 0.1, 0.1, "#222"), 0, 0.83, -0.1)); // base
    // teclado
    g.add(pos(box(0.45, 0.03, 0.16, "#333"), 0, 0.76, 0.12));
    g.userData.screen = screen;
    return g;
  }

  // Comida (snack) para el poder "Crear comida"
  function buildSnack() {
    var g = new T.Group();
    g.add(pos(cyl(0.22, 0.24, 0.08, "#e0a96d"), 0, 0.06, 0)); // pan abajo
    g.add(pos(box(0.32, 0.05, 0.32, "#3aa655"), 0, 0.11, 0)); // lechuga
    g.add(pos(box(0.3, 0.08, 0.3, "#b5471f"), 0, 0.17, 0)); // carne
    g.add(pos(box(0.28, 0.04, 0.28, "#ffd23f"), 0, 0.22, 0)); // queso
    g.add(pos(sph(0.24, "#e8b06a"), 0, 0.3, 0)); // pan arriba
    g.add(pos(sph(0.02, "#fff"), -0.06, 0.42, 0.05)); // semillitas
    g.add(pos(sph(0.02, "#fff"), 0.07, 0.42, -0.03));
    return g;
  }

  // Torre para esconderse (poder)
  function buildTower(theme) {
    var g = new T.Group();
    var c = theme === "gracioso" ? "#ff9ed6" : "#6d4c41";
    var c2 = theme === "gracioso" ? "#ffd1ec" : "#8d6e63";
    g.add(pos(cyl(0.55, 0.65, 1.8, c, { roughness: 0.8 }), 0, 0.9, 0));
    g.add(pos(cyl(0.62, 0.62, 0.18, c2), 0, 1.85, 0)); // borde
    // almenas
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      g.add(pos(box(0.14, 0.22, 0.14, c2), Math.cos(a) * 0.55, 2.0, Math.sin(a) * 0.55));
    }
    // techo cónico
    g.add(pos(cone(0.7, 0.7, theme === "gracioso" ? "#ff5fa2" : "#4527a0"), 0, 2.45, 0));
    g.add(pos(sph(0.1, GOLD, { metalness: 0.9 }), 0, 2.85, 0));
    // puerta/entrada oscura
    g.add(pos(box(0.4, 0.7, 0.1, "#1a0a05"), 0, 0.45, 0.6));
    // ventanita
    g.add(pos(box(0.2, 0.25, 0.1, "#2a1a40"), 0, 1.3, 0.62));
    return g;
  }

  // Cuchillo para Enfrentamiento
  function buildKnife() {
    var g = new T.Group();
    var blade = box(0.04, 0.35, 0.08, SILVER, { metalness: 0.9, roughness: 0.2 });
    g.add(pos(blade, 0, 0.22, 0));
    g.add(pos(box(0.14, 0.04, 0.06, GOLD, { metalness: 0.85 }), 0, 0.02, 0));
    g.add(pos(cyl(0.025, 0.03, 0.14, "#5d4037"), 0, -0.06, 0));
    g.userData.blade = blade;
    return g;
  }

  // Monstruo morado humanoide (Modo Medio — Enfrentamiento)
  function buildPurpleMonster() {
    var g = new T.Group();
    var PURPLE = "#7b1fa2";
    var PURPLE2 = "#9c27b0";
    var PINK = "#ff4081";
    var BLACK = "#1a1a1a";

    var legL = cyl(0.14, 0.16, 0.75, PINK);
    g.add(pos(legL, -0.18, 0.38, 0));
    var legR = cyl(0.14, 0.16, 0.75, BLACK);
    g.add(pos(legR, 0.18, 0.38, 0));
    g.add(pos(box(0.32, 0.38, 0.22, PINK), -0.18, 0.55, 0));
    g.add(pos(box(0.32, 0.38, 0.22, BLACK), 0.18, 0.55, 0));
    g.add(pos(box(0.22, 0.1, 0.32, "#333"), -0.18, 0.05, 0.04));
    g.add(pos(box(0.22, 0.1, 0.32, "#333"), 0.18, 0.05, 0.04));

    g.add(pos(cyl(0.32, 0.38, 0.85, PURPLE), 0, 1.05, 0));
    g.add(pos(box(0.5, 0.12, 0.28, PURPLE2), 0, 1.42, 0));

    var armL = cyl(0.09, 0.1, 0.65, PURPLE2);
    armL.rotation.z = 0.4;
    g.add(pos(armL, -0.42, 1.0, 0));
    var armR = cyl(0.09, 0.1, 0.65, PURPLE2);
    armR.rotation.z = -0.4;
    g.add(pos(armR, 0.42, 1.0, 0));
    g.add(pos(sph(0.1, PURPLE), -0.55, 0.68, 0));
    g.add(pos(sph(0.1, PURPLE), 0.55, 0.68, 0));

    var headGroup = new T.Group();
    headGroup.name = "headGroup";
    headGroup.add(pos(sph(0.32, PURPLE), 0, 0, 0));
    headGroup.add(pos(sph(0.34, REDHAIR), 0, 0.08, -0.06));
    headGroup.add(pos(box(0.55, 0.14, 0.18, REDHAIR), 0, 0.18, 0.14));
    headGroup.add(pos(cyl(0.06, 0.04, 0.45, REDHAIR), -0.28, -0.12, -0.04));
    headGroup.add(pos(cyl(0.06, 0.04, 0.45, REDHAIR), 0.28, -0.12, -0.04));
    headGroup.add(pos(sph(0.09, "#ffff00"), -0.12, 0.04, 0.28));
    headGroup.add(pos(sph(0.09, "#ffff00"), 0.12, 0.04, 0.28));
    headGroup.add(pos(sph(0.05, "#111"), -0.12, 0.04, 0.34));
    headGroup.add(pos(sph(0.05, "#111"), 0.12, 0.04, 0.34));
    var mouth = tor(0.1, 0.025, "#3a0000");
    mouth.rotation.x = Math.PI / 2;
    headGroup.add(pos(mouth, 0, -0.1, 0.28));
    headGroup.add(pos(sph(0.06, "#d40000"), -0.18, -0.02, 0.26));
    headGroup.add(pos(sph(0.05, "#b3001b"), 0.16, 0.06, 0.24));
    headGroup.add(pos(sph(0.04, "#ff1744"), 0.08, -0.14, 0.27));
    headGroup.add(pos(box(0.04, 0.12, 0.02, "#d40000"), -0.1, -0.08, 0.3));
    headGroup.position.set(0, 1.65, 0);
    g.add(headGroup);

    g.userData.headGroup = headGroup;
    g.userData.legs = [legL, legR];
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.walkPhase = 0;

    g.userData.tick = function (dt, t) {
      if (g.userData.headDetached) return;
      g.userData.walkPhase += dt * 5;
      var ph = g.userData.walkPhase;
      g.userData.legs.forEach(function (leg, i) {
        leg.rotation.x = Math.sin(ph + i * Math.PI) * 0.45;
      });
      g.position.y = Math.abs(Math.sin(ph * 2)) * 0.06;
      g.rotation.z = Math.sin(ph) * 0.04;
      g.userData.armL.rotation.x = Math.sin(ph) * 0.35;
      g.userData.armR.rotation.x = -Math.sin(ph) * 0.35;
    };

    g.userData.scare = function () {
      g.scale.setScalar(1.25);
      if (g.userData.headGroup) g.userData.headGroup.rotation.z = 0.2;
    };

    return g;
  }

  // Separa la cabeza del monstruo morado y la hace caer
  function detachHead(monster, scene) {
    if (!monster || !monster.userData.headGroup || monster.userData.headDetached) return null;
    var head = monster.userData.headGroup;
    monster.userData.headDetached = true;
    var worldPos = new T.Vector3();
    head.getWorldPosition(worldPos);
    var worldQuat = new T.Quaternion();
    head.getWorldQuaternion(worldQuat);
    monster.remove(head);
    scene.add(head);
    head.position.copy(worldPos);
    head.quaternion.copy(worldQuat);
    head.userData.vy = 0;
    head.userData.vx = 0.8;
    head.userData.vz = 0.3;
    head.userData.spin = 2.5;
    head.userData.tick = function (dt) {
      head.userData.vy -= 9.8 * dt;
      head.position.y += head.userData.vy * dt;
      head.position.x += head.userData.vx * dt;
      head.position.z += head.userData.vz * dt;
      head.rotation.z += head.userData.spin * dt;
      if (head.position.y < 0.15) {
        head.position.y = 0.15;
        head.userData.vy = Math.abs(head.userData.vy) * 0.3;
        head.userData.spin *= 0.8;
      }
    };
    return head;
  }

  // Personaje pequeño asustado (otra muñequita en la sala)
  function buildLittleDoll(color) {
    var g = new T.Group();
    g.add(pos(cyl(0.13, 0.18, 0.4, color || "#4db8ff"), 0, 0.35, 0));
    g.add(pos(sph(0.18, SKIN), 0, 0.72, 0));
    g.add(pos(sph(0.2, "#3a2a1a"), 0, 0.78, -0.03)); // pelo
    // ojos muy abiertos (asustado)
    g.add(pos(sph(0.05, "#fff"), -0.07, 0.74, 0.15));
    g.add(pos(sph(0.05, "#fff"), 0.07, 0.74, 0.15));
    g.add(pos(sph(0.025, "#000"), -0.07, 0.74, 0.19));
    g.add(pos(sph(0.025, "#000"), 0.07, 0.74, 0.19));
    // boca abierta (grito)
    g.add(pos(sph(0.04, "#5a1020"), 0, 0.64, 0.16));
    // bracitos arriba (susto)
    var aL = cyl(0.04, 0.04, 0.3, SKIN); aL.rotation.z = 1.0; g.add(pos(aL, -0.18, 0.55, 0));
    var aR = cyl(0.04, 0.04, 0.3, SKIN); aR.rotation.z = -1.0; g.add(pos(aR, 0.18, 0.55, 0));
    return g;
  }

  // Crea luces/fondo para un tema dado y los añade a la escena.
  function applyTheme(scene, theme) {
    if (theme === "terror") {
      scene.background = new T.Color("#120018");
      scene.fog = new T.Fog("#120018", 8, 26);
    } else if (theme === "gracioso") {
      scene.background = new T.Color("#bfe3ff");
      scene.fog = new T.Fog("#cfeaff", 14, 40);
    } else if (theme === "medio") {
      scene.background = new T.Color("#2a1545");
      scene.fog = new T.Fog("#2a1545", 10, 30);
    } else {
      scene.background = new T.Color("#1a1030");
      scene.fog = new T.Fog("#1a1030", 12, 34);
    }
  }

  function standardLights(scene, theme) {
    var amb = new T.AmbientLight(0xffffff, theme === "gracioso" ? 0.9 : 0.5);
    scene.add(amb);
    var dir = new T.DirectionalLight(0xffffff, theme === "gracioso" ? 0.8 : 0.65);
    dir.position.set(5, 12, 7);
    scene.add(dir);
    // luz de relleno suave desde el frente para que las caras se vean
    var fill = new T.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-3, 4, 8);
    scene.add(fill);
    if (theme === "terror") {
      var red = new T.PointLight(0xff0040, 1.3, 32);
      red.position.set(-4, 5, 4);
      scene.add(red);
      var purple = new T.PointLight(0x9b30ff, 1.0, 32);
      purple.position.set(5, 4, -3);
      scene.add(purple);
      var rim = new T.PointLight(0x00e5ff, 0.5, 26);
      rim.position.set(0, 6, -6);
      scene.add(rim);
    } else if (theme === "gracioso") {
      var pink = new T.PointLight(0xff7ac3, 0.8, 32);
      pink.position.set(-4, 5, 4);
      scene.add(pink);
      var blue = new T.PointLight(0x4db8ff, 0.6, 32);
      blue.position.set(4, 5, 2);
      scene.add(blue);
    } else if (theme === "medio") {
      var mp = new T.PointLight(0xe040fb, 1.0, 32);
      mp.position.set(-4, 6, 4);
      scene.add(mp);
      var mk = new T.PointLight(0xff4081, 0.7, 28);
      mk.position.set(5, 4, 2);
      scene.add(mk);
    } else {
      var p = new T.PointLight(0xb388ff, 0.9, 32);
      p.position.set(-4, 6, 4);
      scene.add(p);
    }
  }

  window.ATModels = {
    buildDoll: buildDoll,
    buildMinion: buildMinion,
    darkenGroup: darkenGroup,
    buildCoinSprite: buildCoinSprite,
    buildMiniLolPlush: buildMiniLolPlush,
    ensureMacarenaShoulders: ensureMacarenaShoulders,
    buildMonster: buildMonster,
    buildBush: buildBush,
    buildGardenBall: buildGardenBall,
    buildDoor: buildDoor,
    numberTexture: numberTexture,
    buildBalloon: buildBalloon,
    buildRoom: buildRoom,
    buildComputer: buildComputer,
    buildSnack: buildSnack,
    buildTower: buildTower,
    buildLittleDoll: buildLittleDoll,
    buildKnife: buildKnife,
    buildPurpleMonster: buildPurpleMonster,
    detachHead: detachHead,
    updateMonsterScare: updateMonsterScare,
    updateMacarena: updateMacarena,
    startMacarena: startMacarena,
    stopMacarena: stopMacarena,
    applyTheme: applyTheme,
    standardLights: standardLights,
    _mat: mat, _box: box, _sph: sph, _cyl: cyl, _cone: cone, _tor: tor, _pos: pos, _glowMat: glowMat
  };
})();
