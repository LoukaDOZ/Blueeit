var elasticSearch = require('elasticsearch');
const { Client } = require('pg');

const esClient = new elasticSearch.Client({
  host: 'blueeit_elasticsearch_1:9200'
});

const pgClient = new Client({
    user: 'postgres',
    password: 'postgres',
    host: 'blueeit_postgres_1',
    database: 'postgres',
    port: 5432
});
pgClient.connect();

const OFFSET_SIZE = 25;

function escape(str) {
    return str.replace(/[&\/\\#,+()$~%.'":*?<>{}=-]/g, " ");
}

function pgRequest(sql, values, callback) {
    pgClient.query(sql, values, (err, res) => {
        callback(err, res ? res.rows : null);
    });
}

module.exports.getUser = (username, callback) => {
    pgRequest(
        "SELECT * FROM users WHERE pseudo = $1",
        [username],
        callback
    );
};

module.exports.addUser = (username, password, callback) => {
    pgRequest(
        "INSERT INTO users (pseudo, password) VALUES ($1, $2)",
        [username, password],
        callback
    );
};

module.exports.addFavorite = (username, topicID, callback) => {
    pgRequest(
        "INSERT INTO favorites (pseudo_usr, topic_id) VALUES ($1, $2)",
        [username, topicID],
        callback
    );
};

module.exports.removeFavorite = (username, topicID, callback) => {
    pgRequest(
        "DELETE FROM favorites WHERE pseudo_usr = $1 AND topic_id = $2",
        [username, topicID],
        callback
    );
};

const getFavorites = module.exports.getFavorites = (username, callback) => {
    pgRequest(
      "SELECT topic_id FROM favorites WHERE pseudo_usr = $1",
      [username],
      callback
    );
};

module.exports.getTopicsByFavorites = (username, offset, callback) => {
    getFavorites(username, (err, res) => {
        if(err) {
            callback(err, null);
        } else {
            let topics = [];
            for(let i of res) {
                topics.push(i.topic_id)
            }
            esClient.search({
                index: 'es-topic',
                size: offset,
                body: {
                    sort : {
                        post_date : {
                            order : 'desc'
                        }
                    },
                    query: {
                        terms: {
                            _id: topics
                        }
                    }
                }
            }, (err, res) => {
                callback(err, res ? res.hits.hits : null);
            });
        }
    });
};

module.exports.getTopicsByFavoritesContent = (username, usernameSearch, contains, offset, callback) => {
    getFavorites(username, (err, res) => {
        if(err) {
            callback(err, null);
        } else {
            let topics = [];
            for(let i of res) {
                topics.push(i.topic_id)
            }
            let query = {
                bool: {
                    must: [
                        {
                            terms: {
                              _id: topics
                            }
                        }
                    ]
                }
            };

            if(contains) {
                query.bool.must.push({
                    query_string: {
                        query: '*' + escape(contains) + '*',
                        fields: [ 'title', 'description' ] 
                    }
                });
            }

            if(usernameSearch) {
                query.bool.must.push({
                    query_string: {
                        query: '*' + escape(usernameSearch) + '*',
                        default_field: 'pseudo'
                    }
                });
            }

            esClient.search({
                index: 'es-topic',
                size: offset,
                body: {
                    sort : {
                        post_date : {
                            order : 'desc'
                        }
                    },
                    query: query
                }
            }, (err, res) => {
                callback(err, res ? res.hits.hits : null);
            });
        }
    });
};

module.exports.addTopic = (username, title, description, callback) => {
    esClient.index({
        index: 'es-topic',
        refresh: true,
        body: {
            pseudo: username,
            title : title,
            description : description,
            post_date: new Date().toISOString()
        }
    }, (err, res) => {
        callback(err, res);
    });
};

module.exports.addMessage = (topic_id, username, message, callback) => {
    esClient.index({
        index: 'es-msg',
        refresh: true,
        body: {
            topic_id : topic_id,
            pseudo: username,
            message : message,
            post_date: new Date().toISOString()
        }
    }, (err, res) => {
        callback(err, res);
    });
};

module.exports.getTopics = (offset, callback) => {
    esClient.search({
        index: 'es-topic',
        size: offset,
        body: {
            sort : {
                post_date : {
                    order : 'desc'
                }
            },
            query: {
                match_all: {}
            }
        }
    }, (err, res) => {
        callback(err, res ? res.hits.hits : null);
    });
};

module.exports.getTopicByID = (id, callback) => {
    esClient.search({
        index: 'es-topic',
        body: {
            sort : {
                post_date : {
                    order : 'desc'
                }
            },
            query: {
                match: {
                    _id: id
                }
            }
        }
    }, (err, res) => {
        callback(err, res ? res.hits.hits : null);
    });
};

module.exports.getTopicsByContent = (username, contains, offset, callback) => {
    let query = {
        bool: {
            must: []
        }
    };

    if(contains) {
        query.bool.must.push({
            query_string: {
                query: '*' + escape(contains) + '*',
                fields: [ 'title', 'description' ]
            }
        });
    }

    if(username) {
        query.bool.must.push({
            query_string: {
                query: '*' + escape(username) + '*',
                default_field: 'pseudo'
            }
        });
    }

    esClient.search({
        index: 'es-topic',
        size: offset,
        body: {
            sort : {
                post_date : {
                    order : 'desc'
                }
            },
            query: query
        }
    }, (err, res) => {
        callback(err, res ? res.hits.hits : null);
    });
};

module.exports.getTopicsByUser = (username, offset, callback) => {
    esClient.search({
        index: 'es-topic',
        size: offset,
        body: {
            sort : {
                post_date : {
                    order : 'desc'
                }
            },
            query: {
                match: {
                    pseudo: username
                }
            }
        }
    }, (err, res) => {
        callback(err, res ? res.hits.hits : null);
    });
};

module.exports.getMessages = (topic_id, username, contains, offset, callback) => {
    let query = {
        bool: {
            must: [
                {
                    match: {
                        topic_id: topic_id
                    }
                }
            ]
        }
    };

    if(contains) {
        query.bool.must.push({
            query_string: {
                query: '*' + escape(contains) + '*',
                default_field: 'message'
            }
        });
    }

    if(username) {
        query.bool.must.push({
            query_string: {
                query: '*' + escape(username) + '*',
                default_field: 'pseudo'
            }
        });
    }

    esClient.search({
        index: 'es-msg',
        size: offset,
        body: {
            sort : {
                post_date : {
                    order : 'desc'
                }
            },
            query: query
        }
    }, (err, res) => {
        callback(err, res ? res.hits.hits : null);
    });
};
