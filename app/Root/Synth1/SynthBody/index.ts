import {SynthItem, SynthItemState} from "./SynthItem";
import {SavedVoice} from "../persist";

export interface SynthState {
    [id: string]: SynthItemState
}

export class SynthBody {
    state: SynthState = {}
    items: { [id: string]: SynthItem } = {}
    onStateChange: (state: SynthState) => any
    loading = false

    constructor(onStateChange: (state: SynthState) => any) {
        this.onStateChange = onStateChange;
    }

    updateIndexes = () => {
        Object.values(this.items).forEach((item, index) => item.setIndex(index))
    };

    addItem(id?: string) {
        const synthItem = new SynthItem(this, {id, onStateChange: this.setItemState});

        this.items[synthItem.id] = synthItem;

        this.updateIndexes();

        return synthItem;
    }

    serialize(): SavedVoice[] {
        return Object.values(this.items)
            .sort((a, b) => a.index - b.index)
            .map(item => item.serialize());
    }

    load(voices?: SavedVoice[]) {
        if (!voices || !voices.length) {
            return;
        }
        this.loading = true;
        voices.forEach(voice => this.addItem(voice.id));
        voices.forEach(voice => this.items[voice.id]?.restore(voice));
        this.loading = false;
        this.onStateChange(this.state);
    }

    setItemState = (itemState: SynthItemState, id: string) => {
        this.setState(state => ({
            ...state,
            [id]: itemState
        }));
    }

    setState = (setter: (state: SynthState) => SynthState) => {
        this.state = setter(this.state);
        if (!this.loading) {
            this.onStateChange(this.state);
        }
    }

    deleteItem(id: string) {
        const deleted = this.items[id]
        if (!deleted) {
            return
        }

        Object.values(this.items).forEach(item => {
            if (item.id !== id) {
                item.releaseIfFrom(deleted)
            }
        })

        deleted.dispose()

        const {[id]: _removed, ...newItems} = this.items
        this.items = newItems

        this.setState(({[id]: _state, ...rest}) => rest)

        this.updateIndexes()
    }
}

