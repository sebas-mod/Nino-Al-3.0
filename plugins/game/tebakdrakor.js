import { games } from '../../src/lib/ourin-games.js'

games.register('tebakdrakor', {
    alias: ['adivinadrama', 'kdrama', 'drakor'],
    emoji: '🇰🇷',
    title: 'ADIVINA EL K-DRAMA',
    description: 'Adivina el título de la serie o drama coreano',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakdrakor')
export { pluginConfig as config, handler, answerHandler }
