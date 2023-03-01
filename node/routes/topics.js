const db = require('./../db');
const passwordHash = require('password-hash');
const DEFAULT_OFFSET = 25;

function offsetValidity(offset) {
    let i = parseInt(offset);
    return (offset == i && i > 0);
}

function usernameValidity(username) {
    return (username.length >= 3 && username.length <= 32);
}

function usernameSearchValidity(username) {
    return (username.length >= 1 && username.length <= 32);
}

function titleValidity(title) {
    return (title.length > 0 && title.length <= 128);
}

function descriptionValidity(description) {
    return (description.length > 0 && description.length <= 256);
}

function topicSearchValidity(topicSearch) {
    return (topicSearch.length > 0 && topicSearch.length <= 256);
}

function messageValidity(message) {
    return (message.length >= 1 && message.length <= 256);
}

function messageContainsValidity(contains) {
    return (contains.length > 0 && contains.length <= 256);
}

function isUserConnected(req) {
    return req.session.username;
}

function dateNumberFormated(num) {
    return (num < 10 ? '0' + num : num);
}

function dateConvert(date) {
    let d = new Date(date);
    return dateNumberFormated(d.getDate()) + "/" + dateNumberFormated(d.getMonth() + 1) + "/" + d.getFullYear() + " " + dateNumberFormated(d.getHours()) + ":" + dateNumberFormated(d.getMinutes()) + ":" + dateNumberFormated(d.getSeconds());
}

module.exports.addTopicPageHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    res.render('add_topic', {
        page: 'newTopic'
    });
}

module.exports.topicsListPageHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let topicSearch = req.query.search || "";
    let username = req.query.username || "";
    let offset = req.query.offset || DEFAULT_OFFSET;
    let validity;
    let errors = [];
    let returnError = () => {
        res.render('topics', {
            errors: errors,
            values: {
                username: username,
                search: topicSearch
            },
            offset: {
                current: offset,
                next: offset + DEFAULT_OFFSET
            },
            page: 'topics'
        });
    };

    if(!offsetValidity(offset))
        offset = DEFAULT_OFFSET;
    else
        offset = parseInt(offset);

    if(topicSearch) {
        if(!topicSearchValidity(topicSearch))
            errors.push("La recherche de topic doit être comprise entre 1 et 256 caractères");
    }

    if(username) {
        if(!usernameSearchValidity(username))
            errors.push("La recherche de pseudo doit être comprise entre 1 et 32 caractères");
    }

    if(errors.length > 0) {
        returnError();
        return;
    }

    db.getFavorites(req.session.username, (err, result1) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else {
            if(!topicSearch && !username) {
                db.getTopics(offset, (err, result) => {
                    if(err) {
                        console.log(err);
                        errors.push("Une erreur interne est servenue");
                        returnError();
                    } else {
                        let topics = [];
                        for(let i of result) {
                            i._source.id = i._id;
                            i._source.post_date = dateConvert(i._source.post_date);

                            for(let j of result1) {
                                if(j.topic_id == i._source.id) {
                                    i._source.isFavorite = true;
                                    break;
                                }
                            }

                            topics.push(i._source);
                        }

                        res.render('topics', {
                            topics: topics,
                            offset: {
                                current: offset,
                                next: offset + DEFAULT_OFFSET
                            },
                            page: 'topics'
                        });
                    }
                });
            } else {
                db.getTopicsByContent(username, topicSearch, offset, (err, result) => {
                    if(err) {
                        console.log(err);
                        errors.push("Une erreur interne est servenue");
                        returnError();
                    } else {
                        let topics = [];
                        for(let i of result) {
                            i._source.id = i._id;
                            i._source.post_date = dateConvert(i._source.post_date);

                            for(let j of result1) {
                                if(j.topic_id == i._source.id) {
                                    i._source.isFavorite = true;
                                    break;
                                }
                            }
                            
                            topics.push(i._source);
                        }

                        res.render('topics', {
                            topics: topics,
                            values: {
                                username: username,
                                search: topicSearch
                            },
                            offset: {
                                current: offset,
                                next: offset + DEFAULT_OFFSET
                            },
                            page: 'topics'
                        });
                    }
                });
            }
        }
    });
};

