function vRadiane (stopinje: number): number {
    return (stopinje * Math.PI) / 180;
}

export class Vektor {
    komponente: number[];

    constructor(x: number, y: number, z:number, o: number = 1) {
        this.komponente = [x, y, z, o];
    }

    // GET
    get x(): number {
        return this.komponente[0];
    }
    get y(): number {
        return this.komponente[1];
    }
    get z(): number {
        return this.komponente[2];
    }
    get o(): number {
        return this.komponente[3];
    }

    // Transformacija
    transformiraj(m: Matrika): Vektor {
        const r = [0, 0, 0, 0];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r[i] += m.elementi[i][j] * this.komponente[j];
            }
        }
        return new Vektor(r[0], r[1], r[2], r[3]);

    }

    toString(): string {
        return "(" + this.komponente.map((k) => k.toFixed(3)).join(", ") + ")";
    }
}

export class Matrika {

    elementi: number[][];

    constructor(elementi: number[][]) {
        this.elementi = elementi;
    }

    toString(): string {
        return this.elementi.map((vrstica) =>
            vrstica.map((e) => e.toFixed(3).padStart(9)).join(" "),
        ).join("\n");
    }

    pomnozi(b: Matrika): Matrika {
        const c: number[][] = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
        ];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++){
                for (let k = 0; k < 4; k++){

                    c[i][j] += this.elementi[i][k] * b.elementi[k][j];
                }
            }
        }

        return new Matrika(c);
    }

    static identiteta(): Matrika {
        return new Matrika([
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1],
        ]);
    }

    static pomik(tx: number, ty: number, tz: number): Matrika {
        return new Matrika([
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1],
        ]);
    }

    static razteg(sx: number, sy: number, sz: number): Matrika {
        return new Matrika([
        [sx, 0, 0, 0],
        [0, sy, 0, 0],
        [0, 0, sz, 0],
        [0, 0, 0, 1],
        ]);
    }

    // ROTACIJE

    static zasukX(kot: number): Matrika {
        const c = Math.cos(vRadiane(kot));
        const s = Math.sin(vRadiane(kot));
        return new Matrika([
        [1, 0, 0, 0],
        [0, c, -s, 0],
        [0, s, c, 0],
        [0, 0, 0, 1],
        ]);
    }

    static zasukY(kot: number): Matrika {
        const c = Math.cos(vRadiane(kot));
        const s = Math.sin(vRadiane(kot));
        return new Matrika([
        [c, 0, s, 0],
        [0, 1, 0, 0],
        [-s, 0, c, 0],
        [0, 0, 0, 1],
        ]);
    }

    static zasukZ(kot: number): Matrika {
        const c = Math.cos(vRadiane(kot));
        const s = Math.sin(vRadiane(kot));
        return new Matrika([
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        ]);
    }

    // PROJEKCIJE

    static perspektiva(fov: number, razmerje: number, near: number, far: number): Matrika {
        
        const fokus = 1 / Math.tan(vRadiane(fov) / 2);
        
        return new Matrika([
        [fokus / razmerje, 0, 0, 0],
        [0, fokus, 0, 0],
        [0, 0, (far + near) / (near - far), (2 * far * near) / (near - far)],
        [0, 0, -1, 0],
        ]);
    }

    static pogled(polozaj: number[], zasuk: number[]): Matrika {
        
        const [px, py, pz] = polozaj;
        const [rx, ry, rz] = zasuk;

        const obratniZasuk = Matrika.zasukX(-rx)
        .pomnozi(Matrika.zasukY(-ry))
        .pomnozi(Matrika.zasukZ(-rz));

        const obratniPomik = Matrika.pomik(-px, -py, -pz);

        return obratniZasuk.pomnozi(obratniPomik);
    }
}