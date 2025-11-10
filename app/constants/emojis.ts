// src/constants/emojis.js

// Gera automaticamente uma lista completa de emojis Unicode
function generateEmojiList() {
  const emojis = [];

  // Intervalos principais de emojis
  const ranges = [
  [0x1F300, 0x1FAFF], // Emojis diversos (pessoas, objetos, símbolos, animais, etc.)
  [0x1F600, 0x1F64F], // Emojis de rostos
  [0x1F680, 0x1F6FF], // Transportes e símbolos técnicos
  [0x1F900, 0x1F9FF], // Suplemento de emojis (gestos, profissões, etc.)
  [0x1FA70, 0x1FAFF], // Emojis adicionais (instrumentos, objetos, etc.)
  [0x1F1E6, 0x1F1FF], // Bandeiras regionais (A-Z)
  [0x1F200, 0x1F2FF], // Ideogramas e katakana (usados em emojis asiáticos)
  [0x2600, 0x26FF],   // Símbolos diversos (sol, nuvem, coração preto, etc.)
  [0x2700, 0x27BF],   // Dingbats (setas, flores, checkmarks)
  [0xFE00, 0xFE0F],   // Modificadores de variação (VS16)
  [0x1F018, 0x1F270], // Misc symbols and pictographs
  [0x1F780, 0x1F7FF], // Formas geométricas coloridas
  [0x1F000, 0x1F02F], // Mahjong, dominó e cartas
  [0x1F004, 0x1F0CF], // Cartas de baralho
];


  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) {
      emojis.push(String.fromCodePoint(code));
    }
  }

  // Remove caracteres não exibíveis
  const filtered = emojis.filter(e => /\p{Emoji}/u.test(e));

  return filtered;
}

// Exporta lista gerada
export const EMOJI_LIST = generateEmojiList();
