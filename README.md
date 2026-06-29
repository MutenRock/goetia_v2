# GOETIA v2 — Mortis Prototype

Prototype web **Phaser + TypeScript + Vite** pour un jeu arcade de nécromancie logistique, avec un feeling proche des jeux Flash type *Pillage the Village* : main démoniaque, village 2D latéral, corps, âmes, porteurs, fosse et premiers sceaux goétiques.

## Pitch

> Ravage un village avec une main démoniaque, extirpe les âmes des cadavres, puis laisse les porteurs de Bifrons ramener les corps à la fosse pour alimenter tes rituels.

Le but n'est pas de copier un jeu existant : GOETIA garde son twist central, la séparation **âme / corps / transport / fosse / rituel**.

## État du prototype

Cette v0.2 contient déjà :

- une scène 2D latérale 960x540 ;
- une main contrôlée à la souris, avec ombre et feedback de saisie ;
- grab / throw sur villageois et cadavres ;
- dégâts d'impact contre le sol et les bâtiments ;
- cadavres persistants avec états visuels : âme présente, âme extraite, priorité, purification ;
- extraction d'âme au clic droit ou avec `E` ;
- porteurs de Bifrons qui récupèrent les cadavres extraits et respectent les priorités ;
- fosse qui stocke les corps ;
- archers de Leraje produits depuis la fosse ;
- gardes qui attaquent la fosse et les porteurs ;
- chapelle qui purifie les cadavres ;
- score arcade, combo temporaire et score final ;
- conditions simples de victoire/défaite.

## Contrôles

| Action | Contrôle |
|---|---|
| Déplacer la main | Souris |
| Attraper | Clic gauche maintenu |
| Jeter | Relâcher clic gauche avec mouvement |
| Extraire l'âme | Clic droit sur cadavre ou `E` |
| Marquer un cadavre extrait comme prioritaire | `Shift` + clic gauche |
| Créer un porteur de Bifrons | `1` |
| Créer un archer de Leraje | `2` |
| Restart | `R` |

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
│  ├─ scenes/              # BootScene, GameScene
│  ├─ systems/             # grab, extraction, combat
│  └─ ui/                  # futur HUD avancé
└─ .github/workflows/      # build CI
```

## Prochaine étape conseillée

Avant d'ajouter du lore ou des assets, tester uniquement ceci :

> Est-ce que la boucle `attraper → tuer → extirper âme → prioriser un corps → porteur ramène corps → fosse produit` est fun pendant 5 minutes ?

Si oui, on peut ajouter les upgrades, les autres sceaux, les sons et une vraie direction artistique.
