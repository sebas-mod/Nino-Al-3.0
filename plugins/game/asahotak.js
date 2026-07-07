import { games } from '../../src/lib/ourin-games.js'

games.register('asahotak', {
    alias: ['asah', 'quiz', 'trivia', 'cerebro'],
    emoji: '🧠',
    title: 'ACERTIJO MENTAL',
    description: 'Juego mental - ¡adivina la respuesta correcta!'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
