const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how', 'como'],
    category: 'fun',
    description: 'Pregúntale al bot cómo hacer algo',
    usage: '.bagaimana <pregunta>',
    example: '.bagaimana ¿cómo ser exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Es fácil, ¡solo tienes que empezar a hacerlo!',
    'Hmm, es difícil de explicar. ¡Pruébalo tú mismo primero!',
    'Con esfuerzo y fe, por supuesto.',
    'Bueno, así es como se hace.',
    'No estoy muy seguro, intenta buscar otra referencia.',
    'Tómalo con calma, poco a poco lo lograrás.',
    '¡Con trabajo duro y sin rendirse jamás!',
    'Primero, confía en ti mismo.',
    'Hmm, la forma de hacerlo cambia según cada persona.',
    'Solo sigue lo que te dicte tu corazón.',
    'Aprende de los que ya tienen experiencia.',
    'Paso a paso, no te apresures.',
    '¡Con una determinación fuerte!',
    'Empieza primero por las cosas pequeñas.',
    'Solo sé constante y verás que podrás hacerlo.',
    '¡No lo pienses de más, pasa directo a la acción!',
    '¡Fácil! ¡Solo ponte en marcha!',
    '¿Cómo? ¡Pues intentándolo primero!',
    'Con la estrategia adecuada.',
    'Hmm, yo también sigo aprendiendo sobre eso.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *¿CÓMO?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .bagaimana ¿cómo ser exitoso?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
