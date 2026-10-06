import * as Tone from "tone";
import {SynthModule} from "./SynthModule";
import {Time} from "tone/Tone/core/type/Units";

export interface LFOModuleOptions {
    frequency: number
    type: string
    min?: number
    max?: number
}

export class LFOModule extends SynthModule {

    frequency: number
    min: number
    max: number
    type: string
    _lfo: Tone.LFO

    constructor(options: LFOModuleOptions) {
        super();
        const {
            frequency = 400,
            type = 'sine',
            min = 0,
            max = 1,
        } = options;

        this.min = min;
        this.max = max;
        this.type = type;

        this._lfo = new Tone.LFO(frequency, min, max)
        this._lfo.type = type as Tone.ToneOscillatorType;


        this.setSource(this._lfo);
    }

    start(time?: Time) {
        this._lfo.start(time);
    }

    dispose() {
        this._lfo.dispose();
    }

    setType(type: string) {
        this.type = type;
        this._lfo.type = type as Tone.ToneOscillatorType;
    }

    setMin = (value: number)  => {
        this.min = value;

        this._lfo.min = value;
    };
    setMax = (value: number)  => {
        this.max = value;

        this._lfo.max = value;
    };
}


