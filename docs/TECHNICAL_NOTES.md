# Notes techniques

## Stack

- Phaser 3
- TypeScript
- Vite
- Build statique

## Pourquoi Phaser ici

Le prototype vise le navigateur d'abord : canvas/WebGL, scène 2D, input souris, collisions simples, HUD léger, déploiement statique. Phaser est donc plus direct qu'un moteur desktop-first pour cette étape.

## Physique

Le prototype utilise Arcade Physics, pas Matter.js.

Raison :

- grab / throw suffisent en simulation arcade ;
- collisions simples ;
- moins de complexité ;
- meilleur rythme d'itération.

Si on veut plus tard des bâtiments qui s'écroulent en morceaux, on pourra isoler ce système et migrer uniquement la destruction avancée vers Matter.js ou un système maison.

## Architecture actuelle

Le code n'est pas un ECS complet. C'est volontaire.

On a :

- `entities/` : objets de jeu visuels + comportement local ;
- `systems/` : règles transversales ;
- `data/` : définitions de démons/niveaux ;
- `core/` : état global et équilibre.

C'est assez structuré pour ne pas partir en script spaghetti, sans imposer un framework ECS trop tôt.

## Risques actuels

- La main doit être plus juteuse.
- Les collisions bâtiment sont encore très simples.
- Les porteurs cherchent seulement les cadavres dont l'âme est extraite.
- Le niveau est fixe.
- Les assets sont générés par code.
- La stabilité rituelle existe dans le state mais n'a pas encore de conséquences.

## Critère de validation

Ne pas ajouter de contenu avant que cette boucle soit fun :

```txt
main → mort → âme → porteur → fosse → unité → défense
```
