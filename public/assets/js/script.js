const B4A = window.location.host === 'my4um-server.b4a.app'

const B4A_APP_ID = 'DUOfe0DIvESBzY0JgbkR7GPSHQpVeTMx6FgNFeuQ'
const B4A_SERVER_URL = 'https://my4um-server.b4a.io'
const B4A_LIVE_QUERY_SERVER_URL = 'wss://my4um-server.b4a.io'
const B4A_JS_KEY = 'A21ayFe8LvMXaXOOVj0E1VoyieBbngjMQUTP12Sp'

const LOCAL_APP_ID = 'My4uM'
const LOCAL_SERVER_URL = 'http://localhost:1337/parse'
const LOCAL_LIVE_QUERY_SERVER_URL = 'ws://localhost:1337/parse'
const LOCAL_JS_KEY = 'JsMy4uMKey'

const PRODUCTION = false
const DEFAULT_AVATAR = './public/assets/images/default_user.jpg'

if (B4A) {
  Parse.initialize(B4A_APP_ID, B4A_JS_KEY)
  Parse.serverURL = B4A_SERVER_URL
} else {
  Parse.initialize(LOCAL_APP_ID)
  Parse.serverURL = LOCAL_SERVER_URL
}


$(document).ready(() => {

  const postFeedNode = document.getElementById('post-feed')
  const posFeedDiv = ReactDOM.createRoot(postFeedNode)
  let admin, currentUser

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

  async function authUser() {
    try {
      const { isLoggedIn } = await Parse.Cloud.run("isLoggedIn")

      if (isLoggedIn) {
        currentUser = Parse.User.current()
        const query = await new Parse.Query(Parse.Role).equalTo('users', currentUser).find()
        for (const role of query) {if (role.get('name') === 'admin') admin = true}
        $('#current-user').text(`Logged in as: ${currentUser.get('username')} ${admin ? '(admin) ' : ''}`)
      } else {
        admin = undefined
        currentUser = undefined
        $('#current-user').text(`NOT logged in`)
      }
    } catch(error) {
      print(`ERROR in the catch in isLoggedIn scripts.js! ${error}`)
      Parse.User.logOut()
    }
  }

  // SignUp //
  $("#signupForm").submit((event) => {
    event.preventDefault()

    const newUser = new Parse.User()
    newUser.set('username', $('#signupEmail').val())
    newUser.set('password', $('#signupPassword').val())
    newUser.set('email', $('#signupEmail').val())

    newUser.signUp()
      .then(() => window.location.replace('/'))
      .catch((error) => print(`ERROR in 'signUp()': ${error}`))
    })

  // LogIn //
  $("#loginForm").submit((event) => {
    event.preventDefault()

    Parse.User.logIn($('#loginEmail').val() ?? '', $('#loginPassword').val() ?? '')
      .then(() => window.location.replace('/'))
      .catch((error) => print(`ERROR in 'logIn()': ${error}`))
  })

  // LogOut link
  $('#logout-link').click((event) => {
    event.preventDefault()
    admin = undefined
    currentUser = undefined
    Parse.User.logOut()
      .then(() => window.location.replace('/'))
      .catch((error) => print(`ERROR in logOut: ${error}`))
  })

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

  function Avatar(props) {
    return (
      <img 
      style={{height: '2rem', borderRadius: '50%'}}
      className="img-fluid"
      src={props.avatar} 
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
  function PostCard(props) {
    const { post } = props
    const [ showComments, setShowComments ] = React.useState(true)
    const [ commentArea, setCommentArea ] = React.useState(false)
    let comments = post.comments

    return (<>
      <div className='post-card-element card rounded-1 text-start py-0 mt-0 mb-1'>
        <div className="row m-0 p-0">

          <div className='col-auto p-0 m-0'>
            <Lines lines = {post.lines} pkey = {post.id} key = {'L_' + post.id} />
          </div>

          <div className="col p-0">
            <div className='card-header row m-0 p-0 border-secondary-subtle'>

              <div className='col-auto p-1'>
                  <Avatar avatar={post.avatar} key = {'A_' + post.id} />
              </div>

              <div className='col px-2 my-auto'>
                  <h6 className='m-0'>{post.author}</h6>
                  <p className='text-muted m-0'>{timeDiff(post.createdAt)}</p> {/* Create as component */}
              </div>
            </div>

            <div className="card-body px-2 py-1">
              <p className="card-text">{post.content}</p>
            </div>

            <div className='card-footer text-end row m-0 p-0 border-secondary-subtle'>
              <div className='text-muted m-0 p-0 d-inline'>
                {/* {(comments.length > 0) && (!showComments) &&
                  <button className='btn btn-sm btn-primary m-1' onClick={() => {
                    setShowComments(true) }}>View {comments.length} comment(s)</button>}

                {(comments.length > 0) && (showComments) &&
                  <button className='btn btn-sm btn-primary m-1' onClick={() => {
                    setShowComments(false) }}>Hide {comments.length} comment(s)</button>} */}

                {(!commentArea) && (currentUser) && <button className='btn btn-sm btn-outline-primary m-1' onClick={() => {
                  setCommentArea(true)
                }}>Comment</button>}

                {(!commentArea) && admin && <button className='btn btn-sm btn-outline-danger m-1'
                  onClick={() => {
                    Parse.Cloud.run('deletePost', { toDeleteId: post.id })
                    .catch((error) => print(`Error deleting post: ${error}`))
                  }}
                >Delete</button>}
              </div>
            </div>

            {(commentArea) && <div className='row mx-1 mb-1'>
              <textarea id='create-comment-text' className="col" placeholder = "Write a comment here..." rows="1" required
                onChange={() => {
                  ($('#create-comment-text').val() === '') ? 
                    $('#create-comment-button').addClass('disabled') : $('#create-comment-button').removeClass('disabled')
                }}
              ></textarea>

              <button id='create-comment-button' className='col-auto btn btn-sm btn-outline-primary ms-1 disabled'
                onClick={() => {
                  const content = $('#create-comment-text').val()
                  if (content) {
                    $('#create-comment-text').val('')
                    setCommentArea(false)
                    Parse.Cloud.run('createPost', { parentId: post.id, content: content })
                      .catch((error) => print(`Error creating post Comment: ${error}`))
                  }
                }}
              >Post comment</button>

              <button id='cancel-comment-button' className='col-auto btn btn-sm btn-outline-danger ms-1'
                onClick={() => {
                  $('#create-comment-text').val('')
                  setCommentArea(false)
                }
              }>Cancel</button>
            </div>}            
          </div>
        </div>

      </div>
    </>)
  }

  function YouHaveToLogIn () {
    return (<>
      <h3>Welcome to My4uM!</h3>
      <h6>You have to Log In/Sign Up to be able to post here.</h6>
      <p><small>This is just experimental, so you can use a fake email. Your posts/comments can be deleted at any time!</small></p>
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

        <button id='create-post-button' className='col-auto btn btn-sm btn-primary ms-1 disabled'
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

  function ThereAreNoPostsYet_YouCanBeTheFirstToPostHere() {
    return (<>
      <h1 className='m-5'>There are no posts yet!</h1>
      <div className='row m-5'>
        <textarea id='create-post-text' className='col' onChange={() => {
          ($('#create-post-text').val() === '') ? 
            $('#create-post-button').addClass('disabled') : $('#create-post-button').removeClass('disabled')
        }} placeholder='You can be the first to posts here!' rows='2' required></textarea>

        <button id='create-post-button' className='col-auto btn btn-primary ms-1 disabled'
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

  async function fetchFeed() {
    try { return await Parse.Cloud.run('queryPosts') }
    catch(error) { console.log(`ERROR running CLOUD FUNCTION queryPosts, ${error}`) }
  }

  function FEED({ feed }) {
    return (<>{feed}</>)
  }

  function App() {
    const [MainFeed, setMainFeed] = React.useState([])
    const [data, setData] = React.useState([])
    const [state, setState] = React.useState('Loading')

    // Init
    React.useEffect(() => {
      authUser()
        .then(() => fetchFeed())
        .then(feed => {setData(feed); setState('Loaded')})
        .then(() => liveQuery())
    }, [])

    // Create feed from the fetched data
    React.useEffect(() => {
      const cardsFeed = data.map(post => <PostCard post = {post} key = {post.id} />)
      setMainFeed(cardsFeed)
    }, [data])

    function liveQuery() {
      const liveQueryClient = new Parse.LiveQueryClient({
        applicationId: B4A ? B4A_APP_ID : LOCAL_APP_ID,
        javascriptKey: B4A ? B4A_JS_KEY : LOCAL_JS_KEY,
        serverURL: B4A ? B4A_LIVE_QUERY_SERVER_URL : LOCAL_LIVE_QUERY_SERVER_URL,
      })
      liveQueryClient.open()
      const subscription = liveQueryClient.subscribe(new Parse.Query('Posts').descending('createdAt').limit(10))
      subscription.on('create', () => fetchFeed().then(feed => setData(feed)))
      subscription.on('delete', () => fetchFeed().then(feed => setData(feed)))
    }
    if (state === 'Loaded')
    return (<>
      {(!currentUser) && <YouHaveToLogIn />}
      {(MainFeed.length < 1) && <ThereAreNoPostsYet_YouCanBeTheFirstToPostHere />}
      {(currentUser) && (MainFeed.length > 0) && <CreateNewPost_WhatsOnYourMind />}
      {(MainFeed.length > 0) && <FEED feed = { MainFeed } />}
    </>)
    if (state === 'Loading')
    return (<>
      <h1 style={{marginTop: '200px'}}>Loading...</h1>
      <div className="spinner-border" style={{width: '3rem', height: '3rem', role: 'status'}}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </>)
  }
  posFeedDiv.render(<App />)

}) // document.ready
