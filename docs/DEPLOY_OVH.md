# Déploiement OVH / Apache

Le projet produit un dossier statique `dist/`.

## Build

```bash
npm install
npm run build
```

## Exemple de déploiement manuel

```bash
rsync -avz --delete ./dist/ user@nitro.sterenna.fr:/var/www/goetia_v2/dist/
```

## Vhost Apache exemple

```apache
<VirtualHost *:80>
    ServerName goetia.nitro.sterenna.fr
    DocumentRoot /var/www/goetia_v2/dist

    <Directory /var/www/goetia_v2/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

Puis :

```bash
sudo a2ensite goetia_v2
sudo systemctl reload apache2
sudo certbot --apache -d goetia.nitro.sterenna.fr
```

## Vite base

Comme le jeu est prévu à la racine d'un sous-domaine, `base: '/'` suffit dans `vite.config.ts`.
