const PRODUCTION = false
const SERVER_URL = 'http://192.168.1.220:1337/parse'
const DEFAULT_AVATAR = './public/assets/images/default_user.jpg'
Parse.initialize('myAppId')
Parse.serverURL = SERVER_URL

$(document).ready(() => {
  const feedNode = document.getElementById('feed-wrapper')
  const feedWrapper = ReactDOM.createRoot(feedNode)

  const newNode = document.getElementById('new-wrapper')
  const newWrapper = ReactDOM.createRoot(newNode)

  let currentUser
  const showCurrentUser = message => $('#current-user').text(message)

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
    if (PRODUCTION) console.log(`E--> ${message}`)
    else {
      slideMessage(message, 10, `bg-info`)
    }
  }

  async function isLoggedIn() {
    try {
      const { isLoggedIn } = await Parse.Cloud.run("isLoggedIn")
    
      if (isLoggedIn) {
        currentUser = Parse.User.current()
        showCurrentUser(`Logged in as: ${currentUser.get('username')}`)
      } else {
        currentUser = undefined
        showCurrentUser(`NOT logged in`)
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

    // return (`${years  > 0 ? years   + ' years, '  : ''}` +
    //         `${months > 0 ? months  + ' months, ' : ''}` +
    //         `${days   > 0 ? days    + ' days, '   : ''}` +
    //         `${hours  > 0 ? hours   + ' hours, '  : ''}` +
    //         `${mins   > 0 ? mins    + ' min'      : ''} ago`)
  }

  function Avatar(props) {
    return (
      <img 
      style={{height: '3rem', borderRadius: '50%'}}
      className="img-fluid"
      src={props.avatar} 
      alt="No image available"
      onError={ ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src= DEFAULT_AVATAR
      }} />
    )
  }

    
  function WriteAComment(props) {
    const { avatar, author, createdAt, content } = props.post
    const [state, setState] = React.useState('success')

    // const funct = () => {
    //   setState('loading')
    //   call.func()
    //     .then(succ => {
    //       setState('success')
    //     })      
    //     .catch(error => {
    //       console.log(error)
    //       setState(error)
    //     })      
    // }
    // React.useEffect(() => {
    //   funct()
    // }, [])

  
    return (
      <div className='card-footer row m-0 p-0'>
        <div className='col-auto p-1'>
          <Avatar avatar={avatar} />
        </div>

        <div className='col px-2 my-auto'>
          <h6 className='m-0'>{author}</h6>
          <p className='text-muted m-0'>{timeDiff(createdAt)}</p>
        </div>
      </div>
    )
  }

  function Lines(props) {
    const width = '1rem'
    const { lines } = props
    const linesArray = []

    let link = ''
    lines.forEach(line => {
      switch (line ) { 
        case 'line': link = '/public/assets/images/comment-line.png'; break
        case 'branch': link = '/public/assets/images/comment-branch.png'; break
        case 'last': link = '/public/assets/images/comment-last.png'; break
        default: //link = '/public/assets/images/no-image-available.jpg'
      }
      if (link) linesArray.unshift( <img style={{width: width, height: '100%'}} className="img-fluid" src={link} /> )
    })
    // if (linesCount < 1) return

    // if (lines === ') 
    //   <img style={{width: width, height: '100%'}} className="img-fluid" src='/public/assets/images/comment-last.png' />
    //   )
    // if (lines === 'line') linesArray.unshift(
    //   <img style={{width: width, height: '100%'}} className="img-fluid" src='/public/assets/images/comment-line.png' />
    //   )
    // if (lines === 'branch') linesArray.unshift(
    //   <img style={{width: width, height: '100%'}} className="img-fluid" src='/public/assets/images/comment-branch.png' />
    //   )

    return (
      <div className='col-auto p-0 m-0'>
        {linesArray}
      </div>
    )
  }

  // PostCard element
  function PostCard(props) {
    const { post } = props
    return (
      <div className='card rounded-0 text-start py-0 pr-0 mt-0 mb-0' style={{paddingLeft: `${post.get('commentDepth') * 20}px`}}>
        <div className="row m-0 p-0">

          <Lines lines = { post.get('lines') } />
          
          <div className="col">
            {/* Header */}
            <div className='card-header row m-0 p-0 border-secondary-subtle'>

              <div className='col-auto p-1'>
                  <Avatar avatar={post.get('author').get('avatar').url()} />
              </div>

              <div className='col px-2 my-auto'>
                  <h6 className='m-0'>{post._getId()}. {post.get('author').get('username')}</h6>
                  <p className='text-muted m-0'>{timeDiff(post.get('createdAt'))}</p>
              </div>
            </div>

            {/* Content */}
            <div className="card-body px-2 py-1">
              <p className="card-text">{post.get('content')}</p>
            </div>

            {/* Footer */}
            <div className='card-footer text-end row m-0 p-0 border-secondary-subtle'>
              <div className='text-muted m-0 p-0 px-2 d-inline'>
                {post.get('childPosts').length} comments
                <a className='link-danger m-1' onClick={() => { deletePost(post) }}>Delete</a>
                <a className='link-primary m-1' onClick={() => { createPost(post) }}>Comment</a>
                <a className='link-primary m-1' onClick={() => {  }}>More...</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function Posts(props) {
    const { posts } = props
    const cards = []
    if (posts.length < 1) return (
      <div className='container-fluid text-center my-5'>
        <h2>There are no posts yet!</h2>
        <button className='btn btn-sm btn-primary m-1' onClick={() => { createPost() }}>Create a post</button>
      </div>
      )
    
    const rootPosts = posts.filter(p => p.get('commentDepth') === 0)
    rootPosts.forEach(post => {
      function pushCard(currPost) {
        cards.push( <PostCard post={currPost} key={currPost._getId()} /> )
        currPost.get('childPosts').forEach(childPost => pushCard(childPost))
      }
      pushCard(post)
    })
    return (
      <div className='container-sm px-0'>
        <button className='btn btn-sm btn-primary m-1' onClick={() => { createPost() }}>Create a post</button>
        {cards}
        </div>
        )
  }

  async function createPost(parrentPost = undefined) {
    const newPost = new Parse.Object('Posts')
    newPost.set('author', Parse.User.current())
    newPost.set('childPosts', [])
    if (parrentPost) {
      if (parrentPost.get('childPosts').length === 0 )
        newPost.set('lines', ["last"])
      else
        newPost.set('lines', ["branch"])
      newPost.set('parrentPost', parrentPost)
      newPost.set('commentDepth', parrentPost.get('commentDepth') + 1)
      newPost.set('content', `${parrentPost._getId()}, Depth ${parrentPost.get('commentDepth') + 1}`)
    } else {
      newPost.set('commentDepth', 0)
      newPost.set('content', `RootRoot, Depth 0`)
      newPost.set('lines', [])
    }

    try {
      const savedPost = await newPost.save()
      if (parrentPost) {
        const arr = parrentPost.get('childPosts')
        arr.unshift(savedPost)
        parrentPost.set('childPosts', arr)
        await parrentPost.save()
      }
    } catch(error) {
        print(`Error creating post/comment: ${error}`)
    }
    render()
  }

  async function deletePost(postToDelete = undefined) {
    if (!postToDelete) return


    // const sleep = async ms => {
    //   return await new Promise((resolve) => setTimeout(resolve, ms))
    // }

    async function deleteChild(currPost) {
      // console.log(`Request to delete : ${currPost.get('content')}`)
      // await sleep(1500)
      const children = currPost.get('childPosts')
      for(let child of children) {await deleteChild(child)}

      try {
        // console.log(`Deleting : ${currPost.get('content')}`)
        
        await currPost.destroy()
        // await sleep(1500)
      } catch(error) {
        print(`Error deleting post/comment: ${error}`)
      }
    }
    await deleteChild(postToDelete)

    const parrentPost = postToDelete.get('parrentPost')
    if (parrentPost) {
      try {
        let parrentChildPosts = parrentPost.get('childPosts')
        parrentChildPosts = parrentChildPosts.filter(child => child !== postToDelete)
        parrentPost.set('childPosts', parrentChildPosts)
        // console.log('fixing parrentPost pointer')
        await parrentPost.save()
        // await sleep(3000)
        // console.log('Success!')
      } catch(error) {
        print(`Error deleting child from parrent: ${error}`)
      }
    }
    render()
  }

  async function render() {
    const limit = 100, skip = 0
    const query = new Parse.Query('Posts')
    // query.equalTo('commentDepth', 0)
    query.descending('createdAt')
    query.limit(limit)
    query.skip(skip)
    try {
      const posts = await query.find()
      // console.log(`----- ReRendering ${posts.length} posts ------`)
      for (const p of posts) { await p.fetchWithInclude(['author', 'childPosts']) }
      // print(`${posts.length} posts fetched`)
      feedWrapper.render(<Posts posts={posts} />)
  } catch(error) {
      print(`Error getting posts: ${error}`)
    }

  }

  slideMessage('Welcome to My4uM', 6, 'bg-success')
  render()

  // newWrapper.render(<Avatar avatar={currentUser.get('avatar').url()} />)

  // $('#test-results').text()
  // $('#test-button').click(() => {
 
}) // document.ready
