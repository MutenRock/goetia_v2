# GOETIA v2 — Mortis Prototype

Prototype web **Phaser + TypeScript + Vite** pour un jeu arcade de nécromancie logistique, avec un feeling proche des jeux Flash type *Pillage the Village* : main démoniaque, village 2D latéral, corps, âmes, porteurs, fosse et premiers sceaux goétiques.

## Pitch

> Ravage un village avec une main démoniaque, extirpe les âmes des cadavres, puis laisse les porteurs de Bifrons ramener les corps à la fosse pour alimenter tes rituels.

Le but n'est pas de copier un jeu existant : GOETIA garde son twist central, la séparation **âme / corps / transport / fosse / rituel**.

## État du prototype

Cette v0.5 contient déjà :

- un menu principal playtest avec lancement rapide ;
- un bouton **bug report** dans le menu ;
- un raccourci `B` pour préparer un mail de bug report vers `pierreh@sterenna.fr` ;
- un rapport de bug prérempli avec version, URL, navigateur, résolution, date et contexte de jeu ;
- une scène 2D latérale 960x540 ;
- une aide en jeu consultable avec `H` ;
- une pause avec `P` ou `Echap` ;
- un retour menu avec `M` ;
- un panneau d'objectif dynamique ;
- une boucle de **3 vagues** avec difficulté croissante ;
- un écran de choix de sceau entre les vagues ;
- trois upgrades de départ : Murmur, Bifrons, Leraje ;
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
| Commencer depuis le menu | `Entrée`, `Espace` ou bouton `Jouer` |
| Déplacer la main | Souris |
| Attraper | Clic gauche maintenu |
| Jeter | Relâcher clic gauche avec mouvement |
| Extraire l'âme | Clic droit sur cadavre ou `E` |
| Marquer un cadavre extrait comme prioritaire | `Shift` + clic gauche |
| Créer un porteur de Bifrons | `1` |
| Créer un archer de Leraje | `2` |
| Choisir un upgrade entre les vagues | `1`, `2` ou `3` |
| Signaler un bug | `B` ou bouton `Bug Report` dans le menu |
| Aide en jeu | `H` |
| Pause / reprise | `P` ou `Echap` |
| Retour menu | `M` |
| Restart | `R` |

## Bug report playtest

Le jeu est statique : il ne peut pas envoyer un email silencieusement sans backend SMTP/API.

La v0.5 utilise donc un lien `mailto:` :

- `B` ouvre le client mail du testeur ;
- le destinataire est `pierreh@sterenna.fr` ;
- le sujet est prérempli ;
- le corps du mail contient les champs à remplir + contexte automatique.

Pour tester le bug report :

1. lancer le jeu ;
2. appuyer sur `B` depuis le menu ou pendant une partie ;
3. vérifier que le mail s'ouvre avec le contexte prérempli ;
4. compléter description / étapes / résultat attendu ;
5. envoyer.

## Logique de stabilité

La stabilité représente l'intégrité des sceaux autour de la fosse.

- Extirper une âme coûte un peu de stabilité.
- Créer un porteur de Bifrons ou un archer de Leraje coûte de la stabilité.
- Un cadavre purifié par la chapelle fait beaucoup baisser la stabilité.
- Chaque corps ramené à la fosse restaure un peu la stabilité.
- Détruire/profaner un bâtiment restaure de la stabilité.
- Si la stabilité tombe à zéro, la partie est perdue.

## Upgrades de vague

Après une vague réussie, le joueur choisit un sceau :

- `1 — Murmur` : réduit le coût de stabilité des extractions.
- `2 — Bifrons` : ajoute un porteur au début des vagues et réduit son coût de stabilité.
- `3 — Leraje` : ajoute un archer au début des vagues, renforce les tirs et réduit son coût de stabilité.

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

## Structure

```txt
goetia_v2/
├─ docs/                  # GDD, roadmap, lore mapping, playtest
├─ public/assets/          # futur sprites/audio/sigils
├─ src/
│  ├─ core/                # state, types, balance, version, bug report
│  ├─ data/                # demons, levels
│  ├─ entities/            # hand, units, corpse, pit, buildings
│  ├─ scenes/              # BootScene, MenuScene, GameScene
│  ├─ systems/             # grab, extraction, combat
│  └─ ui/                  # futur HUD avancé
└─ .github/workflows/      # build CI
```

## Prochaine étape conseillée

Tester maintenant la boucle :

> menu → bug report → vague 1 → objectif → choix de sceau → vague 2 → choix de sceau → vague 3 → victoire finale → bug report.

Ensuite on pourra ajouter des sons, une vraie direction artistique et des démons plus dangereux.