module.exports.topicsPageHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let username = req.query.username || "";
    let contains = req.query.contains || "";
    let offset = req.query.offset || DEFAULT_OFFSET;
    let validity;
    let errors = [];
    let topic;
    let returnError = () => {
        res.render('messages', {
            errors: errors,
            values: {
                username: username,
                contains: contains
            },
            offset: {
                current: offset,
                next: offset + DEFAULT_OFFSET
            },
            topic: topic
        });
    };
    
    if(!offsetValidity(offset))
        offset = DEFAULT_OFFSET;
    else
        offset = parseInt(offset);

    db.getFavorites(req.session.username, (err, result0) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else {
            db.getTopicByID(topicID, (err, result1) => {
                if(err) {
                    console.log(err);
                    errors.push("Une erreur interne est servenue");
                    returnError();
                } if(result1.length === 0) {
                    errors.push("Le topic n'existe pas");
                    returnError();
                } else {
                    result1[0]._source.id = result1[0]._id;
                    result1[0]._source.post_date = dateConvert(result1[0]._source.post_date);
                    topic = result1[0]._source;

                    for(let i of result0) {
                        if(i.topic_id == topic.id) {
                            topic.isFavorite = true;
                            break;
                        }
                    }

                    if(username) {
                        if(!usernameSearchValidity(username))
                            errors.push("La recherche de pseudo doit être comprise entre 1 et 32 caractères");
                    }

                    if(contains) {
                        if(!messageContainsValidity(contains))
                            errors.push("La recherche de message doit être comprise entre 1 et 256 caractères");
                    }

                    if(errors.length > 0) {
                        returnError();
                        return;
                    }

                    db.getMessages(topicID, username, contains, offset, (err, result) => {
                        if(err) {
                            console.log(err);
                            errors.push("Une erreur interne est servenue");
                            returnError();
                        } else {
                            let messages = [];
                            for(let i of result) {
                                i._source.post_date = dateConvert(i._source.post_date);
                                messages.push(i._source);
                            }

                            res.render('messages', {
                                topic: topic,
                                values: {
                                    username: username,
                                    contains: contains
                                },
                                offset: {
                                    current: offset,
                                    next: offset + DEFAULT_OFFSET
                                },
                                messages: messages
                            });
                        }
                    });
                }
            });
        }
    });
};

module.exports.topicsHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let title = (req.body.title || "").trim();
    let description = (req.body.description || "").trim();
    let errors = [];
    let returnError = () => {
        res.render('add_topic', {
            errors: errors,
            values: {
                title: title,
                description: description,
            },
            page: 'newTopic'
        });
    };

    if(!titleValidity(title))
        errors.push("La taille du titre doit être comprise entre 1 et 128 caractères");

    if(!descriptionValidity(description))
        errors.push("La taille de la description doit être comprise entre 1 et 256 caractères");

    if(errors.length > 0) {
        returnError();
        return;
    }

    db.addTopic(req.session.username, title, description, (err, result) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else
            res.redirect('/topics');
    });
};

module.exports.messagesHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let message = (req.body.message || "").trim();
    let errors = [];
    let topic;
    let returnError = () => {
        res.render('messages', {
            errors: errors,
            values: {
                message: message
            },
            topic: topic
        });
    };

    if(!topicID) {
        errors.push("No topic ID given");
        returnError();
        return;
    }

    db.getTopicByID(topicID, (err, result) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } if(result.length === 0) {
            errors.push("Le topic n'existe pas");
            returnError();
        }  else {
            result[0]._source.id = result[0]._id;
            result[0]._source.post_date = dateConvert(result[0]._source.post_date);
            topic = result[0]._source;

            if(!messageValidity(message)) {
                errors.push("La taille du message doit être comprise entre 1 et 256 caractères");
                returnError();
                return;
            }

            db.addMessage(topicID, req.session.username, message, (err, result) => {
                if(err) {
                    console.log(err);
                    errors.push("Une erreur interne est servenue");
                    returnError();
                } else
                    res.redirect('/topics/' + topicID);
            });
        }
    });
};

