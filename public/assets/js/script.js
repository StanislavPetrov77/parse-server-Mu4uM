const PRODUCTION = false

const B4A = window.location.host === 'my4um-server.b4a.app'

const B4A_APP_ID = 'DUOfe0DIvESBzY0JgbkR7GPSHQpVeTMx6FgNFeuQ'
const B4A_JS_KEY = 'A21ayFe8LvMXaXOOVj0E1VoyieBbngjMQUTP12Sp'
const B4A_SERVER_URL = 'https://my4um-server.b4a.io'
const B4A_LIVE_QUERY_SERVER_URL = 'wss://my4um-server.b4a.io'

const LOCAL_APP_ID = 'My4uM'
const LOCAL_JS_KEY = 'JsMy4uMKey'
const LOCAL_SERVER_URL = 'http://localhost:1337/parse'
const LOCAL_LIVE_QUERY_SERVER_URL = 'ws://localhost:1337/parse'

const DEFAULT_AVATAR = '/public/assets/images/default_user.jpg'

if (B4A) {
  Parse.initialize(B4A_APP_ID, B4A_JS_KEY)
  Parse.serverURL = B4A_SERVER_URL
} else {
  Parse.initialize(LOCAL_APP_ID)
  Parse.serverURL = LOCAL_SERVER_URL
}


