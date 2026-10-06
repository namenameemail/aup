import * as React from "react";
import {useCallback, useContext, useState} from "react";
import {Osc} from "./Osc";
import './styles.css';
import './styles_portrait.css';
import {SynthContext} from "./context";
import {KeyTrigger} from "../../components/KeyboardJS/KeyboardJSTrigger";

export interface Synth1Props {

}

export const Synth1: React.FC<Synth1Props> = (props) => {

    const {synthState, addItem} = useContext(SynthContext);

    const handleAddOsc = useCallback(() => {
        addItem();
    }, [addItem]);

    const [xOffset, setXOffset] = useState(0);
    const [yOffset, setYOffset] = useState(0);

    const incXOffset = useCallback(() => setXOffset(xOffset + 1), [xOffset]);
    const decXOffset = useCallback(() => setXOffset(xOffset - 1), [xOffset]);
    const incYOffset = useCallback(() => setYOffset(yOffset + 1), [yOffset]);
    const decYOffset = useCallback(() => setYOffset(yOffset - 1), [yOffset]);

    return (
        <div className='synth1Container'>
            <KeyTrigger keyValue={'ArrowRight'} onPress={incXOffset}/>
            <KeyTrigger keyValue={'ArrowLeft'} onPress={decXOffset}/>
            <KeyTrigger keyValue={'ArrowUp'} onPress={decYOffset}/>
            <KeyTrigger keyValue={'ArrowDown'} onPress={incYOffset}/>
            <KeyTrigger codeValue={'='} onPress={handleAddOsc}/>
            <div className={'oscillators'}>
                {Object.values(synthState).map((item, index) => {
                    return <Osc
                        xOffset={xOffset}
                        yOffset={yOffset}
                        key={item.id} index={index} id={item.id}/>
                })}
                <div className={`addOscButtonContainer`}>
                    <button
                        title={'add oscillator'}
                        className={`addOscButton`}
                        onClick={handleAddOsc}
                        onTouchStart={handleAddOsc}
                    >+
                    </button>
                </div>
            </div>
            {/*<KeyTrigger codeValue={''} onPress={console.log}/>*/}
        </div>
    );
};
