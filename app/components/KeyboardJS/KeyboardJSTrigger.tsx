import * as React from "react";
import keyboardjs from "keyboardjs";

export interface UserHotkeyTriggerProps {
    keyValue?: string

    codeValue?: string
    withShift?: boolean

    onPress?: (e?: any, name?: any, key?: string, code?: string) => void

    onRelease?: (e?: any, name?: any, key?: string, code?: string) => void

    name?: any

    debug?: boolean;

    withInputs?: boolean
}

export enum NodeType {
    Input = 'INPUT'
}


export class KeyTrigger extends React.PureComponent<UserHotkeyTriggerProps> {

    handlePress = (e: any) => {
        e.preventRepeat();
        const {keyValue, codeValue, withShift, withInputs} = this.props;

        // console.log(e, keyValue, codeValue);
        if (keyValue && e.key !== keyValue) {
            return;
        }
        if (withShift && !e.shiftKey) {
            return;
        }
        if (document.activeElement?.nodeName === NodeType.Input && !withInputs) {
            return;
        }

        const {onPress, name} = this.props;
        onPress && onPress(e, name, keyValue, codeValue);
    };

    handleRelease = (e: any) => {
        const {keyValue, codeValue, withShift, withInputs} = this.props;

        if (keyValue && e.key !== keyValue) {
            return;
        }
        if (withShift && !e.shiftKey) {
            return;
        }
        if (document.activeElement?.nodeName === NodeType.Input && !withInputs) {
            return;
        }

        const {onRelease, name} = this.props;
        onRelease && onRelease(e, name, keyValue, codeValue);
    };

    componentDidMount() {
        const {codeValue} = this.props;


        keyboardjs.bind(codeValue || '', this.handlePress, this.handleRelease)

    }

    componentDidUpdate(prevProps: UserHotkeyTriggerProps) {
        const {codeValue} = this.props;
        const prevCode = prevProps.codeValue;

        if (prevCode !== codeValue) {
            // if (prevCode) {
                keyboardjs.unbind(prevCode  || '', this.handlePress, this.handleRelease);
            // }

            // if (codeValue) {
                keyboardjs.bind(codeValue  || '', this.handlePress, this.handleRelease);
            // }
        }
    }


    componentWillUnmount() {
        this.props.codeValue && keyboardjs.unbind(this.props.codeValue, this.handlePress, this.handleRelease);
    }

    render() {
        return <></>;
    }
}
