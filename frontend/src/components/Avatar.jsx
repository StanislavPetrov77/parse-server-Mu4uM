import { DEFAULT_AVATAR } from "./definitions"

export default function Avatar({ avatar }) {
  return (
    <img
      className='post-avatar'
      src={ avatar ?? DEFAULT_AVATAR } 
      alt="No image"
      onError={ ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src= DEFAULT_AVATAR
    }} />
  )
}
