import { useState } from "react"
import BackDrop from "./BackDrop"

export default function LogIn({ activeForm, setActiveForm, submitForm }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return <>
    <BackDrop setActiveForm={ setActiveForm } />
    <form className="form" onSubmit={ e => submitForm(e, username, password) }>
      <h2>{ activeForm }</h2>
      <input className="input"
        type="email"
        placeholder="Email"
        minLength="8"
        maxLength="30"
        required
        onChange={ e => setUsername(e.target.value) } />
      <input className="input"
        type="password"
        placeholder="Password"
        minLength="8"
        maxLength="30"
        required
        onChange={e => setPassword(e.target.value) } />
      <button type="button" className="button cancel-button" onClick={() => setActiveForm(null) }>Cancel</button>
      <button type="submit" className="button submit-button">{ activeForm }</button>
    </form>
  </>
}
