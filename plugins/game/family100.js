import {
  getRandomItem,
  createSession,
  getSession,
  endSession,
  hasActiveSession,
  setSessionTimer,
  getRemainingTime,
  formatRemainingTime,
  isSurrender,
  isReplyToGame,
  getRandomReward,
} from "../../src/lib/ourin-game-data.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "family100",
  alias: ["f100", "encuesta", "100latinos"],
  category: "game",
  description: "¡100 latinos dijeron! Adivina las respuestas más populares de la encuesta",
  usage: ".family100",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (hasActiveSession(chatId)) {
    const session = getSession(chatId);
    if (session && session.gameType === "family100") {
      const remaining = getRemainingTime(chatId);
      const answered = session.answered || [];
      const total = session.question.jawaban.length;

      let text = `¡Vaya, ya hay una sesión activa de Family 100 en este grupo! 😱✨\n\n`;
      text += `*${session.question.soal}*\n\n`;
      text += `Adivinadas: *${answered.length} de ${total}*\n`;
      answered.forEach((ans, i) => {
        text += `${i + 1}. ✅ ${ans}\n`;
      });
      for (let i = answered.length; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
      }
      text += `\nTiempo restante: *${formatRemainingTime(remaining)}* ⏳\n`;
      text += `¡Responde rápido al mensaje original del juego para participar! 🔥`;
      await m.reply(text);
      return;
    }
  }

  const question = getRandomItem("family100.json");
  if (!question) {
    await m.reply("Lo siento mucho, la base de preguntas para este juego está vacía en este momento. 😭💔");
    return;
  }

  const total = question.jawaban.length;

  let text = `🎉✨ ¡Es hora de jugar a *FAMILY 100*! ✨🎉\n\n`;
  text += `*Pregunta:* ${question.soal}\n\n`;
  text += `Total de respuestas: *${total}* 📝\n`;
  for (let i = 0; i < total; i++) {
    text += `${i + 1}. ❓ ???\n`;
  }
  text += `\n¡Tienes solo *120 segundos*! ⏱️\n`;
  text += `¿El premio? ¡*EXP* y *Monedas* aleatorias por cada respuesta correcta! 🎁💸\n\n`;
  text += `Cómo jugar: Responde directamente (*reply*) a este mensaje con tu respuesta, o escribe *nyerah* o *me rindo* si se te complica demasiado. 🏳️😂`;

  const sentMsg = await m.reply(text);

  const session = createSession(
    chatId,
    "family100",
    question,
    sentMsg.key,
    120000,
  );
  session.answered = [];
  session.answeredBy = {};

  setSessionTimer(chatId, async () => {
    const sess = getSession(chatId);
    const answered = sess?.answered || [];
    const remaining = question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let timeoutText = `⏱️ ¡El tiempo se ha agotado por completo! 😭😭\n\n`;
    timeoutText += `¡Lograron adivinar *${answered.length}* de *${question.jawaban.length}* respuestas! ✨\n\n`;
    if (remaining.length > 0) {
      timeoutText += `Estas fueron las respuestas que les faltaron encontrar:\n`;
      remaining.forEach((ans) => {
        timeoutText += `• ${ans}\n`;
      });
    }
    timeoutText += `\n¡Muchas gracias por jugar, los espero en la próxima ronda! 💖🎉`;

    endSession(chatId);
    await sock.sendMessage(chatId, { text: timeoutText }, { quoted: sentMsg });
  });
}