module.exports.favoritesListPageHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let topicSearch = req.query.search || "";
    let username = req.query.username || "";
    let offset = req.query.offset || DEFAULT_OFFSET;
    let validity;
    let errors = [];
    let returnError = () => {
        res.render('favorites', {
            errors: errors,
            values: {
                username: username,
                search: topicSearch
            },
            offset: {
                current: offset,
                next: offset + DEFAULT_OFFSET
            },
            page: 'favorites'
        });
    };
    
    if(!offsetValidity(offset))
        offset = DEFAULT_OFFSET;
    else
        offset = parseInt(offset);

    if(topicSearch) {
        if(!topicSearchValidity(topicSearch))
            errors.push("La recherche de topic doit être comprise entre 1 et 256 caractères");
    }

    if(username) {
        if(!usernameSearchValidity(username))
            errors.push("La recherche de pseudo doit être comprise entre 1 et 32 caractères");
    }

    if(errors.length > 0) {
        returnError();
        return;
    }

    db.getFavorites(req.session.username, (err, result1) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else {
            if(!topicSearch && !username) {
                db.getTopicsByFavorites(req.session.username, offset, (err, result) => {
                    if(err) {
                        console.log(err);
                        errors.push("Une erreur interne est servenue");
                        returnError();
                    } else {
                        let topics = [];
                        for(let i of result) {
                            i._source.id = i._id;
                            i._source.post_date = dateConvert(i._source.post_date);

                            for(let j of result1) {
                                if(j.topic_id == i._source.id) {
                                    i._source.isFavorite = true;
                                    break;
                                }
                            }

                            topics.push(i._source);
                        }

                        res.render('favorites', {
                            topics: topics,       
                            offset: {
                                current: offset,
                                next: offset + DEFAULT_OFFSET
                            },
                            page: 'favorites'
                        });
                    }
                });
            } else {
                db.getTopicsByFavoritesContent(req.session.username, username, topicSearch, offset, (err, result) => {
                    if(err) {
                        console.log(err);
                        errors.push("Une erreur interne est servenue");
                        returnError();
                    } else {
                        let topics = [];
                        for(let i of result) {
                            i._source.id = i._id;
                            i._source.post_date = dateConvert(i._source.post_date);

                            for(let j of result1) {
                                if(j.topic_id == i._source.id) {
                                    i._source.isFavorite = true;
                                    break;
                                }
                            }
                            
                            topics.push(i._source);
                        }

                        res.render('favorites', {
                            topics: topics,
                            values: {
                                username: username,
                                search: topicSearch
                            },
                            offset: {
                                current: offset,
                                next: offset + DEFAULT_OFFSET
                            },
                            page: 'favorites'
                        });
                    }
                });
            }
        }
    });
};

module.exports.favoritesHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let redirect = (req.query.redirect || "").trim();
    let returnError = () => {
        res.redirect('/topics');
    };

    if(!topicID) {
        returnError();
        return;
    }

    db.getTopicByID(topicID, (err, result) => {
        if(err) {
            console.log(err);
            res.redirect(redirect);
        } if(result.length === 0) {
            res.redirect(redirect);
        }  else {
            db.getFavorites(req.session.username, (err, result1) => {
                if(err) {
                    console.log(err);
                    res.redirect(redirect);
                } if(result.length === 0) {
                    res.redirect(redirect);
                }  else {
                    let isFavorite = false;
                    for(let i of result1) {
                        if(i.topic_id == topicID) {
                            isFavorite = true;
                            break;
                        }
                    }

                    if(isFavorite) {
                        res.redirect(redirect);
                        return;
                    }

                    db.addFavorite(req.session.username, topicID, (err, result) => {
                        if(err) {
                            console.log(err);
                            res.redirect(redirect);
                        } else
                            res.redirect(redirect);
                    });
                }
            });
        }
    });
};

module.exports.favoritesDeleteHandler = (req, res) => {
    if(!isUserConnected(req)) {
        res.redirect('/login');
        return;
    }

    let topicID = req.params.topicID || "";
    let redirect = (req.query.redirect || "").trim();
    let returnError = () => {
        res.redirect('/topics');
    };

    if(!topicID) {
        returnError();
        return;
    }

    if(!redirect.includes("topics") && !redirect.includes("favorites")) {
        returnError();
        return;
    }

    db.getTopicByID(topicID, (err, result) => {
        if(err) {
            console.log(err);
            res.redirect(redirect);
        } if(result.length === 0) {
            res.redirect(redirect);
        }  else {
            db.getFavorites(req.session.username, (err, result1) => {
                if(err) {
                    console.log(err);
                    res.redirect(redirect);
                } if(result.length === 0) {
                    res.redirect(redirect);
                }  else {
                    let isFavorite = false;
                    for(let i of result1) {
                        if(i.topic_id == topicID) {
                            isFavorite = true;
                            break;
                        }
                    }

                    if(!isFavorite) {
                        res.redirect(redirect);
                        return;
                    }

                    db.removeFavorite(req.session.username, topicID, (err, result) => {
                        if(err) {
                            console.log(err);
                            res.redirect(redirect);
                        } else
                            res.redirect(redirect);
                    });
                }
            });
        }
    });
};
