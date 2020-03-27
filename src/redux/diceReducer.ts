import {v4} from 'uuid';
import {Action} from 'redux';
import {NetworkedAction} from '../util/types';

// =========================== Action types and generators

enum DiceReducerActionTypes {
    ADD_DICE_ACTION = 'add-dice-action',
    SET_DIE_RESULT_ACTION = 'set-die-result-action',
    CLEAR_DICE_ACTION = 'clear-dice-action'
}

interface AddDiceActionType extends Action {
    type: DiceReducerActionTypes.ADD_DICE_ACTION;
    dieType: string[];
    dieId: string[];
    peerKey: string;
}

export function addDiceAction(...dieType: string[]): AddDiceActionType {
    const dieId: string[] = [];
    for (let count = 0; count < dieType.length; ++count) {
        dieId.push(v4());
    }
    return {type: DiceReducerActionTypes.ADD_DICE_ACTION, dieType, dieId, peerKey: 'add'};
}

interface SetDieResultActionType extends NetworkedAction {
    type: DiceReducerActionTypes.SET_DIE_RESULT_ACTION;
    dieId: string;
    result: number;
    peerKey: string;
}

export function setDieResultAction(dieId: string, result: number): SetDieResultActionType {
    return {type: DiceReducerActionTypes.SET_DIE_RESULT_ACTION, dieId, result, peerKey: 'result' + dieId};
}

interface ClearDiceActionType extends Action {
    type: DiceReducerActionTypes.CLEAR_DICE_ACTION;
    peerKey: string;
}

export function clearDiceAction() {
    return {type: DiceReducerActionTypes.CLEAR_DICE_ACTION, peerKey: 'clear'};
}

type DieReducerActionType = AddDiceActionType | SetDieResultActionType | ClearDiceActionType;

// =========================== Reducers

export interface DiceReducerType {
    busy: number;
    rolling: {
        [id: string] : {
            dieType: string;
            index: number;
            result?: {[peedId: string]: number};
        }
    }
}

const initialDiceReducerType = {busy: 0, rolling: {}};

export default function diceReducer(state: DiceReducerType = initialDiceReducerType, action: DieReducerActionType): DiceReducerType {
    switch (action.type) {
        case DiceReducerActionTypes.ADD_DICE_ACTION:
            return {
                busy: state.busy + action.dieId.length,
                rolling: {
                    ...action.dieId.reduce((allDice, dieId, index) => {
                        allDice[dieId] = {dieType: action.dieType[index], index};
                        return allDice;
                    }, {})
                }
            };
        case DiceReducerActionTypes.SET_DIE_RESULT_ACTION:
            const dieState = state.rolling[action.dieId];
            if (!dieState) {
                // received result for die roll we don't know about - perhaps we joined mid-roll?
                return state;
            }
            return {
                busy: dieState.result === undefined ? state.busy - 1 : state.busy,
                rolling: {
                    ...state.rolling,
                    [action.dieId]: {
                        ...dieState,
                        result: {
                            ...dieState.result,
                            [action.originPeerId || 'me']: action.result
                        }
                    }
                }
            };
        case DiceReducerActionTypes.CLEAR_DICE_ACTION:
            return initialDiceReducerType;
        default:
            return state;
    }
}