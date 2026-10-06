import * as React from "react";
import {useCallback, useContext, useRef, useState} from "react";
import {KeyTrigger} from "../../../../components/KeyboardJS/KeyboardJSTrigger";
import {SynthContext} from "../../context";
import './styles.css';
import cn from 'classnames';
import {Parameter} from "../../SynthBody/SynthItem";
import {ModuleType} from "../../SynthBody/modules/types";

export interface OscParamFormProps {
    xOffset: number
    yOffset: number
    id: string
    parentIndex: number
    index: number
    onApply: (paramName: string, value: any) => void
    onApplyConnect: (paramName: string, connectedItemId: string, moduleType: ModuleType, min: number, max: number) => void
    onRemove: (id: string) => void
}

const KEY_CODE_MAP = [
    ['q', 'a', 'z'],
    ['w', 's', 'x'],
    ['e', 'd', 'c'],
    ['r', 'f', 'v'],
    ['t', 'g', 'b'],
    ['y', 'h', 'n'],
    ['u', 'j', 'm'],
    ['i', 'k', ','],
    ['o', 'l', '.'],
    ['p', ';', '/'],
]

export const OscParamForm: React.FC<OscParamFormProps> = (props) => {

    const {onApply, onApplyConnect, xOffset, yOffset, index, id, parentIndex, onRemove} = props;
    const typeInput = useRef<HTMLSelectElement>(null);
    const valueInput = useRef<HTMLInputElement>(null);
    const paramNameInput = useRef<HTMLSelectElement>(null);

    const [param, setParam] = useState('frequency');
    const [frequencySignalType, setFrequencySignalType] = useState<string>('const');
    const [frequencyConstValue, setFrequencyConstValue] = useState<string>('');
    const [modMin, setModMin] = useState('');
    const [modMax, setModMax] = useState('');

    const {synthState} = useContext(SynthContext);

    const offsetParentIndex = parentIndex - xOffset;
    const offsetIndex = index - yOffset;

    const code = KEY_CODE_MAP[offsetParentIndex]?.[offsetIndex % 3];
    const key = (offsetIndex >= 0 && offsetIndex < 6 && offsetParentIndex < KEY_CODE_MAP.length)
        ? (
            offsetIndex < 3
                ? KEY_CODE_MAP[offsetParentIndex]?.[offsetIndex]
                : KEY_CODE_MAP[offsetParentIndex]?.[offsetIndex - 3]?.toUpperCase()
        )
        : null;

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (param === 'type') {
            const name = paramNameInput.current?.value as string;
            const value = typeInput.current?.value;
            onApply(name, value)
        } else if ([Parameter.frequency, Parameter.amplitude].includes(param as Parameter)) {

            if (frequencySignalType === 'const' || !frequencySignalType) {
                const name = paramNameInput.current?.value as string;
                onApply(name, frequencyConstValue)
            } else {
                const name = paramNameInput.current?.value as string;

                const [connectedItemId, type] = frequencySignalType.split(' ')

                onApplyConnect(name, connectedItemId, type as ModuleType, +modMin, +modMax);
            }
        } else {
            const name = paramNameInput.current?.value as string;
            const value = valueInput.current?.value;
            onApply(name, value)
        }
    }, [paramNameInput, valueInput, onApply, onApplyConnect, param, key, frequencyConstValue, frequencySignalType, modMin, modMax]);

    const handleParamChange = useCallback((e) => {
        setParam(e.target.value);
    }, []);

    const handleValueKeyDown = useCallback((e) => {

        if (e.key === 'Backspace' && e.shiftKey)
            onRemove(id);

        if (e.key === 'Escape')
            e.target.blur();

    }, [onRemove, id]);

    const handleFrequencyConstValueChange = useCallback((e) => {
        setFrequencyConstValue(e.target.value)
    }, []);

    const handleFrequencySignalTypeChange = useCallback((e) => {
        setFrequencySignalType(e.target.value)

    }, []);

    return (
        <form onSubmit={handleSubmit} className={'oscParamForm'}>
            {key && code && (<>

                <KeyTrigger codeValue={code} keyValue={key} onPress={handleSubmit}/>

            </>)}
            <button type='submit' title={'apply'}>_{key ? <small>({key})</small> : ''}</button>
            <select title={'parameter name'} ref={paramNameInput} value={param} onChange={handleParamChange}>
                {Object.values(Parameter).map(p => {
                    return (
                        <option key={p} value={p}>{p}</option>
                    )
                })}
            </select>
            {param === 'type' && (
                <select ref={typeInput} title={'wave type'} onKeyDown={handleValueKeyDown}>
                    <option value={'square'}>square</option>
                    <option value={'sine'}>sine</option>
                    <option value={'triangle'}>triangle</option>
                    <option value={'sawtooth'}>sawtooth</option>
                </select>
            )}
            {[Parameter.frequency, Parameter.amplitude].includes(param as Parameter) && (
                <div
                    className={cn('freqInputContainer', {
                        ['freqInputContainer_const']: frequencySignalType === 'const'
                    })}>
                    {frequencySignalType === 'const' && (
                        <input
                            value={frequencyConstValue}
                            ref={valueInput}
                            type={'number'}
                            min={0} step={0.01}
                            onKeyDown={handleValueKeyDown}
                            title={'value'}
                            onChange={handleFrequencyConstValueChange}
                            placeholder={'value'}
                        />
                    )}
                    {frequencySignalType !== 'const' && (
                        <>
                            <input
                                value={modMin}
                                type={'number'}
                                step={0.01}
                                onKeyDown={handleValueKeyDown}
                                title={'min'}
                                onChange={(e) => setModMin(e.target.value)}
                                placeholder={'min'}
                            />
                            <input
                                value={modMax}
                                type={'number'}
                                step={0.01}
                                onKeyDown={handleValueKeyDown}
                                title={'max'}
                                onChange={(e) => setModMax(e.target.value)}
                                placeholder={'max'}
                            />
                        </>
                    )}
                    <select
                        ref={typeInput}
                        value={frequencySignalType}
                        title={'modulation'}
                        onChange={handleFrequencySignalTypeChange}
                    >
                        <option value={'const'}>const</option>
                        {Object.values(synthState).map((item, index) => (
                            <React.Fragment key={index}>
                                {index !== parentIndex ? (
                                    <option value={item.id + ' ' + ModuleType.lfo}>{index + 1} lfo</option>
                                ) : null}
                                <option value={item.id + ' ' + ModuleType.adsr}>{index + 1} adsr</option>
                            </React.Fragment>
                        ))}
                    </select>
                </div>
            )}
            {[
                'attack',
                'decay',
                'sustain',
                'release'
            ].includes(param) && (
                <input
                    ref={valueInput} type={'number'} min={0} step={0.01} onKeyDown={handleValueKeyDown}
                    title={'value'}
                    placeholder={'value'}/>
            )}
        </form>
    );
};
