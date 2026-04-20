/**
 * Helper to map Hero IDs to localized names.
 * Data source: https://api.opendota.com/api/heroes
 */
export const HEROES: Record<number, { name: string; localized_name: string; roles: string[] }> = {
  1: { name: "npc_dota_hero_antimage", localized_name: "Anti-Mage", roles: ["Carry", "Escape", "Nuker"] },
  2: { name: "npc_dota_hero_axe", localized_name: "Axe", roles: ["Initiator", "Durable", "Disabler", "Jungler", "Carry"] },
  3: { name: "npc_dota_hero_bane", localized_name: "Bane", roles: ["Support", "Disabler", "Nuker", "Durable"] },
  4: { name: "npc_dota_hero_bloodseeker", localized_name: "Bloodseeker", roles: ["Carry", "Disabler", "Jungler", "Nuker", "Initiator"] },
  5: { name: "npc_dota_hero_crystal_maiden", localized_name: "Crystal Maiden", roles: ["Support", "Disabler", "Nuker", "Jungler"] },
  6: { name: "npc_dota_hero_drow_ranger", localized_name: "Drow Ranger", roles: ["Carry", "Disabler", "Push"] },
  7: { name: "npc_dota_hero_earthshaker", localized_name: "Earthshaker", roles: ["Support", "Initiator", "Disabler", "Nuker"] },
  8: { name: "npc_dota_hero_juggernaut", localized_name: "Juggernaut", roles: ["Carry", "Push", "Escape"] },
  9: { name: "npc_dota_hero_mirana", localized_name: "Mirana", roles: ["Support", "Carry", "Escape", "Nuker", "Disabler"] },
  10: { name: "npc_dota_hero_morphling", localized_name: "Morphling", roles: ["Carry", "Escape", "Durable", "Nuker", "Disabler"] },
  11: { name: "npc_dota_hero_nevermore", localized_name: "Shadow Fiend", roles: ["Carry", "Nuker"] },
  12: { name: "npc_dota_hero_phantom_lancer", localized_name: "Phantom Lancer", roles: ["Carry", "Escape", "Push", "Nuker"] },
  13: { name: "npc_dota_hero_puck", localized_name: "Puck", roles: ["Initiator", "Disabler", "Escape", "Nuker"] },
  14: { name: "npc_dota_hero_pudge", localized_name: "Pudge", roles: ["Disabler", "Durable", "Initiator", "Nuker"] },
  15: { name: "npc_dota_hero_razor", localized_name: "Razor", roles: ["Carry", "Durable", "Nuker", "Push"] },
  16: { name: "npc_dota_hero_sand_king", localized_name: "Sand King", roles: ["Initiator", "Disabler", "Nuker", "Escape", "Jungler"] },
  17: { name: "npc_dota_hero_storm_spirit", localized_name: "Storm Spirit", roles: ["Carry", "Escape", "Nuker", "Disabler", "Initiator"] },
  18: { name: "npc_dota_hero_sven", localized_name: "Sven", roles: ["Carry", "Disabler", "Initiator", "Durable", "Nuker"] },
  19: { name: "npc_dota_hero_tiny", localized_name: "Tiny", roles: ["Carry", "Nuker", "Push", "Initiator", "Durable", "Disabler"] },
  20: { name: "npc_dota_hero_vengefulspirit", localized_name: "Vengeful Spirit", roles: ["Support", "Initiator", "Disabler", "Nuker", "Escape"] },
  21: { name: "npc_dota_hero_windrunner", localized_name: "Windranger", roles: ["Carry", "Support", "Disabler", "Escape", "Nuker"] },
  22: { name: "npc_dota_hero_zuus", localized_name: "Zeus", roles: ["Nuker"] },
  23: { name: "npc_dota_hero_kunkka", localized_name: "Kunkka", roles: ["Carry", "Support", "Disabler", "Initiator", "Durable", "Nuker"] },
  25: { name: "npc_dota_hero_lina", localized_name: "Lina", roles: ["Support", "Carry", "Nuker", "Disabler"] },
  26: { name: "npc_dota_hero_lion", localized_name: "Lion", roles: ["Support", "Disabler", "Nuker", "Initiator"] },
  27: { name: "npc_dota_hero_shadow_shaman", localized_name: "Shadow Shaman", roles: ["Support", "Push", "Disabler", "Nuker", "Initiator"] },
  28: { name: "npc_dota_hero_slardar", localized_name: "Slardar", roles: ["Carry", "Durable", "Initiator", "Disabler", "Escape"] },
  29: { name: "npc_dota_hero_tidehunter", localized_name: "Tidehunter", roles: ["Initiator", "Durable", "Disabler", "Nuker"] },
  30: { name: "npc_dota_hero_witch_doctor", localized_name: "Witch Doctor", roles: ["Support", "Disabler", "Nuker"] },
  31: { name: "npc_dota_hero_lich", localized_name: "Lich", roles: ["Support", "Nuker"] },
  32: { name: "npc_dota_hero_riki", localized_name: "Riki", roles: ["Carry", "Escape", "Disabler"] },
  33: { name: "npc_dota_hero_enigma", localized_name: "Enigma", roles: ["Disabler", "Jungler", "Initiator", "Push"] },
  34: { name: "npc_dota_hero_tinker", localized_name: "Tinker", roles: ["Carry", "Nuker", "Push"] },
  35: { name: "npc_dota_hero_sniper", localized_name: "Sniper", roles: ["Carry", "Nuker"] },
  36: { name: "npc_dota_hero_necrolyte", localized_name: "Necrophos", roles: ["Carry", "Nuker", "Durable", "Disabler"] },
  37: { name: "npc_dota_hero_warlock", localized_name: "Warlock", roles: ["Support", "Initiator", "Disabler"] },
  38: { name: "npc_dota_hero_beastmaster", localized_name: "Beastmaster", roles: ["Initiator", "Disabler", "Durable", "Push"] },
  39: { name: "npc_dota_hero_queenofpain", localized_name: "Queen of Pain", roles: ["Carry", "Nuker", "Escape"] },
  40: { name: "npc_dota_hero_venomancer", localized_name: "Venomancer", roles: ["Support", "Nuker", "Initiator", "Push", "Disabler"] },
  41: { name: "npc_dota_hero_faceless_void", localized_name: "Faceless Void", roles: ["Carry", "Initiator", "Disabler", "Escape", "Durable"] },
  42: { name: "npc_dota_hero_skeleton_king", localized_name: "Wraith King", roles: ["Carry", "Support", "Durable", "Disabler", "Initiator"] },
  43: { name: "npc_dota_hero_death_prophet", localized_name: "Death Prophet", roles: ["Carry", "Push", "Nuker", "Disabler"] },
  44: { name: "npc_dota_hero_phantom_assassin", localized_name: "Phantom Assassin", roles: ["Carry", "Escape"] },
  45: { name: "npc_dota_hero_pugna", localized_name: "Pugna", roles: ["Nuker", "Push"] },
  46: { name: "npc_dota_hero_templar_assassin", localized_name: "Templar Assassin", roles: ["Carry", "Escape"] },
  47: { name: "npc_dota_hero_viper", localized_name: "Viper", roles: ["Carry", "Durable", "Initiator", "Disabler"] },
  48: { name: "npc_dota_hero_luna", localized_name: "Luna", roles: ["Carry", "Nuker", "Push"] },
  49: { name: "npc_dota_hero_dragon_knight", localized_name: "Dragon Knight", roles: ["Carry", "Push", "Durable", "Disabler", "Initiator", "Nuker"] },
  50: { name: "npc_dota_hero_dazzle", localized_name: "Dazzle", roles: ["Support", "Nuker", "Disabler"] },
  51: { name: "npc_dota_hero_rattletrap", localized_name: "Clockwerk", roles: ["Initiator", "Disabler", "Durable", "Nuker"] },
  52: { name: "npc_dota_hero_leshrac", localized_name: "Leshrac", roles: ["Carry", "Support", "Nuker", "Push", "Disabler"] },
  53: { name: "npc_dota_hero_furion", localized_name: "Nature's Prophet", roles: ["Carry", "Jungler", "Push", "Escape", "Nuker"] },
  54: { name: "npc_dota_hero_life_stealer", localized_name: "Lifestealer", roles: ["Carry", "Durable", "Jungler", "Escape", "Disabler"] },
  55: { name: "npc_dota_hero_dark_seer", localized_name: "Dark Seer", roles: ["Initiator", "Jungler", "Escape", "Disabler"] },
  56: { name: "npc_dota_hero_clinkz", localized_name: "Clinkz", roles: ["Carry", "Escape", "Nuker", "Push"] },
  57: { name: "npc_dota_hero_omniknight", localized_name: "Omniknight", roles: ["Support", "Durable", "Nuker"] },
  58: { name: "npc_dota_hero_enchantress", localized_name: "Enchantress", roles: ["Support", "Jungler", "Push", "Durable", "Disabler"] },
  59: { name: "npc_dota_hero_huskar", localized_name: "Huskar", roles: ["Carry", "Durable", "Initiator"] },
  60: { name: "npc_dota_hero_night_stalker", localized_name: "Night Stalker", roles: ["Carry", "Initiator", "Durable", "Disabler", "Nuker"] },
  61: { name: "npc_dota_hero_broodmother", localized_name: "Broodmother", roles: ["Carry", "Push", "Escape", "Nuker"] },
  62: { name: "npc_dota_hero_bounty_hunter", localized_name: "Bounty Hunter", roles: ["Support", "Escape", "Nuker"] },
  63: { name: "npc_dota_hero_weaver", localized_name: "Weaver", roles: ["Carry", "Escape"] },
  64: { name: "npc_dota_hero_jakiro", localized_name: "Jakiro", roles: ["Support", "Nuker", "Push", "Disabler"] },
  65: { name: "npc_dota_hero_batrider", localized_name: "Batrider", roles: ["Initiator", "Jungler", "Disabler", "Escape"] },
  66: { name: "npc_dota_hero_chen", localized_name: "Chen", roles: ["Support", "Jungler", "Push"] },
  67: { name: "npc_dota_hero_spectre", localized_name: "Spectre", roles: ["Carry", "Durable", "Escape"] },
  68: { name: "npc_dota_hero_ancient_apparition", localized_name: "Ancient Apparition", roles: ["Support", "Disabler", "Nuker"] },
  69: { name: "npc_dota_hero_doom_bringer", localized_name: "Doom", roles: ["Carry", "Disabler", "Durable", "Initiator", "Jungler"] },
  70: { name: "npc_dota_hero_ursa", localized_name: "Ursa", roles: ["Carry", "Jungler", "Durable", "Disabler"] },
  71: { name: "npc_dota_hero_spirit_breaker", localized_name: "Spirit Breaker", roles: ["Carry", "Initiator", "Disabler", "Durable", "Escape"] },
  72: { name: "npc_dota_hero_gyrocopter", localized_name: "Gyrocopter", roles: ["Carry", "Nuker"] },
  73: { name: "npc_dota_hero_alchemist", localized_name: "Alchemist", roles: ["Carry", "Support", "Durable", "Disabler", "Initiator", "Nuker"] },
  74: { name: "npc_dota_hero_invoker", localized_name: "Invoker", roles: ["Carry", "Nuker", "Disabler", "Escape", "Push"] },
  75: { name: "npc_dota_hero_silencer", localized_name: "Silencer", roles: ["Carry", "Support", "Disabler", "Nuker"] },
  76: { name: "npc_dota_hero_obsidian_destroyer", localized_name: "Outworld Destroyer", roles: ["Carry", "Nuker", "Disabler"] },
  77: { name: "npc_dota_hero_lycan", localized_name: "Lycan", roles: ["Carry", "Push", "Jungler", "Durable", "Escape"] },
  78: { name: "npc_dota_hero_brewmaster", localized_name: "Brewmaster", roles: ["Carry", "Initiator", "Durable", "Disabler", "Nuker"] },
  79: { name: "npc_dota_hero_shadow_demon", localized_name: "Shadow Demon", roles: ["Support", "Disabler", "Initiator", "Nuker"] },
  80: { name: "npc_dota_hero_lone_druid", localized_name: "Lone Druid", roles: ["Carry", "Push", "Jungler", "Durable"] },
  81: { name: "npc_dota_hero_chaos_knight", localized_name: "Chaos Knight", roles: ["Carry", "Disabler", "Durable", "Initiator"] },
  82: { name: "npc_dota_hero_meepo", localized_name: "Meepo", roles: ["Carry", "Escape", "Nuker", "Disabler", "Initiator", "Push"] },
  83: { name: "npc_dota_hero_treant", localized_name: "Treant Protector", roles: ["Support", "Initiator", "Durable", "Disabler", "Escape"] },
  84: { name: "npc_dota_hero_ogre_magi", localized_name: "Ogre Magi", roles: ["Support", "Nuker", "Disabler", "Durable", "Initiator"] },
  85: { name: "npc_dota_hero_undying", localized_name: "Undying", roles: ["Support", "Durable", "Disabler", "Initiator"] },
  86: { name: "npc_dota_hero_rubick", localized_name: "Rubick", roles: ["Support", "Disabler", "Nuker"] },
  87: { name: "npc_dota_hero_disruptor", localized_name: "Disruptor", roles: ["Support", "Disabler", "Nuker", "Initiator"] },
  88: { name: "npc_dota_hero_nyx_assassin", localized_name: "Nyx Assassin", roles: ["Disabler", "Nuker", "Initiator", "Escape"] },
  89: { name: "npc_dota_hero_naga_siren", localized_name: "Naga Siren", roles: ["Carry", "Support", "Push", "Disabler", "Initiator", "Escape"] },
  90: { name: "npc_dota_hero_keeper_of_the_light", localized_name: "Keeper of the Light", roles: ["Support", "Nuker", "Disabler", "Jungler"] },
  91: { name: "npc_dota_hero_wisp", localized_name: "Io", roles: ["Support", "Escape", "Nuker"] },
  92: { name: "npc_dota_hero_visage", localized_name: "Visage", roles: ["Support", "Nuker", "Durable", "Disabler", "Push"] },
  93: { name: "npc_dota_hero_slark", localized_name: "Slark", roles: ["Carry", "Escape", "Disabler", "Nuker"] },
  94: { name: "npc_dota_hero_medusa", localized_name: "Medusa", roles: ["Carry", "Durable", "Nuker"] },
  95: { name: "npc_dota_hero_troll_warlord", localized_name: "Troll Warlord", roles: ["Carry", "Push", "Disabler", "Durable"] },
  96: { name: "npc_dota_hero_centaur", localized_name: "Centaur Warrunner", roles: ["Durable", "Initiator", "Disabler", "Nuker"] },
  97: { name: "npc_dota_hero_magnataur", localized_name: "Magnus", roles: ["Initiator", "Disabler", "Nuker", "Escape"] },
  98: { name: "npc_dota_hero_shredder", localized_name: "Timbersaw", roles: ["Nuker", "Durable", "Escape"] },
  99: { name: "npc_dota_hero_bristleback", localized_name: "Bristleback", roles: ["Carry", "Durable", "Initiator", "Nuker"] },
  100: { name: "npc_dota_hero_tusk", localized_name: "Tusk", roles: ["Initiator", "Disabler", "Nuker"] },
  101: { name: "npc_dota_hero_skywrath_mage", localized_name: "Skywrath Mage", roles: ["Support", "Nuker", "Disabler"] },
  102: { name: "npc_dota_hero_abaddon", localized_name: "Abaddon", roles: ["Support", "Carry", "Durable"] },
  103: { name: "npc_dota_hero_elder_titan", localized_name: "Elder Titan", roles: ["Initiator", "Disabler", "Nuker", "Durable"] },
  104: { name: "npc_dota_hero_legion_commander", localized_name: "Legion Commander", roles: ["Carry", "Disabler", "Initiator", "Durable", "Nuker"] },
  105: { name: "npc_dota_hero_techies", localized_name: "Techies", roles: ["Nuker", "Disabler"] },
  106: { name: "npc_dota_hero_ember_spirit", localized_name: "Ember Spirit", roles: ["Carry", "Escape", "Nuker", "Disabler", "Initiator"] },
  107: { name: "npc_dota_hero_earth_spirit", localized_name: "Earth Spirit", roles: ["Initiator", "Disabler", "Support", "Nuker", "Escape"] },
  108: { name: "npc_dota_hero_abyssal_underlord", localized_name: "Underlord", roles: ["Support", "Carry", "Durable", "Disabler", "Initiator", "Escape"] },
  109: { name: "npc_dota_hero_terrorblade", localized_name: "Terrorblade", roles: ["Carry", "Push"] },
  110: { name: "npc_dota_hero_phoenix", localized_name: "Phoenix", roles: ["Support", "Initiator", "Nuker", "Disabler", "Escape"] },
  111: { name: "npc_dota_hero_oracle", localized_name: "Oracle", roles: ["Support", "Nuker", "Disabler", "Escape"] },
  112: { name: "npc_dota_hero_winter_wyvern", localized_name: "Winter Wyvern", roles: ["Support", "Disabler", "Nuker", "Escape"] },
  113: { name: "npc_dota_hero_arc_warden", localized_name: "Arc Warden", roles: ["Carry", "Escape", "Nuker"] },
  114: { name: "npc_dota_hero_monkey_king", localized_name: "Monkey King", roles: ["Carry", "Escape", "Disabler", "Initiator"] },
  119: { name: "npc_dota_hero_dark_willow", localized_name: "Dark Willow", roles: ["Support", "Nuker", "Disabler", "Escape"] },
  120: { name: "npc_dota_hero_pangolier", localized_name: "Pangolier", roles: ["Carry", "Nuker", "Disabler", "Durable", "Escape", "Initiator"] },
  121: { name: "npc_dota_hero_grimstroke", localized_name: "Grimstroke", roles: ["Support", "Nuker", "Disabler"] },
  123: { name: "npc_dota_hero_hoodwink", localized_name: "Hoodwink", roles: ["Support", "Nuker", "Disabler", "Escape"] },
  126: { name: "npc_dota_hero_void_spirit", localized_name: "Void Spirit", roles: ["Carry", "Escape", "Nuker", "Disabler"] },
  128: { name: "npc_dota_hero_snapfire", localized_name: "Snapfire", roles: ["Support", "Nuker", "Disabler", "Escape"] },
  129: { name: "npc_dota_hero_mars", localized_name: "Mars", roles: ["Carry", "Initiator", "Durable", "Disabler"] },
  135: { name: "npc_dota_hero_dawnbreaker", localized_name: "Dawnbreaker", roles: ["Carry", "Durable", "Initiator"] },
  136: { name: "npc_dota_hero_marci", localized_name: "Marci", roles: ["Carry", "Support", "Initiator", "Disabler", "Escape"] },
  137: { name: "npc_dota_hero_primal_beast", localized_name: "Primal Beast", roles: ["Initiator", "Durable", "Disabler"] },
  138: { name: "npc_dota_hero_muerta", localized_name: "Muerta", roles: ["Carry", "Nuker", "Disabler"] },
};

