import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkata', {
    alias: ['tk', 'adivinapalabra', 'palabra'],
    emoji: '📝',
    title: 'ADIVINA LA PALABRA',
    description: 'Adivina la palabra a partir de las pistas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkata')
export { pluginConfig as config, handler, answerHandler }
