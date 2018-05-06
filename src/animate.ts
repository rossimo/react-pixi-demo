import { call, Func1, CallEffectFn, put, race, getContext } from 'redux-saga/effects'
import { eventChannel, END, detach } from 'redux-saga'

export let getTicker = function* (): IterableIterator<PIXI.ticker.Ticker> {
    let ticker: PIXI.ticker.Ticker = yield getContext('ticker') as any
    return ticker
}

export let nextTick = (ticker: PIXI.ticker.Ticker) =>
    new Promise<number>(res => {
        ticker.addOnce(() => res(ticker.elapsedMS))
    })

export let tickDelay = function* (duration: number) {
    let ticker = yield getTicker()

    let total = 0
    while (total < duration) {
        total += yield nextTick(ticker)
    }
}

export let progress = function* (
    duration: number,
    callback: (CallEffectFn<Func1<number>>)) {
    let ticker = yield getTicker()

    yield call(callback, 0)

    let total = 0
    while (total < duration) {
        total += yield nextTick(ticker)
        yield call(callback, total / duration)
    }

    yield call(callback, 1)
}
