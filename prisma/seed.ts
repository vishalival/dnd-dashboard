import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const toJson = (value: unknown) => JSON.stringify(value);

async function clearExistingData() {
  await prisma.sessionStoryline.deleteMany();
  await prisma.sessionNPC.deleteMany();
  await prisma.sessionSecret.deleteMany();
  await prisma.storylineNPC.deleteMany();
  await prisma.storylineSecret.deleteMany();
  await prisma.nPCSecret.deleteMany();

  await prisma.storyEvent.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.magicItemWishlist.deleteMany();
  await prisma.characterBackground.deleteMany();

  await prisma.sessionPlan.deleteMany();
  await prisma.secretGoal.deleteMany();
  await prisma.nPC.deleteMany();
  await prisma.storyline.deleteMany();
  await prisma.character.deleteMany();
  await prisma.location.deleteMany();
  await prisma.faction.deleteMany();
  await prisma.campaign.deleteMany();
}

async function main() {
  await clearExistingData();

  const campaign = await prisma.campaign.create({
    data: {
      name: "Of Stars & Stone",
      description:
        "Rachel's campaign command center for session prep, secrets, timeline continuity, and NPC state tracking.",
      currentArc: "Skyhorn Lighthouse Rescue / Briani Conspiracy",
      startDate: new Date("2026-03-10T21:30:00.000Z"),
    },
  });

  await prisma.faction.createMany({
    data: [
      {
        campaignId: campaign.id,
        name: "Black Wax Raven Guild",
        alignment: "Neutral",
        status: "active",
        goals: "Move people and messages across borders through covert courier routes.",
        description:
          "Smuggler/intelligence network tied to Silas, Rose Cottage couriers, and Misty Market logistics.",
      },
      {
        campaignId: campaign.id,
        name: "Briani Crown & Glint Ministry",
        alignment: "Lawful Evil",
        status: "active",
        goals:
          "Protect Briani's political dominance and control plague containment through force.",
        description:
          "Queen Glasha's apparatus, including the intelligence arm and military checkposts.",
      },
      {
        campaignId: campaign.id,
        name: "Court of Veridian Tides",
        alignment: "Lawful Neutral",
        status: "active",
        goals:
          "Maintain legal and aesthetic control in Clove while suppressing political scandal.",
        description:
          "Clovian magistrate structure led publicly by Valerius Skyhorn.",
      },
      {
        campaignId: campaign.id,
        name: "Morthein Sprite Circles",
        alignment: "Neutral Good",
        status: "active",
        goals:
          "Protect Violet Woods and identify corruption spreading from Briani and Blackford.",
        description:
          "Moon-bound water sprites connected to forest wards and spiritual warnings.",
      },
      {
        campaignId: campaign.id,
        name: "Silver Scale Consortium",
        alignment: "Neutral Evil",
        status: "active",
        goals:
          "Control information and rare goods via shell businesses across all three kingdoms.",
        description:
          "Cross-kingdom trade front with links to map thefts, smuggling, and blackmail.",
      },
      {
        campaignId: campaign.id,
        name: "The Hexen",
        alignment: "Chaotic Neutral",
        status: "active",
        goals:
          "Expand influence through cursed bargains and strategic intelligence deals.",
        description:
          "Independent hag-linked operators trading power for missions and leverage.",
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      {
        campaignId: campaign.id,
        name: "The Misty Market",
        type: "trade_hub",
        region: "Central Crossroads",
        description:
          "Tri-kingdom trade nexus around the Elnoque River with heavy checkpoints and hidden deals.",
        notes:
          "Jointly funded after the Hills to Die On war; quarantine protocols now active.",
      },
      {
        campaignId: campaign.id,
        name: "The Dead Star",
        type: "tavern",
        region: "Misty Market",
        description:
          "Celestial skull tavern where the party converged and triggered Melora's confrontation.",
        notes:
          "Frequent Black Wax Raven handoffs; Eduardo runs messages.",
      },
      {
        campaignId: campaign.id,
        name: "New Hope Harbor",
        type: "harbor",
        region: "Clove",
        description:
          "Departure point for Rosport voyages and blood-tax ritual to appease Joe.",
        notes:
          "Crimson water event observed before calm passage.",
      },
      {
        campaignId: campaign.id,
        name: "Skyhorn Lighthouse",
        type: "lighthouse",
        region: "Rosport Island",
        description:
          "Lucien Skyhorn's beacon; currently under threat from sea monsters and eel-folk pressure.",
      },
      {
        campaignId: campaign.id,
        name: "Rose Cottage",
        type: "lodging",
        region: "Clove",
        description:
          "Boutique safehouse arranged by Silas.",
        notes: "Warm host, covert courier traffic, and suspected doppelganger incidents.",
      },
      {
        campaignId: campaign.id,
        name: "Sea Glass Archives",
        type: "library",
        region: "Clove",
        description:
          "Restricted archive where the party stole ritual and mind-reading texts.",
      },
      {
        campaignId: campaign.id,
        name: "Faerie's Fire Apothecary",
        type: "apothecary",
        region: "Clove",
        description:
          "Kaelen's high-end alchemy shop carrying ritual reagents and fungal components.",
      },
      {
        campaignId: campaign.id,
        name: "The Prismatic Reef",
        type: "jeweler",
        region: "Clove",
        description:
          "High-end fence and jewelry house where the party planned to pawn the gold chains.",
      },
      {
        campaignId: campaign.id,
        name: "Violet Woods",
        type: "wilderness",
        region: "North of Hills to Die On",
        description:
          "Morthein territory with fungal communes, hidden wards, and escalating corruption signals.",
      },
      {
        campaignId: campaign.id,
        name: "Briani Crater",
        type: "city",
        region: "Briani",
        description:
          "Meteor crater city powered by Glint, split by class and ravine infrastructure.",
        notes:
          "Suspected root cause zone for Star-Burn and ongoing covert weaponization.",
      },
      {
        campaignId: campaign.id,
        name: "Blackford",
        type: "ghost_town",
        region: "South of Briani",
        description:
          "Bound-spirit settlement tied to unresolved promises and villain frequency echoes.",
      },
      {
        campaignId: campaign.id,
        name: "The Queendom of Clove",
        type: "capital",
        region: "Southern Coast",
        description:
          "Gold-marble paradise governed by Queens Ephemera and Arolem under mounting external pressure.",
      },
    ],
  });

  const storylineSkyhorn = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Skyhorn Lighthouse Rescue",
      summary:
        "Silas recruited the party to rescue Lucien Skyhorn and restore safe passage lanes.",
      status: "active",
      urgency: "high",
      arcName: "Rosport Operations",
      nextDevelopment:
        "Landfall reconnaissance will determine if Lucien is besieged, corrupted, or already compromised.",
      notes:
        "Track blood-tax consequences and Lucien/Valerius family politics in parallel.",
      tags: toJson([
        "rescue",
        "sea-route",
        "harbor",
        "session-critical",
      ]),
      events: {
        create: [
          {
            title: "Silas offers lighthouse job at Dead Star",
            type: "event",
            session: 1,
            date: "Nightfall, Session 1",
            description:
              "Party accepts mission: extract Lucien and handle eel-folk obstruction.",
          },
          {
            title: "Blood-tax ritual observed at New Hope Harbor",
            type: "revelation",
            session: 2,
            date: "Dawn, Session 2",
            description:
              "Criminal sacrifice used to appease Joe and open sea routes.",
          },
          {
            title: "Drop-off near Rosport cove",
            type: "milestone",
            session: 3,
            date: "Session 3 planning",
            description:
              "Beacon flicker confirmed; entry route identified.",
          },
        ],
      },
    },
  });

  const storylineSchematics = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Briani Ravine Schematics Fallout",
      summary:
        "A stolen map from the Silver Scale Consortium is now pulling every faction into conflict.",
      status: "active",
      urgency: "critical",
      arcName: "Map War",
      nextDevelopment:
        "Bells and Melora will force a transfer attempt unless Flynt secures a new hide route.",
      notes:
        "Prioritize secure copies and identify what the map reveals below Briani's ravine.",
      tags: toJson([
        "heist",
        "intel",
        "briani",
        "silver-scale",
      ]),
      events: {
        create: [
          {
            title: "Flynt steals schematics during prologue heist",
            type: "event",
            session: 1,
            date: "Before Session 1",
            description:
              "Initial theft triggers Melora response and Bells pursuit.",
          },
          {
            title: "Melora demands parchment at Dead Star",
            type: "revelation",
            session: 1,
            date: "Session 1",
            description:
              "Confrontation confirms map strategic value for Briani command.",
          },
          {
            title: "Bells declared active stalker target",
            type: "milestone",
            session: 3,
            date: "Session 3",
            description:
              "Map retrieval becomes direct player-vs-player tension risk.",
          },
        ],
      },
    },
  });

  const storylineStarBurn = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Star-Burn Plague Expansion",
      summary:
        "The silver-vein plague is spreading from Briani with unclear origin and political coverups.",
      status: "active",
      urgency: "critical",
      arcName: "Containment Failure",
      nextDevelopment:
        "Market quarantine logs may reveal suppressed final-stage cases and transmission routes.",
      notes:
        "Con save mechanics and ash exposure rules are table-critical; enforce tension through logistics.",
      tags: toJson([
        "plague",
        "world-threat",
        "briani",
        "mystery",
      ]),
      events: {
        create: [
          {
            title: "Sigolt district quarantines escalate",
            type: "event",
            date: "Current era",
            description:
              "Briani uses aggressive containment and class-based segregation.",
          },
          {
            title: "Quarantine wing added at Misty Market",
            type: "milestone",
            session: 2,
            date: "Session 2",
            description:
              "No final-stage cases officially reported, credibility uncertain.",
          },
          {
            title: "Clove border nobility begins panic response",
            type: "revelation",
            session: 2,
            date: "Session 2",
            description:
              "Political appetite for scapegoats rising.",
          },
        ],
      },
    },
  });

  const storylineGlasha = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Shadow of Queen Glasha",
      summary:
        "Evidence suggests Queen Glasha's network orchestrates assassinations, map operations, and war prep.",
      status: "active",
      urgency: "high",
      arcName: "Crown Calculus",
      nextDevelopment:
        "Cross-reference archive manifests with Silver Scale movement records and Bells' private notes.",
      notes:
        "Potential false-flag strategy against Avila with Melora as deniable blade.",
      tags: toJson([
        "crown",
        "assassination",
        "war",
        "politics",
      ]),
      events: {
        create: [
          {
            title: "Glasha rebellion established current regime",
            type: "event",
            date: "~15 years ago",
            description: "Violent takeover placed Briani under hardline rule.",
          },
          {
            title: "Bells receives crown mission at archives",
            type: "revelation",
            session: 1,
            date: "Prologue",
            description:
              "Career leverage tied directly to covert retrieval from Silver Scale.",
          },
          {
            title: "Rumors of militia strike on Avila",
            type: "milestone",
            date: "Current era",
            description: "War trajectory accelerating behind trade diplomacy.",
          },
        ],
      },
    },
  });

  const storylineVioletWoods = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Violet Woods Corruption",
      summary:
        "Morthein warnings, ghost echoes from Blackford, and commune losses point to deep-rooted corruption.",
      status: "active",
      urgency: "high",
      arcName: "Morthein Echoes",
      nextDevelopment:
        "Garie and Amara can triangulate corruption vectors using sprite warnings and fungal network readings.",
      notes:
        "Tie this arc into crater villain resurrection clues and captured kin.",
      tags: toJson([
        "forest",
        "sprites",
        "blackford",
        "personal-backstory",
      ]),
      events: {
        create: [
          {
            title: "Thornblood commune raided",
            type: "event",
            date: "3 years ago",
            description:
              "Amara's mother and bonded sprite were captured; commune partially destroyed.",
          },
          {
            title: "Blackford spirits warn through Morthein",
            type: "revelation",
            date: "Recent",
            description:
              "Ghost network confirms villain frequency tied to Briani crater.",
          },
          {
            title: "Garie sent toward Misty Market for truth",
            type: "milestone",
            session: 1,
            date: "Session 1",
            description:
              "Party convergence triggered by shared corruption threat.",
          },
        ],
      },
    },
  });

  const storylineZoheyr = await prisma.storyline.create({
    data: {
      campaignId: campaign.id,
      title: "Zoheyr Blood Debt Network",
      summary:
        "Allryn, Melora, and Garie are all entangled in vendetta-fueled power tied to Zoheyr.",
      status: "active",
      urgency: "medium",
      arcName: "Grudge Engine",
      nextDevelopment:
        "Allryn's ritual demands a true blood catalyst, making Melora both resource and risk.",
      notes:
        "Leverage side effects to drive roleplay cost for magical gains.",
      tags: toJson([
        "god",
        "ritual",
        "vendetta",
        "character-arc",
      ]),
      events: {
        create: [
          {
            title: "Allryn's pact manifests during family massacre",
            type: "event",
            date: "Past",
            description:
              "Power acquisition linked to catastrophic personal loss.",
          },
          {
            title: "Melora identified as secret Zoheyr devotee",
            type: "revelation",
            session: 1,
            date: "Session 1",
            description:
              "Her resilience and tactics match devout grudge doctrine.",
          },
          {
            title: "Potion of Connection recipe finalized",
            type: "milestone",
            session: 2,
            date: "Session 2",
            description:
              "Ingredients identified; sacrifice step remains unresolved.",
          },
        ],
      },
    },
  });

  const npcSilas = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Silas Alderman",
      race: "Human",
      role: "Smuggler / Mission Broker",
      faction: "Black Wax Raven Guild",
      disposition: "friendly",
      status: "ally",
      location: "Misty Market / New Hope Harbor",
      goals:
        "Rescue Lucien Skyhorn and locate Saltbeard using his silver compass leads.",
      secrets:
        "Former mentor to Melora and active guild node managing black-raven courier channels.",
      firstAppearance: 1,
      lastAppearance: 3,
      voiceNotes:
        "Dry, veteran thief cadence; taunts Melora as 'little bird' when emotionally cornered.",
      storyRelevance:
        "Primary bridge from tavern chaos into Rosport rescue arc.",
      dmNotes:
        "Bad leg prevents hard escapes. If cornered, uses smoke, misdirection, or hired muscle.",
      isPlayerKnown: true,
      isPinned: true,
    },
  });

  const npcMelora = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Melora",
      race: "Humanoid",
      role: "Briani Knight / Sword-Maker",
      faction: "Briani Crown & Glint Ministry",
      disposition: "hostile",
      status: "hostile",
      location: "Briani / Misty Market routes",
      goals:
        "Destroy or replace her twin Queen Arolem and consolidate cross-kingdom leverage.",
      secrets:
        "Secret devotee of Zoheyr with access to elite Briani constructs and identity-level impersonation potential.",
      firstAppearance: 1,
      lastAppearance: 1,
      voiceNotes:
        "Controlled menace, polished authority, never raises voice unless personally challenged.",
      storyRelevance:
        "Direct antagonist in map conflict and Zoheyr arc convergence.",
      dmNotes:
        "Predictable when pride is challenged. Can be baited into overextension.",
      isPlayerKnown: true,
      isPinned: true,
    },
  });

  const npcEduardo = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Eduardo",
      race: "Frog-folk",
      role: "Bartender / Courier",
      faction: "Black Wax Raven Guild",
      disposition: "friendly",
      status: "alive",
      location: "The Dead Star",
      goals:
        "Earn a shadow-name and become a full Thieves Guild operative.",
      secrets:
        "Cannot keep sensitive info private; regularly leaks Silas movement patterns.",
      firstAppearance: 1,
      lastAppearance: 2,
      voiceNotes:
        "Eager overshare energy, conspiratorial whispers that become loud by accident.",
      storyRelevance:
        "Reliable delivery node for guild hooks and false-security intel leaks.",
      dmNotes:
        "Use for dynamic clue drops when party stalls.",
      isPlayerKnown: true,
      isPinned: false,
    },
  });

  const npcValerius = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Valerius Skyhorn",
      race: "Human",
      role: "High Magistrate",
      faction: "Court of Veridian Tides",
      disposition: "neutral",
      status: "alive",
      location: "Clove",
      goals: "Secure a permanent seat on the Queens' Royal Council.",
      secrets:
        "Vulnerable to blackmail tied to Lucien's instability and family scandal.",
      firstAppearance: 2,
      lastAppearance: 2,
      voiceNotes:
        "Measured legal rhetoric masking social contempt for 'unrefined' outsiders.",
      storyRelevance:
        "Critical legal pressure point for the lighthouse and Clovian politics.",
      dmNotes:
        "Can become ally if reputational protection is traded for actionable intel.",
      isPlayerKnown: true,
      isPinned: false,
    },
  });

  const npcLucien = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Lucien Skyhorn",
      race: "Human",
      role: "Druid Lighthouse Keeper",
      faction: "Independent",
      disposition: "unknown",
      status: "missing",
      location: "Skyhorn Lighthouse",
      goals:
        "Hold lighthouse against sea threats and keep Rosport channels from collapsing.",
      secrets:
        "May know origin details of offshore creature agitation and beacon anomalies.",
      firstAppearance: 3,
      lastAppearance: 3,
      storyRelevance:
        "Mission target whose survival state determines arc tone.",
      dmNotes:
        "Prep two reveal branches: besieged survivor vs. partially compromised guardian.",
      isPlayerKnown: false,
      isPinned: true,
    },
  });

  const npcKaelen = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Kaelen the Shimmer-Smith",
      race: "High Elf",
      role: "Alchemist",
      faction: "Independent",
      disposition: "neutral",
      status: "alive",
      location: "Faerie's Fire Apothecary",
      goals:
        "Maintain exclusivity and cultural influence through curated reagent supply.",
      firstAppearance: 2,
      lastAppearance: 2,
      storyRelevance:
        "Supplier gatekeeper for Allryn ritual ingredients and fungal crafting options.",
      isPlayerKnown: true,
    },
  });

  const npcCaspian = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Caspian Estieges",
      race: "Human",
      role: "Chief Trade Inspector",
      faction: "Guild of the Graceful Sun",
      disposition: "neutral",
      status: "alive",
      location: "Misty Market",
      goals:
        "Keep checkpoint order and monetize high-value intelligence without choosing sides.",
      secrets:
        "Maintains private quarantine log discrepancies for leverage sales.",
      storyRelevance:
        "Control point for travel legality and plague movement visibility.",
      isPlayerKnown: true,
    },
  });

  const npcRose = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Rose",
      race: "Halfling",
      role: "Innkeeper",
      faction: "Black Wax Raven Guild",
      disposition: "friendly",
      status: "ally",
      location: "Rose Cottage",
      goals: "Keep guests safe while quietly preserving Silas' old network.",
      secrets:
        "Still handles black-raven envelopes and can route covert responses overnight.",
      firstAppearance: 3,
      lastAppearance: 3,
      storyRelevance:
        "Safehouse anchor and optional clue dispersal hub.",
      isPlayerKnown: true,
    },
  });

  const npcThalassar = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Thalassar",
      race: "Tortle",
      role: "Fence / Jeweler",
      faction: "Silver Scale Consortium",
      disposition: "neutral",
      status: "alive",
      location: "The Prismatic Reef",
      goals: "Acquire high-quality contraband while preserving luxury clientele trust.",
      secrets:
        "Uses Briani exile craftsman for glint-enhanced custom pieces with unclear clients.",
      firstAppearance: 3,
      lastAppearance: 3,
      storyRelevance:
        "Economic conversion node for stolen wealth and item hooks.",
      isPlayerKnown: true,
    },
  });

  const npcDax = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Dax",
      race: "Bronze Dragonborn",
      role: "Archaeologist",
      disposition: "friendly",
      status: "alive",
      location: "The Salt-Witch",
      goals: "Document dragon migration anomalies around Rosport.",
      firstAppearance: 3,
      lastAppearance: 3,
      storyRelevance:
        "Foreshadows dragon-linked environmental instability.",
      isPlayerKnown: true,
    },
  });

  const npcOlo = await prisma.nPC.create({
    data: {
      campaignId: campaign.id,
      name: "Olo",
      race: "Rock Gnome",
      role: "Archaeologist",
      disposition: "friendly",
      status: "alive",
      location: "The Salt-Witch",
      goals: "Recover Rosport ruin fragments tied to pre-kingdom weather tech.",
      firstAppearance: 3,
      lastAppearance: 3,
      storyRelevance:
        "Secondary source for Rosport lore and dragon unrest observations.",
      isPlayerKnown: true,
    },
  });

  const secretSaveLucien = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Rescue Lucien and relight Rosport lanes",
      type: "party_goal",
      owner: "Party",
      description:
        "Primary mission from Silas: stabilize sea routes by resolving the lighthouse crisis.",
      visibility: "visible",
      urgency: "critical",
      status: "active",
      progress: 55,
      isPinned: true,
      notes: "Progress is blocked at shoreline entry and interior threat identification.",
    },
  });

  const secretNeutralizeDoom = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Find source of impending doom in Violet Woods",
      type: "party_goal",
      owner: "Party",
      description:
        "Shared objective spanning Garie and Amara arcs around corruption, ghosts, and crater ties.",
      visibility: "partial",
      urgency: "high",
      status: "active",
      progress: 30,
      notes:
        "Evidence points to villain-frequency resonance with Blackford and Briani crater activity.",
    },
  });

  const secretFlyntGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Flynt: reclaim crew and find Saltbeard",
      type: "player_goal",
      owner: "Flynt Locke",
      description:
        "Recover ship-level autonomy and reconnect with mentor figure Saltbeard.",
      visibility: "partial",
      urgency: "medium",
      status: "active",
      progress: 20,
    },
  });

  const secretGarieGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Garie: confront Greepo and decide mercy or execution",
      type: "player_goal",
      owner: "Garie Busei",
      description:
        "Resolve family violence legacy without losing new moral trajectory.",
      visibility: "partial",
      urgency: "high",
      status: "active",
      progress: 10,
    },
  });

  const secretBellsGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Bells: identify who ordered her parents' assassination",
      type: "player_goal",
      owner: "Bel'aryth (Bells)",
      description:
        "Use archive and covert assignments to trace origin actors tied to Glint politics.",
      visibility: "dm_only",
      urgency: "high",
      status: "active",
      progress: 25,
      isPinned: true,
      notes:
        "Bells frames this as career advancement publicly but treats it as personal vendetta.",
    },
  });

  const secretAllrynGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Allryn: complete Zoheyr connection ritual safely",
      type: "player_goal",
      owner: "Allryn",
      description:
        "Acquire catalyst and ingredients while managing side effects and social fallout.",
      visibility: "partial",
      urgency: "medium",
      status: "active",
      progress: 50,
      notes:
        "Catalyst blood source unresolved; Melora remains viable but dangerous option.",
    },
  });

  const secretAmaraGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Amara: rescue Orella and Lir from raid captors",
      type: "player_goal",
      owner: "Amara",
      description:
        "Primary emotional driver for covert work and alliance decisions.",
      visibility: "dm_only",
      urgency: "critical",
      status: "active",
      progress: 15,
      isPinned: true,
      notes:
        "Revealing Hexen ties too early risks internal party fracture.",
    },
  });

  const secretSilasGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Silas: save Lucien and recover Saltbeard trail",
      type: "npc_goal",
      owner: "Silas Alderman",
      description:
        "Silas is balancing old debts, personal loyalty, and network survival.",
      visibility: "partial",
      urgency: "high",
      status: "active",
      progress: 45,
    },
  });

  const secretMeloraGoal = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Melora: usurp Queen Arolem using identity parity",
      type: "npc_goal",
      owner: "Melora",
      description:
        "Twin resemblance plus Zoheyr-fueled ambition creates infiltration threat.",
      visibility: "dm_only",
      urgency: "critical",
      status: "active",
      progress: 35,
      isPinned: true,
    },
  });

  const secretCraterVillain = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Mother Gris seeks a resurrection event in Briani crater",
      type: "dm_secret",
      owner: "DM",
      description:
        "Hexen objectives appear linked to dormant villain reactivation mechanics.",
      visibility: "dm_only",
      urgency: "critical",
      status: "active",
      progress: 40,
      isPinned: true,
    },
  });

  const secretRoseGuild = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Rose Cottage is still an active Black Raven drop-point",
      type: "dm_secret",
      owner: "DM",
      description:
        "Rose's hospitality masks live courier operations and operational logs.",
      visibility: "dm_only",
      urgency: "medium",
      status: "active",
      progress: 60,
    },
  });

  const secretDoppelganger = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Doppelganger is tailing map carriers",
      type: "dm_secret",
      owner: "DM",
      description:
        "Shape-shifter activity around Rose Cottage suggests targeted theft attempts.",
      visibility: "dm_only",
      urgency: "high",
      status: "active",
      progress: 10,
    },
  });

  const secretPlagueOrigin = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Star-Burn likely originates from Glint manipulation",
      type: "world_secret",
      owner: "World",
      description:
        "Symptoms and spread vectors align with contaminated glint processing zones.",
      visibility: "partial",
      urgency: "critical",
      status: "active",
      progress: 20,
    },
  });

  const secretBrianiWar = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Briani militia preparing covert strike on Avila",
      type: "faction_secret",
      owner: "Briani Crown & Glint Ministry",
      description:
        "Pre-war logistics masked as plague and border containment policy.",
      visibility: "dm_only",
      urgency: "high",
      status: "active",
      progress: 30,
    },
  });

  const secretConsortium = await prisma.secretGoal.create({
    data: {
      campaignId: campaign.id,
      title: "Silver Scale launders cross-kingdom intelligence",
      type: "faction_secret",
      owner: "Silver Scale Consortium",
      description:
        "Jeweler/perfumery/dragon-hunter fronts are part of one covert data economy.",
      visibility: "partial",
      urgency: "high",
      status: "active",
      progress: 50,
    },
  });

  const session1 = await prisma.sessionPlan.create({
    data: {
      campaignId: campaign.id,
      sessionNumber: 1,
      title: "The Dead Star Convergence",
      date: new Date("2026-03-10T21:30:00.000Z"),
      status: "completed",
      template: "tavern",
      summary:
        "Party converged at the Dead Star, survived Melora's incursion, and accepted Silas' Rosport rescue job.",
      keyBeats: toJson([
        "Flynt's ravine schematics draw Briani attention inside the tavern.",
        "Melora arrives with two glint-forged guards and demands surrender.",
        "Silas uses stealth smoke to extract the party through back routes.",
        "Escape wagon crosses bridge while market lockdown begins.",
        "Silas pitches Skyhorn Lighthouse rescue as debt settlement and future leverage.",
      ]),
      encounters: toJson([
        "Social pressure-cooker in celestial skull tavern with mixed agendas.",
        "Melora + animated armor confrontation in heavy-obscurement chaos.",
        "Escape skill sequence through alleyway cart extraction.",
      ]),
      hooks: toJson([
        "Recover Lucien Skyhorn at Rosport Lighthouse.",
        "Decide who controls the stolen ravine schematics.",
        "Track Silas/Melora mentor fallout for leverage.",
      ]),
      npcAppearances: toJson([
        "Silas Alderman",
        "Melora",
        "Eduardo",
      ]),
      locations: toJson([
        "The Dead Star",
        "Misty Market",
        "Bridge of a Thousand Steps",
      ]),
      playerNotes: toJson([
        "Flynt: map is your bargaining chip and liability.",
        "Bells: keep surveillance posture subtle around Flynt.",
        "Garie: tie stranger-compassion goal into next session prompt.",
        "Allryn: Melora remains your fastest catalyst path.",
        "Amara: monitor Hexen pressure escalation.",
      ]),
      contingencies: toJson([
        "If party gives map to Melora: convert arc into extraction from Briani custody.",
        "If party kills Melora early: trigger retaliatory Briani enforcement raid.",
      ]),
      improvPrompts: toJson([
        "The smoke clears and someone has the wrong map tube.",
        "Eduardo blurts a secret to the least trusted PC.",
      ]),
      reminders: toJson([
        "Keep Joe blood-tax lore consistent before harbor departure.",
        "Track guard response time after tavern lock-down alarm.",
      ]),
      checklist: toJson([
        "Prep Melora and guard stat blocks.",
        "Prep Silas smoke gadget effect (2 rounds heavy obscurement).",
        "Prep loot table: cloak/wand/water-breathing options.",
      ]),
    },
  });

  const session2 = await prisma.sessionPlan.create({
    data: {
      campaignId: campaign.id,
      sessionNumber: 2,
      title: "The Gilded Shallows",
      date: new Date("2026-03-15T20:00:00.000Z"),
      status: "completed",
      template: "political",
      summary:
        "In Clove, party social friction escalated through class conflict, archive theft, and blood-tax harbor rituals.",
      keyBeats: toJson([
        "Party navigates elite spaces while visibly out-of-place.",
        "Kaelen introduces ritual-grade ingredient constraints for Allryn.",
        "Fountain/magistrate incident generates wanted pressure on Garie.",
        "Sea Glass Archives infiltration succeeds with illusion + command combo.",
        "Dawn harbor sacrifice confirms Joe's blood toll before Rosport route.",
      ]),
      encounters: toJson([
        "Social encounter at Nice Strawberry with hostile nobility.",
        "Library stealth-heist under 5-minute pressure window.",
        "Harbor ritual scene with moral stress and no-combat dread.",
      ]),
      hooks: toJson([
        "Sell gold chains discreetly at Prismatic Reef.",
        "Decode Codicil and mind-reading texts.",
        "Identify who is feeding wanted info to Clovian officials.",
      ]),
      npcAppearances: toJson([
        "Kaelen",
        "Valerius Skyhorn",
        "Eduardo",
      ]),
      locations: toJson([
        "Faerie's Fire Apothecary",
        "The Nice Strawberry",
        "Sea Glass Archives",
        "New Hope Harbor",
      ]),
      playerNotes: toJson([
        "Bells: maintain deniable link to archive records.",
        "Garie: wanted status should produce subtle city friction.",
        "Allryn: ingredient sourcing now story-relevant, not shopping.",
        "Amara: tie map and Mother Gris asks into pressure beats.",
      ]),
      contingencies: toJson([
        "If archives alarm triggers: run rooftop chase into service canals.",
        "If party reports theft themselves: offer legal bargain through Valerius.",
      ]),
      improvPrompts: toJson([
        "A noble recognizes someone from a pre-session rumor.",
        "A black-wax envelope appears under the wrong room door.",
      ]),
      reminders: toJson([
        "Reinforce Clove's visual contrast against Misty Market grit.",
        "Use blood-tax imagery to foreshadow sea corruption.",
      ]),
      checklist: toJson([
        "Prep archive guard DCs and alternate exits.",
        "Prep harbor ritual sensory scene.",
        "Prep reagent inventory and prices for Kaelen.",
      ]),
    },
  });

  const session3 = await prisma.sessionPlan.create({
    data: {
      campaignId: campaign.id,
      sessionNumber: 3,
      title: "Prismatic Reef Gambit",
      date: new Date("2026-03-22T20:00:00.000Z"),
      status: "ready",
      template: "mystery",
      summary:
        "Planned session: pawn-shop theft pressure, Bells/Flynt map tension, Rose Cottage infiltration risk, Rosport departure.",
      keyBeats: toJson([
        "Attempt chain conversion at Prismatic Reef under surveillance.",
        "Optional Elara poverty reveal creates Garie morality choice.",
        "Bells confronts Flynt over schematics custody.",
        "Night event at Rose Cottage may involve doppelganger theft attempt.",
        "Party departs on Salt-Witch toward Rosport drop point.",
      ]),
      encounters: toJson([
        "Thief interception scene with insight branch.",
        "Negotiation with Thalassar over value and risk premium.",
        "Doppelganger infiltration or dream-vision event overnight.",
      ]),
      hooks: toJson([
        "Choose compassion vs profit with Elara incident.",
        "Secure map custody protocol before departure.",
        "Assess Dax/Olo intel on dragon agitation.",
      ]),
      npcAppearances: toJson([
        "Thalassar",
        "Rose",
        "Dax",
        "Olo",
      ]),
      locations: toJson([
        "The Prismatic Reef",
        "Rose Cottage",
        "New Hope Harbor",
        "Rosport Cove",
      ]),
      playerNotes: toJson([
        "Garie: strangers-in-need beat should be spotlighted here.",
        "Flynt/Bells: enforce consequence if map conflict goes loud.",
        "Amara: inject Mother Gris update demand mid-rest.",
      ]),
      contingencies: toJson([
        "If party splits in city: trigger dual clocks (wanted patrol + map stalker).",
        "If party executes thief harshly: social reputation penalty in Clove.",
      ]),
      improvPrompts: toJson([
        "A mirror reflection reveals a detail that doesn't match the current speaker.",
        "Pippin appears with unexpectedly useful rumor and terrible timing.",
      ]),
      reminders: toJson([
        "Keep pacing tight between urban scenes and harbor launch.",
        "Give Bells/Flynt confrontation real stakes but no forced PvP.",
      ]),
      checklist: toJson([
        "Prep thief statline and compassion branch reward.",
        "Prep doppelganger infiltration clues.",
        "Prep Rosport arrival sensory reveal.",
      ]),
    },
  });

  const session4 = await prisma.sessionPlan.create({
    data: {
      campaignId: campaign.id,
      sessionNumber: 4,
      title: "Skyhorn Descent",
      date: new Date("2026-03-29T20:00:00.000Z"),
      status: "planning",
      template: "combat",
      summary:
        "Draft planning: lighthouse interior breach, Lucien state reveal, and first hard clue on Star-Burn origin.",
      keyBeats: toJson([
        "Beach landing under foghorn + bio-luminescent kelp visuals.",
        "Lighthouse approach with environmental hazards and eel-folk traces.",
        "Locate Lucien and resolve his condition.",
        "Extract evidence tying sea unrest to broader plague mechanics.",
      ]),
      encounters: toJson([
        "Shoreline skirmish with tide-shift terrain.",
        "Multi-level lighthouse fight or social negotiation depending on Lucien state.",
      ]),
      hooks: toJson([
        "Reveal first concrete clue on plague mechanism.",
        "Introduce long-tail dragon agitation tie-in from archaeologists.",
      ]),
      npcAppearances: toJson([
        "Lucien Skyhorn",
        "Silas Alderman",
      ]),
      locations: toJson([
        "Rosport Island",
        "Skyhorn Lighthouse",
      ]),
      playerNotes: toJson([
        "Give each PC one personal stake beat inside the lighthouse.",
        "Offer at least one non-combat solution branch.",
      ]),
      contingencies: toJson([
        "If Lucien is dead: pivot to possession/corruption investigation.",
        "If party retreats: weather front blocks easy extraction.",
      ]),
      reminders: toJson([
        "Do not over-stack combat in first Rosport session.",
        "Preserve mystery tone while delivering hard evidence.",
      ]),
      checklist: toJson([
        "Prep lighthouse map layers.",
        "Prep Lucien branch states.",
        "Prep clue objects tied to Briani glint network.",
      ]),
    },
  });

  const characterFlynt = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      name: "Flynt Locke",
      playerName: "Jeremy",
      className: "Rogue",
      subclass: "Swashbuckler",
      race: "Feral Tiefling",
      level: 3,
      background: "Pirate Mutineer",
      backstory:
        "Kidnapped into piracy from Clove, raised by a crew that became his family, then cast out after a mutiny against Captain Silver.",
      personality: "Charismatic, sneaky, intimidating, and compulsively opportunistic.",
      bonds:
        "Saltbeard (mentor), former crew survivors, and Vesper from childhood.",
      flaws:
        "Gold obsession, distrust-first mindset, and escalating risk tolerance.",
      ideals: "Freedom over hierarchy, loyalty to chosen crew, fairness among thieves.",
      currentGoals: "Rebuild a crew, track Saltbeard, and keep hold of the ravine map.",
      notes:
        "Map custody drives inter-party tension; keep him valuable but vulnerable.",
      status: "active",
      isPlayerCharacter: true,
      relationships: toJson([
        "Silas: transactional ally",
        "Bells: surveillance pressure",
        "Garie: uneasy respect",
      ]),
    },
  });

  const characterGarie = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      name: "Garie Busei",
      playerName: "Andres",
      className: "Druid",
      race: "Wood Elf",
      level: 3,
      background: "Disavowed Briani Noble",
      backstory:
        "Former noble from a war-fueled family who fled to the Violet Woods after his brother's death and now seeks to stop looming corruption.",
      personality: "Antisocial, direct, self-assured, and protective when trust is earned.",
      bonds:
        "Morthein sprites, memory of Frogi, and strained family lineage in Briani.",
      flaws:
        "Hubris in combat, poor trust formation, and unresolved rage toward authority.",
      ideals: "Protect vulnerable communities, restore ecological balance, and reject violent rule.",
      currentGoals:
        "Neutralize the doom source, confront his father, and strengthen Violet Woods.",
      notes:
        "Session 3 thief scene is built to trigger his 'help a stranger' growth path.",
      status: "active",
      isPlayerCharacter: true,
      relationships: toJson([
        "Frogi (deceased brother)",
        "Queen Glasha (enemy)",
        "Morthein circles (trusted)",
      ]),
    },
  });

  const characterBells = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      name: "Bel'aryth (Bells)",
      playerName: "Mia",
      className: "Rogue",
      subclass: "Thief",
      race: "Tiefling",
      level: 3,
      background: "Covert Archivist",
      backstory:
        "After her parents' murder and separation from twin sister Boogie, Bells became a deniable intelligence asset while secretly hunting the truth.",
      personality:
        "Guarded, analytical, emotionally avoidant, and ruthlessly practical under pressure.",
      bonds:
        "Missing twin Boogie, pet raven Halo, and fragmented memory of family life on trade roads.",
      flaws:
        "Control fixation, invasive intel habits, and readiness to justify morally gray action.",
      ideals: "Family, survival, freedom through information control, and eventual reckoning.",
      currentGoals:
        "Trace her parents' killers while maintaining cover inside Briani networks.",
      notes:
        "Alias stack: Bishop (crown), Raven (street), B (archives), Bells (trust only).",
      status: "active",
      isPlayerCharacter: true,
      relationships: toJson([
        "Queen Glasha network (handler pressure)",
        "Flynt (target + possible ally)",
        "Boogie (missing twin)",
      ]),
    },
  });

  const characterAllryn = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      name: "Allryn",
      playerName: "Ryan",
      className: "Warlock",
      race: "Elf",
      level: 3,
      background: "Fallen Heir",
      backstory:
        "A disgraced aristocrat who entered a vengeance pact after lifelong magical rejection, then watched his family die during rebellion chaos.",
      personality:
        "Measured, prideful, intellectually intense, and quietly consumed by self-directed resentment.",
      bonds: "Family memory, unresolved pact entity, and obsessive arcane study habits.",
      flaws:
        "Revenge fixation, self-loathing loops, and dangerous willingness to pay ritual costs.",
      ideals: "Power with purpose, truth through scholarship, and eventual self-redemption.",
      currentGoals:
        "Finish the Zoheyr connection ritual and discover who truly shaped his pact path.",
      notes:
        "Use ritual side-effects as meaningful social/mechanical tradeoffs.",
      status: "active",
      isPlayerCharacter: true,
      relationships: toJson([
        "Melora (possible catalyst source)",
        "Zoheyr influence (uncertain patron intensity)",
        "Party (untested trust)",
      ]),
    },
  });

  const characterAmara = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      name: "Amara",
      playerName: "Diana",
      className: "Druid",
      subclass: "Circle of Spores",
      race: "Hexblood (Gnome origin)",
      level: 3,
      background: "Thornblood Operative",
      backstory:
        "After the raid on her commune, Amara entered covert Hexen work to find her captured mother and bonded sprite.",
      personality:
        "Withdrawn, surgical, and ruthless in defense of inner-circle loyalties.",
      bonds:
        "Mother Orella, sprite Lir, brother Edric, and hidden ties to Hexen contact Vesper.",
      flaws:
        "Fire trauma trigger, secrecy compulsion, and willingness to compromise ethics for rescue outcomes.",
      ideals:
        "Protect small communities, preserve lunar-cycle traditions, and punish those behind the raid.",
      currentGoals:
        "Rescue Orella and Lir, investigate Holdfast curse mechanics, and weaponize gathered lore.",
      notes:
        "Strong hook carrier for hag politics, fungal ecology, and emotional stakes.",
      status: "active",
      isPlayerCharacter: true,
      relationships: toJson([
        "Mother Gris (coercive patron)",
        "Morthein sprites (shared kinship)",
        "Hexen cell (hidden alliance)",
      ]),
    },
  });

  await prisma.characterBackground.createMany({
    data: [
      {
        characterId: characterFlynt.id,
        backgroundText:
          "Flynt washed ashore after mutiny fallout and now treats the map as his return-to-power leverage.",
        keyHistory: toJson([
          "Kidnapped from Clove coast into pirate life.",
          "Mentored by Saltbeard and raised on pirate code.",
          "Mutiny against Captain Silver ended with forced exile.",
        ]),
        plotHooks: toJson([
          "Saltbeard sighting via Silas old contacts.",
          "Rival crew places bounty for map recovery.",
        ]),
        unresolvedThreads: toJson([
          "Find Vesper from childhood.",
          "Decide whether to lead or rebuild pirate ethics.",
        ]),
        linkedNPCs: toJson(["Silas Alderman", "Melora"]),
      },
      {
        characterId: characterGarie.id,
        backgroundText:
          "Garie abandoned Briani noble violence for the Violet Woods, where Morthein warnings now drag him back into kingdom conflict.",
        keyHistory: toJson([
          "Brother Frogi's death tied to Glasha-era violence.",
          "Forest refuge with Morthein sprites.",
          "Receives corruption warnings connected to Blackford.",
        ]),
        plotHooks: toJson([
          "Ghost message chain from Frogi.",
          "Direct confrontation path with Greepo and Glasha network.",
        ]),
        unresolvedThreads: toJson([
          "Heal Violet Woods blight source.",
          "Choose mercy vs vengeance for family reckoning.",
        ]),
        linkedNPCs: toJson(["Valerius Skyhorn", "Melora"]),
      },
      {
        characterId: characterBells.id,
        backgroundText:
          "Bells operates as a sanctioned shadow while secretly using archive access to track the people behind her family's destruction.",
        keyHistory: toJson([
          "Parents assassinated; separated from twin sister.",
          "Survival years in Sigolt district under aliases.",
          "Folded into Briani intelligence as deniable asset.",
        ]),
        plotHooks: toJson([
          "Archive ledger with concealed assassin payment trail.",
          "Boogie sighting rumor in Avila circuits.",
        ]),
        unresolvedThreads: toJson([
          "Unmask assassination sponsor chain.",
          "Decide whether to defect from Briani apparatus.",
        ]),
        linkedNPCs: toJson(["Melora", "Caspian Estieges"]),
      },
      {
        characterId: characterAllryn.id,
        backgroundText:
          "Allryn's arcane obsession and infernal pact left him powerful but fractured, now hunting meaning through Zoheyr-linked rituals.",
        keyHistory: toJson([
          "Raised in Russald elite circles but shamed for weak innate magic.",
          "Triggered pact ritual during rebellion night massacre.",
          "Spent years wandering to hide lineage and deepen studies.",
        ]),
        plotHooks: toJson([
          "Identify pact-giver's true identity and endgame.",
          "Acquire catalyst blood without empowering Melora.",
        ]),
        unresolvedThreads: toJson([
          "Break or renegotiate pact without losing power base.",
          "Choose revenge or release toward Glasha-era trauma.",
        ]),
        linkedNPCs: toJson(["Melora", "Kaelen the Shimmer-Smith"]),
      },
      {
        characterId: characterAmara.id,
        backgroundText:
          "Amara balances commune loyalty and Hexen compromise while pursuing the people who took her family.",
        keyHistory: toJson([
          "Thornblood commune raid killed elders and captured key kin.",
          "Hexblood transformation linked to Mother Gris bargain.",
          "Current field work trades morality for intelligence access.",
        ]),
        plotHooks: toJson([
          "Find moon-sickle upgrade artisan.",
          "Uncover Holdfast trigger conditions.",
          "Reconnect with commune through recovered captive trail.",
        ]),
        unresolvedThreads: toJson([
          "Reveal Hexen alliance to party or keep buried.",
          "Rescue Orella and Lir before ritual window closes.",
        ]),
        linkedNPCs: toJson(["Silas Alderman", "Lucien Skyhorn"]),
      },
    ],
  });

  await prisma.magicItemWishlist.createMany({
    data: [
      {
        campaignId: campaign.id,
        characterId: characterFlynt.id,
        itemName: "Ring of Water Walking",
        rarity: "uncommon",
        status: "planned",
        reason: "Naval advantage during boarding and shoreline strikes.",
        storyHook: "Can be purchased only through a Rumrunner Cove broker.",
      },
      {
        campaignId: campaign.id,
        characterId: characterFlynt.id,
        itemName: "Cloak of Billowing",
        rarity: "common",
        status: "found",
        reason: "Style and intimidation utility.",
      },
      {
        campaignId: campaign.id,
        characterId: characterGarie.id,
        itemName: "Ring of Telekinesis",
        rarity: "very_rare",
        status: "rumored",
        reason: "Control terrain and support non-lethal outcomes.",
        storyHook: "Linked to a Briani noble vault rumor.",
      },
      {
        campaignId: campaign.id,
        characterId: characterGarie.id,
        itemName: "Staff of Swarming Insects",
        rarity: "rare",
        status: "planned",
        reason: "Fits druidic battlefield control style.",
      },
      {
        campaignId: campaign.id,
        characterId: characterGarie.id,
        itemName: "Wand of Secrets",
        rarity: "uncommon",
        status: "found",
        reason: "Supports investigation and hidden-door gameplay.",
      },
      {
        campaignId: campaign.id,
        characterId: characterBells.id,
        itemName: "Hat of Disguise",
        rarity: "uncommon",
        status: "planned",
        reason: "Alias operations and deniable mobility.",
      },
      {
        campaignId: campaign.id,
        characterId: characterBells.id,
        itemName: "Amulet of Proof Against Detection and Location",
        rarity: "uncommon",
        status: "rumored",
        reason: "Counter-surveillance against handlers and rivals.",
      },
      {
        campaignId: campaign.id,
        characterId: characterAllryn.id,
        itemName: "Cloak of Many Fashions",
        rarity: "common",
        status: "planned",
        reason: "Social adaptation while maintaining low-profile travel.",
      },
      {
        campaignId: campaign.id,
        characterId: characterAllryn.id,
        itemName: "Dark Shard Amulet",
        rarity: "common",
        status: "planned",
        reason: "Arcane focus with thematic resonance to pact magic.",
      },
      {
        campaignId: campaign.id,
        characterId: characterAmara.id,
        itemName: "Moon Sickle",
        rarity: "uncommon",
        status: "planned",
        reason: "Wants to evolve her grandmother's sickle into a ritual weapon.",
        storyHook: "Requires specialized tinkerer and lunar-core reagent.",
      },
      {
        campaignId: campaign.id,
        characterId: characterAmara.id,
        itemName: "Ring of Fire Resistance",
        rarity: "rare",
        status: "rumored",
        reason: "Mitigate trauma trigger and improve survivability vs fire casters.",
      },
      {
        campaignId: campaign.id,
        characterId: characterAmara.id,
        itemName: "Nature's Mantle",
        rarity: "uncommon",
        status: "planned",
        reason: "Enhance stealth and druidic positioning in field ops.",
      },
    ],
  });

  await prisma.journalEntry.createMany({
    data: [
      {
        campaignId: campaign.id,
        sessionId: session1.id,
        type: "session_recap",
        title: "Rachel Journal: Session 1 - The Dead Star Convergence",
        content:
          "Starting at the Dead Star, the party was forced together by map pressure and Melora's intervention. Silas extracted the group through smoke and committed them to the Rosport rescue of Lucien. Core takeaway: the map conflict and Zoheyr ties are now openly entangled.",
        tags: toJson([
          "rachel-journal",
          "session-1",
          "dead-star",
          "melora",
          "silas",
        ]),
        isPinned: true,
      },
      {
        campaignId: campaign.id,
        sessionId: session2.id,
        type: "session_recap",
        title: "Rachel Journal: Session 2 - Clove Pressure and Harbor Blood Tax",
        content:
          "Clove's wealth theater intensified social tension while the party pursued reagents and archive intel. Wanted heat increased for Garie, and the harbor blood-tax ritual reframed the sea route as morally compromised. Session delivered strong contrast and raised stakes before Rosport.",
        tags: toJson([
          "rachel-journal",
          "session-2",
          "clove",
          "harbor",
          "archives",
        ]),
        isPinned: true,
      },
      {
        campaignId: campaign.id,
        sessionId: session3.id,
        type: "prep_notes",
        title: "Rachel Prep: Session 3 Decision Engine",
        content:
          "Priority beats: Prismatic Reef sale, Bells vs Flynt map confrontation, and Rose Cottage doppelganger branch. Ensure Garie's 'help a stranger' goal is meaningfully testable via Elara scene. Keep the departure clock visible so players feel momentum toward Rosport.",
        tags: toJson([
          "rachel-journal",
          "session-3-prep",
          "contingencies",
          "party-goals",
        ]),
        isPinned: true,
      },
      {
        campaignId: campaign.id,
        type: "worldbuilding",
        title: "Rachel World Notes: Misty Market, Clove, and Tri-Kingdom Tension",
        content:
          "Misty Market remains the shared artery between Avila, Briani, and Clove but now shows fracture lines from plague policy and hidden intelligence trade. Clove's visual opulence should contrast with its political paranoia and moral blind spots. Keep Joe, Zoheyr, and Saesis active in world texture, not just lore dumps.",
        tags: toJson([
          "rachel-journal",
          "worldbuilding",
          "misty-market",
          "clove",
          "lore",
        ]),
        isPinned: false,
      },
      {
        campaignId: campaign.id,
        type: "reflection",
        title: "Rachel DM Reflection: Secrets Need Timers",
        content:
          "The strongest sessions happen when secrets have visible pressure and consequences. Going forward, each hidden thread should have either a countdown, a rival actor, or a reputational cost. Avoid static mysteries. Keep everything connected to sessions, NPC behavior changes, and player goals.",
        tags: toJson([
          "rachel-journal",
          "dm-reflection",
          "secrets",
          "timeline",
        ]),
        isPinned: false,
      },
      {
        campaignId: campaign.id,
        type: "prep_notes",
        title: "DM Secret Notes: Table Rules and Encounter Guardrails",
        content:
          "Enforce Star-Burn Con-save mechanics, avoid early-session TPK spikes, and maintain encounter pacing through explicit warnings. Keep one meaningful NPC per location and reward player curiosity whenever possible. Use doppelganger, mimic, and trap motifs sparingly but with strong payoff.",
        tags: toJson([
          "dm-secrets",
          "encounter-design",
          "session-flow",
          "house-rules",
        ]),
        isPinned: false,
      },
    ],
  });

  await prisma.sessionStoryline.createMany({
    data: [
      { sessionId: session1.id, storylineId: storylineSkyhorn.id },
      { sessionId: session1.id, storylineId: storylineSchematics.id },
      { sessionId: session1.id, storylineId: storylineZoheyr.id },
      { sessionId: session2.id, storylineId: storylineSkyhorn.id },
      { sessionId: session2.id, storylineId: storylineSchematics.id },
      { sessionId: session2.id, storylineId: storylineStarBurn.id },
      { sessionId: session2.id, storylineId: storylineGlasha.id },
      { sessionId: session3.id, storylineId: storylineSkyhorn.id },
      { sessionId: session3.id, storylineId: storylineSchematics.id },
      { sessionId: session3.id, storylineId: storylineVioletWoods.id },
      { sessionId: session4.id, storylineId: storylineSkyhorn.id },
      { sessionId: session4.id, storylineId: storylineStarBurn.id },
    ],
  });

  await prisma.sessionNPC.createMany({
    data: [
      { sessionId: session1.id, npcId: npcSilas.id },
      { sessionId: session1.id, npcId: npcMelora.id },
      { sessionId: session1.id, npcId: npcEduardo.id },
      { sessionId: session2.id, npcId: npcKaelen.id },
      { sessionId: session2.id, npcId: npcValerius.id },
      { sessionId: session2.id, npcId: npcEduardo.id },
      { sessionId: session3.id, npcId: npcThalassar.id },
      { sessionId: session3.id, npcId: npcRose.id },
      { sessionId: session3.id, npcId: npcDax.id },
      { sessionId: session3.id, npcId: npcOlo.id },
      { sessionId: session3.id, npcId: npcSilas.id },
      { sessionId: session4.id, npcId: npcLucien.id },
      { sessionId: session4.id, npcId: npcSilas.id },
    ],
  });

  await prisma.sessionSecret.createMany({
    data: [
      { sessionId: session1.id, secretId: secretSaveLucien.id },
      { sessionId: session1.id, secretId: secretSilasGoal.id },
      { sessionId: session1.id, secretId: secretMeloraGoal.id },
      { sessionId: session1.id, secretId: secretConsortium.id },
      { sessionId: session2.id, secretId: secretSaveLucien.id },
      { sessionId: session2.id, secretId: secretAllrynGoal.id },
      { sessionId: session2.id, secretId: secretPlagueOrigin.id },
      { sessionId: session2.id, secretId: secretBrianiWar.id },
      { sessionId: session3.id, secretId: secretBellsGoal.id },
      { sessionId: session3.id, secretId: secretFlyntGoal.id },
      { sessionId: session3.id, secretId: secretDoppelganger.id },
      { sessionId: session3.id, secretId: secretRoseGuild.id },
      { sessionId: session4.id, secretId: secretSaveLucien.id },
      { sessionId: session4.id, secretId: secretPlagueOrigin.id },
      { sessionId: session4.id, secretId: secretCraterVillain.id },
    ],
  });

  await prisma.storylineNPC.createMany({
    data: [
      { storylineId: storylineSkyhorn.id, npcId: npcSilas.id },
      { storylineId: storylineSkyhorn.id, npcId: npcLucien.id },
      { storylineId: storylineSkyhorn.id, npcId: npcValerius.id },
      { storylineId: storylineSkyhorn.id, npcId: npcDax.id },
      { storylineId: storylineSkyhorn.id, npcId: npcOlo.id },
      { storylineId: storylineSchematics.id, npcId: npcMelora.id },
      { storylineId: storylineSchematics.id, npcId: npcThalassar.id },
      { storylineId: storylineSchematics.id, npcId: npcSilas.id },
      { storylineId: storylineSchematics.id, npcId: npcCaspian.id },
      { storylineId: storylineStarBurn.id, npcId: npcCaspian.id },
      { storylineId: storylineStarBurn.id, npcId: npcValerius.id },
      { storylineId: storylineGlasha.id, npcId: npcMelora.id },
      { storylineId: storylineVioletWoods.id, npcId: npcSilas.id },
      { storylineId: storylineVioletWoods.id, npcId: npcLucien.id },
      { storylineId: storylineZoheyr.id, npcId: npcMelora.id },
      { storylineId: storylineZoheyr.id, npcId: npcKaelen.id },
    ],
  });

  await prisma.storylineSecret.createMany({
    data: [
      { storylineId: storylineSkyhorn.id, secretId: secretSaveLucien.id },
      { storylineId: storylineSkyhorn.id, secretId: secretSilasGoal.id },
      { storylineId: storylineSchematics.id, secretId: secretFlyntGoal.id },
      { storylineId: storylineSchematics.id, secretId: secretBellsGoal.id },
      { storylineId: storylineSchematics.id, secretId: secretConsortium.id },
      { storylineId: storylineStarBurn.id, secretId: secretPlagueOrigin.id },
      { storylineId: storylineStarBurn.id, secretId: secretBrianiWar.id },
      { storylineId: storylineGlasha.id, secretId: secretBrianiWar.id },
      { storylineId: storylineGlasha.id, secretId: secretBellsGoal.id },
      { storylineId: storylineGlasha.id, secretId: secretMeloraGoal.id },
      { storylineId: storylineVioletWoods.id, secretId: secretNeutralizeDoom.id },
      { storylineId: storylineVioletWoods.id, secretId: secretAmaraGoal.id },
      { storylineId: storylineVioletWoods.id, secretId: secretGarieGoal.id },
      { storylineId: storylineVioletWoods.id, secretId: secretCraterVillain.id },
      { storylineId: storylineZoheyr.id, secretId: secretAllrynGoal.id },
      { storylineId: storylineZoheyr.id, secretId: secretMeloraGoal.id },
    ],
  });

  await prisma.nPCSecret.createMany({
    data: [
      { npcId: npcSilas.id, secretId: secretSilasGoal.id },
      { npcId: npcSilas.id, secretId: secretRoseGuild.id },
      { npcId: npcMelora.id, secretId: secretMeloraGoal.id },
      { npcId: npcMelora.id, secretId: secretBrianiWar.id },
      { npcId: npcValerius.id, secretId: secretSaveLucien.id },
      { npcId: npcValerius.id, secretId: secretPlagueOrigin.id },
      { npcId: npcLucien.id, secretId: secretSaveLucien.id },
      { npcId: npcLucien.id, secretId: secretPlagueOrigin.id },
      { npcId: npcRose.id, secretId: secretRoseGuild.id },
      { npcId: npcThalassar.id, secretId: secretConsortium.id },
      { npcId: npcCaspian.id, secretId: secretConsortium.id },
      { npcId: npcCaspian.id, secretId: secretPlagueOrigin.id },
      { npcId: npcEduardo.id, secretId: secretRoseGuild.id },
      { npcId: npcEduardo.id, secretId: secretDoppelganger.id },
    ],
  });

  const [sessionCount, storylineCount, npcCount, secretCount, journalCount, characterCount, wishlistCount] =
    await Promise.all([
      prisma.sessionPlan.count(),
      prisma.storyline.count(),
      prisma.nPC.count(),
      prisma.secretGoal.count(),
      prisma.journalEntry.count(),
      prisma.character.count(),
      prisma.magicItemWishlist.count(),
    ]);

  console.log("Seed complete:", {
    campaign: campaign.name,
    sessions: sessionCount,
    storylines: storylineCount,
    npcs: npcCount,
    secrets: secretCount,
    journals: journalCount,
    characters: characterCount,
    wishlists: wishlistCount,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
