const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const config = require('./config/key');
const {auth} = require('./middleware/auth');
const port = process.env.PORT || 5000;

const User = require('./models/User');

app.use(express.json());
app.use(cookieParser());
app.use(cors());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log('DB connected'))
.catch(err => console.error(err));

app.get('/api/user/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req._id,
        isAuth: true,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
    });
});

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);

    user.save()
        .then(() => res.status(200).json({ success: true, user }))
        .catch(err => res.status(400).json({ success: false, err }));
});

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) return res.json({
            loginSuccess: false,
            message: 'User not found'
        });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({
                loginSuccess: false,
                message: 'Incorrect password'
            })
        })

        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);

            res.cookie('x_auth', user.token).status(200).json({
                loginSuccess: true,
                userId: user._id,
                user
            });
        });
    });
});

app.get('/api/user/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {token: ''}, (err, doc) => {
        if (err) res.json({ success: false, err});
        return res.status(200).send({
            success: true
        });
    });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
    });
};

app.listen(port);