import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {SynthBody, SynthState} from "./SynthBody";
import {ModuleType} from "./SynthBody/modules/types";

export interface SynthContextValue {
    body?: SynthBody
    synthState: SynthState
    addItem?: any,
    removeItem?: any,
    addItemApplier?: any,
    removeItemApplier?: any,
    setItemApplierState?: (itemId: string, applierId: string, paramName: string, value: any) => any
    applyParamValue?: any
    applyParamConnect?: (itemId: string, paramName: string, connectedItemId: string, moduleType: ModuleType, min: number, max: number) => void
    setItemPlay?: any
    setItemStop?: any
    setItemIndex?: (itemId: string, index: number) => any
}

export const SynthContext = createContext<SynthContextValue>({
    synthState: {},
});

export function SynthContextProvider(props: any) {
    const {children} = props;

    const body = useRef<SynthBody>();

    const [synthState, setSynthState] = useState<SynthState>({});

    useEffect(() => {
        body.current = new SynthBody((state: SynthState) => setSynthState(state));
    }, []);

    const addItem = useCallback(() => {
        body.current?.addItem();

    }, [body]);

    const removeItem = useCallback((itemId: string) => {
        body.current?.deleteItem(itemId);
    }, [body]);

    const addItemApplier = useCallback((itemId: string) => {
        body.current?.items[itemId]?.appliers.add();

    }, []);

    const removeItemApplier = useCallback((itemId: string, applierId: string) => {
        body.current?.items[itemId]?.appliers.remove(applierId);

    }, []);

    const setItemApplierState = useCallback((itemId: string, applierId: string, paramName: string, value: any) => {
        body.current?.items[itemId]?.appliers.appliers[applierId].setStateByFieldName(paramName, value);
    }, []);


    const applyParamValue = React.useCallback((itemIndex: number, paramName: string, value: any) => {
        body.current?.items[itemIndex]?.setParam(paramName, value);
    }, [body]);

    const applyParamConnect = React.useCallback((itemId: string, paramName: string, connectedItemId: string, moduleType: ModuleType, min: number, max: number) => {
        body.current?.items[itemId]?.connectParam(paramName, connectedItemId, moduleType, min, max);
    }, [body]);

    const setItemPlay = React.useCallback((itemId: string) => {
        body.current?.items[itemId]?.triggerAttack();
    }, [body]);

    const setItemStop = React.useCallback((itemId: string) => {
        body.current?.items[itemId]?.triggerRelease();
    }, [body]);

    const setItemIndex = React.useCallback((itemId: string, index: number) => {
        body.current?.items[itemId]?.setIndex(index);
    }, [body]);

    const value = useMemo(() => ({
        body: body.current,
        synthState,
        addItem,
        removeItem,
        addItemApplier,
        removeItemApplier,
        setItemApplierState,
        applyParamValue,
        applyParamConnect,
        setItemPlay,
        setItemStop,
        setItemIndex,
    }), [
        body.current,
        synthState,
        addItem,
        removeItem,
        addItemApplier,
        removeItemApplier,
        setItemApplierState,
        applyParamValue,
        applyParamConnect,
        setItemPlay,
        setItemStop,
        setItemIndex
    ]);

    return (
        <SynthContext.Provider value={value}>
            {children}
        </SynthContext.Provider>
    );
}