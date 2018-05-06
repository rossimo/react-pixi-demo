import * as React from 'react'
import * as PIXI from 'pixi.js'
import { Container, Sprite, SpriteProperties } from 'react-pixi-fiber'
import { pure } from 'recompose'
import { Tmx, Map, Layer, Tile } from './tmx'

interface SpriteFrameIn {
    frameX?: number
    frameY?: number
    tileWidth: number
    tileHeight: number
}

export let SpriteFrame = ({ frameX, frameY, tileWidth, tileHeight, texture, ...props }: SpriteFrameIn & SpriteProperties) => {
    frameX = frameX || 0
    frameY = frameY || 0

    return <Sprite texture={new PIXI.Texture(
        texture.baseTexture,
        new PIXI.Rectangle(
            frameX * tileWidth,
            frameY * tileHeight,
            tileWidth,
            tileHeight
        ))}
        {...props} />
}

export interface MapIn {
    map: Map
    tilesets: { [name: string]: any }
    x?: number
    y?: number
}

let halfPi = 0.5 * Math.PI

export let MapLayer = pure(({ map, x, y, tilesets }: MapIn) => {
    let tileset = tilesets[map.tilesets[0].source]
    let texture = PIXI.Texture.from(`resources/${tileset.image}`)
    let tileWidth = tileset.tilewidth
    let tileHeight = tileset.tileheight

    return <Container x={x} y={y}>
        {map.layers.map((layer, layerIndex) =>
            <Container key={layerIndex}>
                {layer.data
                    .map((tile, index) => ({ ...tile, guid: tile.guid - 1, index }))
                    .filter(({ index, ...tile }) => tile.guid >= 0)
                    .map(({ index, ...tile }) => {
                        let x = (index % layer.width) * tileWidth
                        let y = Math.floor(index / layer.width) * tileHeight

                        let anchor = { x: 0.5, y: 0.5 }
                        let scale = { x: 1, y: 1 }

                        let rotation = 0
                        if (tile.rotateHorizontal) {
                            scale.x *= -1
                        }

                        if (tile.rotateVertical) {
                            scale.y *= -1
                        }

                        if (tile.rotateDiagonal) {
                            if (tile.rotateVertical) {
                                rotation = halfPi
                                scale.x *= -1
                            } else {
                                rotation = -halfPi
                                scale.y *= -1
                            }
                        }

                        return <SpriteFrame key={index}
                            x={x + anchor.x * tileWidth}
                            y={y + anchor.y * tileHeight}
                            anchor={anchor as any}
                            scale={scale as any}
                            rotation={rotation}
                            texture={texture}
                            tileWidth={tileWidth}
                            tileHeight={tileHeight}
                            frameX={tile.guid % tileset.columns}
                            frameY={Math.floor(tile.guid / tileset.columns)} />
                    })}
            </Container>)}
    </Container>
})