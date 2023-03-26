const ParsePost = require('./parse-post-class')

Parse.Cloud.define('deletePost', async (req) => {
    const { toDeleteId } = req.params
    const { user } = req
  
    if (!user) throw new Error('Please Log In as admin or moderator to be able to delete posts')
  
    try {
      const toDelete = await new Parse.Query(ParsePost).get(toDeleteId)
      if (!toDelete) throw new Error('Post to delete not found in the database')
  
      const toDeleteParent = toDelete.parent
  
      if (toDeleteParent) {
        await toDeleteParent.fetch()
  
        toDeleteParent.comments = toDeleteParent.comments.filter(comment => comment.id !== toDelete.id)
        await toDeleteParent.save()
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
  