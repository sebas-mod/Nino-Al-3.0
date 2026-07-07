import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkimia', {
    alias: ['quimica', 'elemento', 'simbolo', 'chemistry'],
    emoji: '🧪',
    title: 'ADIVINA EL ELEMENTO',
    description: 'Adivina el símbolo o elemento químico',
    questionField: 'unsur',
    answerField: 'lambang'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkimia')
export { pluginConfig as config, handler, answerHandler }