$(document).ready(() => {

  let admin = false

  const postFeedNode = document.getElementById('post-feed')
  const postFeedDiv = ReactDOM.createRoot(postFeedNode)

  const navbarDrop = new bootstrap.Collapse($('#navbarSupportedContent'), { toggle: false})
  const logoutLink = new bootstrap.Collapse($('#logout-link'), { toggle: false})
  const loginCard = new bootstrap.Collapse($('#login-container'), { toggle: false})
  const signupCard = new bootstrap.Collapse($('#signup-container'), { toggle: false})

  function slideMessage(message, timeOut = 6, color = 'bg-success') {
    const messageDiv = document.createElement('div')
    $(messageDiv)
      .hide()
      .html(message)
      .css('padding', '4px')
      .addClass(`text-center m-0 ${color} border-bottom border-secondary`)
      .prependTo($("#info-message-wrapper"))
      .click(function () {$(this).stop()})
      .slideDown(500)
      .delay(timeOut * 1000)
      .slideUp(500)
      .queue(function () {$(this).remove()})
  }

  function print(message) {
    if (PRODUCTION) console.log(`Message --> ${message}`)
    else {
      slideMessage(message, 10, `bg-info`)
    }
  }

  function MainApp() {
    const [user, setUser] = React.useState(null)
    const [state, setState] = React.useState('Show feed')

    React.useEffect(() => {
      // SignUp //
      $('#signup-link').click(event => {
        event.preventDefault()
        navbarDrop.hide()
        loginCard.hide()
        signupCard.show()
      })

      $('#signup-cancel').click(event => {
        event.preventDefault()
        signupCard.hide()
      })

      $('#signupForm').submit(event => {
        event.preventDefault()
        signupCard.hide()

        const newUser = new Parse.User()
        newUser.set('username', $('#signupEmail').val())
        newUser.set('password', $('#signupPassword').val())
        newUser.set('email', $('#signupEmail').val())

        newUser.signUp()
          .then(authUser)
          .catch((error) => print(`ERROR in 'signUp': ${error}`))
      })

      // LogIn //
      $('#login-link').click(event => {
        event.preventDefault()
        navbarDrop.hide()
        signupCard.hide()
        loginCard.show()
      })

      $('#login-cancel').click(event => {
        event.preventDefault()
        loginCard.hide()
      })

      $('#loginForm').submit(event => {
        event.preventDefault()
        loginCard.hide()

        Parse.User.logIn($('#loginEmail').val(), $('#loginPassword').val())
          .then(authUser)          
          .catch((error) => print(`ERROR in logIn: ${error}`))

      })

      // LogOut link
      $('#logout-link').click(event => {
        event.preventDefault()
        navbarDrop.hide()

        Parse.User.logOut()
          .then(authUser)
          .catch((error) => print(`ERROR in logOut: ${error}`))
      })

      $('#navbar-pic').click(event => { // Show collapsed menu items
        event.preventDefault()
        navbarDrop.toggle()
      })


      $('#profile-link').click(event => {
        event.preventDefault()
        setState('Profile edit')
      })

      authUser()
    }, [])

    async function authUser() {
      try {
        const { loggedUser, role } = await Parse.Cloud.run('AUTH_User')

        if (loggedUser) {
          admin = role === 'admin'

          $('#current-user').text(`User: ${loggedUser.get('username')} ${admin ? '(admin) ' : ''}`)
          logoutLink.show()
          setUser(loggedUser)
        } else {
          admin = false
          $('#current-user').text(`NOT logged in`)
          logoutLink.hide()
          setUser(null)
        }
      } catch(error) {
        print(`ERROR in authUser: ${error}`)
        Parse.User.logOut()

        admin = false
        $('#current-user').text(`NOT logged in`)
        logoutLink.hide()
        setUser(null)
      }
    }

    if (state === 'Show feed') return (<App user = { user } />)
    if (state === 'Profile edit') return (<ProfileEdit user = { user } />)

    function ProfileEdit({ user }) {
      return (
        <div className="card">
          <div className="card-header">
            <h3>Edit your profile</h3>
          </div>
          <div className="card-text">
            <Avatar avatar = {user.get('avatar')?.url() ?? DEFAULT_AVATAR} />
            <p>User name: {user.get('username')}</p>
            <p>Email: {user.get('email')}</p>
            <p>Change password:</p>
          </div>
          <div className="card-footer">
            <button className="btn btn-outline-primary" onClick={() => setState('Show feed')}>Save</button>
            <button className="btn btn-outline-danger" onClick={() => setState('Show feed')}>Cancel</button>
          </div>
        </div>
        )
    }
  }

  function timeDiff(time) { // Should be neater...
    const dateNow = Date.now()
    
    // convert from ms to min
    let diff = Math.floor((dateNow - time) / 60000)
    if (diff < 1) return `Just now`
    
    const mins = diff % 60
    diff = (diff - mins) / 60
    const hours = diff % 24
    diff = (diff - hours) / 24
    const days = diff % 31
    diff = (diff - days) / 31
    const months = diff % 12
    diff = (diff - months) /12
    const years = diff

    if      (years  > 0) return (years  + 'y' + `${months > 0 ? ' ' + months  + 'm' : ''} ago`)
    else if (months > 0) return (months + 'm' + `${days   > 0 ? ' ' + days    + 'd' : ''} ago`)
    else if (days   > 0) return (days   + 'd' + `${hours  > 0 ? ' ' + hours   + 'h' : ''} ago`)
    else if (hours  > 0) return (hours  + 'h' + `${mins   > 0 ? ' ' + mins    + 'm' : ''} ago`)
    else if (mins   > 0) return (mins   +                                            'min ago')
  }

  function Avatar({ avatar }) {
    return (
      <img 
      style={{height: '2rem', borderRadius: '50%'}}
      className="img-fluid"
      src={ avatar ?? DEFAULT_AVATAR } 
      alt="No image available"
      onError={ ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src= DEFAULT_AVATAR
      }} />
    )
  }

  function Lines(props) {
    const width = '1rem'
    const { lines, pkey } = props
    const linesArray = []

    let link = undefined
    lines.forEach((line, index) => {
      switch (line) { 
        case 0: link = '/public/assets/images/comment-none.png'; break
        case 1: link = '/public/assets/images/comment-line.png'; break
        case 2: link = '/public/assets/images/comment-branch.png'; break
        case 3: link = '/public/assets/images/comment-last.png'; break
        default: link = undefined
      }
      if (link) linesArray.push( <img style={{width: width, height: '100%'}} className="img-fluid" src={link} key = {`L_${index}_${pkey}`} /> )
    })

    return (linesArray)
  }

  // PostCard element
  function PostCard({ post, user}) {
    const [ commentArea, setCommentArea ] = React.useState(false)

    return (<>
      <div className='card rounded-1 text-start py-0 mt-0 mb-1'>
        <div className="row m-0 p-0">

          <div className='col-auto p-0 m-0'>  {/* Lines */}
            <Lines lines = {post.lines} pkey = {post.id} key = {'L_' + post.id} />
          </div>

          <div className="col p-0">
            <div className='card-header row m-0 p-0 border-secondary-subtle'>

              <div className='col-auto p-1'>  {/* Avatar */}
                  <Avatar avatar={post.avatar} key = {'A_' + post.id} />
              </div>

              <div className='col px-2 my-auto'>  {/* Author & time */}
                  <h6 className='m-0'>{post.author}</h6>
                  <p className='text-muted m-0'>{timeDiff(post.createdAt)}</p> {/* Convert to component! */}
              </div>
            </div>

            <div className="card-body px-2 py-1">  {/* Content */}
              <p className="card-text">{post.content}</p>
            </div>

            <div className='card-footer text-end m-0 p-0 border-secondary-subtle'>  {/* Footer */}
              {(!commentArea) && (user) && <button className='btn btn-sm btn-outline-primary m-1'
                onClick={() => setCommentArea(true) }>Comment
              </button>}

              {(!commentArea) && admin && <button className='btn btn-sm btn-outline-danger m-1'
                onClick={() => {
                  Parse.Cloud.run('deletePost', { toDeleteId: post.id })
                  .catch((error) => print(`Error deleting post: ${error}`))
                }}>Delete
              </button>}

              {(commentArea) && <div className='row mx-1 mb-1'>
                <textarea id='create-comment-text' className="col" placeholder = "Write a comment here..." rows="1" required
                  onChange={() => {
                    $('#create-comment-text').val() ? 
                      $('#create-comment-button').removeClass('disabled') : $('#create-comment-button').addClass('disabled')
                  }}>
                </textarea>

                <button id='create-comment-button' className='col-auto btn btn-sm btn-outline-primary ms-1 disabled'
                  onClick={() => {
                    const content = $('#create-comment-text').val()
                    $('#create-comment-text').val('')
                    setCommentArea(false)
                    Parse.Cloud.run('createPost', { parentId: post.id, content: content })
                      .catch((error) => print(`Error creating post Comment: ${error}`))
                  }}>Post comment
                </button>

                <button id='cancel-comment-button' className='col-auto btn btn-sm btn-outline-danger ms-1'
                  onClick={() => { $('#create-comment-text').val(''); setCommentArea(false) }}>Cancel
                </button>
              </div>}
            </div>

          </div>
        </div>

      </div>
    </>)
  }

  function YouHaveToLogIn () {
    return (<>
      <div className='card rounded-1 p-1 mb-1'>
        <h3 className="forecolor">Welcome to My4uM!</h3>
        <h6 className="forecolor">You have to Log In/Sign Up to be able to post here.</h6>
        <h6 className="forecolor">This is experimental, so you can use a fake email.
          <span style={{color: 'red'}}> NOTE: </span>Your posts/comments can be deleted at any time!</h6>
      </div>
    </>)
  }

  function CreateNewPost_WhatsOnYourMind(props) {
    return (<>
      <div className='row m-0 mb-1'>
        <textarea id='create-post-text' className="col" placeholder = "What's on your mind?" rows="1" required
          onChange={() => {
            ($('#create-post-text').val() === '') ? 
              $('#create-post-button').addClass('disabled') : $('#create-post-button').removeClass('disabled')
          }}
        ></textarea>

        <button id='create-post-button' className='col-auto btn btn-sm btn-outline-light ms-1 disabled'
          onClick={() => {
            const content = $('#create-post-text').val()
            if (content) {
              $('#create-post-text').val('')
              Parse.Cloud.run('createPost', { content: content })
                .catch((error) => print(`Error creating FIRST post: ${error}`))
            }
          }}
        >Create post</button>
      </div>
    </>)
  }

  function ThereAreNoPostsYet() {
    return (
      <div className='card rounded-1 mb-1'>
        <h1 className='m-5'>There are no posts yet!</h1>
      </div>)
  }

  function YouCanBeTheFirstToPostHere() {
    return (<>
      <div className='row mx-0 my-3'>
        <textarea id='create-post-text' className='col' onChange={() => {
          ($('#create-post-text').val() === '') ? 
            $('#create-post-button').addClass('disabled') : $('#create-post-button').removeClass('disabled')
        }} placeholder='You can be the first to posts here!' rows='2' required></textarea>

        <button id='create-post-button' className='col-auto btn btn-outline-light ms-1 disabled'
          onClick={() => {
            const content = $('#create-post-text').val()
            if (content) {
              $('#create-post-text').val('')
              Parse.Cloud.run('createPost', { content: content })
                // .then(() => reloadFeed())
                .catch((error) => print(`Error creating post NoPostsYet: ${error}`))
            }
          }
        }>Create post</button>
      </div>
    </>)
  }

  function FooterCopyright () {
    return (<>
      <div className='card rounded-1 mb-1'>
        <h6 className="my-1 forecolor">&copy; Copyright 2023 Stanislav Petrov</h6>
      </div>
    </>)
  }

  function App({ user }) {
    const [MainFeed, setMainFeed] = React.useState([])
    const [state, setState] = React.useState('Loading')

    React.useEffect(() => {
      fetchFeed()
        .then(() => setState('Loaded'))
        .then(liveQuery)
    }, [user])

    async function fetchFeed() {
      try {
        const feed = await Parse.Cloud.run('queryPosts')
        setMainFeed(feed.map(post => <PostCard post = {post} user = {user} key = {post.id} />))
      }
      catch(error) { console.log(`Error in fetchFeed: ${error}`) }
    }
  
    function liveQuery() {
      const liveQueryClient = new Parse.LiveQueryClient({
        applicationId: B4A ? B4A_APP_ID : LOCAL_APP_ID,
        javascriptKey: B4A ? B4A_JS_KEY : LOCAL_JS_KEY,
        serverURL: B4A ? B4A_LIVE_QUERY_SERVER_URL : LOCAL_LIVE_QUERY_SERVER_URL,
      })
      liveQueryClient.open()
      const subscription = liveQueryClient.subscribe(new Parse.Query('Posts').descending('createdAt').limit(100))
      subscription.on('create', fetchFeed)
      subscription.on('delete', fetchFeed)
    }

    if (state === 'Loaded')
    return (<>
      {(!user) && <YouHaveToLogIn />}
      {(MainFeed.length < 1) && <ThereAreNoPostsYet />}
      {(user) && (MainFeed.length < 1) && <YouCanBeTheFirstToPostHere />}
      {(user) && (MainFeed.length > 0) && <CreateNewPost_WhatsOnYourMind />}
      {(MainFeed.length > 0) && <>{ MainFeed }</>}
      <FooterCopyright />
    </>)
    if (state === 'Loading')
    return (<>
      <h1 style={{color: 'white', marginTop: '200px'}}>Loading...</h1>
      <div className="spinner-border" style={{color: 'white', width: '3rem', height: '3rem', role: 'status'}}></div>
      <FooterCopyright />
    </>)
  }
  postFeedDiv.render(<MainApp />)

}) // document.ready


// function delay(delayTime) { return new Promise(resolve => setTimeout(resolve, delayTime)) }
