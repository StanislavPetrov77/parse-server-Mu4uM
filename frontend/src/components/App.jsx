import { useState, useEffect } from 'react'
import tsm from './tsm'
import * as defs from './definitions'
import Nav from './Nav'
import Wallpaper from './Wallpaper'
import Form from './Form'
import Loading from './Loading'
import PleaseLogIn from './PleaseLogin'
import NoPostsYet from './NoPostsYet'
import CreatePost from './CreatePost'
import Post from './Post'
import Footer from './Footer'

export default function App() {
  const [parseReady, setParseReady] = useState(false)
  const [user, setUser] = useState(null)
  const [postsReady, setPostsReady] = useState(false)
  const [activeForm, setActiveForm] = useState(null)
  const [feed, setFeed] = useState([])

  const liveQueryClient = new Parse.LiveQueryClient({
    applicationId: defs.B4A ? defs.B4A_APP_ID : defs.LOCAL_APP_ID,
    javascriptKey: defs.B4A ? defs.B4A_JS_KEY : defs.LOCAL_JS_KEY,
    serverURL: defs.B4A ? defs.B4A_LIVE_QUERY_SERVER_URL : defs.LOCAL_LIVE_QUERY_SERVER_URL,
  })

  async function authUser() {
    return Parse.Cloud.run('AUTH_User').then(setUser)
  }

  useEffect(() => {

    Parse.initialize(defs.B4A ? defs.B4A_APP_ID : defs.LOCAL_APP_ID, defs.B4A ? defs.B4A_JS_KEY : defs.LOCAL_JS_KEY)
    Parse.serverURL = defs.B4A ? defs.B4A_SERVER_URL : defs.LOCAL_SERVER_URL
    // Parse.serverURL = '/parse'

    setParseReady(true)
    authUser().then(() => openLiveQuery()).catch(tsm)

    
    return () => { closeLiveQuery(); setParseReady(false) }
  }, [])



  async function getPosts() {
    return Parse.Cloud.run('queryPosts').then(setFeed)
  }

  useEffect(() => {
    setActiveForm(null)
    getPosts().then(() => setPostsReady(true)).catch(tsm)
    return () => setPostsReady(false)
  }, [user])


  function submitForm(e, username, password) {
    e.preventDefault()
    // setActiveForm(null)
    if (activeForm === 'Log In') Parse.User.logIn(username, password).then(authUser).catch(tsm)
    if (activeForm === 'Sign Up') Parse.User.signUp(username, password).then(authUser).catch(tsm)
  }

  function logOut(e) {
    e.preventDefault()
    // setActiveForm(null)
    Parse.User.logOut().then(authUser).catch(tsm)
  }


  function openLiveQuery() {
    liveQueryClient.open()
    const subscription = liveQueryClient.subscribe(new Parse.Query('Posts').descending('createdAt').limit(100))
    subscription.on('create', getPosts)
    subscription.on('delete', getPosts)
  }

  function closeLiveQuery() {
    liveQueryClient.close()
  }

  return <>
    <Nav user={ user } setActiveForm={ setActiveForm } logOut={ logOut } />
    <Wallpaper src={'/assets/images/wallpaper-05.jpg'} />
    { activeForm && <Form user={ user } activeForm={ activeForm } setActiveForm={ setActiveForm } submitForm={ submitForm } /> }
    { parseReady
      ? postsReady
        ? <>
            { user ? <CreatePost /> : <PleaseLogIn /> }
            { feed.length ?  feed.map(p => <Post post={ p } user={ user } key={ p.id } />) : <NoPostsYet /> }
          </>
        : <Loading msg={ 'Loading...' } />
      : <Loading msg={ 'Connecting...' } />
    }
    <Footer />
  </>
}





async function SLEEP(ms) {
  // tsm(`SLEEP!`)
  return new Promise(resolve => setTimeout(resolve, ms));
}