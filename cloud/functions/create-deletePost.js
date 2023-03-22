class ParsePost extends Parse.Object {
  constructor() { super('Posts') }

  get content()   { return this.get('content')}
  get authorObj() { return this.get('author')}
  get author()    { return this.get('author').get('username')}
  get avatar()    { return this.get('author').get('avatar')?.url() ?? DEFAULT_AVATAR}
  get comments()  { return this.get('comments') ?? []}
  get parent()    { return this.get('parentPost')}
  get createdAt() { return this.get('createdAt')}

  set content(content)      { this.set('content', content)}
  set authorObj(authorObj)  { this.set('author', authorObj)}
  set comments(comments)    { this.set('comments', comments)}
  set parent(parent)        { this.set('parentPost', parent)}

  set unsiftComments(comment)     { this.comments.unshift(comment); this.set('comments', this.comments)}
  set removeFromComments(comment) { this.set('comments', this.comments.filter(c => c != comment))}
}
Parse.Object.registerSubclass('Posts', ParsePost)

//Create Post
Parse.Cloud.define('createPost', async (req) => {
  const { parentId, content } = req.params
  const { user } = req
  let parent
  
  if (!user) throw new Error('Please Log In to be able to post')
  if (!content) throw new Error(`Can't create empty post!`)
    
  const newPost = new ParsePost()
  newPost.authorObj = user
  newPost.content = content
  newPost.comments = []

  try {
    if (parentId) {
      parent = await new Parse.Query(ParsePost).get(parentId)
    }
    newPost.parent = parent
    const savedNewPost = await newPost.save()
    
    if (parent) {
      parent.unsiftComments = savedNewPost
      await parent.save()
    }

  } catch(error) {
    console.log(`Error creating post: ${error}`)
  }
})

// Delete Post
Parse.Cloud.define('deletePost', async (req) => {
  const { toDeleteId } = req.params
  const { user } = req

  if (!user) throw new Error('Please Log In as admin or moderator to be able to delete posts')
  const toDelete = await new Parse.Query(ParsePost).get(toDeleteId)
  if (!toDelete) throw new Error('Post to delete not found in the database')

  const parent = toDelete.parent

  try {
    if (parent) {
      await parent.fetch()
      parent.removeFromComments = toDelete
      await parent.save()
    }
    await deletePost(toDelete)
  } catch(error) {
    console.log(`Error deleting child from parent: ${error}`)
  }

  async function deletePost(post) {
    try {
      for(const comment of post.comments) {
        await comment.fetch()
        await deletePost(comment)
      }
      await post.destroy()
    } catch(error) {
      console.log(`Error in deletePost CLOUD: ${post.id}: ${error}`)
    }
  }
})
