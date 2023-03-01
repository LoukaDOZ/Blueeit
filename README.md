# Projet-NOSQL

Auteurs : Guillaume Descroix - Louka Doz

## Installation de notre application

Les seuls package nécéssaires à installer sur votre machine son **docker** et **docker-compose** :

- [Install Docker](https://docs.docker.com/install/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

Une fois installés, vous pouvez clonner le projet sur votre machine :

- `git clone https://gitlab.pedago.ensiie.fr/guillaume.descroix/projet-nosql.git `
- `cd projet-nosql`

Vous pouvez désormais lancer l'installation :

- `make install`
- Le projet tourne sur [http:localhost:3000](http:localhost:3000) !

Quelques commandes utiles :

- `make stop` Stop les conteneurs
- `make start` Démarre les conteneurs
- `make db.connect` Permet la connexion à la base de données Postgres
- `make install` Reinstalle tous les conteneurs

