import { games } from '../../src/lib/ourin-games.js'

games.register('tebakhewan', {
    alias: ['th', 'adivinanimal', 'animal', 'animales'],
    emoji: '🐾',
    title: 'ADIVINA EL ANIMAL',
    description: 'Adivina el nombre del animal'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakhewan')
export { pluginConfig as config, handler, answerHandler }
