import { useState } from "react"

export default function CreatePost(props) {
  const [ newPost, setNewPost ] = useState('')
  return (<>
    <div className='create-post'>
      <input
        className='input2'
        type='text'
        placeholder="What's on your mind?"
        value={ newPost }
        required
        onChange={e => { setNewPost(e.target.value) }}
      />

      <button
        onClick={() => {
          if (newPost)
            Parse.Cloud.run('createPost', { content: newPost })
              .then(() => setNewPost(''))
              .catch((error) => printMessage(`Error creating FIRST post: ${error}`))
        }}>Create post
      </button>
    </div>
  </>)
}
