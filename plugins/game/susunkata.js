import { games } from '../../src/lib/ourin-games.js'

games.register('susunkata', {
    alias: ['susun', 'ordenarpalabra', 'ordenar', 'scramble'],
    emoji: '🔠',
    title: 'ORDENAR PALABRA',
    description: 'Ordena las letras para formar la palabra correcta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
