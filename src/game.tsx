import * as _ from 'lodash';
import * as React from 'react';
import { Sprite } from 'react-pixi-fiber';
import { connect } from 'react-redux';
import { call, put, select, spawn } from 'redux-saga/effects';
import * as tween from 'tween-functions';
import { v4 as uuid } from 'uuid';
import { progress, tickDelay } from './animate';
import { MapLayer } from './mapLayer';
import { Entity, State, setEntity, setMap, setTilesets, setEntities } from './state';
import { Map, parseMap } from './tmx';
import * as memoizee from 'memoizee'

let heroes = PIXI.Texture.from(`./resources/tileset.png`)
let mobSprite  = new PIXI.Texture(heroes.baseTexture, new PIXI.Rectangle(7 * 32, 1 * 32, 32, 32))
let stepDuration = 750

let GameComponent = ({ entities, map, tilesets }: State) => {
    return <>
        {map && tilesets && <MapLayer key="map" tilesets={tilesets} map={map} />}
        {_.toPairs(entities).map(([id, entity]) =>
            <Sprite key={`entity_${id}`} texture={mobSprite} x={entity.x * map.tilewidth} y={entity.y * map.tileheight} />)}
    </>
}

export default connect((state: State) => state)(GameComponent)

export let saga = function* () {
    yield put(setTilesets({
        'tileset.json': require('./resources/tileset.json')
    }))
    yield put(setMap(parseMap(require('./resources/map.json'))))

    yield call(mob)
}

let mob = function* () {
    let map: Map = yield select<State>(state => state.map)
    let locations: number[][] = _.chunk(map.collision, map.width)

    let mob: { [id: string]: Entity } = {}
    let ids: string[] = []
    for (var i = 0; i < 1000; i++) {
        let id = `${i}`
        let { x, y } = _.chain(map.startLocations).shuffle().first().value()
        ids.push(id)
        mob[id] = { x, y }
    }
    yield put(setEntities(mob))

    let getMob = function* () {
        return yield select<State>(state => _.chain(state.entities)
            .toPairs()
            .filter(([id]) => _.includes(ids, id))
            .fromPairs()
            .value())
    }

    do {
        let destinations = {}
        mob = yield getMob()
        for (let id of ids) {
            let entity = mob[id]
            destinations[id] = _.shuffle(getTargets(entity.x, entity.y, locations))[0]
        }

        yield call(progress, stepDuration, function* (val: number) {
            val = tween.easeInOutCubic(val, 0, 1, 1)
            let update = {}
            for (let id of ids) {
                let entity = mob[id]
                let destination = destinations[id]

                update[id] = {
                    x: entity.x + val * destination.x,
                    y: entity.y + val * destination.y
                }
            }
            yield put(setEntities(update))
        })
    } while (true)
}

let getTargets = memoizee((x, y, locations) => {
    let targets: { x: number, y: number }[] = []

    for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++)
            if (!(i == 0 && j == 0) && _.get(locations, `${y + j}.${x + i}`) == 0)
                targets.push({ x: i, y: j })

    return targets
})