/**
 * Reverse mapping for hero names to IDs.
 */
export const HERO_NAME_TO_ID: Record<string, number> = Object.entries(HEROES).reduce((acc, [id, hero]) => {
  acc[hero.name] = Number(id);
  return acc;
}, {} as Record<string, number>);

/**
 * Helper to map Lobby Type IDs to names.
 * Data source: https://api.opendota.com/api/constants/lobby_type
 */
export const LOBBY_TYPES: Record<number, string> = {
  0: "Normal",
  1: "Practice",
  2: "Tournament",
  3: "Tutorial",
  4: "Co-op Bots",
  5: "Ranked Team MM",
  6: "Ranked Solo MM",
  7: "Ranked",
  8: "1v1 Mid",
  9: "Battle Cup",
};

/**
 * Helper to map Region IDs (clusters) to names.
 * Data source: https://api.opendota.com/api/constants/region
 */
export const REGIONS: Record<number, string> = {
  // Region IDs (from /counts endpoint)
  1: "US West",
  2: "US East",
  3: "Western EU",
  5: "SE Asia",
  6: "Dubai",
  7: "Australia",
  8: "Russia",
  9: "Eastern EU",
  10: "South America",
  11: "South Africa",
  12: "China", 13: "China", 14: "China", 15: "China", 16: "China", 17: "China", 18: "China", 19: "China", 20: "China",
  25: "Chile",
  26: "Peru",
  27: "India",

  // Cluster IDs (from raw match data)
  111: "US West", 112: "US West", 113: "US West", 114: "US West",
  121: "US East", 122: "US East", 123: "US East", 124: "US East",
  131: "Western EU", 132: "Western EU", 133: "Western EU", 134: "Western EU", 135: "Western EU", 136: "Western EU", 137: "Western EU", 138: "Western EU",
  151: "SE Asia", 152: "SE Asia", 153: "SE Asia", 154: "SE Asia", 155: "SE Asia", 156: "SE Asia", 157: "SE Asia",
  161: "China", 163: "China",
  171: "Australia",
  181: "Russia", 182: "Russia", 183: "Russia", 184: "Russia", 185: "Russia", 186: "Russia", 187: "Russia", 188: "Russia",
  191: "Eastern EU", 192: "Eastern EU",
  200: "South America", 204: "South America",
  211: "South Africa", 212: "South Africa", 213: "South Africa",
  223: "China", 224: "China", 225: "China", 227: "China",
  231: "Chile",
  241: "Peru", 242: "Peru",
  251: "India",
  261: "Dubai",
};

