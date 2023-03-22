Parse.Cloud.define('isLoggedIn', async (req) => {
  const { user } = req;

  if (!user) return { isLoggedIn: false }

  // const sessionToken = user.getSessionToken()

  // try {
  //   const result = await Parse.Cloud.httpRequest({
  //     url: `${Parse.serverURL}/sessions/me`,
  //     headers: {
  //       "X-Parse-Application-Id": Parse.applicationId,
  //       "X-Parse-JavaScript-API-Key": Parse.javaScriptKey,
  //       "X-Parse-Session-Token": sessionToken,
  //     }
  //   })

    return { isLoggedIn: true }
  // } catch (error) {
  //   console.log(`Error in httpRequest! ${error}`)
  //   return { isLoggedIn: false }
  // }
})