import {Appliers, AppliersState} from "./Appliers";
import {SynthModule} from "../modules/SynthModule";
import * as Tone from "tone";
import {ADSRModule} from "../modules/ADSRModule";
import {LFOModule} from "../modules/LFOModule";
import {ParameterConnections} from "./ParameterConnections";
import {v4 as uuid} from "uuid";
import {ConstModule} from "../modules/ConstModule";
import {SynthBody} from "../index";
import {ModuleType} from "../modules/types";

export interface SynthItemChange {
    paramName: string,
    value: any
}

export interface SynthItemState {
    changes: SynthItemChange[]
    index: number
    id: string
    started: boolean
    frequency: number
    amplitude: number
    type: string
    attack: number
    decay: number
    sustain: number
    release: number
    lfoMin: number
    lfoMax: number
    adsrMin: number
    adsrMax: number
    appliers: AppliersState
}

export interface ParamsHandlers {
    [key: string]: {
        set: (value: any, _name: string) => any
        connect?: (sourceItemId: string, moduleType: string, paramName: string) => any
        disconnect?: (paramName: Parameter) => void
    }
}

export interface SynthItemOptions {
    frequency?: number
    v?: number
    type?: string
    attack?: number
    decay?: number
    sustain?: number
    release?: number
    lfoMin?: number
    lfoMax?: number
    adsrMin?: number
    adsrMax?: number
    onStateChange?: (state: SynthItemState, id: string) => any
}

export enum Parameter {
    frequency = 'frequency',
    amplitude = 'amplitude',
    type = 'type',
    attack = 'attack',
    release = 'release',
    sustain = 'sustain',
    decay = 'decay',
    lfoMin = 'lfoMin',
    lfoMax = 'lfoMax',
    adsrMin = 'adsrMin',
    adsrMax = 'adsrMax',
}



export interface ConnectionOptions {
    module: SynthModule
    connectParameters?: any[]
}

export class SynthItem {
    id: string
    index: number

    state: SynthItemState
    onStateChange?: (state: SynthItemState, id: string) => any

    body: SynthBody

    appliers: Appliers

    _osc: Tone.Oscillator
    _amp: Tone.Gain

    m_ADSR: ADSRModule
    m_LFO: LFOModule
    frequencyConst?: ConstModule
    amplitudeConst?: ConstModule


    parameterConnections: ParameterConnections

    changes: SynthItemChange[] = [];

    pushChange = (paramName: string, value: any) => {
        this.changes = this.changes.filter((change) => change.paramName !== paramName)
        this.changes.unshift({paramName, value});

        if (this.changes.length > 5) {
            this.changes.pop();
        }
        this.setStateByName('changes', this.changes);
    };

    static defaultOptions = {
        frequency: 400,
        type: 'sine',
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 0.4,
        adsrMin: 0,
        adsrMax: 1,
        lfoMin: 0,
        lfoMax: 1,
        onStateChange: undefined
    };

    constructor(body: SynthBody, options?: SynthItemOptions) {
        this.id = uuid();
        this.body = body;
        const {
            frequency,
            type,
            attack,
            decay,
            sustain,
            release,
            adsrMin,
            adsrMax,
            lfoMin,
            lfoMax,
            onStateChange,
        } = (options ? {...SynthItem.defaultOptions, ...options} : SynthItem.defaultOptions);

        this.onStateChange = onStateChange;

        this.appliers = new Appliers((state) => {
            this.setStateByName('appliers', state);
        });

        this.parameterConnections = new ParameterConnections();

        // const nois = new Tone.Noise('pink').toDestination();
        // nois.playbackRate = 0.0002;
        // nois.start();
        // const scale = new Tone.Scale(100, 300);
        // nois.connect(scale);


        this._amp = new Tone.Gain(0).toDestination();

        this.m_ADSR = new ADSRModule({
            attack,
            decay,
            sustain,
            release,
            min: adsrMin,
            max: adsrMax,
        });

        this.parameterConnections.save(
            Parameter.amplitude,
            this.m_ADSR
                .connect([this._amp.gain]),
        )

        this.m_LFO = new LFOModule({
            frequency,
            type,
            min: lfoMin,
            max: lfoMax,
        })

        this._osc = new Tone.Oscillator(
            frequency,
            type as Tone.ToneOscillatorType
        ).connect(this._amp);

        this._osc.start(0);
        this.m_LFO.start(0);// todo  sync

        // scale.connect(this._osc.frequency);
        // this.parameterConnections.save(
        //     Parameter.frequency,
        //     (new ConstModule(frequency))
        //         .connect([this._osc.frequency, this.m_LFO._lfo.frequency])
        // );

        this.setState(state => ({
            ...state,
            changes: [],
            id: this.id,
            frequency,
            type,
            attack,
            decay,
            sustain,
            release,
            lfoMin,
            lfoMax,
            adsrMin,
            adsrMax,
        }))
    }

    /* STATE STATE STATE STATE STATE STATE STATE STATE STATE STATE */
    setState = (setter: (state: SynthItemState) => SynthItemState) => {
        this.state = setter(this.state);
        this.onStateChange?.(this.state, this.id);
    };

