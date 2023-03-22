// require modules
const express = require('express')
const path = require('path')

const Parse = require('parse/node')
Parse.serverURL = 'https://my4um-server.b4a.io'
Parse.initialize(process.env.APP_ID, process.env.JS_KEY, process.env.MASTER_KEY)

// Set up the views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({extended: false})); 
app.use(express.json());

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/../../data-public')))

app.get('/', (req, res) => res.render('index'))
