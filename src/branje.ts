export type Tocka = [number, number, number];
export type Trikotnik = [Tocka, Tocka, Tocka];
export type Model = Trikotnik[];

export interface Kamera {

    fov: number; // kot
    near: number; 
    far: number;

    position: Tocka; // polozaj kamere
    rotation: Tocka; 
}

export interface Transformacija {
    type: "scale" | "translate" | "rotate";
    parameters: [number, number, number];
}

export interface ObjektPrizora {
    model: number; // idx. v seznamu
    transforms: Transformacija[];
}

export interface Prizor{
    camera: Kamera;
    models: Model[];
    scene: ObjektPrizora[];
}

// Branje datoteke - pot
export async function preberiDatoteko(pot: string): Promise<Prizor> {
    const odgovor = await fetch(pot);
    const prizor: Prizor = await odgovor.json();
    
    return prizor;
}

// Branje datoteke - drag&drop
export async function preberiNalozenoDatoteko(file: File): Promise<Prizor> {
    const besedilo = await file.text();
    const prizor: Prizor = JSON.parse(besedilo);

    return prizor;
}