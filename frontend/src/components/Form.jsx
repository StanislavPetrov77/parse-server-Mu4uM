import { useState, useEffect } from "react"
import BackDrop from "./BackDrop"
import { DEFAULT_AVATAR } from './definitions'

export default function LogIn({ user, activeForm, setActiveForm, submitForm }) {
  const [username, setUsername] = useState('')
  const [currPassword, setCurrPassword] = useState('')
  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')

  useEffect(() => {
    if (activeForm === 'Edit profile') {
      setUsername(user.userName)
    } else {
      setUsername('')
    }
  }, [activeForm])

  return <>
    <BackDrop setActiveForm={ setActiveForm } />
    <form className="form" onSubmit={ e => submitForm(e, username, currPassword) }>
      <h2 className="form-header">{ activeForm }</h2>
      { activeForm === 'Edit profile' &&
        <div className="change-avatar">
          <img className='profile-avatar' src={ user?.avatar ?? DEFAULT_AVATAR } />
          <input type="file" />
        </div>
      }

      <input className="input"
        autoComplete="username"
        type="email"
        placeholder="Email"
        minLength="8"
        maxLength="30"
        required
        value = { username }
        onInput = { e => setUsername(e.target.value) }
      />
      <input className="input"
        autoComplete="current-password"
        type="password"
        placeholder="Password"
        minLength="8"
        maxLength="30"
        required
        value = { currPassword }
        onInput = {e => setCurrPassword(e.target.value) }
      />

      { false && <>
        <input className="input"
          autoComplete="new-password"
          type="password"
          placeholder="Enter new password"
          minLength="8"
          maxLength="30"
          required
          value = { newPassword1 }
          onInput = {e => setNewPassword1(e.target.value) }
        />
        <input className="input"
          autoComplete="new-password"
          type="password"
          placeholder="Confirm new password"
          minLength="8"
          maxLength="30"
          required
          value = { newPassword2 }
          onInput = {e => setNewPassword2(e.target.value) }
        />
      </>}

      <div className="buttons">
        <button type="button" className="button cancel-button" onClick={() => setActiveForm(null) }>Cancel</button>
        <button type="submit" className="button submit-button">{ (activeForm === 'Log In' || activeForm === 'Sign Up') ? activeForm : 'Save' }</button>
      </div>
    </form>
  </>
}
