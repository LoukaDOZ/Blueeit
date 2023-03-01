const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'sessioninit',
    resave: false,
    saveUninitialized: true
}));

app.get('/', function(req, res) {
    res.redirect('/login');
});

const { loginPageHandler, loginHandler, registerPageHandler, registerHandler } = require('./routes/account');
app.route('/login').get(loginPageHandler).post(loginHandler);
app.route('/register').get(registerPageHandler).post(registerHandler);

const { topicsListPageHandler, topicsPageHandler, addTopicPageHandler, topicsHandler, messagesHandler, favoritesListPageHandler, favoritesHandler, favoritesDeleteHandler } = require('./routes/topics');
app.route('/topics').get(topicsListPageHandler);
app.route('/topics/:topicID').get(topicsPageHandler).post(messagesHandler);
app.route('/newTopic').get(addTopicPageHandler).post(topicsHandler);
app.get('/favorites/', favoritesListPageHandler);
app.post('/favorites/add/:topicID', favoritesHandler);
app.post('/favorites/remove/:topicID', favoritesDeleteHandler);

//Not found error
//Should stay as the last route
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:` + port);
});