import * as Tone from "tone";
import {SynthModule} from "./SynthModule";

export class RangeScale extends SynthModule {
    input: Tone.Multiply
    _add: Tone.Add

    constructor(min: number, max: number) {
        super();

        this._add = new Tone.Add(min);
        this.input = new Tone.Multiply(max - min).connect(this._add);
        this.setSource(this._add);
    }

    setRange(min: number, max: number) {
        this._add.addend.value = min;
        this.input.factor.value = max - min;
    }

    dispose() {
        this.input.dispose();
        this._add.dispose();
    }
}
