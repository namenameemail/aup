import * as Tone from "tone";
import {SynthModule} from "./SynthModule";

export interface ASDRModuleOptions {
    attack?: number
    decay?: number
    sustain?: number
    release?: number

    min?: number
    max?: number
}

export class ADSRModule extends SynthModule {

    min
    max
    _ADSR: Tone.Envelope
    _ADSR_mul: Tone.Multiply
    _ADSR_add: Tone.Add

    constructor(options: ASDRModuleOptions) {
        super();
        const {
            attack = 0.1,
            decay = 0.2,
            sustain = 0.3,
            release = 0.4,
            min = 0,
            max = 1,
        } = options;

        this.min = min;
        this.max = max;

        this._ADSR_add = new Tone.Add(this.min);
        this._ADSR_mul = new Tone.Multiply(this.max).connect(this._ADSR_add);
        this._ADSR = new Tone.Envelope({
            attack,
            decay,
            sustain,
            release,
        }).connect(this._ADSR_mul);

        this.setSource(this._ADSR_add);

    }

    setAttack = (value: number)  => {
        this._ADSR.attack = value
    };

    setDecay = (value: number)  => {
        this._ADSR.decay = value
    };

    setSustain = (value: number)  => {
        this._ADSR.sustain = value
    };
    setRelease = (value: number)  => {
        this._ADSR.release = value
    };
    setMin = (value: number)  => {
        this.min = value;

        this._ADSR_add.addend.value = this.min
        this._ADSR_mul.factor.value = (this.max - (this.min || 0))
    };
    setMax = (value: number)  => {
        this.max = value;

        this._ADSR_mul.factor.value = (this.max - (this.min || 0))
    };

    triggerAttack = () => {
        this._ADSR.triggerAttack();
    };
    triggerRelease = () => {
        this._ADSR.triggerRelease();
    };

    dispose() {
        this._ADSR.dispose();
        this._ADSR_mul.dispose();
        this._ADSR_add.dispose();
    }
}
