const db = require('./../db');
const passwordHash = require('password-hash');

function usernameValidity(username) {
    return (username.length >= 3 && username.length <= 32);
}

function passwordValidity(password) {
    return (password.length >= 8 && password.length <= 32);
}

module.exports.loginPageHandler = (req, res) => {
    res.render('login', {
        page: 'login'
    });
};

module.exports.loginHandler = (req, res) => {
    let username = (req.body.username || "").trim();
    let password = (req.body.password || "").trim();
    let errors = [];
    let returnError = () => {
        res.render('login', {
            errors: errors,
            values: {
                username: username
            },
            page: 'login'
        });
    };

    if(!usernameValidity(username))
        errors.push("La taille du pseudo doit être comprise entre 3 et 32 caractères");

    if(!passwordValidity(password))
        errors.push("La taille du mot de passe doit être comprise entre 8 et 32 caractères");

    if(errors.length > 0) {
        returnError();
        return;
    }

    db.getUser(username, (err, result) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else if(result.length === 0 || result[0].pseudo !== username || !passwordHash.verify(password, result[0].password)) {
            errors.push("Identifiants invalides");
            returnError();
        } else {
            req.session.username = username;
            res.redirect('/topics');
        }
    });
};

module.exports.registerPageHandler = (req, res) => {
    res.render('register', {
            page: 'register'
        });
};

module.exports.registerHandler = (req, res) => {
    let username = (req.body.username || "").trim();
    let password = (req.body.password || "").trim();
    let confirmPassword = (req.body['confirm-password'] || "").trim();
    let errors = [];
    let returnError = () => {
        res.render('register', {
            errors: errors,
            values: {
                username: username
            },
            page: 'register'
        });
    };

    if(!usernameValidity(username))
        errors.push("La taille du pseudo doit être comprise entre 3 et 32 caractères");

    if(!passwordValidity(password))
        errors.push("La taille du mot de passe doit être comprise entre 8 et 32 caractères");

    if(!passwordValidity(confirmPassword))
        errors.push("La taille du mot de passe de confirmation doit être comprise entre 8 et 32 caractères");

    if(password !== confirmPassword)
        errors.push("Le mot de passe et le mot de passe de confirmation ne correspondent pas");

    if(errors.length > 0) {
        returnError();
        return;
    }

    db.getUser(username, (err, result) => {
        if(err) {
            console.log(err);
            errors.push("Une erreur interne est servenue");
            returnError();
        } else if(result.length > 0) {
            errors.push("Ce pseudo existe déjà");
            returnError();
        } else {
           db.addUser(username, passwordHash.generate(password), (err, result) => {
                if(err) {
                    console.log(err);
                    errors.push("Une erreur interne est servenue");
                    returnError();
                } else
                   res.redirect('/login');
            });
        }
    });
};