Parse.Cloud.define('AUTH_User', async ({ user }) => {

  if (!user) return { loggedUser: undefined, role: undefined }
  const sessionToken = user.getSessionToken()

  let role = 'user'
  const roleQuery = await new Parse.Query(Parse.Role).equalTo('users', user).find({sessionToken: sessionToken })
  for (const r of roleQuery) { if (r.get('name') === 'admin') role = 'admin' }


  return { loggedUser: user, role: role }
})