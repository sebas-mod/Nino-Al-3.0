const pluginConfig = {
    name: 'calcular',
    alias: ['calc', 'cek', 'lindo', 'calcularlindo', 'inteligente', 'calcularinteligente', 'suerte', 'calcularsuerte', 'fiel', 'calcularfiel', 'baik', 'cekbaik'],
    category: 'cek',
    description: 'Calcula diferentes estadísticas divertidas sobre ti o un amigo',
    usage: '.calcular <lindo|inteligente|suerte|fiel|baik> <@tag/nombre>',
    example: '.calcular lindo @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { command, text }) {
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
    const username = `@${mentioned.split('@')[0]}`

    // 1. Determinar el tipo de cálculo basado en el comando directo o el primer argumento
    let type = ''
    const cmd = command.toLowerCase()
    const args = text?.trim().split(/\s+/) || []
    let firstArg = args[0]?.toLowerCase() || ''

    if (cmd.includes('lindo')) {
        type = 'lindo'
    } else if (cmd.includes('inteligente')) {
        type = 'inteligente'
    } else if (cmd.includes('suerte')) {
        type = 'suerte'
    } else if (cmd.includes('fiel')) {
        type = 'fiel'
    } else if (cmd.includes('baik') || cmd.includes('baik')) {
        type = 'baik'
    } else {
        // Si usó el comando base (.calcular o .calc), miramos el primer argumento
        if (['lindo', 'inteligente', 'suerte', 'fiel', 'baik'].includes(firstArg)) {
            type = firstArg
        }
    }

    // Si no se especificó un tipo válido, mostrar el menú de ayuda del plugin
    if (!type) {
        return m.reply(
            `📊 *ᴍᴇɴᴜ́ ᴅᴇ ᴄᴀ́ʟᴄᴜʟᴏs*\n\n` +
            `> Por favor, selecciona una de las opciones válidas:\n\n` +
            `• \`${m.prefix}calcular lindo\`\n` +
            `• \`${m.prefix}calcular inteligente\`\n` +
            `• \`${m.prefix}calcular suerte\`\n` +
            `• \`${m.prefix}calcular fiel\`\n` +
            `• \`${m.prefix}calcular baik\` (bondad)\n\n` +
            `💡 *Tip:* También puedes usar acortadores directos como \`${m.prefix}lindo\` o \`${m.prefix}fiel\``
        )
    }

    // 2. Definir las descripciones según el porcentaje y tipo de cálculo elegido
    let title = ''
    let desc = ''

    switch (type) {
        case 'lindo':
            title = 'Nivel de Lindura'
            if (percent >= 90) desc = '¡Espectacular! Modelas para revistas internacionales. 🌟✨'
            else if (percent >= 70) desc = 'Muy atractivo/a, robas miradas a donde vas. 😏💖'
            else if (percent >= 50) desc = 'Tienes lo tuyo, simpático/a. 😊'
            else if (percent >= 30) desc = 'Normalito/a, belleza exótica. 🙂'
            else desc = 'Lo bueno es que tienes salud y buenos sentimientos. 💀'
            break

        case 'inteligente':
            title = 'Nivel de Inteligencia'
            if (percent >= 90) desc = '¡Nivel Einstein! Un cerebro privilegiado. 🧠⚡'
            else if (percent >= 70) desc = 'Muy listo/a, siempre tienes una respuesta para todo. 📝'
            else if (percent >= 50) desc = 'Promedio, pasas las materias raspando. 👍'
            else if (percent >= 30) desc = 'Te cuesta un poquito, pero le echas ganas. 🤓'
            else desc = 'Se te olvida a qué entraste a una habitación. 🧐'
            break

        case 'suerte':
            title = 'Nivel de Suerte'
            if (percent >= 90) desc = '¡Te encuentras dinero en la calle todos los días! 🍀💰'
            else if (percent >= 70) desc = 'La fortuna te sonríe bastante seguido. 🎰'
            else if (percent >= 50) desc = 'Mitad y mitad, ni tan suertudo ni tan salado. ⚖️'
            else if (percent >= 30) desc = 'Hoy mejor no juegues a nada. 🥶'
            else desc = 'Te cae un rayo en un día completamente soleado. ⛈️'
            break

        case 'fiel':
            title = 'Nivel de Fidelidad'
            if (percent >= 90) desc = '¡Un ángel de la lealtad! Jamás mirarías a nadie más. 💍❤️'
            else if (percent >= 70) desc = 'Muy fiel y respetuoso/a con tus vínculos. 🤝'
            else if (percent >= 50) desc = 'Fiel... pero la tentación a veces te hace dudar. 👀'
            else if (percent >= 30) desc = 'Peligroso/a, un ojo al gato y otro al garabato. 😼'
            else desc = 'El mismísimo Rey/Reina de la infidelidad. Corran de aquí. 🔥'
            break

        case 'baik':
            title = 'Nivel de Bondad'
            if (percent >= 90) desc = '¡Excelente! ¡Eres la persona más buena de este mundo! 😇✨'
            else if (percent >= 70) desc = '¡De buen corazón y para nada presumido/a! 💝'
            else if (percent >= 50) desc = 'Bastante bueno/a 😊'
            else if (percent >= 30) desc = 'Un poco bueno/a 🙂'
            else desc = 'Hmm, ¿necesitas una introspección? 🤔'
            break
    }

    // 3. Estructurar la respuesta dependiendo de si se calcula para uno mismo o para un tercero
    let txt = ''
    if (mentioned === m.sender) {
        txt = `Hola ${username}\n\nTu *${title}* es del *${percent}%*\n\`\`\`${desc}\`\`\``
    } else {
        txt = `¿Quieres revisar el *${title}* de ${username}?\n\nSu porcentaje es del *${percent}%*\n\`\`\`${desc}\`\`\``
    }

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
