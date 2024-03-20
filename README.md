# Blueeit

A Reddit like web app with Big Data and NoSQL databases (MongoDB & Elasticsearch)

Authors : Guillaume Descroix - Louka Doz

## Usage

The project needs the following packages :
- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Then, the project can be cloned :
```bash
git clone https://github.com/LoukaDOZ/Blueeit.git
```

Finally, use the following command to start the project :
```bash
cd ./Blueeit/
make run
```

Project running on http://localhost:3000!

### Makefile

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `make run`         | Run demo project             |
| `make bluid`       | Build containers             |
| `make start`       | Start project                |
| `make stop`        | Stop project                 |
| `make clean`       | Remove images and volumes    |
| `make set_es_data` | Prepare Elasticsearch volume |
| `make db-install`  | Populate PostgreSQL          |
| `make es-install`  | Populate Elasticsearch       |

## Screenshots

### Login page
![Capture d’écran du 2024-03-13 11-56-12](https://github.com/LoukaDOZ/Blueeit/assets/46566140/0294a91f-a80d-497f-b349-830c5ffad4a5)

### Register page
![Capture d’écran du 2024-03-13 11-56-58](https://github.com/LoukaDOZ/Blueeit/assets/46566140/424c94b5-6c76-4798-b214-a6b5bf5b83ad)

### Create topic page
![Capture d’écran du 2024-03-13 11-58-32](https://github.com/LoukaDOZ/Blueeit/assets/46566140/558f0c0d-b340-4fec-b5d5-8dcaf6c34065)

### Topics page
![Capture d’écran du 2024-03-13 12-13-19](https://github.com/LoukaDOZ/Blueeit/assets/46566140/0ad72fac-786a-4933-9cce-08d0af496291)

### Topic comments page
![Capture d’écran du 2024-03-13 12-19-00](https://github.com/LoukaDOZ/Blueeit/assets/46566140/f12b1a75-c8d2-4f21-86e9-5cbc2348ab05)

### Favorite topics page
![Capture d’écran du 2024-03-13 12-13-24](https://github.com/LoukaDOZ/Blueeit/assets/46566140/29b0f97b-6a9b-450d-8f0f-6434b44e8cd7)

