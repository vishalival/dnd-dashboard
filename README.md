# DM Campaign Dashboard

A premium **Dungeon Master operating system** for campaign management, session planning, NPC tracking, and storyline orchestration. Built for serious DMs who want a polished, high-agency tool that feels like "Notion + Linear + fantasy campaign command center."

## Product Vision

Running a D&D campaign is complex. DMs juggle storylines, NPCs, secrets, session plans, character arcs, and worldbuilding — often scattered across notebooks, Google Docs, and random notes apps. **DM Campaign Dashboard** centralizes everything into one elegant, interconnected system.

## Features

### Core Modules (Priority Order)

1. **Session Planner** — Structured session prep with key beats, encounters, hooks, contingency branches, improv prompts, NPC appearances, and pre-session checklists. Supports templates (tavern, travel, mystery, combat, political intrigue).

2. **Secrets & Goals Tracker** — Track party goals, player goals, NPC goals, DM secrets, world secrets, and faction secrets. Visibility layers: visible to party, partially revealed, DM only. Progress tracking and urgency levels.

3. **Story Timeline** — Campaign narrative tracker with arcs, story beats, quests, subplots, and timeline events. Connected to NPCs, secrets, and sessions.

4. **NPC Tracker** — Rich NPC profiles with disposition, faction, goals, secrets, voice notes, relationships, session appearances, and DM-only notes. Searchable and filterable.

5. **Overview Dashboard** — Command center with upcoming session, active plot threads, critical secrets, active NPCs, party goals, recent journal entries, and quick navigation.

6. **DM's Campaign Journal** — Dated entries for session recaps, prep notes, reflections, and worldbuilding. Searchable with tags.

7. **Party / Character Hub** — Player character profiles with class, backstory, personality traits, goals, backgrounds, and magic item wishlists.

8. **Magic Item Wishlist Tracker** — Track desired items by character with rarity, story hooks, and acquisition status.

### UX Features

- Command palette (⌘K) for quick navigation
- Dark mode default with gold/crimson/arcane blue accents
- Glassy panel design with smooth Framer Motion animations
- Collapsible sidebar navigation
- Cross-linked entities (NPCs ↔ storylines ↔ secrets ↔ sessions)
- DM-only vs player-known information visibility

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** with custom dark fantasy theme
- **shadcn/ui** components
- **Framer Motion** for animations
- **Zustand** for state management
- **Prisma** + SQLite for persistence
- **Vercel-friendly** deployment setup

## Architecture

```
src/
├── app/
│   ├── (campaign)/        # All campaign pages with shared layout
│   │   ├── dashboard/     # Command center
│   │   ├── sessions/      # Session planner
│   │   ├── storylines/    # Story timeline
│   │   ├── npcs/          # NPC tracker
│   │   ├── secrets/       # Secrets & goals
│   │   ├── journal/       # DM journal
│   │   ├── party/         # Character hub
│   │   └── wishlists/     # Magic items
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Sidebar, app shell, command palette
│   └── shared/            # Reusable components
├── lib/                   # Prisma client, utilities, data fetching
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Data Model

- **Campaign** — Top-level container
- **SessionPlan** — Session planning with beats, encounters, hooks, contingencies
- **Storyline** — Arcs, subplots with status and urgency
- **StoryEvent** — Timeline events within storylines
- **NPC** — Rich character profiles with disposition, faction, secrets
- **SecretGoal** — Secrets and goals with visibility layers
- **JournalEntry** — DM notes and session recaps
- **Character** — Player characters with backgrounds
- **CharacterBackground** — Detailed backstory, plot hooks, unresolved threads
- **MagicItemWishlist** — Desired items with rarity and story connections
- **Location** / **Faction** — World elements

All entities are richly cross-linked through junction tables.

## Local Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Future Additions

- Live note sync / collaborative editing
- D&D Beyond character sheet integration
- Combat tracker / encounter builder
- AI-assisted session recap generation
- Initiative tracker
- Map integration
- Dice roller
- Export/import campaigns
- Multi-campaign support
- Player-facing view (share limited info with players)

## License

MIT
