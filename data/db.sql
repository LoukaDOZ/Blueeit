
/* Création des tables */
CREATE TABLE Users
(
  pseudo varchar(32) PRIMARY KEY,
  password varchar(128) NOT NULL
);

CREATE TABLE Favorites
(
  pseudo_usr varchar(32) NOT NULL,
  topic_id varchar(512) NOT NULL,
  PRIMARY KEY(pseudo_usr, topic_id),
  FOREIGN KEY (pseudo_usr) REFERENCES Users (pseudo)
);

/* Insertion des données */
INSERT INTO Users (pseudo, password)
VALUES ('Sinax', 'sha1$ef358009$1$8751aa169c88f4c40f8de55fe051b893050c5a28'),
       ('Louloukit', 'sha1$ef358009$1$8751aa169c88f4c40f8de55fe051b893050c5a28'),
       ('Sacha', 'sha1$ef358009$1$8751aa169c88f4c40f8de55fe051b893050c5a28');;

INSERT INTO Favorites (pseudo_usr, topic_id)
VALUES ('Sinax', '1'),
       ('Louloukit', '1');
