const pluginConfig = {
    name: 'apakah',
    alias: ['apa', 'es', 'acaso'],
    category: 'fun',
    description: 'Pregúntale al bot si algo es o no',
    usage: '.apakah <pregunta>',
    example: '.apakah ¿puedo ser rico?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, por supuesto!',
    'No, parece que no.',
    'Puede ser, intenta preguntar más tarde.',
    'Hmm... yo creo que sí.',
    'Lo dudo, pero todo es posible.',
    '¡Seguro! ¡100%!',
    'Imposible.',
    'Podría ser, ¿quién sabe?',
    'Según yo, sí.',
    'Vaya, no lo creo.',
    'Claro, ¿por qué no?',
    'No lo sé, pregúntale a alguien más.',
    '¡Por Dios, claro que sí!',
    'Hmm... parece que no.',
    '¡Estoy seguro de que sí!',
    'Para nada posible.',
    'Quizás, pero no te hagas demasiadas ilusiones.',
    '¡Claro que sí!',
    'No, lo siento.',
    '¡Se puede! ¡Ánimo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *¿ACASO?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .apakah ¿puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
