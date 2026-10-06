import {v4 as uuid} from "uuid";

export interface AppliersState {
    [id: string]: ApplierState
}
export interface ApplierState {
    id: string
    paramName: string
    value?: string
    signalType?: string
    modMin?: string
    modMax?: string
    waveType?: string
}

export class Applier {
    id: string
    state: ApplierState

    onStateChange: (state: ApplierState, id: string) => any
    constructor(onStateChange: (state: ApplierState, id: string) => any, saved?: Partial<ApplierState>) {
        this.id = saved?.id || uuid()
        this.onStateChange = onStateChange

        this.setState(() => ({
            id: this.id,
            paramName: saved?.paramName || 'frequency',
            value: saved?.value || '',
            signalType: saved?.signalType || 'const',
            modMin: saved?.modMin || '',
            modMax: saved?.modMax || '',
            waveType: saved?.waveType || 'square',
        }))
    }

    setStateByFieldName(fieldName: string, value: any) {
        this.setState((state) => ({
            ...state,
            [fieldName]: value
        }))
    }

    /* STATE STATE STATE STATE STATE STATE STATE STATE STATE STATE */
    setState = (setter: (state: ApplierState) => ApplierState) => {
        this.state = setter(this.state);
        this.onStateChange?.(this.state, this.id);
    };
}

export class Appliers {
    appliers: { [id: string]: Applier} = {}
    state: AppliersState
    onStateChange: (state: AppliersState) => any

    constructor(onStateChange: (state: AppliersState) => any) {
        this.onStateChange = onStateChange;
    }

    add(saved?: Partial<ApplierState>) {
        const applier = new Applier(this.setItemState, saved);

        this.appliers[applier.id] = applier;

        this.setItemState(applier.state, applier.id)

        return applier;
    }

    remove(id: string) {

        const {[id]: removed, ...newAppliers} = this.appliers;

        this.appliers = newAppliers;

        this.setState(({[id]: removed, ...newAppliers}) => newAppliers)

    }

    setItemState = (itemState: ApplierState, id: string) => {
        this.setState(state => ({
            ...state,
            [id]: itemState
        }));
    }

    setState = (setter: (state: AppliersState) => AppliersState) => {
        this.state = setter(this.state);
        this.onStateChange?.(this.state);
    };

}