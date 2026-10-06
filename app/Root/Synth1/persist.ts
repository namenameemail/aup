import {ModuleType} from "./SynthBody/modules/types";

export const STORAGE_KEY = 'aup.synth1';

export type SavedMod = {
    sourceId: string
    moduleType: ModuleType
    min: number
    max: number
}

export type SavedParam = {const: number} | SavedMod

export function isSavedMod(param: SavedParam): param is SavedMod {
    return 'sourceId' in param;
}

export type SavedVoice = {
    id: string
    type: string
    attack: number
    decay: number
    sustain: number
    release: number
    frequency?: SavedParam
    amplitude?: SavedParam
    changes: {paramName: string, value: any}[]
    appliers?: {
        id: string
        paramName: string
        value?: string
        signalType?: string
        modMin?: string
        modMax?: string
        waveType?: string
    }[]
    applierCount?: number
}

export type SavedSynth = {
    voices: SavedVoice[]
    xOffset: number
    yOffset: number
}

export function readSynth(): SavedSynth | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as SavedSynth;
    } catch {
        return null;
    }
}

export function writeSynth(patch: Partial<SavedSynth>) {
    const prev = readSynth() || {voices: [], xOffset: 0, yOffset: 0};
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({...prev, ...patch}));
    } catch {
    }
}
