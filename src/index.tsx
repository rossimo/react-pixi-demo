import * as PIXI from 'pixi.js';
import * as React from 'react';
import { render } from 'react-pixi-fiber';
import { Provider } from 'react-redux';
import { Reducer, Store } from 'redux';
import Game, { saga } from './game';
import { State, create } from './state';

let renderer = new PIXI.WebGLRenderer({
    width: 800,
    height: 640,
    backgroundColor: 0x000000,
    view: document.getElementById('container')
} as any)
let stage = new PIXI.Container()
let ticker = new PIXI.ticker.Ticker()
ticker.add(() => renderer.render(stage))

let { store, sagas } = create(ticker)

ticker.start()

sagas.run(saga)

let throttledStore: Store<State> = {
    dispatch: (action: any) => store.dispatch(action),
    getState: () => store.getState(),
    replaceReducer: (reducer: Reducer<State>) => store.replaceReducer(reducer),
    subscribe: (listener: () => void) => {
        let subsciption = ticker.add(listener)
        return () => ticker.remove(listener)
    }
}

render(
    <Provider store={throttledStore}>
        <Game />
    </Provider> as any,
    stage
);