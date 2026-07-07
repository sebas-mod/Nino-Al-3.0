const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will', 'pasara', 'ocurrira'],
    category: 'fun',
    description: 'Pregúntale al bot si algo sucederá',
    usage: '.akankah <pregunta>',
    example: '.akankah ¿seré exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, definitivamente sucederá!',
    'No, parece que no va a pasar.',
    'Tal vez sí, tal vez no.',
    '¡Si Dios quiere, sucederá!',
    'Hmm, es difícil de predecir.',
    '¡Por supuesto! ¡Tenlo por seguro!',
    'No lo creo.',
    'Sucederá si estás dispuesto a esforzarte.',
    'Algún día, con toda seguridad.',
    'No pasará, lo siento.',
    '¡Claro que sí! ¡Solo espera!',
    'Hmm, lo dudo.',
    '¡Sí! ¡Confía en el proceso!',
    'Hay muy pocas probabilidades.',
    '¡Pasará, estoy seguro!',
    'No va a pasar, mejor busca otra cosa.',
    'Pasará, pero tomará algo de tiempo.',
    '¡Ojalá así sea!',
    'Si es el destino, definitivamente pasará.',
    '¡Sucederá en el momento perfecto!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔮 *¿PASARÁ?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .akankah ¿seré exitoso?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
