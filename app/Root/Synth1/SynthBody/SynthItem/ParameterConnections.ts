import {SynthModule} from "../modules/SynthModule";
import {RangeScale} from "../modules/RangeScale";

export interface ConnectionOptions {
    module: SynthModule
    scale?: RangeScale
}

export class ParameterConnections {
    list: {
        [key: string]: ConnectionOptions | undefined
    } = {}

    constructor() {
    }

    save = (paramName: string, connectedItemModule: SynthModule, scale?: RangeScale) => {
        this.list[paramName] = {
            module: connectedItemModule,
            scale,
        };
    };
}