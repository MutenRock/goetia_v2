# GOETIA v2 — Mortis Prototype

Prototype web **Phaser + TypeScript + Vite** pour un jeu arcade de nécromancie logistique, avec un feeling proche des jeux Flash type *Pillage the Village* : main démoniaque, village 2D latéral, corps, âmes, porteurs, fosse et premiers sceaux goétiques.

## Pitch

> Ravage un village avec une main démoniaque, extirpe les âmes des cadavres, puis laisse les porteurs de Bifrons ramener les corps à la fosse pour alimenter tes rituels.

Le but n'est pas de copier un jeu existant : GOETIA garde son twist central, la séparation **âme / corps / transport / fosse / rituel**.

## État du prototype

Cette v0.3 contient déjà :

- un menu principal avec pitch, objectif et lancement rapide ;
- une scène 2D latérale 960x540 ;
- une aide en jeu consultable avec `H` ;
- une pause avec `P` ou `Echap` ;
- un retour menu avec `M` ;
- un panneau d'objectif dynamique ;
- une main contrôlée à la souris, avec ombre et feedback de saisie ;
- grab / throw sur villageois et cadavres ;
- dégâts d'impact contre le sol et les bâtiments ;
- cadavres persistants avec états visuels : âme présente, âme extraite, priorité, purification ;
- extraction d'âme au clic droit ou avec `E` ;
- porteurs de Bifrons qui récupèrent les cadavres extraits et respectent les priorités ;
- fosse qui stocke les corps ;
- archers de Leraje produits depuis la fosse ;
- maisons qui font revenir des villageois tant qu'elles tiennent ;
- caserne qui appelle des gardes tant qu'elle tient ;
- chapelle avec aura visible qui purifie les cadavres proches ;
- stabilité rituelle active : extractions, invocations et purifications déstabilisent les sceaux ;
- corps traités et bâtiments profanés rendent de la stabilité ;
- défaite si la stabilité tombe à zéro ;
- scoring arcade sur impacts, extractions, corps stockés, invocations et bâtiments détruits ;
- score arcade, combo temporaire et score final ;
- conditions simples de victoire/défaite.

## Contrôles

| Action | Contrôle |
|---|---|
| Commencer depuis le menu | `Entrée`, `Espace` ou clic |
| Déplacer la main | Souris |
| Attraper | Clic gauche maintenu |
| Jeter | Relâcher clic gauche avec mouvement |
| Extraire l'âme | Clic droit sur cadavre ou `E` |
| Marquer un cadavre extrait comme prioritaire | `Shift` + clic gauche |
| Créer un porteur de Bifrons | `1` |
| Créer un archer de Leraje | `2` |
| Aide en jeu | `H` |
| Pause / reprise | `P` ou `Echap` |
| Retour menu | `M` |
| Restart | `R` |

## Logique de stabilité

La stabilité représente l'intégrité des sceaux autour de la fosse.

- Extirper une âme coûte un peu de stabilité.
- Créer un porteur de Bifrons ou un archer de Leraje coûte de la stabilité.
- Un cadavre purifié par la chapelle fait beaucoup baisser la stabilité.
- Chaque corps ramené à la fosse restaure un peu la stabilité.
- Détruire/profaner un bâtiment restaure de la stabilité.
- Si la stabilité tombe à zéro, la partie est perdue.

## Installation locale

```bash
npm install
npm run dev
```

Puis ouvrir l'URL Vite affichée, généralement :

```txt
http://localhost:5173
```

## Build production

```bash
npm run build
npm run preview
```

Le dossier `dist/` est statique et peut être servi par Apache/Nginx/OVH.

## Création du repo GitHub

Depuis le dossier parent :

```bash
gh repo create MutenRock/goetia_v2 --public --description "GOETIA v2 — arcade web prototype for necromantic logistics" --source ./goetia_v2 --remote origin --push
```

Si tu préfères en privé :

```bash
gh repo create MutenRock/goetia_v2 --private --description "GOETIA v2 — arcade web prototype for necromantic logistics" --source ./goetia_v2 --remote origin --push
```

## Structure

```txt
goetia_v2/
├─ docs/                  # GDD, roadmap, lore mapping
├─ public/assets/          # futur sprites/audio/sigils
├─ src/
│  ├─ core/                # state, types, balance
│  ├─ data/                # demons, levels
│  ├─ entities/            # hand, units, corpse, pit, buildings
│  ├─ scenes/              # BootScene, MenuScene, GameScene
│  ├─ systems/             # grab, extraction, combat
│  └─ ui/                  # futur HUD avancé
└─ .github/workflows/      # build CI
```

## Prochaine étape conseillée

Avant d'ajouter du lore ou des assets, tester uniquement ceci :

> Est-ce que la boucle `attraper → tuer → extirper âme → prioriser un corps → porteur ramène corps → fosse produit` est fun pendant 5 minutes ?

Si oui, on peut ajouter les upgrades, les autres sceaux, les sons et une vraie direction artistique.
