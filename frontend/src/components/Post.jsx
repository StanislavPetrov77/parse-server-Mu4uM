import { useState } from 'react'
import PostLines from './PostLines'
import Avatar from './Avatar'
import postAge from './postAge'

export default function Post({ post, user }) {
  const [ commentArea, setCommentArea ] = useState(false)
  const [ newComment, setNewComment ] = useState('')

  return (
    <div className='post'>
      <PostLines lines={ post.lines } pkey={ post.id } />

      <div className="post-container">
        <div className='post-header'>
          <Avatar avatar={ post.avatar } />  {/* key = {'A_' + post.id} /> */}
          <p className='post-author'>{ post.author }</p>
          <p className='post-age'>{ postAge( post.createdAt ) }</p>
        </div>

        <p className="post-body">{ post.content }</p>

        <div className='post-footer'>
          { !commentArea && user &&
            <button onClick={e => setCommentArea(true)}>Comment</button>
          }

          { !commentArea && user?.admin &&
            <button
            onClick={e => 
              Parse.Cloud.run('deletePost', { toDeleteId: post.id })
              .catch((error) => console.log(`Error deleting post: ${error}`))
            }>Delete</button>
          }

          { commentArea &&
            <>
              <input className='input3' type='text' placeholder='Write a comment here...' required
                onChange={e => { setNewComment(e.target.value) }}
              />

              <button
                onClick={() => {
                  setCommentArea(false)
                  if (newComment)
                    Parse.Cloud.run('createPost', { parentId: post.id, content: newComment })
                      .catch((error) => console.log(`Error creating post Comment: ${error}`))
                }}>Post
              </button>

              <button onClick={() => setCommentArea(false) }>Cancel</button>
            </>
          }
        </div>

      </div>

    </div>
  )
}
