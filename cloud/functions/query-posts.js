Parse.Cloud.define('queryPosts', async (req) => {
  // const { limit, skip } = req;
  const limit = 100, skip = 0

  class FeedPost {
    constructor(parsePost, lines) {
      this.id = parsePost.id
      this.avatar = parsePost.avatar
      this.author = parsePost.author
      this.createdAt = parsePost.createdAt
      this.content =  parsePost.content
      this.parent = parsePost.parent
      this.commentsCount = parsePost.commentsCount
      this.lines = lines
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

  const query = new Parse.Query('Posts')
    .doesNotExist('parentPost')
    .descending('createdAt')
    .limit(limit)
    .skip(skip)
    .include('author')

  try {
    const rootPosts = await query.find()
    return feed(rootPosts)
  } catch(error) {
    console.log(`CLOUD FUNCTION query.find() ERROR: ${error}`)
  }

  async function feed(rootPosts) {
    const feed = []

    for (const rootPost of rootPosts) {
      feed.push(new FeedPost(rootPost, []))
      await pushComments(rootPost, [])
    }
    return feed

    async function pushComments(post, indent) {
      const postQuery = await new Parse.Query('Posts')
        .equalTo('parentPost', post)
        .ascending('createdAt')
        .include('author')
        .find()
      for (const index in postQuery) {
        let last = index == (postQuery.length - 1)
        feed.push(new FeedPost(postQuery[index], [...indent, last ? 3 : 2]))
        await pushComments(postQuery[index], [...indent, last ? 0 : 1])
      }
    }
  }
})
