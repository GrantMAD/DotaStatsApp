/**
 * Mapping of Dota 2 Chat Wheel IDs and Dota Plus Hero phrases to their English messages.
 * Data sourced from OpenDota constants.
 */

export const CHATWHEEL_MAPPING: Record<string, string> = {
  // Standard Chat Wheel
  "0": "Okay.",
  "1": "Careful!",
  "2": "Get Back!",
  "3": "Need Wards.",
  "4": "Stun Now!",
  "5": "Help!",
  "6": "Push Now!",
  "7": "Well Played!",
  "8": "Missing!",
  "9": "Missing Top!",
  "10": "Missing Mid!",
  "11": "Missing Bottom!",
  "12": "New Meta.",
  "13": "My Bad.",
  "14": "Space Created.",
  "15": "Whoops.",
  "16": "Initiate!",
  "17": "Follow Me.",
  "18": "Group Up.",
  "19": "Spread Out.",
  "20": "Split Farm.",
  "21": "Attack Now!",
  "22": "Be Right Back.",
  "23": "Dive!",
  "24": "On My Way.",
  "25": "Get Ready.",
  "26": "He's Using His Bottle.",
  "27": "He's Using His Salve.",
  "28": "He's Using His Clarity.",
  "29": "He's Using His Mango.",
  "30": "Check His Inventory.",
  "31": "Skill Is Off Cooldown.",
  "32": "Ult Is Off Cooldown.",
  "33": "Need Mana.",
  "34": "Need XP.",
  "35": "Need Gold.",
  "36": "Need Buyback.",
  "37": "Need Roshan.",
  "38": "Need Aegis.",
  "39": "Need Cheese.",
  "40": "Need Refresher.",
  "41": "Need Ward.",
  "42": "Need Sentry.",
  "43": "Need Dust.",
  "44": "Need Smoke.",
  "45": "Need Gem.",
  "46": "Need Courier.",
  "47": "Need Flying Courier.",
  "48": "Need Upgrade.",
  "49": "Need Help!",
  "50": "Need Backup!",
  "51": "Need Gank!",
  "52": "Need Vision!",
  "53": "Need Map Awareness!",
  "54": "Need TP!",
  "55": "Need To Pull!",
  "56": "Need To Stack!",
  "57": "Need To Check Rune!",
  "58": "Need To Ward!",
  "59": "Need To De-Ward!",
  "60": "Good Luck, Have Fun.",
  "61": "Thanks!",
  "62": "You're Welcome.",
  "63": "Nice.",
  "64": "Don't Give Up!",
  "65": "That Just Happened.",
  "66": "Game Is Hard.",
  "67": "Relax, You're Doing Fine.",
  "68": "I Immediately Regret My Decision.",
  "69": "Good Game.",
  "70": "Good Game, Well Played.",
  "71": "Sorry.",
  "72": "Wait.",
  "73": "Go!",
  "74": "Pushing.",
  "75": "Defending.",
  "76": "Jungling.",
  "77": "Roaming.",
  "78": "Pulling.",
  "79": "Stacking.",
  "80": "I'm retreating",
  "81": "Space created",
  "82": "Thanks",
  "83": "We need wards",
  "84": "Heal",
  "85": "Mana",
  "86": "Out of mana",
  "87": "Skills are on cooldown",
  "88": "Ultimate is ready",
  "89": "Ultimate is not ready",
  "90": "Ultimate is on cooldown",
  "91": "Not enough mana for Ultimate",
  "92": "I'm level [Level]",
  "93": "I'm [Percentage]% to level [Level]",
  "94": "Enemy has [Item]",
  "95": "Enemy [Hero] is missing!",
  "96": "Enemy [Hero] has returned!",
  "97": "All enemies are missing!",
  "98": "Enemy [Hero] is back!",
  "99": "(All) Well played",
  "100": "(All) Luck",
  "101": "(All) Good game",
  "102": "(All) Good game, well played",
  "103": "What should I buy?",
  "104": "I'm building [Item]",
  "105": "I have [Item]",
  "106": "[Item] is ready",
  "107": "Need [Amount] gold for [Item]",
  "108": "(All) GLHF",
  "109": "(All) GG",
  "110": "(All) GGWP",
  "111": "(All) Game is paused",
  "112": "(All) Game is unpaused",
  "113": "(All) Sorry",
  "114": "(All) Relax, you're doing fine",
  "115": "(All) That just happened",
  "116": "(All) Good job",
  "117": "(All) Well played!",
  "118": "(All) Nice",
  "119": "(All) Thanks",

  // Caster/Seasonal/Epic Lines (Common ones)
  "120": "Patience from Zhou",
  "121": "Waow!",
  "122": "They're all dead!",
  "123": "Brutal. Savage. Rekt.",
  "124": "It's a disastah!",
  "125": "Lakad Matatag! Normalin, Normalin.",
  "126": "The next level play!",
  "127": "Oy oy oy oy oy oy oy oy!",
  "128": "Easiest money of my life!",
  "129": "Echo Slamma Jamma!",
  "130": "C'est un désastre!",
  "131": "Красава!",
  "132": "Ой-ой-ой-ой-ой, что сейчас произошло!",
  "133": "Это. Просто. Нечто.",
  "134": "Боже, ты посмотри вокруг...",
  "135": "Жил до конца, умер как герой",
  "136": "Ай-ай-ай-ай-ай, что сейчас произошло!",
  "137": "Это ГГ",
  "138": "Это ненормально, это нечестно!",
  "139": "Как же это сочно, друзья!",
  "140": "Ребята, это не игра, это пошли они...",
  "141": "加油! (Jia You!)",
  "142": "破两路啦! (Po liang lu la!)",
  "143": "天火! (Tian Huo!)",
  "144": "走好，不送 (Zou hao, bu song)",
  "145": "漂亮! (Piao Liang!)",
  "146": "感觉心满意足 (Gan jue xin man yi zu)",
  "147": "这就很难受了 (Zhe jiu hen nan shou le)",
  
  // More Seasonal
  "150": "Absolutely Perfect!",
  "151": "You're a God!",
  "152": "I can't believe it!",
  "153": "Incredible!",
  "154": "What?!",
  "155": "Goodbye!",
  "156": "See ya!",
  "157": "Oh my god!",
  "158": "Wow!",
  "159": "My goodness!",
  "169": "[Crowd Groan]",

  // Guild Rewards & Supporter Packs (2024-2026)
  "230": "Ceeeeeb!",
  "263": "Holy Moly!",
  "272": "What the **** just happened?",
  "304": "I'm so stupid, I'm so stupid stupid stupid!",
  "328": "Bock bock bock!",
  "397": "Absolute cinema.",

  // SVG Lines
  "702": "Honestly I just don't care.",
  "726": "What the hell are we doing here?",
  
  // Animal/Event Sounds
  "53004": "Bock bock!",
  "54006": "Oink Oink!",

  // Guild Platinum/Gold/Silver standard rotations
  "200": "See you later.",
  "201": "That's playing to win, baby!",
  "202": "I can't believe what we're seeing. What just happened?",
  "203": "Looking spicy!",
  "204": "What? What? What?",
  "205": "I... uh... what?",
  "206": "Wait for it... wait for it...",
  "207": "You're doing great!",
  "208": "Nice.",
  "209": "Good job.",

  // Talent Voice Lines 2025 Series (401xxx)
  "401678": "I'm farming lane, cause I'm a winner.",
  "401679": "Wow, I hope the rest of your day goes as well as that play.",
  "401672": "*Poof* See ya!",
  "401673": "The dog says 'Bark Bark'",
  "401640": "Are you sure about that?",
  "401641": "Did you try asking for help?",
  "401684": "Mamma mia!",
  "401690": "Nothing beats a Dota 2 holiday...",
  "401695": "Aw yeah, now I get your wisdom!",
  "401702": "How ya going champion?",
  "401738": "Nah, I'd win.",
  "401659": "Оу май, что за легенда в лобби?",
  "401720": "Истинный мастер не ищет сражения",
  "401721": "Я не проигрываю, я тренируюсь",
  "401234": "Absolute cinema.",
  "401235": "I love this game.",
  "401236": "This gamer goes brrrrr.",

  // Example Hero Lines
  // (Handled dynamically in UI if needed, but adding a few common ones)
  "dota_chatwheel_message_nevermore_1": "You're not even a challenge.",
  "dota_chatwheel_message_nevermore_2": "Outplayed.",
  "dota_chatwheel_message_nevermore_3": "Fear my presence.",
  "dota_chatwheel_message_nevermore_4": "Collected.",
  "dota_chatwheel_message_nevermore_5": "Abyssal focus.",
  
  "dota_chatwheel_message_axe_1": "Axe is AXE!",
  "dota_chatwheel_message_axe_2": "I said good day sir!",
  "dota_chatwheel_message_axe_3": "Axe is all the reinforcement I need.",
  "dota_chatwheel_message_axe_4": "What happened? Axe happened!",
  "dota_chatwheel_message_axe_5": "You're a disgrace!",
};

