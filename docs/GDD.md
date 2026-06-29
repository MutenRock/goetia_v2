# GDD v0.2 — GOETIA / Mortis

## Intention

GOETIA est un jeu web arcade de nécromancie logistique. Le joueur contrôle une main rituelle au-dessus d'un village 2D de profil. Il peut attraper les habitants, les jeter, détruire les bâtiments, extirper les âmes des cadavres, puis laisser ses serviteurs transporter les corps à la fosse.

## Positionnement

- Feeling : jeu Flash nerveux, lisible, violent mais slapstick.
- Forme : écran unique, caméra fixe au début.
- Fond : Goétie, sceaux, contrainte des morts, 72 démons comme progression.
- Twist : corps et âme sont deux ressources différentes.

## Piliers

### 1. La main doit être amusante seule

Le joueur doit pouvoir s'amuser sans interface complexe : attraper, secouer, jeter, écraser, arracher l'âme.

### 2. La nécromancie est une chaîne de production

```txt
mort → cadavre → âme extraite → corps transporté → fosse → serviteur
```

### 3. Le village est un jouet destructible

Chaque bâtiment a un rôle : maison, chapelle, caserne, grange, fosse.

### 4. Les démons sont des systèmes

Les démons ne sont pas simplement des unités uniques. Ce sont des sceaux qui débloquent des comportements.

| Démon | Fonction |
|---|---|
| Murmur | Extraction d'âmes |
| Bifrons | Transport de cadavres |
| Leraje | Défense à distance |
| Andras | Puissance instable |
| Malthus | Construction |
| Buer | Soutien / restauration |

## MVP

### Entités

- Main
- Villageois
- Gardes
- Cadavres
- Âmes
- Porteurs de Bifrons
- Archers de Leraje
- Fosse
- Maisons
- Chapelle
- Caserne

### Conditions de victoire

- Traiter 12 corps et neutraliser la chapelle.
- Ou détruire chapelle + caserne.

### Conditions de défaite

- Fosse détruite.
- 12 cadavres purifiés.

## Contrôles

| Action | Contrôle |
|---|---|
| Main | Souris |
| Attraper | Clic gauche |
| Jeter | Relâcher clic gauche |
| Extraire âme | Clic droit / E |
| Sceau de Bifrons | 1 |
| Sceau de Leraje | 2 |
| Restart | R |

## Boucle 30 secondes

1. Un villageois sort.
2. Le joueur l'attrape.
3. Il le projette.
4. Un cadavre apparaît.
5. La main extirpe l'âme.
6. Un porteur récupère le corps.
7. La fosse stocke le corps.
8. Le joueur fabrique un serviteur.
9. Les gardes menacent la fosse.

## Boucle 5 minutes

- Créer des morts.
- Neutraliser la chapelle.
- Protéger les porteurs.
- Accumuler corps et âmes.
- Fabriquer assez de serviteurs pour submerger le village.

## À ne pas faire maintenant

- Pas de 72 démons implémentés.
- Pas de campagne.
- Pas de sauvegarde.
- Pas de deckbuilding.
- Pas de map editor.
- Pas de pathfinding complexe.
- Pas de physique réaliste avancée.