    setStateByName = (name: string, value: any) => {
        this.state = {
            ...this.state,
            [name]: value
        };
        this.onStateChange?.(this.state, this.id);
    };

    setIndex(index: number) {
        if (index !== this.index) {
            this.index = index;
            this.setStateByName('index', index);
        }
    }

    /* PARAMS VALUE PARAMS VALUE PARAMS VALUE PARAMS VALUE PARAMS VALUE PARAMS VALUE PARAMS VALUE  */


    paramsHandlers: ParamsHandlers = {
        [Parameter.type]: {
            set: (_value: any, _name: string) => {
                this._osc.type = _value;
                this.m_LFO.setType(_value);
            },
        },
        [Parameter.frequency]: {
            set: (_value: any) => {
                this.setConst(Parameter.frequency, +_value)
            },
            connect: (sourceItemId: string, moduleType: ModuleType, paramName: Parameter) => {

                this.disconnectParameterFromSource(Parameter.frequency)

                console.log(moduleType, sourceItemId)

                this.parameterConnections.save(
                    Parameter.frequency,
                    this.body.items[sourceItemId].getModule(moduleType)
                        .connect([this._osc.frequency, this.m_LFO._lfo.frequency])
                );
            },
            disconnect: () => {
                if (this.parameterConnections.list[Parameter.frequency]) {

                    this.parameterConnections.list[Parameter.frequency]?.module.disconnect([this._osc.frequency, this.m_LFO._lfo.frequency]);
                    this.parameterConnections.list[Parameter.frequency] = undefined;
                }
            }
        },
        [Parameter.amplitude]: {
            set: (_value: any) => {
                this.setConst(Parameter.amplitude, +_value)
            },
            connect: (sourceItemId: string, moduleType: ModuleType, paramName: Parameter) => {

                this.disconnectParameterFromSource(Parameter.amplitude)

                this.parameterConnections.save(
                    Parameter.amplitude,
                    this.body.items[sourceItemId].getModule(moduleType)
                        .connect(
                            [this._amp.gain]
                        )
                );
            },
            disconnect: () => {
                if (this.parameterConnections.list[Parameter.amplitude]) {

                    this.parameterConnections.list[Parameter.amplitude]?.module.disconnect([this._amp.gain]);
                    this.parameterConnections.list[Parameter.amplitude] = undefined;
                }
            }
        },
        [Parameter.attack]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setAttack(+_value)
            }
        },
        [Parameter.release]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setRelease(+_value)
            }
        },
        [Parameter.sustain]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setSustain(+_value)
            }
        },
        [Parameter.decay]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setDecay(+_value)
            }
        },
        [Parameter.adsrMin]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setMin(+_value);
            }
        },
        [Parameter.adsrMax]: {
            set: (_value: any, _name: string) => {
                this.m_ADSR.setMax(+_value);
            }
        },
        [Parameter.lfoMin]: {
            set: (_value: any, _name: string) => {
                this.m_LFO.setMin(+_value)
            }
        },
        [Parameter.lfoMax]: {
            set: (_value: any, _name: string) => {
                this.m_LFO.setMax(+_value)
            }
        },
    }


    setParam(paramName: string, value: any) {
        const setter = this.paramsHandlers[paramName]?.set
        setter?.(value, paramName);

        this.setStateByName(paramName, value);

        this.pushChange(paramName, value);
    }

    connectParam(paramName: string, sourceItemId: string, moduleType: string) {
        const connector = this.paramsHandlers[paramName]?.connect;
        connector?.(sourceItemId, moduleType, paramName);

        this.setStateByName(paramName, [sourceItemId, moduleType]);

        this.pushChange(paramName, [sourceItemId, moduleType]);
    }

    disconnectParameterFromSource = (paramName: Parameter) => {
        this.paramsHandlers[paramName]?.disconnect?.(paramName);
    };

    setConst(paramName: Parameter.frequency | Parameter.amplitude, value: number) {
        const destinations = paramName === Parameter.frequency
            ? [this._osc.frequency, this.m_LFO._lfo.frequency]
            : [this._amp.gain]

        let signal = paramName === Parameter.frequency ? this.frequencyConst : this.amplitudeConst
        if (!signal) {
            signal = new ConstModule(value)
            if (paramName === Parameter.frequency) {
                this.frequencyConst = signal
            } else {
                this.amplitudeConst = signal
            }
        } else {
            signal.setValue(value)
        }

        if (this.parameterConnections.list[paramName]?.module === signal) {
            return
        }

        this.disconnectParameterFromSource(paramName)
        this.parameterConnections.save(paramName, signal.connect(destinations))
    }


    // TRIGGERS TRIGGERS TRIGGERS TRIGGERS TRIGGERS TRIGGERS TRIGGERS TRIGGERS TRIGGERS

    triggerAttack() {
        Tone.start();
        this.m_ADSR.triggerAttack();
        this.setStateByName('started', true);
    }

    triggerRelease() {
        Tone.start();
        this.m_ADSR.triggerRelease();
        this.setStateByName('started', false);
    }

    getModule = (type: ModuleType): SynthModule => {
        switch (type) {
            case ModuleType.adsr:
                return this.m_ADSR;
            case ModuleType.lfo:
                return this.m_LFO;
        }
    };

}