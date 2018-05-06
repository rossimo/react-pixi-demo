import * as _ from 'lodash'
import * as polyBool from 'polybooljs'

export interface Object {
    id: string
    x: number
    y: number
    polygon?: {
        x: number,
        y: number
    }[]
}

export interface ObjectGroup {
    name: string
    id: number
    objects: Object[]
}

export interface Tmx {
    layers: {
        data: number[]
        height: number
        name: string
        opacity: string
        type: string
        visible: boolean
        width: number
        x: number
        y: number
    }[]
    tilesets: {
        firstgid: number
        source: string
    }[]
    width: number
    height: number
    objectGroups: ObjectGroup[]
    tilewidth: number
    tileheight: number
}

export interface Tile {
    guid: number
    rotateVertical?: boolean
    rotateHorizontal?: boolean
    rotateDiagonal?: boolean
}

export interface Layer {
    data: Tile[]
    height: number
    name: string
    opacity: string
    type: string
    visible: boolean
    width: number
    x: number
    y: number
}

export interface Map {
    layers: Layer[]
    tilesets: {
        firstgid: number
        source: string
    }[]
    width: number
    height: number
    objectGroups: ObjectGroup[]
    tilewidth: number
    tileheight: number
    collision: number[]
    startLocations: { x: number, y: number }[]
}

export let findCollision = (tmx: Tmx, objects: Object[]): { x: number, y: number, collision: number }[] => {
    let offsetPolygons = objects
        .filter(object => object.polygon)
        .map(object => object.polygon.map(({ x, y }) => [
            object.x + x,
            object.y + y
        ]))

    return _.range(0, tmx.width * tmx.height).map(index => {
        let x = (index % tmx.width) * tmx.tilewidth;
        let y = Math.floor(index / tmx.width) * tmx.tileheight;

        let tilePoly = {
            regions: [[
                [x, y],
                [x + tmx.tilewidth, y],
                [x + tmx.tilewidth, y + tmx.tileheight],
                [x, y + tmx.tileheight]
            ]], inverted: false
        }

        return {
            x: index % tmx.width,
            y: Math.floor(index / tmx.width),
            collision: offsetPolygons.reduce((collide, polygon) => collide || polyBool.intersect(tilePoly, { regions: [polygon], inverted: false }).regions.length > 0, false) ? 1 : 0
        }
    })
}

export let parseMap = (tmx: Tmx): Map => {
    let tileLayer = tmx.layers.filter(layer => layer.type == "tilelayer")
    let objectGroups: any = tmx.layers.filter(layer => layer.type == "objectgroup")

    tmx.layers = tileLayer;
    tmx.objectGroups = objectGroups;

    let collisionGroup = tmx.objectGroups.find(objectGroup => objectGroup.name.toLocaleLowerCase() == 'collision') || {
        name: 'collision',
        objects: []
    }

    let collision = findCollision(tmx, collisionGroup.objects)

    let startGroup = tmx.objectGroups.find(objectGroup => objectGroup.name.toLocaleLowerCase() == 'start') || {
        name: 'start',
        objects: []
    }

    let startLocations = findCollision(tmx, startGroup.objects)

    for (let i = 0; i < collision.length; i++) {
        if (collision[i].collision) {
            startLocations[i].collision = 0
        }
    }

    let { layers, ...tmxValues } = tmx

    let rotatedLayers = layers.map(({ data, ...layer }) => ({
        data: data.map(tile => ({
            guid: tile & ~(0x80000000 | 0x40000000 | 0x20000000),
            rotateHorizontal: Boolean(tile & 0x80000000),
            rotateVertical: Boolean(tile & 0x40000000),
            rotateDiagonal: Boolean(tile & 0x20000000)
        })),
        ...layer
    }))

    return ({
        ...tmxValues,
        layers: rotatedLayers,
        collision: collision.map(({ collision }) => collision),
        startLocations: startLocations.filter(({ collision }) => collision).map(({ x, y }) => ({ x, y }))
    })
}