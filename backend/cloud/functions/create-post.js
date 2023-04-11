const ParsePost = require('./parse-post-class')

Parse.Cloud.define('createPost', async (req) => {
  const { user } = req
  const { parentId, content } = req.params
  
  if (!user) throw new Error('Please Log In to be able to post')
  if (!content) throw new Error(`Can't create empty post!`)
  
  let parentPost
    
  const newPost = new ParsePost()
  newPost.authorObj = user
  newPost.content = content

  try {
    if (parentId) {
      parentPost = await new Parse.Query(ParsePost).get(parentId)
      if (!parentPost) throw new Error(`The parent post you're commentig to can not be found`)
      newPost.parent = parentPost
    }

    const savedNewPost = await newPost.save()
    
    if (parentPost) {
      parentPost.comments = [ savedNewPost, ...parentPost.comments ]
      await parentPost.save()
    }
  } catch(error) {
    console.log(`Error creating post: ${error}`)
  }
})
