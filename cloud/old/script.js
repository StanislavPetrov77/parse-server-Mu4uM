const PRODUCTION = false

const B4A = window.location.host === 'my4um-server.b4a.app'

const B4A_APP_ID = 'DUOfe0DIvESBzY0JgbkR7GPSHQpVeTMx6FgNFeuQ'
const B4A_JS_KEY = 'A21ayFe8LvMXaXOOVj0E1VoyieBbngjMQUTP12Sp'
const B4A_SERVER_URL = 'https://my4um-server.b4a.io'
const B4A_LIVE_QUERY_SERVER_URL = 'wss://my4um-server.b4a.io'

const LOCAL_APP_ID = 'My4uM'
const LOCAL_JS_KEY = 'JsMy4uMKey'
const LOCAL_SERVER_URL = 'http://localhost:1337/parse'
const LOCAL_LIVE_QUERY_SERVER_URL = 'ws://localhost:1337/parse'

const DEFAULT_AVATAR = '/public/assets/images/default_user.jpg'




$(document).ready(() => {


  // const navbarDrop = new bootstrap.Collapse($('#navbarSupportedContent'), { toggle: false})
  // const logoutLink = new bootstrap.Collapse($('#logout-link'), { toggle: false})
  // const loginCard = new bootstrap.Collapse($('#login-container'), { toggle: false})
  // const signupCard = new bootstrap.Collapse($('#signup-container'), { toggle: false})

  function slideMessage(message, timeOut = 6, color = 'bg-success') {
    const messageDiv = document.createElement('div')
    $(messageDiv)
      .hide()
      .html(message)
      .css('padding', '4px')
      .addClass(`text-center m-0 ${color} border-bottom border-secondary`)
      .prependTo($("#info-message-wrapper"))
      .click(function () {$(this).stop()})
      .slideDown(500)
      .delay(timeOut * 1000)
      .slideUp(500)
      .queue(function () {$(this).remove()})
  }

  function printMessage(message) {
    if (PRODUCTION) console.log(`Message --> ${message}`)
    else {
      slideMessage(message, 10, `bg-info`)
    }
  }

}) // document.ready

// function delay(delayTime) { return new Promise(resolve => setTimeout(resolve, delayTime)) }
