// require modules
const express = require('express')
const path = require('path')

const Parse = require('parse/node')
Parse.serverURL = 'https://my4um-server.b4a.io'
Parse.initialize(process.env.APP_ID, process.env.JS_KEY, process.env.MASTER_KEY)

app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Serve static assets from the /dist folder
app.use('/', express.static(path.join(__dirname, './dist')))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/../../data-public/index.html')))
