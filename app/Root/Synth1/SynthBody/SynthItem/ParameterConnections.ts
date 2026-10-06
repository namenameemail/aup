import {SynthModule} from "../modules/SynthModule";
import {RangeScale} from "../modules/RangeScale";
import {LfoRangeScale} from "../modules/LfoRangeScale";

export type ModScale = RangeScale | LfoRangeScale

export interface ConnectionOptions {
    module: SynthModule
    scale?: ModScale
}

export class ParameterConnections {
    list: {
        [key: string]: ConnectionOptions | undefined
    } = {}

    constructor() {
    }

    save = (paramName: string, connectedItemModule: SynthModule, scale?: ModScale) => {
        this.list[paramName] = {
            module: connectedItemModule,
            scale,
        };
    };
}