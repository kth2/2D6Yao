# 六爻预测 PWA — Project Instructions for Claude Code

## Project Goal
Build a fully customizable Progressive Web App (PWA) for traditional 六爻 (Liu Yao / Six Lines) divination.
The app must allow users to freely set up and inspect a complete 卦盘.

## Core Requirements (Must Have)

### 卦盘设置 (Hexagram Setup)
- User can freely choose / input:
  - 本卦 (Original Hexagram) — by name, by 64-gua number, or by 6 lines (初爻 → 上爻)
  - 动爻 (Moving Lines) — select which lines are moving (老阳/老阴)
  - 变卦 (Changed Hexagram) — auto-calculated from 本卦 + 动爻, with option to manually override
- Support multiple input methods:
  - Manual line-by-line (6/7/8/9 or 阴阳 + 动)
  - Coin simulation
  - Time-based
  - Number / Chinese character (optional later)

### 完整卦盘详情 (Itemized Chart Details)
Must display a complete, structured 卦盘 that lists every detail for both 本卦 and 变卦:
- 卦名 + 卦宫 + 世应位置
- 每一爻：爻位、阴阳、是否动爻、纳甲（天干地支）、五行、六亲、六神
- 空亡、月破、日破、暗动
- 伏神 / 飞神
- 旺衰状态
- 神煞（驿马、桃花、华盖、天乙贵人等）
- 化进化退、墓库等
- Side-by-side or tabbed view of 本卦 vs 变卦
- Clickable / expandable detail for each 爻

### Other Core Features
- Accurate Chinese calendar (真太阳时 + 精确节气 + 四柱 + 旬空)
- AI interpretation: generate high-quality structured prompt + optional LLM call (user API key or prompt copy)
- Full PWA: installable, offline-capable, local history (IndexedDB)
- Clean, modern, highly customizable UI (theme system, classical + modern styles)
- Chinese UI by default

## Preferred Tech Stack
- Vite + React 19 + TypeScript
- Tailwind CSS + shadcn/ui (or similar component library)
- mingyu-core (primary engine for 六爻 + calendar) — https://github.com/Brhiza/mingyu
- Alternative / reference engines: yaomancy/liuyao-engine, murInJ/liuyao-graph, lemonteaau/binary-liuyao
- vite-plugin-pwa for PWA features
- IndexedDB (via idb or dexie) for saving readings
- Date handling with proper Chinese calendar libraries

## Architecture Rules
- Keep calculation logic pure and separate from UI
- Engine must return structured JSON that the UI can freely render and edit
- All 卦盘 data must be editable by the user (settings → regenerate chart)
- Prefer small, incremental changes
- Always show a clear plan before writing large amounts of code
- Ask before adding new major dependencies
- Use TypeScript strictly (no `any`)
- Components should be highly reusable and themeable

## Working Style
1. Always read this CLAUDE.md first
2. Plan → confirm with user → implement → test
3. Prefer editing existing files over creating many new ones
4. After major features, update a simple README.md with how to run and key features
5. Keep Chinese terminology accurate (本卦、变卦、动爻、纳甲、六亲、六神、世应、空亡 etc.)

## Priority Order
1. Accurate 卦盘 engine + full itemized display of 本卦 & 变卦
2. User settings to freely choose/edit 本卦 + 动爻 + 变卦
3. Clean UI for the chart
4. PWA + offline + history
5. AI interpretation layer
6. Extra起卦 methods and polish
