# TODO immédiat après premier push

## 1. Vérifier lancement

```bash
npm install
npm run dev
```

## 2. Tester la sensation de main

Questions :

- Est-ce que le grab est agréable ?
- Est-ce que la projection est assez violente ?
- Est-ce que les morts arrivent trop vite ou pas assez ?
- Est-ce que le clic droit sur cadavre est lisible ?

## 3. Premier polish utile

- Ajouter un vrai curseur main dessiné propre.
- Ajouter une ombre sous la main.
- Ajouter un effet d'impact au sol.
- Ajouter un feedback quand la chapelle purifie.

## 4. Première vraie mécanique à ajouter

La priorité des cadavres :

- Shift + clic sur cadavre = priorité haute.
- Les porteurs vont d'abord chercher les cadavres prioritaires.
- UI : petit marqueur de sigil au-dessus du corps.

## 5. Première issue GitHub suggérée

Titre : `Improve hand feel and throw impact`

Body :

```md
Objectif : rendre la main centrale plus satisfaisante.

- [ ] courbe d'inertie de la main
- [ ] meilleur calcul de vélocité au relâchement
- [ ] impact au sol plus clair
- [ ] shake léger
- [ ] poussière / particules
- [ ] sons placeholder
```
