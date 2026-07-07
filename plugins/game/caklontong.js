import { games } from '../../src/lib/ourin-games.js'

games.register('caklontong', {
    alias: ['cak', 'lontong', 'troll', 'absurdo'],
    emoji: '🤔',
    title: 'ACERTIJO ABSURDO',
    description: 'Juego de lógica absurda - respuestas graciosas y trolls'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('caklontong')
export { pluginConfig as config, handler, answerHandler }
