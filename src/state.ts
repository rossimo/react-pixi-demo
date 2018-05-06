import update from 'immutability-helper';
import * as _ from 'lodash';
import { Store, applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Map } from './tmx';

export interface Entity {
    x: number
    y: number
}

export interface State {
    tilesets: { [id: string]: any }
    entities: { [id: string]: Entity }
    map: Map
}

let initialState: State = {
    entities: {},
    tilesets: {},
    map: null
}

export let setTilesets = (tilesets: { [id: string]: any }) => ({
    type: 'TILESETS',
    payload: tilesets
})

export let setMap = (map: Map) => ({
    type: 'MAP',
    payload: map
})

export let setEntity = (id: string, entity: Entity) => ({
    type: 'ENTITY',
    payload: { id, entity }
})

export let setEntities = (entities: { [id: string]: Entity }) => ({
    type: 'ENTITIES',
    payload: entities
})

let reducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case 'ENTITY': {
            let { id, entity } = payload
            return update(state, {
                entities: {
                    [id]: { $set: entity }
                }
            })
        }

        case 'ENTITIES': {
            return update(state, {
                entities: _.toPairs(payload).reduce((sets, [id, entity]) => {
                    sets[id] = { $set: entity }
                    return sets
                }, {})
            })
        }

        case 'MAP': {
            let map = payload
            return update(state, { map: { $set: map } })
        }

        case 'TILESETS': {
            let tilesets = payload
            return update(state, { tilesets: { $set: tilesets } })
        }

        default: {
            return state;
        }
    }
}

export let create = (ticker: PIXI.ticker.Ticker) => {
    let sagas = createSagaMiddleware({
        context: {
            ticker
        }
    })

    let store: Store<State> = createStore(reducer, applyMiddleware(sagas))

    return {
        store,
        sagas
    }
}
