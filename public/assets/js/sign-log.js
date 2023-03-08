const SERVER_URL = 'http://192.168.1.220:1337/parse'
Parse.initialize('myAppId')
Parse.serverURL = SERVER_URL
const DefaultAvatar = './public/assets/images/default_user.jpg'

$(document).ready(() => {
  const message = (m) => {
    $('#info-message').text(m)
    $('#info-message').removeClass('d-none')
    setTimeout(() => {
      $('#info-message').addClass('d-none')
      $('#info-message').text('')
    }, 4000)
  }

  // SignUp //
  $("#signupForm").submit((event) => {
    event.preventDefault()

    const newUser = new Parse.User()
    newUser.set('username', $('#signupEmail').val())
    newUser.set('password', $('#signupPassword').val())
    newUser.set('email', $('#signupEmail').val())

    newUser.signUp()
      .then(() => window.location.replace('/'))
      .catch((error) => message(`ERROR in 'signUp()': ${error}`))
    })

  // LogIn //
  $("#loginForm").submit((event) => {
    event.preventDefault()

    Parse.User.logIn($('#loginEmail').val(), $('#loginPassword').val())
      .then(() => window.location.replace('/'))
      .catch((error) => message(`ERROR in 'logIn()': ${error}`))
  })


  // LogOut link
  $('#logout-link').click((event) => {
    event.preventDefault()
    Parse.User.logOut()
      .then(() => window.location.replace('/'))
      .catch((error) => message(`ERROR in logOut: ${error}`))
  })

}) // document.ready
