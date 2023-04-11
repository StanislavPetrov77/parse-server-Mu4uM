import * as defs from './definitions'

export default function Nav({ user, setActiveForm, logOut }) {
  return <>
    <div className="nav">
      <div className='link logo' onClick={ () => {} } >My4uM</div>
      <div className='link' onClick={ () => setActiveForm('Sign Up') } >Sign Up</div>
      <div className='link' onClick={ () => setActiveForm('Log In') } >Log In</div>
      <div className='link' onClick={ logOut } >Log Out</div>
      <div className="nav-current-user">{ user?.userName ?? 'Guest'} {user?.admin ? '(Admin)' : ''}</div>
      <img className='nav-avatar' src={ user?.avatar ?? defs.DEFAULT_AVATAR } />
    </div>
  </>
}