/**
 * Mapping for Lane IDs
 */
export const LANES: Record<number, string> = {
  1: "Safe",
  2: "Mid",
  3: "Off",
  4: "Jungle",
};

/**
 * Mapping for Lane Role IDs
 */
export const LANE_ROLES: Record<number, string> = {
  1: "Core",
  2: "Support",
};

/**
 * Helper to map Item IDs to internal names.
 * Data source: https://api.opendota.com/api/constants/item_ids
 */
export const ITEM_IDS: Record<number, string> = {
  1: "blink", 2: "blades_of_attack", 3: "broadsword", 4: "chainmail", 5: "claymore",
  6: "helm_of_iron_will", 7: "javelin", 8: "mithril_hammer", 9: "platemail", 10: "quarterstaff",
  11: "quelling_blade", 12: "ring_of_protection", 13: "gauntlets", 14: "slippers", 15: "mantle",
  16: "branches", 17: "belt_of_strength", 18: "boots_of_elves", 19: "robe", 20: "circlet",
  21: "ogre_axe", 22: "blade_of_alacrity", 23: "staff_of_wizardry", 24: "ultimate_orb", 25: "gloves",
  26: "lifesteal", 27: "ring_of_regen", 28: "sobi_mask", 29: "boots", 30: "gem",
  31: "cloak", 32: "talisman_of_evasion", 33: "cheese", 34: "magic_stick", 36: "magic_wand",
  37: "ghost", 38: "clarity", 39: "flask", 40: "dust", 41: "bottle",
  42: "ward_observer", 43: "ward_sentry", 44: "tango", 46: "tpscroll", 48: "travel_boots",
  50: "phase_boots", 51: "demon_edge", 52: "eagle", 53: "reaver", 54: "relic",
  55: "hyperstone", 56: "ring_of_health", 57: "void_stone", 58: "mystic_staff", 59: "energy_booster",
  60: "point_booster", 61: "vitality_booster", 63: "power_treads", 65: "hand_of_midas", 67: "oblivion_staff",
  69: "pers", 71: "poor_mans_shield", 73: "bracer", 75: "wraith_band", 77: "null_talisman",
  79: "mekansm", 81: "vladmir", 86: "buckler", 88: "ring_of_basilius", 90: "pipe",
  92: "urn_of_shadows", 94: "headdress", 96: "sheepstick", 98: "orchid", 100: "cyclone",
  102: "force_staff", 104: "dagon", 106: "necronomicon", 108: "ultimate_scepter", 110: "refresher",
  112: "assault", 114: "heart", 116: "black_king_bar", 117: "aegis", 119: "shivas_guard",
  121: "bloodstone", 123: "sphere", 125: "vanguard", 127: "blade_mail", 129: "soul_booster",
  131: "hood_of_defiance", 133: "rapier", 135: "monkey_king_bar", 137: "radiance", 139: "butterfly",
  141: "greater_crit", 143: "basher", 145: "bfury", 147: "manta", 149: "lesser_crit",
  151: "armlet", 152: "invis_sword", 154: "sange_and_yasha", 156: "satanic", 158: "mjollnir",
  160: "skadi", 162: "sange", 164: "helm_of_the_dominator", 166: "maelstrom", 168: "desolator",
  170: "yasha", 172: "mask_of_madness", 174: "diffusal_blade", 176: "ethereal_blade", 178: "soul_ring",
  180: "arcane_boots", 181: "orb_of_venom", 182: "stout_shield", 185: "ancient_janggo", 187: "medallion_of_courage",
  188: "smoke_of_deceit", 190: "veil_of_discord", 193: "necronomicon_2", 194: "necronomicon_3", 196: "diffusal_blade_2",
  201: "dagon_2", 202: "dagon_3", 203: "dagon_4", 204: "dagon_5", 206: "rod_of_atos",
  208: "abyssal_blade", 210: "heavens_halberd", 212: "ring_of_aquila", 214: "tranquil_boots", 215: "shadow_amulet",
  216: "enchanted_mango", 218: "ward_dispenser", 220: "travel_boots_2", 223: "meteor_hammer", 225: "nullifier",
  226: "lotus_orb", 229: "solar_crest", 231: "guardian_greaves", 232: "aether_lens", 235: "octarine_core",
  236: "dragon_lance", 237: "faerie_fire", 239: "iron_talon", 240: "blight_stone", 241: "tango_single",
  242: "crimson_guard", 244: "wind_lace", 247: "moon_shard", 249: "silver_edge", 250: "bloodthorn",
  252: "echo_sabre", 254: "glimmer_cape", 256: "aeon_disk", 257: "tome_of_knowledge", 259: "kaya",
  261: "crown", 263: "hurricane_pike", 265: "infused_raindrop", 267: "spirit_vessel", 269: "holy_locket",
  271: "ultimate_scepter_2", 273: "kaya_and_sange", 277: "yasha_and_kaya", 279: "ring_of_tarrasque",
};

