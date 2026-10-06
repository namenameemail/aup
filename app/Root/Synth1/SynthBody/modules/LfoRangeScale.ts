import * as Tone from "tone";
import {SynthModule} from "./SynthModule";
import {ADSRModule} from "./ADSRModule";

export class LfoRangeScale extends SynthModule {
    input: Tone.Multiply
    depth: Tone.Param<"number">
    _offset: Tone.Add
    _depth: Tone.Multiply
    _span: Tone.Multiply
    _center: Tone.Add
    _adsr?: ADSRModule

    constructor(min: number, max: number) {
        super();
        this._center = new Tone.Add((min + max) / 2);
        this._span = new Tone.Multiply(max - min).connect(this._center);
        this._depth = new Tone.Multiply(0).connect(this._span);
        this._offset = new Tone.Add(-0.5).connect(this._depth);
        this.input = new Tone.Multiply(1).connect(this._offset);
        this.depth = this._depth.factor;
        this.setSource(this._center);
    }

    attachAdsr(adsr: ADSRModule) {
        this._adsr = adsr;
        adsr.connect([this.depth]);
    }

    setRange(min: number, max: number) {
        this._span.factor.value = max - min;
        this._center.addend.value = (min + max) / 2;
    }

    getRange() {
        const span = this._span.factor.value;
        const center = this._center.addend.value;
        return {min: center - span / 2, max: center + span / 2};
    }

    dispose() {
        this._adsr?.disconnect([this.depth]);
        this.input.dispose();
        this._offset.dispose();
        this._depth.dispose();
        this._span.dispose();
        this._center.dispose();
    }
}
