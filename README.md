# 👹 ATERRADOR 3D — El juego de Isabella 💖

¡Ahora en **3D de verdad**! Un juego para el navegador, **sin instalar nada,
sin internet y sin crear cuenta**. Funciona en computadora, tablet o celular.
Para edades de 4 a 26 años. 🎈

Los gráficos 3D están hechos con **three.js** y todos los modelos (la muñeca,
las skins, los monstruos y los escenarios) se construyen con figuras de colores
dentro del propio código. No hay archivos pesados ni dibujos externos.

## ▶️ Cómo abrir el juego

1. Abre la carpeta del juego.
2. Haz **doble clic** en el archivo **`index.html`**.
3. ¡Listo! El juego se abre en tu navegador (Chrome, Edge, Firefox...).

No necesitas internet, ni servidor, ni programas extra. Todo funciona abriendo
el archivo directamente (`file://`).

## 🎮 Cómo jugar

1. En **Inicio**, mira a la muñeca girar en 3D y toca **▶️ JUGAR**.
2. Elige un **modo**:
   - **TERRORÍFICO** 👹 — morado, negro, luces rojas (de miedo).
   - **GRACIOSO** 🤡 — rosado, azul y globos voladores.
3. En el **menú**, elige un juego:
   - **🚪 Puertas**: hay 30 puertas en 3D. **Toca una** y se abre: ¡sale un
     monstruo distinto cada vez!
   - **🌳 Escondite**: jardín 3D con arbustos y **luces verdes** 💚. **Camina**
     hasta una luz verde para esconderte. Si te quedas quieta mucho tiempo,
     ¡**TE SALES DEL JUEGO**! En modo gracioso, el payaso baila la macarena
     cuando te encuentra. 💃
   - **🏃 Carrera**: corredor en 3D. Huye del monstruo y agarra todas las
     cajitas para ganar dinero (¡hasta **$940.000**!) y poderes. Si no agarras
     ninguna, ganas $0 o $1. Usa **flechas** o **WASD** en la compu, o los
     **botones** y **toca la pista** en tablet/celular.
   - **❓ Preguntas**: cara a cara en 3D con un personaje. Responde preguntas
     fáciles. En modo gracioso, alegra al payaso enojado con su peluche 🧸 o
     bailando macarena 💃.
   - **🎀 Skins**: mira tu muñeca en 3D y cámbiale el look (Barbie sirena, LOL
     Surprise, taza, mono, dinosaurio rojo...). ¡Es solo decoración!
   - **✨ Poderes**: compra poderes con las monedas que ganas en la Carrera
     (Saltar alto, Invisible, Correr con fuego, Volar).

## 💾 ¿Se guarda mi progreso?

¡Sí! Las **monedas**, los **poderes** comprados y la **skin** elegida se guardan
en el navegador (almacenamiento local). Si abres el juego otra vez en la misma
computadora y navegador, seguirá tu progreso.

## 🛠️ Hecho con

- **HTML + CSS + JavaScript** clásico (sin módulos, sin `npm`, sin compilar).
- **three.js r128** incluido localmente en la carpeta `vendor/three.min.js`
  (versión global clásica, para que funcione abriendo el archivo sin internet).
- Todos los modelos 3D se generan con código (esferas, cubos, cilindros, conos...).

### Archivos

- `index.html` — estructura y el lienzo 3D.
- `styles.css` — estilos y los dos temas.
- `vendor/three.min.js` — la librería 3D (incluida).
- `models.js` — los modelos 3D (muñeca, skins, monstruos, escenarios).
- `scenes.js` — el motor de render y las escenas de cada juego.
- `game.js` — la lógica (menús, monedas, poderes, skins, partidas).

¡Diviértete, Isabella! 🎉
