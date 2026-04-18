/**
 * Helper to map Hero IDs to localized names.
 * Data source: https://api.opendota.com/api/heroes
 */
export const HEROES: Record<number, { name: string; localized_name: string }> = {
  1: { name: "npc_dota_hero_antimage", localized_name: "Anti-Mage" },
  2: { name: "npc_dota_hero_axe", localized_name: "Axe" },
  3: { name: "npc_dota_hero_bane", localized_name: "Bane" },
  4: { name: "npc_dota_hero_bloodseeker", localized_name: "Bloodseeker" },
  5: { name: "npc_dota_hero_crystal_maiden", localized_name: "Crystal Maiden" },
  6: { name: "npc_dota_hero_drow_ranger", localized_name: "Drow Ranger" },
  7: { name: "npc_dota_hero_earthshaker", localized_name: "Earthshaker" },
  8: { name: "npc_dota_hero_juggernaut", localized_name: "Juggernaut" },
  9: { name: "npc_dota_hero_mirana", localized_name: "Mirana" },
  10: { name: "npc_dota_hero_morphling", localized_name: "Morphling" },
  11: { name: "npc_dota_hero_nevermore", localized_name: "Shadow Fiend" },
  12: { name: "npc_dota_hero_phantom_lancer", localized_name: "Phantom Lancer" },
  13: { name: "npc_dota_hero_puck", localized_name: "Puck" },
  14: { name: "npc_dota_hero_pudge", localized_name: "Pudge" },
  15: { name: "npc_dota_hero_razor", localized_name: "Razor" },
  16: { name: "npc_dota_hero_sand_king", localized_name: "Sand King" },
  17: { name: "npc_dota_hero_storm_spirit", localized_name: "Storm Spirit" },
  18: { name: "npc_dota_hero_sven", localized_name: "Sven" },
  19: { name: "npc_dota_hero_tiny", localized_name: "Tiny" },
  20: { name: "npc_dota_hero_vengefulspirit", localized_name: "Vengeful Spirit" },
  21: { name: "npc_dota_hero_windrunner", localized_name: "Windranger" },
  22: { name: "npc_dota_hero_zuus", localized_name: "Zeus" },
  23: { name: "npc_dota_hero_kunkka", localized_name: "Kunkka" },
  25: { name: "npc_dota_hero_lina", localized_name: "Lina" },
  26: { name: "npc_dota_hero_lion", localized_name: "Lion" },
  27: { name: "npc_dota_hero_shadow_shaman", localized_name: "Shadow Shaman" },
  28: { name: "npc_dota_hero_slardar", localized_name: "Slardar" },
  29: { name: "npc_dota_hero_tidehunter", localized_name: "Tidehunter" },
  30: { name: "npc_dota_hero_witch_doctor", localized_name: "Witch Doctor" },
  31: { name: "npc_dota_hero_lich", localized_name: "Lich" },
  32: { name: "npc_dota_hero_riki", localized_name: "Riki" },
  33: { name: "npc_dota_hero_enigma", localized_name: "Enigma" },
  34: { name: "npc_dota_hero_tinker", localized_name: "Tinker" },
  35: { name: "npc_dota_hero_sniper", localized_name: "Sniper" },
  36: { name: "npc_dota_hero_necrolyte", localized_name: "Necrophos" },
  37: { name: "npc_dota_hero_warlock", localized_name: "Warlock" },
  38: { name: "npc_dota_hero_beastmaster", localized_name: "Beastmaster" },
  39: { name: "npc_dota_hero_queenofpain", localized_name: "Queen of Pain" },
  40: { name: "npc_dota_hero_venomancer", localized_name: "Venomancer" },
  41: { name: "npc_dota_hero_faceless_void", localized_name: "Faceless Void" },
  42: { name: "npc_dota_hero_skeleton_king", localized_name: "Wraith King" },
  43: { name: "npc_dota_hero_death_prophet", localized_name: "Death Prophet" },
  44: { name: "npc_dota_hero_phantom_assassin", localized_name: "Phantom Assassin" },
  45: { name: "npc_dota_hero_pugna", localized_name: "Pugna" },
  46: { name: "npc_dota_hero_templar_assassin", localized_name: "Templar Assassin" },
  47: { name: "npc_dota_hero_viper", localized_name: "Viper" },
  48: { name: "npc_dota_hero_luna", localized_name: "Luna" },
  49: { name: "npc_dota_hero_dragon_knight", localized_name: "Dragon Knight" },
  50: { name: "npc_dota_hero_dazzle", localized_name: "Dazzle" },
  51: { name: "npc_dota_hero_rattletrap", localized_name: "Clockwerk" },
  52: { name: "npc_dota_hero_leshrac", localized_name: "Leshrac" },
  53: { name: "npc_dota_hero_furion", localized_name: "Nature's Prophet" },
  54: { name: "npc_dota_hero_life_stealer", localized_name: "Lifestealer" },
  55: { name: "npc_dota_hero_dark_seer", localized_name: "Dark Seer" },
  56: { name: "npc_dota_hero_clinkz", localized_name: "Clinkz" },
  57: { name: "npc_dota_hero_omniknight", localized_name: "Omniknight" },
  58: { name: "npc_dota_hero_enchantress", localized_name: "Enchantress" },
  59: { name: "npc_dota_hero_huskar", localized_name: "Huskar" },
  60: { name: "npc_dota_hero_night_stalker", localized_name: "Night Stalker" },
  61: { name: "npc_dota_hero_broodmother", localized_name: "Broodmother" },
  62: { name: "npc_dota_hero_bounty_hunter", localized_name: "Bounty Hunter" },
  63: { name: "npc_dota_hero_weaver", localized_name: "Weaver" },
  64: { name: "npc_dota_hero_jakiro", localized_name: "Jakiro" },
  65: { name: "npc_dota_hero_batrider", localized_name: "Batrider" },
  66: { name: "npc_dota_hero_chen", localized_name: "Chen" },
  67: { name: "npc_dota_hero_spectre", localized_name: "Spectre" },
  68: { name: "npc_dota_hero_ancient_apparition", localized_name: "Ancient Apparition" },
  69: { name: "npc_dota_hero_doom_bringer", localized_name: "Doom" },
  70: { name: "npc_dota_hero_ursa", localized_name: "Ursa" },
  71: { name: "npc_dota_hero_spirit_breaker", localized_name: "Spirit Breaker" },
  72: { name: "npc_dota_hero_gyrocopter", localized_name: "Gyrocopter" },
  73: { name: "npc_dota_hero_alchemist", localized_name: "Alchemist" },
  74: { name: "npc_dota_hero_invoker", localized_name: "Invoker" },
  75: { name: "npc_dota_hero_silencer", localized_name: "Silencer" },
  76: { name: "npc_dota_hero_obsidian_destroyer", localized_name: "Outworld Destroyer" },
  77: { name: "npc_dota_hero_lycan", localized_name: "Lycan" },
  78: { name: "npc_dota_hero_brewmaster", localized_name: "Brewmaster" },
  79: { name: "npc_dota_hero_shadow_demon", localized_name: "Shadow Demon" },
  80: { name: "npc_dota_hero_lone_druid", localized_name: "Lone Druid" },
  81: { name: "npc_dota_hero_chaos_knight", localized_name: "Chaos Knight" },
  82: { name: "npc_dota_hero_meepo", localized_name: "Meepo" },
  83: { name: "npc_dota_hero_treant", localized_name: "Treant Protector" },
  84: { name: "npc_dota_hero_ogre_magi", localized_name: "Ogre Magi" },
  85: { name: "npc_dota_hero_undying", localized_name: "Undying" },
  86: { name: "npc_dota_hero_rubick", localized_name: "Rubick" },
  87: { name: "npc_dota_hero_disruptor", localized_name: "Disruptor" },
  88: { name: "npc_dota_hero_nyx_assassin", localized_name: "Nyx Assassin" },
  89: { name: "npc_dota_hero_naga_siren", localized_name: "Naga Siren" },
  90: { name: "npc_dota_hero_keeper_of_the_light", localized_name: "Keeper of the Light" },
  91: { name: "npc_dota_hero_wisp", localized_name: "Io" },
  92: { name: "npc_dota_hero_visage", localized_name: "Visage" },
  93: { name: "npc_dota_hero_slark", localized_name: "Slark" },
  94: { name: "npc_dota_hero_medusa", localized_name: "Medusa" },
  95: { name: "npc_dota_hero_troll_warlord", localized_name: "Troll Warlord" },
  96: { name: "npc_dota_hero_centaur", localized_name: "Centaur Warrunner" },
  97: { name: "npc_dota_hero_magnataur", localized_name: "Magnus" },
  98: { name: "npc_dota_hero_shredder", localized_name: "Timbersaw" },
  99: { name: "npc_dota_hero_bristleback", localized_name: "Bristleback" },
  100: { name: "npc_dota_hero_tusk", localized_name: "Tusk" },
  101: { name: "npc_dota_hero_skywrath_mage", localized_name: "Skywrath Mage" },
  102: { name: "npc_dota_hero_abaddon", localized_name: "Abaddon" },
  103: { name: "npc_dota_hero_elder_titan", localized_name: "Elder Titan" },
  104: { name: "npc_dota_hero_legion_commander", localized_name: "Legion Commander" },
  105: { name: "npc_dota_hero_techies", localized_name: "Techies" },
  106: { name: "npc_dota_hero_ember_spirit", localized_name: "Ember Spirit" },
  107: { name: "npc_dota_hero_earth_spirit", localized_name: "Earth Spirit" },
  108: { name: "npc_dota_hero_abyssal_underlord", localized_name: "Underlord" },
  109: { name: "npc_dota_hero_terrorblade", localized_name: "Terrorblade" },
  110: { name: "npc_dota_hero_phoenix", localized_name: "Phoenix" },
  111: { name: "npc_dota_hero_oracle", localized_name: "Oracle" },
  112: { name: "npc_dota_hero_winter_wyvern", localized_name: "Winter Wyvern" },
  113: { name: "npc_dota_hero_arc_warden", localized_name: "Arc Warden" },
  114: { name: "npc_dota_hero_monkey_king", localized_name: "Monkey King" },
  119: { name: "npc_dota_hero_dark_willow", localized_name: "Dark Willow" },
  120: { name: "npc_dota_hero_pangolier", localized_name: "Pangolier" },
  121: { name: "npc_dota_hero_grimstroke", localized_name: "Grimstroke" },
  123: { name: "npc_dota_hero_hoodwink", localized_name: "Hoodwink" },
  126: { name: "npc_dota_hero_void_spirit", localized_name: "Void Spirit" },
  128: { name: "npc_dota_hero_snapfire", localized_name: "Snapfire" },
  129: { name: "npc_dota_hero_mars", localized_name: "Mars" },
  135: { name: "npc_dota_hero_dawnbreaker", localized_name: "Dawnbreaker" },
  136: { name: "npc_dota_hero_marci", localized_name: "Marci" },
  137: { name: "npc_dota_hero_primal_beast", localized_name: "Primal Beast" },
  138: { name: "npc_dota_hero_muerta", localized_name: "Muerta" },
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
