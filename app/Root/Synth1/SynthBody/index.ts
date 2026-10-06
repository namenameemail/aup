import {SynthItem, SynthItemState} from "./SynthItem";

export interface SynthState {
    [id: string]: SynthItemState
}

export class SynthBody {
    state: SynthState
    items: { [id: string]: SynthItem } = {}
    onStateChange: (state: SynthState) => any

    constructor(onStateChange: (state: SynthState) => any) {
        this.onStateChange = onStateChange;
    }

    updateIndexes = () => {
        Object.values(this.items).forEach((item, index) => item.setIndex(index))
    };

    addItem() {
        // Tone.start();

        const synthItem = new SynthItem(this, {onStateChange: this.setItemState});

        this.items[synthItem.id] = synthItem;

        this.updateIndexes();

        return synthItem;
    }

    setItemState = (itemState: SynthItemState, id: string) => {
        this.setState(state => ({
            ...state,
            [id]: itemState
        }));
    }

    setState = (setter: (state: SynthState) => SynthState) => {
        this.state = setter(this.state);
        this.onStateChange(this.state);
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

