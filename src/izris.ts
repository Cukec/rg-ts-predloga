import { Vektor, Matrika } from "./matematika";
import type { Prizor, Transformacija, Tocka } from "./branje";

export type TrikotnikVektorjev = [Vektor, Vektor, Vektor];

// Točka s homogeno komponento
function hTocka(t: Tocka): Vektor {
    return new Vektor(t[0], t[1], t[2], 1);
}

function matrikaTransformacije(t: Transformacija): Matrika {
    const [a,b,c] = t.parameters;

    switch (t.type) {
        case "scale":
            return Matrika.razteg(a,b,c);
        case "translate":
            return Matrika.pomik(a,b,c);
        case "rotate":
            return Matrika.zasukZ(c).pomnozi(Matrika.zasukY(b)).pomnozi(Matrika.zasukX(a));
    }
}

export function zgradiTransformacijo(transformacije: Transformacija[]): Matrika {
    let m = Matrika.identiteta();

    for (const t of transformacije) {

        m = matrikaTransformacije(t).pomnozi(m);
    }

    return m;
}

export function projeciraj(v: Vektor, projekcija: Matrika): Vektor {
    const p = v.transformiraj(projekcija);

    return new Vektor(p.x / p.o, p.y / p.o, p.z / p.o, 1);
}

export function zaslonskaMatrika(sirina: number, visina: number): Matrika {
    return new Matrika([
        [sirina / 2, 0, 0, sirina / 2],
        [0, -visina / 2, 0, visina / 2],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]);
}

export function narisiTrikotnik(ctx: CanvasRenderingContext2D, trikotnik: TrikotnikVektorjev, projekcija: Matrika, zaslon: Matrika, near: number, far: number): void {

    for (const v of trikotnik) {
        const oddaljenost = -v.z;


        // preveti ali so točke v sceni
        if (oddaljenost < near || oddaljenost > far) {
            return;
        }
    }

    const tocke = trikotnik.map((v) =>
        projeciraj(v, projekcija).transformiraj(zaslon)
    );

    // Risanje
    ctx.beginPath();
    ctx.moveTo(tocke[0].x, tocke[0].y);
    ctx.lineTo(tocke[1].x, tocke[1].y);
    ctx.lineTo(tocke[2].x, tocke[2].y);
    ctx.closePath(); // zadnja stranica nazaj do prvega oglišča
    ctx.stroke();
}

export function izrisiPrizor(prizor: Prizor, ctx: CanvasRenderingContext2D): void {
    const sirina = ctx.canvas.width;
    const visina = ctx.canvas.height;

    // prazno platno
    ctx.clearRect(0, 0, sirina, visina);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    const kamera = prizor.camera;
    const pogled = Matrika.pogled(kamera.position, kamera.rotation);
    const projekcija = Matrika.perspektiva(
        kamera.fov,
        sirina / visina,
        kamera.near,
        kamera.far,
    );

    const zaslon = zaslonskaMatrika(sirina, visina);

    for (const objekt of prizor.scene) {
        const model = prizor.models[objekt.model];

        const modelPogled = pogled.pomnozi(zgradiTransformacijo(objekt.transforms));

        for (const t of model) {
            const trikotnik: TrikotnikVektorjev = [
                hTocka(t[0]).transformiraj(modelPogled),
                hTocka(t[1]).transformiraj(modelPogled),
                hTocka(t[2]).transformiraj(modelPogled),
            ];

            narisiTrikotnik(ctx, trikotnik, projekcija, zaslon, kamera.near, kamera.far);
        }
    }
}