/**
 * Helper to map rank tier first digit to rank names.
 */
export const RANK_NAMES: Record<number, string> = {
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal",
};

/**
 * Returns the CDN URL for a hero's avatar.
 */
export function getHeroImageUrl(heroId: number): string {
  const hero = HEROES[heroId];
  if (!hero) return "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/unknown.png";
  const shortName = hero.name.replace("npc_dota_hero_", "");
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
}

/**
 * Returns the CDN URL for an item's icon.
 */
export function getItemImageUrl(itemId: number): string {
  const itemName = ITEM_IDS[itemId];
  if (!itemName || itemId === 0) return "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/emptyitembg.png";
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemName}.png`;
}

/**
 * Returns the CDN URL for an item's icon by its internal name.
 */
export function getItemImageUrlByName(itemName: string): string {
  if (!itemName) return "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/emptyitembg.png";
  // OpenDota often prefixes item names with 'item_'
  const cleanName = itemName.startsWith("item_") ? itemName.slice(5) : itemName;
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cleanName}.png`;
}

/**
 * Returns the URL for a rank badge image.
 */
export function getRankBadgeUrl(rankTier: number | null): string {
  if (!rankTier) return "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_0.png";
  const badgeDigit = Math.floor(rankTier / 10);
  return `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${badgeDigit}.png`;
}

/**
 * Returns the URL for rank stars image.
 */
export function getRankStarsUrl(rankTier: number | null): string {
  if (!rankTier || rankTier < 10) return "";
  const starsDigit = rankTier % 10;
  if (starsDigit === 0) return "";
  return `https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_${starsDigit}.png`;
}
