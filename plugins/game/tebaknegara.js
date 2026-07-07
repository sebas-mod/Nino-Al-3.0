import { games } from '../../src/lib/ourin-games.js'

games.register('tebaknegara', {
    alias: ['tn', 'adivinaelpais', 'pais', 'paises'],
    emoji: '🌍',
    title: 'ADIVINA EL PAÍS',
    description: 'Adivina el nombre del país'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaknegara')
export { pluginConfig as config, handler, answerHandler }
