import { preberiDatoteko, preberiNalozenoDatoteko } from "./branje";
import { Vektor, Matrika } from "./matematika";
import { izrisiPrizor } from "./izris";

// Platno iz HTML dokumenta lahko pridobimo prek njegovega ID-ja.
// Ta ID smo nastavili v HTML datoteki (id="canvas").
const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

/*
  funkcija document.querySelector lahko vrne html element ali pa null, 
  ča te ne obstaja. Za razliko od Jave moramo v TypeScriptu primere, kadar
  je spremenjivka lahko null, eksplicitno preveriti.
*/
if (!canvas) {
  throw new Error("Failed to get canvas context");
}

/*
  Za risanje na platno potrebujemo kontekst - vmesnik, ki nam
  ponuja funkcionalnosti risanja. Pridobimo ga s platna.

  Zakaj je na koncu te vrstice '!'? Kot smo omenili zgoraj TypeScript od
  nas zahteva, da eksplicitno preverimo, ali je spremenljivka null.
  Vendar pa vemo, da vsak modern brskalnik podpira 2D kontekst, 
  zato lahko uporabimo '!', da TypeScriptu obljubimo, da spremenljivka ctx
  zagotovo ni null.
*/
const ctx = canvas.getContext("2d")!;

function izpisiPrimereMatrik() {

  console.log("===== PRIMERI MATRIK =====");

  // Identiteta
  console.log("Identiteta:\n" + Matrika.identiteta().toString());

  // Pomik
  console.log("Pomik (1, 2, 3):\n" + Matrika.pomik(1, 2, 3).toString());

  // Razteg
  console.log("Razteg (2, 2, 2):\n" + Matrika.razteg(2, 2, 2).toString());

  // Zasuki
  console.log("Zasuk X (90°):\n" + Matrika.zasukX(90).toString());
  console.log("Zasuk Y (90°):\n" + Matrika.zasukY(90).toString());
  console.log("Zasuk Z (90°):\n" + Matrika.zasukZ(90).toString());

  // Perspektiva
  const razmerje = canvas!.width / canvas!.height;
  console.log(
    `Perspektiva (fov 90, razmerje ${razmerje}, near 0.01, far 100):\n` +
      Matrika.perspektiva(90, razmerje, 0.01, 100).toString(),
  );

  // Pogled
  console.log(
    "Pogled (položaj [0, 0, 1], zasuk [-5, -10, 0]):\n" +
      Matrika.pogled([0, 0, 1], [-5, -10, 0]).toString(),
  );

  // Množenje matrik
  const a = Matrika.pomik(1, 2, 3);
  const b = Matrika.razteg(2, 2, 2);
  const c = a.pomnozi(b);

  console.log("A = pomik (1, 2, 3):\n" + a.toString());
  console.log("B = razteg (2, 2, 2):\n" + b.toString());
  console.log("C = A * B:\n" + c.toString());

  // Transformacija vektorja: najprej razteg (B), nato pomik (A)
  const v = new Vektor(1, 1, 1);
  const rezultat = v.transformiraj(c);
  console.log("Vektor v: " + v.toString());
  console.log("C * v: " + rezultat.toString()); // pričakovano (3, 4, 5, 1)
}

izpisiPrimereMatrik();

const podatki = await preberiDatoteko("data/primer.json");

/*
  V JavaScriptu in TypeScriptu lahko podatke v konzolo izpišemo s funkcijo console.log(). 
  Izpis lahko vidimo v brskalniku, če odpremo "Developer Tools" 
  (v Chrome: Ctrl+Shift+I ali F12, v Firefox: Ctrl+Shift+K ali F12).
  V kolikor uporabljamo razhroščevalnik opisan v Readme datoteki, 
  pa se izpis pojavi tudi v terminalu "Debug Console".
*/
console.log("Prebrani podatki:", podatki);

izrisiPrizor(podatki, ctx);

// -----------------
// Konfiguracija drag-and-drop funkcionalnosti
// -----------------

// Pridobimo skrit html element input, ki nam bo olajšal implementacijo.
const fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;

/*
 V tej funkciji bomo definirali kaj se zgodi z datoteko ko jo uporabnik
 spusti na canvas ali izbere prek "file inputa".
 Fukcija prejme parameter tipa File, ki je vgrajen tip v JavaScriptu in TypeScriptu.
 Več o tem tipu si lahko preberete na:
 https://developer.mozilla.org/en-US/docs/Web/API/File
*/
async function obdelajDatoteko(file: File) {
  console.log("Obdelujem datoteko:", file.name, file.type);
  const podatki = await preberiNalozenoDatoteko(file);
  console.log("Naloženi podatki:", podatki);

  izrisiPrizor(podatki, ctx);
}

// Brez tega nam brskalnik ne bo dovolil spustiti datoteke na canvas.
canvas.addEventListener("dragover", (event) => {
  event.preventDefault();
});

/*
  Tu definiramo kaj se zgodi, ko uporabnik spusti datoteko na canvas.
  Datoteko pridobimo iz event.dataTransfer.files, ki je seznam vseh datotek, 
  ki jih je uporabnik spustil. Datoteko bi lahko obdelali kar tukaj, vendar 
  je boljša praksa, da to funkcionalnost definiramo v ločeni funkciji, saj jo 
  bomo potrebovali tudi, če datoteko izberemo prek uporabniškega vmesnika "file input".
*/
canvas.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[0];
  if (!file) return;

  obdelajDatoteko(file);
});

/*
  Trik, s katerim omogočimo, da kliku na canvas odpre uporabniški vmesnik "file input".
*/
canvas.addEventListener("click", () => {
  fileInput.click();
});
/*
  Tu definiramo kaj se zgodi, ko uporabnik izbere datoteko prek
  uporabniškega vmesnika "file input".
  Podobno kot zgoraj, datoteko obdelamo v ločeni funkciji.
*/
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  obdelajDatoteko(file);

  // Po obdelavi datoteke počistimo "file input", da lahko uporabnik
  // isto datoteko izbere večkrat.¸
  fileInput.value = "";
});

// Konec konfiguracije drag-and-drop