/**
 * Helper to get the phrase from a key.
 * If the key is not found, it returns the key itself.
 */
export function getChatWheelPhrase(key: any): string {
  if (key === undefined || key === null) return '';
  
  const cleanKey = String(key).trim();
  
  // Direct match
  if (CHATWHEEL_MAPPING[cleanKey]) {
    return CHATWHEEL_MAPPING[cleanKey];
  }
  
  // Handle numeric strings that might be prefixed (e.g., "chatwheel_7")
  const numericMatch = cleanKey.match(/\d+/);
  if (numericMatch) {
    const id = numericMatch[0];
    if (CHATWHEEL_MAPPING[id]) {
      return CHATWHEEL_MAPPING[id];
    }
  }
  
  // Handle hero-specific lines that might follow a pattern
  if (cleanKey.startsWith('dota_chatwheel_message_') || cleanKey.startsWith('dota_chat_wheel_')) {
    const parts = cleanKey.split('_');
    // Pattern: dota_chatwheel_message_<hero_name>_<index>
    // Or: dota_chat_wheel_<hero_name>_<index>
    const isHeroLine = cleanKey.includes('message') || parts.length >= 5;
    if (isHeroLine) {
      const startIndex = cleanKey.includes('message') ? 3 : 3;
      const heroName = parts.slice(startIndex, -1).join(' ');
      const index = parts[parts.length - 1];
      if (heroName && index) {
        return `[${heroName.charAt(0).toUpperCase() + heroName.slice(1)} Line ${index}]`;
      }
    }
  }

  return cleanKey;
}
