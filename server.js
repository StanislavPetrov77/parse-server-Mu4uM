if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const { ParseServer } = require('parse-server')
const ParseDashboard = require('parse-dashboard')

const { parse } = require('path')

// const S3Adapter = require('parse-server').S3Adapter
const path = require('path')
// const { nextTick } = require('process')

const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI

// if (!databaseUri) {
// 	console.log('DATABASE_URI not specified, falling back to localhost.')
// }

const server = new ParseServer({
	//**** General Settings ****//

	allowExpiredAuthDataToken: false,
	sessionLength: process.env.SESSION_LENGTH || 31536000,
	expireInactiveSessions: true,

	directAccess: false,
	enforcePrivateUsers : false,
	enableAnonymousUsers : false, //????

	databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
	cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
	serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
	
	//**** Security Settings ****//
	allowClientClassCreation: process.env.CLIENT_CLASS_CREATION || false, 
	appId: process.env.APP_ID || 'myAppId',
	masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!	
	
	//**** Live Query ****//
	// liveQuery: {
	// 	classNames: ["TestObject", "Place", "Team", "Player", "ChatMessage"] // List of classes to support for query subscriptions
	// },

	//**** Email Verification ****//
	/* Enable email verification */
	verifyUserEmails: false,
	/* The public URL of your app */
	// This will appear in the link that is used to verify email addresses and reset passwords.
	/* Set the mount path as it is in serverURL */
	publicServerURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
	/* This will appear in the subject and body of the emails that are sent */
	appName: process.env.APP_NAME || "ParseServer", 

	// emailAdapter: {
	// 	module: 'parse-server-simple-mailgun-adapter',
	// 	options: {
	// 		fromAddress: process.env.EMAIL_FROM || "test@example.com",
	// 		domain: process.env.MAILGUN_DOMAIN || "example.com",
	// 		apiKey: process.env.MAILGUN_API_KEY  || "apikey"
	// 	}
	// },
	
	//**** File Storage ****//
	// filesAdapter: new S3Adapter(
	// 	{
	// 		directAccess: true
	// 	}
	// )
})

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

// const dashboard = new ParseDashboard({
// 	apps: [
// 	  {
// 		serverURL: process.env.SERVER_URL,
// 		appId: process.env.APP_ID,
// 		masterKey: process.env.MASTER_KEY,
// 		appName: process.env.APP_NAME
// 	  }
// 	],
// 	users: [
// 	  {
// 		user: process.env.ADMIN_USER,
// 		pass: process.env.ADMIN_PASSWORD,
// 		apps: [
// 		  {
// 			appId: process.env.APP_ID
// 		  }
// 		]
// 	  }
// 	]
  
//   }, { allowInsecureHTTP: true })

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))


// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse'
app.use(mountPath, server)
// app.use('/dashboard', dashboard)


app.get('/', (req, res) => res.render('index'))

// 404 Error ----------------
app.get('*', (req, res) => res.status(404).send('Error 404. Not found on this server.'))


const port = process.env.PORT || 1337
const httpServer = require('http').createServer(app)
httpServer.listen(port, () => {
	console.log(`Mu4uM running on port: ${port}.`)
})

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer)

