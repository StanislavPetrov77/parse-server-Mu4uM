const PRODUCTION = false
const SERVER_URL = 'http://192.168.1.220:1337/parse'
const DEFAULT_AVATAR = './public/assets/images/default_user.jpg'
Parse.initialize('My4uM')
Parse.serverURL = SERVER_URL

$(document).ready(() => {
  class Posts extends Parse.Object {
    constructor() { super('Posts') }

    get content()       { return this.get('content')}
    get author()        { return this.get('author')}
    get authorName()    { return this.get('author').get('username')}
    get authorAvatar()  { return this.get('author').get('avatar')?.url() ?? DEFAULT_AVATAR}
    get childPosts()    { return this.get('childPosts')}
    get parentPost()    { return this.get('parentPost')}
    get createdAt()     { return this.get('createdAt')}

    set content(content)              { this.set('content', content)}
    set author(author)                { this.set('author', author)}
    set childPosts(childPosts)        { this.set('childPosts', childPosts)}
    set childPostsUnshift(childPost)  { this.childPosts.unshift(childPost); this.set('childPosts', this.childPosts)}
    set childPostsRemove(childPost)   { this.set('childPosts', this.childPosts.filter(p => p != childPost))}
    set parentPost(parentPost)        { this.set('parentPost', parentPost)}

    // set authorName(authorName) { this.get('author').set('username', authorName)}
    // set authorAvatar(authorAvatar) { this.get('author').set('avatar').url()}
  }
  Parse.Object.registerSubclass('Posts', Posts)

  const postFeedNode = document.getElementById('post-feed')
  const feedDiv = ReactDOM.createRoot(postFeedNode)

  // const newNode = document.getElementById('new-wrapper')
  // const newWrapper = ReactDOM.createRoot(newNode)

  let admin, moderator, currentUser

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

  async function isLoggedIn() {
    try {
      const { isLoggedIn } = await Parse.Cloud.run("isLoggedIn")

      if (isLoggedIn) {
        currentUser = Parse.User.current()
        const query = await new Parse.Query(Parse.Role).equalTo('users', currentUser).find()
        for (const role of query) {if (role.get('name') === 'admin') admin = true}
        for (const role of query) {if (role.get('name') === 'moderator') moderator = true}
        $('#current-user').text(`Logged in as: ${currentUser.get('username')} ${admin ? '(admin) ' : ''} ${moderator ? '(moderator) ' : ''}`)
      } else {
        admin = undefined
        moderator = undefined
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
    const { linesArray } = props
    const lines = []

    let link = undefined
    linesArray.forEach((line, index) => {
      switch (line) { 
        case 0: link = '/public/assets/images/comment-none.png'; break
        case 1: link = '/public/assets/images/comment-line.png'; break
        case 2: link = '/public/assets/images/comment-branch.png'; break
        case 3: link = '/public/assets/images/comment-last.png'; break
        default: link = undefined
      }
      if (link) lines.push( <img style={{width: width, height: '100%'}} className="img-fluid" src={link} key={index} /> )
    })

    return (<>{lines}</>)
  }

  // PostCard element
  function Post(props) {
    const { post, linesArray } = props
    const [ showComments, setShowComments ] = React.useState(true)
    const [ commentArea, setCommentArea ] = React.useState(false)
    let childPosts = post.childPosts

    return (<>
      <div className='post-card-element card rounded-1 text-start py-0 mt-0 mb-1'>
        <div className="row m-0 p-0">

          <div className='col-auto p-0 m-0'>
            <Lines linesArray = {linesArray} />
          </div>

          <div className="col p-0">
            <div className='card-header row m-0 p-0 border-secondary-subtle'>

              <div className='col-auto p-1'>
                  <Avatar avatar={post.authorAvatar} />
              </div>

              <div className='col px-2 my-auto'>
                  <h6 className='m-0'>{post.authorName}</h6>
                  <p className='text-muted m-0'>{timeDiff(post.createdAt)}</p> {/* Create as component */}
              </div>
            </div>

            <div className="card-body px-2 py-1">
              <p className="card-text">{post.content}</p>
            </div>

            <div className='card-footer text-end row m-0 p-0 border-secondary-subtle'>
              <div className='text-muted m-0 p-0 d-inline'>
                {/* {(childPosts.length > 0) && (!showComments) &&
                  <button className='btn btn-sm btn-primary m-1' onClick={() => {
                    setShowComments(true) }}>View {childPosts.length} comment(s)</button>}

                {(childPosts.length > 0) && (showComments) &&
                  <button className='btn btn-sm btn-primary m-1' onClick={() => {
                    setShowComments(false) }}>Hide {childPosts.length} comment(s)</button>} */}

                {(!commentArea) && (currentUser) && <button className='btn btn-sm btn-outline-primary m-1' onClick={() => {
                  setCommentArea(true)
                }}>Comment</button>}

                {(!commentArea) && (admin || moderator) && <button className='btn btn-sm btn-outline-danger m-1' onClick={() => {
                  deletePost(post)
                }}>Delete</button>}
              </div>
            </div>
            {(commentArea) && <div className='row mx-1 mb-1'>
              <textarea id='create-comment-text' className="col" onChange={() => {
                ($('#create-comment-text').val() === '') ? 
                  $('#create-comment-button').addClass('disabled') : $('#create-comment-button').removeClass('disabled')
              }} placeholder = "Write a comment here..." rows="1" required></textarea>

              <button id='create-comment-button' className='col-auto btn btn-sm btn-outline-primary ms-1 disabled'onClick={() => {
                if ($('#create-comment-text').val()) createPost(post, $('#create-comment-text').val())
              }}>Post comment</button>
              <button id='cancel-comment-button' className='col-auto btn btn-sm btn-outline-danger ms-1'onClick={() => {
                $('#create-comment-text').val(''); setCommentArea(false)
              }}>Cancel</button>
            </div>}            
          </div>
        </div>

      </div>
    </>)
  }

  function Feed(props) {
    const { posts } = props
    const [ feed, setFeed ] = React.useState([])

    async function feedPush(post, prevLinesArray) {          // <----------- feedPush Starts here
      const parentPost = post.parentPost
      const children = post.childPosts
      let lineNeeded = undefined, ending = undefined
      const linesArray = prevLinesArray

      try {
        await post.fetchWithInclude(['childPosts', 'author'])
      } catch(error) {
        print(`Error fetching post in Feed: ${error}`)
      }

      if (!parentPost) {                                    // no parentPost - it's a Root Post !
        linesArray.length = 0
      } else {
        const siblings = parentPost.childPosts

        if (siblings.length === 1) {                         // if it's only child
          ending = 3
          lineNeeded = 0
        } else {
          if (post.id === siblings.at(-1).id) {              // if oldest
            lineNeeded = 0
            ending = 3
          } else {                                           // branch
            lineNeeded = 1
            ending = 2
          }
        }
      }

      setFeed(prev => [...prev, <Post post = {post} linesArray = {[...linesArray, ending]} key = {post.id} />])

      if (children.length > 0) {
        for (const child of children) {
          await feedPush(child, [...linesArray, lineNeeded])
        }
      }
    }

    async function rootPush() { for (const post of posts) await feedPush(post, []) }

    React.useEffect(() => { rootPush() }, [])
    return (<>{feed}</>)
  }

  function YouHaveToLogIn () {
    return (<>
      <h3>Welcome to My4uM!</h3>
      <h6>You have to Log In/Sign Up to be able to post here.</h6>
      <p><small>This is just experimental, so you can use a fake email. Your posts/comments can be deleted at any time!</small></p>
    </>)
  }

  function Header(props) {
    return (<>
      {(admin || moderator || currentUser) ? <div className='row m-0 mb-1'>
        <textarea id='create-post-text' className="col" onChange={() => {
          ($('#create-post-text').val() === '') ? 
            $('#create-post-button').addClass('disabled') : $('#create-post-button').removeClass('disabled')
        }} placeholder = "What's on your mind?" rows="1" required></textarea>

        <button id='create-post-button' className='col-auto btn btn-sm btn-primary ms-1 disabled' onClick={() => {
            createPost(undefined , $('#create-post-text').val())
        }}>Create post</button>
      </div> : <YouHaveToLogIn />}
    </>)
  }

  function NoPostsYet() {
    return (<>
      {(admin || moderator || currentUser) ? <div className='row m-5'>
        <textarea id='create-post-text' className='col' onChange={() => {
          ($('#create-post-text').val() === '') ? 
            $('#create-post-button').addClass('disabled') : $('#create-post-button').removeClass('disabled')
        }} placeholder='You can be the first to posts here!' rows='2' required></textarea>

        <button id='create-post-button' className='col-auto btn btn-primary ms-1 disabled' onClick={() => {
          createPost(undefined, $('#create-post-text').val())
        }}>Create post</button>
      </div> : <YouHaveToLogIn />}
      <h1 className='m-5'>There are no posts yet!</h1>
    </>)
  }

  async function createPost(parentPost = undefined, content = undefined) {
    if (!content) return

    const newPost = new Posts()
    newPost.author = Parse.User.current()
    newPost.childPosts = []
    newPost.content = content

    newPost.parentPost = parentPost

    try {
      const savedPost = await newPost.save()
      if (parentPost) {
        parentPost.childPostsUnshift = savedPost
        await parentPost.save()
      }
      refresh()
    } catch(error) {
      print(`Error creating post: ${error}`)
    }
  }

  async function deletePost(postToDelete = undefined) {
    if (!postToDelete) return
    const parentPost = postToDelete.parentPost

    async function deleteChild(currPost) {
      const children = currPost.childPosts
      for(const child of children) {
        try {
          // await child.fetch() // probably not needed
          await deleteChild(child)
        } catch(error) {
          print(`Error deleteChild post ${currPost.id}: ${error}`)
        }
      }

      try {
        await currPost.destroy()
      } catch(error) {
        print(`Error deleting post ${currPost.id}: ${error}`)
      }
    }
    await deleteChild(postToDelete)

    if (parentPost) {
      try {
        parentPost.childPostsRemove = postToDelete
        await parentPost.save()
        refresh()
      } catch(error) {
        print(`Error deleting child from parent: ${error}`)
      }
    } else refresh()
  }

  async function refresh() {
    feedDiv.render()
    const limit = 100, skip = 0
    const query = new Parse.Query(Posts)
    query.equalTo('parentPost', undefined)           // condition to find root posts ONLY
    query.descending('createdAt')                     // sorting newest first
    query.limit(limit)
    query.skip(skip)                                  // Will be used to implement pagination
    try {
      const rootPosts = await query.find()
      for (const rootPost of rootPosts) rootPost.fetchWithInclude(['author', 'childPosts'])
      if (rootPosts.length < 1) {
        feedDiv.render(<NoPostsYet key = {'NoPostsYet'} />)
      } else {
        feedDiv.render([<Header key = {'Header'} />, <Feed posts = {rootPosts} key = {'Feed'} />])
      }
    } catch(error) {
      print(`Error getting parentPosts: ${error}`)
    }
  }
  isLoggedIn().then(() => refresh())
}) // document.ready