async function family100AnswerHandler(m, sock) {
  const chatId = m.chat;
  const session = getSession(chatId);

  if (!session || session.gameType !== "family100") return false;
  if (!isReplyToGame(m, session)) return false;

  const userAnswer = (m.body || "").toLowerCase().trim();
  if (!userAnswer || userAnswer.startsWith(".")) return false;

  if (isSurrender(userAnswer) || userAnswer === "me rindo" || userAnswer === "rendirse" || userAnswer === "rendicion") {
    const answered = session.answered || [];
    const remaining = session.question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let text = `¿Cómo? ¿Se rinden tan fácil? 🥺🏳️\n\n`;
    text += `¡Iban muy bien! Adivinaron *${answered.length}* de *${session.question.jawaban.length}* respuestas. 👏\n\n`;
    if (remaining.length > 0) {
      text += `Aquí tienen el resto de las respuestas ocultas:\n`;
      remaining.forEach((ans) => {
        text += `• ${ans}\n`;
      });
    }
    text += `\n¡No pasa nada, la próxima vez completarán el tablero! 💖✨`;

    endSession(chatId);
    await m.reply(text);
    return true;
  }

  const correctAnswers = session.question.jawaban.map((j) => j.toLowerCase());
  const answered = session.answered || [];

  if (answered.includes(userAnswer)) {
    await m.react("⚠️");
    await m.reply(`¡Epa! Alguien ya adivinó *${userAnswer}* hace un momento. ¡Piensa en otra! 😂✨`);
    return true;
  }

  const matchIndex = correctAnswers.findIndex((ans) => {
    const similarity = getSimilarity(ans, userAnswer);
    return (
      similarity >= 0.8 || ans.includes(userAnswer) || userAnswer.includes(ans)
    );
  });

  if (matchIndex !== -1) {
    const originalAnswer = session.question.jawaban[matchIndex];

    if (!answered.includes(originalAnswer.toLowerCase())) {
      session.answered.push(originalAnswer.toLowerCase());
      session.answeredBy[originalAnswer.toLowerCase()] = m.sender;

      const db = getDatabase();
      const user = db.getUser(m.sender);

      const answerReward = getRandomReward();
      if (!user.rpg) user.rpg = {};
      await addExpWithLevelCheck(sock, m, db, user, answerReward.exp);
      db.updateKoin(m.sender, answerReward.koin);
      db.save();

      if (session.answered.length === correctAnswers.length) {
        endSession(chatId);

        const participants = Object.values(session.answeredBy);
        const uniqueParticipants = [...new Set(participants)];

        let text = `🎉🔥 ¡BRUTAL! ¡Adivinaron absolutamente todas las respuestas del tablero! ✨🔥\n\n`;
        text += `*Pregunta:* ${session.question.soal}\n\n`;
        session.question.jawaban.forEach((ans, i) => {
          const who = session.answeredBy[ans.toLowerCase()];
          text += `${i + 1}. ✅ ${ans} - @${who?.split("@")[0] || "?"}\n`;
        });
        text += `\n🎊 ¡Felicidades a todos los que pusieron a trabajar sus neuronas! ¡Qué gran equipo! 🧠💯`;

        await m.reply(text, { mentions: uniqueParticipants });
        return true;
      }

      const total = question.jawaban?.length || session.question.jawaban.length;
      let text = `¡Eso es correcto! ✅🎉\n@${m.sender.split("@")[0]} ganó *+${answerReward.exp} EXP* & *+${answerReward.koin} Monedas* 💸✨\n\n`;
      text += `*Pregunta:* ${session.question.soal}\n\n`;
      session.question.jawaban.forEach((ans, i) => {
        const isAnswered = session.answered.includes(ans.toLowerCase());
        if (isAnswered) {
          text += `${i + 1}. ✅ ${ans}\n`;
        } else {
          text += `${i + 1}. ❓ ???\n`;
        }
      });
      text += `\n¡Vamos por más! Quedan *${total - session.answered.length}* respuestas pendientes. 🔥⏱️`;

      await m.reply(text, { mentions: [m.sender] });
      return true;
    }
  }

  await m.react("❌");
  await m.reply(`¡Suena la alarma! ❌ ¡Respuesta incorrecta! Dale otra vuelta a tu idea 😂🧠`);
  return true;
}

function getSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longer.length - costs[shorter.length]) / longer.length;
}

export { pluginConfig as config, handler, family100AnswerHandler };
