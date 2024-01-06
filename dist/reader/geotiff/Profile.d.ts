export interface Profile {
    width: number;
    height: number;
    resolutions: [number, number];
    bbox: [number, number, number, number];
    bands: number;
    nodata: number | null;
    unit: string | null;
    code: string | null;
    range: [number, number] | null;
}
export declare function getProfile(source: File | string, imageIndex?: number): Promise<Profile>;
