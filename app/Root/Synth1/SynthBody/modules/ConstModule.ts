import * as Tone from "tone";
import { SynthModule } from "./SynthModule";


export class ConstModule extends SynthModule {

    value: number
    _const: Tone.Signal

    constructor(value: number) {
        super();

        this._const = new Tone.Signal(value)
        this.value = value

        this.setSource(this._const);
    }

    setValue(value: number) {
        this.value = value
        this._const.value = value
    }
}


