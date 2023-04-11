Parse.Cloud.define('AUTH_User', async ({ user }) => {

  if (!user) return null
  const sessionToken = user.getSessionToken()

  let role
  const roleQuery = await new Parse.Query(Parse.Role).equalTo('users', user).find({sessionToken: sessionToken })
  for (const r of roleQuery) { if (r.get('name') === 'admin') role = 'admin' }

  return { userName: user.get('username'), avatar: user.get('avatar')?.url() ?? null, admin: (role === 'admin') }
})