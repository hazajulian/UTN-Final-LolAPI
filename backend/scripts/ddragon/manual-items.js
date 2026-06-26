export const MANUAL_ITEMS = [
// ITEM 1
    {
    itemId: "90001",
    locale: "en_US",
    catalogName: "Bandlepipes",
    name: "Bandlepipes",
    plaintext:
        "Defensive tank/support item that grants durability and empowers allies after slowing or immobilizing enemies.",
    descriptionRaw:
        "<mainText><stats><attention>290</attention> Health<br><attention>32.5</attention> Armor<br><attention>33.89</attention> Magic Resist<br><attention>23</attention> Ability Haste</stats><br><br><attention>Fanfare:</attention> Slowing or immobilizing an enemy champion empowers you with Fanfare for a few seconds, granting bonus movement speed. While empowered, nearby allied champions, including yourself, gain bonus attack speed.</mainText>",
    descriptionText:
        "290 Health 32.5 Armor 33.89 Magic Resist 23 Ability Haste Fanfare: Slowing or immobilizing an enemy champion empowers you with Fanfare for a few seconds, granting bonus movement speed. While empowered, nearby allied champions, including yourself, gain bonus attack speed.",
    gold: {
        base: 800,
        total: 2300,
        sell: 1610,
        purchasable: true,
    },

    tags: ["Health", "Armor", "SpellBlock", "CooldownReduction"],
    from: ["3067", "1029", "1033"],
    into: [],
    maps: {
        11: true,
        12: true,
        21: true,
        30: false,
        35: true,
    },

    imageFull: "Bandlepipes_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Bandlepipes_item.png?3b6c0",
    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",
    roleGroups: ["tank", "support"],
    },
    {
    itemId: "90001",
    locale: "es_MX",
    catalogName: "Bandlepipes",
    name: "Gaitas de Bandle",
    plaintext:
        "Objeto defensivo para tanques y soportes que otorga resistencia y potencia a los aliados tras ralentizar o inmovilizar enemigos.",
    descriptionRaw:
        "<mainText><stats><attention>290</attention> de Vida<br><attention>32.5</attention> de Armadura<br><attention>33.89</attention> de Resistencia Mágica<br><attention>23</attention> de Aceleración de Habilidad</stats><br><br><attention>Fanfarria:</attention> Ralentizar o inmovilizar a un campeón enemigo te potencia con Fanfarria durante unos segundos, otorgándote Velocidad de Movimiento adicional. Mientras estás potenciado, los campeones aliados cercanos, incluido tú, obtienen Velocidad de Ataque adicional.</mainText>",
    descriptionText:
        "290 de Vida 32.5 de Armadura 33.89 de Resistencia Mágica 23 de Aceleración de Habilidad Fanfarria: Ralentizar o inmovilizar a un campeón enemigo te potencia con Fanfarria durante unos segundos, otorgándote Velocidad de Movimiento adicional. Mientras estás potenciado, los campeones aliados cercanos, incluido tú, obtienen Velocidad de Ataque adicional.",
    gold: {
        base: 800,
        total: 2300,
        sell: 1610,
        purchasable: true,
    },

    tags: ["Health", "Armor", "SpellBlock", "CooldownReduction"],
    from: ["3067", "1029", "1033"],
    into: [],
    maps: {
        11: true,
        12: true,
        21: true,
        30: false,
        35: true,
    },

    imageFull: "Bandlepipes_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Bandlepipes_item.png?3b6c0",
    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",
    roleGroups: ["tank", "support"],
    },
// ITEM 2
    {
    itemId: "90002",
    locale: "en_US",
    catalogName: "Bastionbreaker",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Bastionbreaker",
    plaintext:
        "Assassin item that empowers ability damage and rewards takedowns.",
    descriptionRaw:
        "<mainText><stats><attention>69.29</attention> Attack Damage<br><attention>31</attention> Ability Haste<br><attention>22</attention> Lethality</stats><br><br><attention>Shaped Carge:</attention> Your next instance of ability damage to a champion or epic monster with a champion ability deals bonus true damage.<br><br><attention>Sabotage:</attention> Scoring a takedown against an enemy champion within 3 seconds of damaging them grants Sabotage for 90 seconds. While you have Sabotage, your next basic attack against a turret or epic monster consumes the effect to deal bonus true damage over 3 seconds.</mainText>",
    descriptionText:
        "69.29 Attack Damage 31 Ability Haste 22 Lethality Shaped Charge: Your next instance of ability damage to a champion or epic monster with a champion ability deals bonus true damage. Sabotage: Scoring a takedown against an enemy champion within 3 seconds of damaging them grants Sabotage for 90 seconds. While you have Sabotage, your next basic attack against a turret or epic monster consumes the effect to deal bonus true damage over 3 seconds.",

    gold: {
        base: 863,
        total: 3200,
        sell: 2240,
        purchasable: true,
    },

    tags: ["Damage", "ArmorPenetration", "CooldownReduction", "Lethality"],
    from: ["2020", "3134"],
    into: [],

    maps: {
        11: true,
        12: false,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Bastionbreaker_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Bastionbreaker_item.png?ccdb8",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["assassin"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90002",
    locale: "es_MX",
    catalogName: "Bastionbreaker",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Rompebastiones",
    plaintext:
        "Objeto de asesino que potencia el daño de habilidades y recompensa las bajas.",
    descriptionRaw:
        "<mainText><stats><attention>69.29</attention> de Daño de Ataque<br><attention>31</attention> de Aceleración de Habilidad<br><attention>22</attention> de Letalidad</stats><br><br><attention>Carga Moldeada:</attention> Tu siguiente instancia de daño de habilidad contra un campeón o monstruo épico con una habilidad de campeón inflige daño verdadero adicional.<br><br><attention>Sabotaje:</attention> Conseguir una baja contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga Sabotaje durante 90 segundos. Mientras tienes Sabotaje, tu siguiente ataque básico contra una torreta o monstruo épico consume el efecto para infligir daño verdadero adicional durante 3 segundos.</mainText>",
    descriptionText:
        "69.29 de Daño de Ataque 31 de Aceleración de Habilidad 22 de Letalidad Carga Moldeada: Tu siguiente instancia de daño de habilidad contra un campeón o monstruo épico con una habilidad de campeón inflige daño verdadero adicional. Sabotaje: Conseguir una baja contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga Sabotaje durante 90 segundos. Mientras tienes Sabotaje, tu siguiente ataque básico contra una torreta o monstruo épico consume el efecto para infligir daño verdadero adicional durante 3 segundos.",

    gold: {
        base: 863,
        total: 3200,
        sell: 2240,
        purchasable: true,
    },

    tags: ["Damage", "ArmorPenetration", "CooldownReduction", "Lethality"],
    from: ["2020", "3134"],
    into: [],

    maps: {
        11: true,
        12: false,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Bastionbreaker_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Bastionbreaker_item.png?ccdb8",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["assassin"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 3
    {
    itemId: "90003",
    locale: "en_US",
    catalogName: "Dusk and Dawn",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Dusk and Dawn",
    plaintext:
        "Hybrid Spellblade item that empowers basic attacks after using abilities.",
    descriptionRaw:
        "<mainText><stats><attention>390</attention> Health<br><attention>72.5</attention> Ability Power<br><attention>28</attention> Ability Haste<br><attention>28.33%</attention> Attack Speed</stats><br><br><attention>Spellblade:</attention> After using an ability, your next basic attack within 10 seconds deals bonus magic damage, heals you, and applies on-hit effects to the target again after a short delay.</mainText>",
    descriptionText:
        "390 Health 72.5 Ability Power 28 Ability Haste 28.33% Attack Speed Spellblade: After using an ability, your next basic attack within 10 seconds deals bonus magic damage, heals you, and applies on-hit effects to the target again after a short delay.",

    gold: {
        base: 300,
        total: 3100,
        sell: 2170,
        purchasable: true,
    },

    tags: ["AttackSpeed", "SpellDamage", "Health", "CooldownReduction", "OnHit"],
    from: ["3057", "1026", "3067", "1042"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Dusk_and_Dawn_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Dusk_and_Dawn_item.png?be79a",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["mage", "fighter"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90003",
    locale: "es_MX",
    catalogName: "Dusk and Dawn",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Ocaso y Alba",
    plaintext:
        "Objeto híbrido de Espada Encantada que potencia los ataques básicos tras usar habilidades.",
    descriptionRaw:
        "<mainText><stats><attention>390</attention> de Vida<br><attention>72.5</attention> de Poder de Habilidad<br><attention>28</attention> de Aceleración de Habilidad<br><attention>28.33%</attention> de Velocidad de Ataque</stats><br><br><attention>Espada Encantada:</attention> Tras usar una habilidad, tu siguiente ataque básico dentro de 10 segundos inflige daño mágico adicional, te cura y vuelve a aplicar los efectos de impacto al objetivo tras un breve retraso.</mainText>",
    descriptionText:
        "390 de Vida 72.5 de Poder de Habilidad 28 de Aceleración de Habilidad 28.33% de Velocidad de Ataque Espada Encantada: Tras usar una habilidad, tu siguiente ataque básico dentro de 10 segundos inflige daño mágico adicional, te cura y vuelve a aplicar los efectos de impacto al objetivo tras un breve retraso.",

    gold: {
        base: 300,
        total: 3100,
        sell: 2170,
        purchasable: true,
    },

    tags: ["AttackSpeed", "SpellDamage", "Health", "CooldownReduction", "OnHit"],
    from: ["3057", "1026", "3067", "1042"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Dusk_and_Dawn_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Dusk_and_Dawn_item.png?be79a",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["mage", "fighter"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 4
    {
    itemId: "90004",
    locale: "en_US",
    catalogName: "Endless Hunger",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Endless Hunger",
    plaintext:
        "Fighter item that grants attack damage, omnivamp and tenacity.",
    descriptionRaw:
        "<mainText><stats><attention>93.57</attention> Attack Damage<br><attention>5%</attention> Omnivamp<br><attention>20%</attention> Tenacity</stats><br><br><attention>Famine:</attention> Gain 5 ability haste plus bonus ability haste based on bonus attack damage.<br><br><attention>Feast:</attention> Scoring a takedown against an enemy champion within 3 seconds of damaging them grants 15% omnivamp for 8 seconds.</mainText>",
    descriptionText:
        "93.57 Attack Damage 5% Omnivamp 20% Tenacity Famine: Gain 5 ability haste plus bonus ability haste based on bonus attack damage. Feast: Scoring a takedown against an enemy champion within 3 seconds of damaging them grants 15% omnivamp for 8 seconds.",

    gold: {
        base: 825,
        total: 3100,
        sell: 2170,
        purchasable: true,
    },

    tags: ["Damage", "LifeSteal", "CooldownReduction", "Tenacity"],
    from: ["3133", "1037", "1036"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Endless_Hunger_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Endless_Hunger_item.png?cc802",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["fighter"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90004",
    locale: "es_MX",
    catalogName: "Endless Hunger",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Hambre Infinita",
    plaintext:
        "Objeto de luchador que otorga daño de ataque, omnivampirismo y tenacidad.",
    descriptionRaw:
        "<mainText><stats><attention>93.57</attention> de Daño de Ataque<br><attention>5%</attention> de Omnivampirismo<br><attention>20%</attention> de Tenacidad</stats><br><br><attention>Hambruna:</attention> Obtienes 5 de Aceleración de Habilidad más Aceleración de Habilidad adicional según tu Daño de Ataque adicional.<br><br><attention>Festín:</attention> Conseguir una baja contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga 15% de Omnivampirismo durante 8 segundos.</mainText>",
    descriptionText:
        "93.57 de Daño de Ataque 5% de Omnivampirismo 20% de Tenacidad Hambruna: Obtienes 5 de Aceleración de Habilidad más Aceleración de Habilidad adicional según tu Daño de Ataque adicional. Festín: Conseguir una baja contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga 15% de Omnivampirismo durante 8 segundos.",

    gold: {
        base: 825,
        total: 3100,
        sell: 2170,
        purchasable: true,
    },

    tags: ["Damage", "LifeSteal", "CooldownReduction", "Tenacity"],
    from: ["3133", "1037", "1036"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Endless_Hunger_item.png",
    iconUrl: "https://wiki.leagueoflegends.com/en-us/images/Endless_Hunger_item.png?cc802",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["fighter"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 5
    {
    itemId: "90005",
    locale: "en_US",
    catalogName: "Fiendhunter Bolts",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Fiendhunter Bolts",
    plaintext:
        "Marksman item that grants attack speed, critical strike chance and movement speed.",
    descriptionRaw:
        "<mainText><stats><attention>78.33%</attention> Attack Speed<br><attention>25%</attention> Critical Strike Chance<br><attention>4%</attention> Movement Speed</stats><br><br><attention>Night Vigil:</attention> Gain 30 ultimate ability haste.<br><br><attention>Opening Barrage:</attention> After casting your ultimate ability, your next 3 basic attacks within 8 seconds gain 50% bonus attack speed and are empowered to critically strike. If an attack would already critically strike, it instead critically strikes for bonus damage and deals bonus true damage.</mainText>",
    descriptionText:
        "78.33% Attack Speed 25% Critical Strike Chance 4% Movement Speed Night Vigil: Gain 30 ultimate ability haste. Opening Barrage: After casting your ultimate ability, your next 3 basic attacks within 8 seconds gain 50% bonus attack speed and are empowered to critically strike. If an attack would already critically strike, it instead critically strikes for bonus damage and deals bonus true damage.",

    gold: {
        base: 850,
        total: 2650,
        sell: 1855,
        purchasable: true,
    },

    tags: ["AttackSpeed", "CriticalStrike", "Movement"],
    from: ["3086", "1043"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Fiendhunter_Bolts_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Fiendhunter_Bolts_item.png?7596c",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["marksman"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90005",
    locale: "es_MX",
    catalogName: "Fiendhunter Bolts",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Virotes del Cazademonios",
    plaintext:
        "Objeto para tiradores que otorga velocidad de ataque, probabilidad de golpe crítico y velocidad de movimiento.",
    descriptionRaw:
        "<mainText><stats><attention>78.33%</attention> de Velocidad de Ataque<br><attention>25%</attention> de Golpe Crítico<br><attention>4%</attention> de Velocidad de Movimiento</stats><br><br><attention>Vigilia Nocturna:</attention> Obtienes 30 de Aceleración de Habilidad definitiva.<br><br><attention>Descarga Inicial:</attention> Tras lanzar tu habilidad definitiva, tus siguientes 3 ataques básicos dentro de 8 segundos obtienen 50% de Velocidad de Ataque adicional y son potenciados para asestar Golpes Críticos. Si un ataque ya iba a asestar un Golpe Crítico, en su lugar asesta un Golpe Crítico con daño adicional e inflige daño verdadero adicional.</mainText>",
    descriptionText:
        "78.33% de Velocidad de Ataque 25% de Golpe Crítico 4% de Velocidad de Movimiento Vigilia Nocturna: Obtienes 30 de Aceleración de Habilidad definitiva. Descarga Inicial: Tras lanzar tu habilidad definitiva, tus siguientes 3 ataques básicos dentro de 8 segundos obtienen 50% de Velocidad de Ataque adicional y son potenciados para asestar Golpes Críticos. Si un ataque ya iba a asestar un Golpe Crítico, en su lugar asesta un Golpe Crítico con daño adicional e inflige daño verdadero adicional.",

    gold: {
        base: 850,
        total: 2650,
        sell: 1855,
        purchasable: true,
    },

    tags: ["AttackSpeed", "CriticalStrike", "Movement"],
    from: ["3086", "1043"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Fiendhunter_Bolts_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Fiendhunter_Bolts_item.png?7596c",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["marksman"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 6
    {
    itemId: "90006",
    locale: "en_US",
    catalogName: "Hexoptics C44",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Hexoptics C44",
    plaintext:
        "Marksman item that grants attack damage and critical strike chance, rewarding long-range attacks.",
    descriptionRaw:
        "<mainText><stats><attention>83.57</attention> Attack Damage<br><attention>25%</attention> Critical Strike Chance</stats><br><br><attention>Magnification:</attention> Deal 0% – 10% increased damage with basic attacks based on distance to the target. Distance is calculated from the edge of your current position to the edge of the target's position at the time they are damaged.<br><br><attention>Arcane AIM:</attention> Scoring a takedown against an enemy champion within 3 seconds of damaging them grants 100 bonus attack range for 8 seconds.</mainText>",
    descriptionText:
        "83.57 Attack Damage 25% Critical Strike Chance Magnification: Deal 0% – 10% increased damage with basic attacks based on distance to the target. Distance is calculated from the edge of your current position to the edge of the target's position at the time they are damaged. Arcane AIM: Scoring a takedown against an enemy champion within 3 seconds of damaging them grants 100 bonus attack range for 8 seconds.",

    gold: {
        base: 275,
        total: 2800,
        sell: 1960,
        purchasable: true,
    },

    tags: ["AttackDamage", "CriticalStrike"],
    from: ["1037", "6670", "1036"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Hexoptics_C44_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Hexoptics_C44_item.png?dd50f",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["marksman"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90006",
    locale: "es_MX",
    catalogName: "Hexoptics C44",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Hexóptica C44",
    plaintext:
        "Objeto para tiradores que otorga daño de ataque y probabilidad de golpe crítico, potenciando ataques a larga distancia.",
    descriptionRaw:
        "<mainText><stats><attention>83.57</attention> de Daño de Ataque<br><attention>25%</attention> de Golpe Crítico</stats><br><br><attention>Magnificación:</attention> Inflige entre 0% y 10% de daño aumentado con ataques básicos según la distancia al objetivo. La distancia se calcula desde el borde de tu posición actual hasta el borde de la posición del objetivo en el momento en que recibe daño.<br><br><attention>Puntería Arcana:</attention> Conseguir una participación en asesinato contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga 100 de alcance de ataque adicional durante 8 segundos.</mainText>",
    descriptionText:
        "83.57 de Daño de Ataque 25% de Golpe Crítico Magnificación: Inflige entre 0% y 10% de daño aumentado con ataques básicos según la distancia al objetivo. La distancia se calcula desde el borde de tu posición actual hasta el borde de la posición del objetivo en el momento en que recibe daño. Puntería Arcana: Conseguir una participación en asesinato contra un campeón enemigo dentro de los 3 segundos posteriores a dañarlo te otorga 100 de alcance de ataque adicional durante 8 segundos.",

    gold: {
        base: 275,
        total: 2800,
        sell: 1960,
        purchasable: true,
    },

    tags: ["AttackDamage", "CriticalStrike"],
    from: ["1037", "6670", "1036"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Hexoptics_C44_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Hexoptics_C44_item.png?dd50f",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["marksman"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 7
    {
    itemId: "90007",
    locale: "en_US",
    catalogName: "Luden's Echo",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Luden's Echo",
    plaintext:
        "Mage item that grants ability power, mana and ability haste, unleashing bursts of magic damage through Echo charges.",
    descriptionRaw:
        "<mainText><stats><attention>125</attention> Ability Power<br><attention>26</attention> Ability Haste<br><attention>600</attention> Mana</stats><br><br><attention>Echo:</attention> Gain 6 Echo stacks. Dealing ability damage to an enemy consumes all Echo stacks to deal 75 (+5% AP) bonus magic damage to them, and for each stack consumed beyond the first, an additional enemy within 600 units of them fires an orb at each secondary target that impacts after 0.528 seconds to deal the damage. If the number of additional targets fired at is less than the number of stacks consumed, deal an additional 15 – 75 bonus magic damage to the primary target, for a total of 90 – 150 bonus magic damage.</mainText>",
    descriptionText:
        "125 Ability Power 26 Ability Haste 600 Mana Echo: Gain 6 Echo stacks. Dealing ability damage to an enemy consumes all Echo stacks to deal 75 (+5% AP) bonus magic damage to them, and for each stack consumed beyond the first, an additional enemy within 600 units of them fires an orb at each secondary target that impacts after 0.528 seconds to deal the damage. If the number of additional targets fired at is less than the number of stacks consumed, deal an additional 15 – 75 bonus magic damage to the primary target, for a total of 90 – 150 bonus magic damage.",

    gold: {
        base: 450,
        total: 2750,
        sell: 1925,
        purchasable: true,
    },

    tags: ["Mage", "AbilityPower", "ManaRegen", "AbilityHaste"],
    from: ["3802", "3145"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Ludens_Echo_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Luden%27s_Tempest_item.png?e80fc",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["mage"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90007",
    locale: "es_MX",
    catalogName: "Luden's Echo",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Eco de Luden",
    plaintext:
        "Objeto para magos que otorga poder de habilidad, maná y aceleración de habilidad, liberando ráfagas de daño mágico mediante cargas de Eco.",
    descriptionRaw:
        "<mainText><stats><attention>125</attention> de Poder de Habilidad<br><attention>26</attention> de Aceleración de Habilidad<br><attention>600</attention> de Maná</stats><br><br><attention>Eco:</attention> Obtienes 6 cargas de Eco. Infligir daño de habilidad a un enemigo consume todas las cargas de Eco para infligirle 75 (+5% PH) de daño mágico adicional. Por cada carga consumida después de la primera, un enemigo adicional dentro de 600 unidades dispara un orbe hacia cada objetivo secundario, que impacta después de 0.528 segundos e inflige el daño. Si la cantidad de objetivos adicionales alcanzados es menor que la cantidad de cargas consumidas, inflige 15 – 75 de daño mágico adicional al objetivo principal, para un total de 90 – 150 de daño mágico adicional.</mainText>",
    descriptionText:
        "125 de Poder de Habilidad 26 de Aceleración de Habilidad 600 de Maná Eco: Obtienes 6 cargas de Eco. Infligir daño de habilidad a un enemigo consume todas las cargas de Eco para infligirle 75 (+5% PH) de daño mágico adicional. Por cada carga consumida después de la primera, un enemigo adicional dentro de 600 unidades dispara un orbe hacia cada objetivo secundario, que impacta después de 0.528 segundos e inflige el daño. Si la cantidad de objetivos adicionales alcanzados es menor que la cantidad de cargas consumidas, inflige 15 – 75 de daño mágico adicional al objetivo principal, para un total de 90 – 150 de daño mágico adicional.",

    gold: {
        base: 450,
        total: 2750,
        sell: 1925,
        purchasable: true,
    },

    tags: ["Mage", "AbilityPower", "ManaRegen", "AbilityHaste"],
    from: ["3802", "3145"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Ludens_Echo_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Luden%27s_Tempest_item.png?e80fc",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["mage"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 8
    {
    itemId: "2525",
    locale: "en_US",
    catalogName: "Protoplasm Harness",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Protoplasm Harness",
    plaintext:
        "Tank item that grants health and ability haste, activating Lifeline when near death to gain health, healing and defensive bonuses.",
    descriptionRaw:
        "<mainText><stats><attention>600</attention> Health<br><attention>20</attention> Ability Haste</stats><br><br><attention>Lifeline:</attention> If damage would reduce you below 30% of your maximum health, you first gain 200 – 311.76 bonus health for 5 seconds and heal yourself for 200 – 423.53 over the same duration. During this time, you also gain increased size, 10% bonus movement speed and 25% tenacity.</mainText>",
    descriptionText:
        "600 Health 20 Ability Haste Lifeline: If damage would reduce you below 30% of your maximum health, you first gain 200 – 311.76 bonus health for 5 seconds and heal yourself for 200 – 423.53 over the same duration. During this time, you also gain increased size, 10% bonus movement speed and 25% tenacity.",

    gold: {
        base: 800,
        total: 2500,
        sell: 1750,
        purchasable: true,
    },

    tags: ["Tank", "Health", "HealthRegen", "AbilityHaste"],
    from: ["3067", "1011"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Protoplasm_Harness_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Protoplasm_Harness_item.png?2d12a",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["tank"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "2525",
    locale: "es_MX",
    catalogName: "Protoplasm Harness",
    catalogSection: "item",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Arnés de Protoplasma",
    plaintext:
        "Objeto para tanques que otorga vida y aceleración de habilidad, activando Salvavidas al quedar con poca vida para ganar supervivencia adicional.",
    descriptionRaw:
        "<mainText><stats><attention>600</attention> de Vida<br><attention>20</attention> de Aceleración de Habilidad</stats><br><br><attention>Salvavidas:</attention> Si un daño fuera a reducirte por debajo del 30% de tu Vida máxima, primero obtienes 200 – 311.76 de Vida adicional durante 5 segundos y te curas 200 – 423.53 durante la misma duración. Durante este tiempo, también obtienes tamaño aumentado, 10% de Velocidad de Movimiento adicional y 25% de Tenacidad.</mainText>",
    descriptionText:
        "600 de Vida 20 de Aceleración de Habilidad Salvavidas: Si un daño fuera a reducirte por debajo del 30% de tu Vida máxima, primero obtienes 200 – 311.76 de Vida adicional durante 5 segundos y te curas 200 – 423.53 durante la misma duración. Durante este tiempo, también obtienes tamaño aumentado, 10% de Velocidad de Movimiento adicional y 25% de Tenacidad.",

    gold: {
        base: 800,
        total: 2500,
        sell: 1750,
        purchasable: true,
    },

    tags: ["Tank", "Health", "HealthRegen", "AbilityHaste"],
    from: ["3067", "1011"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Protoplasm_Harness_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Protoplasm_Harness_item.png?2d12a",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "item",
    tier: "legendary",

    roleGroups: ["tank"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
// ITEM 9
    {
    itemId: "90008",
    locale: "en_US",
    catalogName: "Gluttonous Greaves",
    catalogSection: "boots",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Gluttonous Greaves",
    plaintext:
        "Boots item that grants movement speed and omnivamp, gaining additional omnivamp after takedowns.",
    descriptionRaw:
        "<mainText><stats><attention>45</attention> Movement Speed<br><attention>4%</attention> Omnivamp</stats><br><br><attention>Slay:</attention> Scoring a takedown against an enemy champion grants you <attention>0.6%</attention> Omnivamp, stacking up to 10 times for a total of <attention>6%</attention>.</mainText>",
    descriptionText:
        "45 Movement Speed 4% Omnivamp Slay: Scoring a takedown against an enemy champion grants you 0.6% Omnivamp, stacking up to 10 times for a total of 6%.",

    gold: {
        base: 700,
        total: 1000,
        sell: 700,
        purchasable: true,
    },

    tags: ["Boots", "NonbootsMovement", "LifeSteal", "SpellVamp"],
    from: ["1001"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Gluttonous_Greaves_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Gluttonous_Greaves_item.png?d560e",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "boots",
    tier: "",

    roleGroups: ["fighter", "assassin"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
    {
    itemId: "90008",
    locale: "es_MX",
    catalogName: "Gluttonous Greaves",
    catalogSection: "boots",
    catalogStatus: "manual",
    catalogOrder: 0,

    name: "Grebas Glotonas",
    plaintext:
        "Botas que otorgan velocidad de movimiento y omnivampirismo, ganando omnivampirismo adicional tras conseguir derribos.",
    descriptionRaw:
        "<mainText><stats><attention>45</attention> de Velocidad de Movimiento<br><attention>4%</attention> de Omnivampirismo</stats><br><br><attention>Masacre:</attention> Conseguir un derribo contra un campeón enemigo te otorga <attention>0.6%</attention> de Omnivampirismo, acumulándose hasta 10 veces para un total de <attention>6%</attention>.</mainText>",
    descriptionText:
        "45 de Velocidad de Movimiento 4% de Omnivampirismo Masacre: Conseguir un derribo contra un campeón enemigo te otorga 0.6% de Omnivampirismo, acumulándose hasta 10 veces para un total de 6%.",

    gold: {
        base: 700,
        total: 1000,
        sell: 700,
        purchasable: true,
    },

    tags: ["Boots", "NonbootsMovement", "LifeSteal", "SpellVamp"],
    from: ["1001"],
    into: [],

    maps: {
        11: true,
        12: true,
        21: false,
        30: false,
        35: true,
    },

    imageFull: "Gluttonous_Greaves_item.png",
    iconUrl:
        "https://wiki.leagueoflegends.com/en-us/images/Gluttonous_Greaves_item.png?d560e",

    inStore: true,
    hideFromAll: false,
    requiredChampion: "",
    requiredAlly: "",
    ddragonVersion: "manual",

    shopGroup: "main",
    shopSection: "boots",
    tier: "",

    roleGroups: ["fighter", "assassin"],
    isSummonersRift: true,
    isArena: false,
    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",
    isVisible: true,
    },
];