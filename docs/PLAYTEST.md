# GOETIA v0.5 — Playtest

Objectif de cette version : vérifier que le prototype est **jouable, compréhensible et reportable** par quelqu'un qui découvre le jeu.

## Lancement

```bash
npm install
npm run build
npm run dev
```

Ouvrir l'URL Vite affichée, généralement :

```txt
http://localhost:5173
```

## Parcours de test recommandé

1. Arriver sur le menu principal.
2. Vérifier que la version affichée est `v0.5-playtest`.
3. Cliquer sur `BUG REPORT` depuis le menu et vérifier qu'un mail prérempli s'ouvre vers `pierreh@sterenna.fr`.
4. Revenir au jeu et lancer une partie.
5. Finir la vague 1.
6. Choisir un sceau avec `1`, `2` ou `3`.
7. Finir la vague 2.
8. Choisir un autre sceau.
9. Finir la vague 3.
10. Vérifier que la victoire finale s'affiche.
11. Appuyer sur `B` pendant la partie, pendant le choix de sceau ou sur l'écran de fin pour tester le bug report.

## Ce qu'il faut observer

- Est-ce que le but est compréhensible sans explication externe ?
- Est-ce que la main est agréable à contrôler ?
- Est-ce que le lancer donne envie de rejouer ?
- Est-ce que l'extraction d'âme est lisible ?
- Est-ce que les porteurs vont bien chercher les cadavres extraits ?
- Est-ce que la priorité `Shift + clic` est utile ?
- Est-ce que la chapelle est clairement menaçante ?
- Est-ce que les vagues durent trop longtemps ou pas assez ?
- Est-ce que les upgrades sont compréhensibles ?
- Est-ce que la stabilité baisse trop vite ?
- Est-ce que le bug report est facile à envoyer ?

## Bug report

Le jeu est actuellement statique, donc le bouton de bug report utilise `mailto:`.

Le mail contient automatiquement :

- version du jeu ;
- URL ;
- navigateur ;
- résolution ;
- langue ;
- date ;
- scène actuelle ;
- vague ;
- score ;
- ressources ;
- niveaux de sceaux ;
- nombre d'unités/cadavres actifs.

Le testeur doit compléter :

- description du bug ;
- étapes pour reproduire ;
- résultat obtenu ;
- résultat attendu.

## Limites connues

- Le mail ne part pas automatiquement : le client mail du testeur doit s'ouvrir.
- Certains navigateurs ou appareils sans client mail configuré peuvent ne rien ouvrir.
- Il n'y a pas encore de sauvegarde de run.
- Il n'y a pas encore de sons.
- L'équilibrage des vagues est volontairement brut.
