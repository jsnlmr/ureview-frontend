const searchURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&s='
const showURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&i='
const apiURL = 'http://localhost:3000/api/v1/'

let logged_in = false
let current_user = null
//let current_user_id = null

document.addEventListener('DOMContentLoaded', function(){
  renderLogin()
})

///////// LOGIN //////////
function renderLogin() {
  document.body.innerHTML = ''

  let loginContainer = document.createElement('div')
  loginContainer.className = "ui middle aligned center aligned grid"

  let loginBox = document.createElement('div')
  loginBox.className = "column login-box"

  let loginHeader = document.createElement('h2')
  loginHeader.className = "ui blue header"
  loginHeader.innerText = "Login to your account"

  let loginForm = document.createElement('form')
  loginForm.id = 'login-form'
  loginForm.className = "ui large form"
  loginForm.addEventListener('submit', verifyUser)

  let loginDiv = document.createElement('div')
  loginDiv.className = "ui stacked segment"

  let loginField = document.createElement('div')
  loginField.className = "field"

  let userIconDiv = document.createElement('div')
  userIconDiv.className = "ui left icon input"

  let userIcon = document.createElement('i')
  userIcon.className = "user icon"

  let usernameInput = document.createElement('input')
  usernameInput.placeholder = "Username"
  usernameInput.id = 'login-username'

  let loginButton = document.createElement('div')
  loginButton.className = "ui fluid blue large submit button"
  loginButton.id = "login"
  loginButton.innerText = "Login"
  loginButton.addEventListener('click', verifyUser)

  let registrationDiv = document.createElement('div')
  registrationDiv.className = "ui message"
  registrationDiv.innerText = "New user? "

  let registerLink = document.createElement('a')
  registerLink.id = "register"
  registerLink.innerText = "Register Now"
  registerLink.addEventListener('click', newregisterForm)

  document.body.appendChild(loginContainer)
  loginContainer.appendChild(loginBox)
  loginBox.append(loginHeader, loginForm)
  loginForm.appendChild(loginDiv)
  loginDiv.append(loginField, loginButton, registrationDiv)
  loginField.appendChild(userIconDiv)
  userIconDiv.append(userIcon, usernameInput)
  registrationDiv.appendChild(registerLink)
}

function newregisterForm() {
  document.body.innerHTML = ''

  let registerContainer = document.createElement('div')
  registerContainer.className = "ui middle aligned center aligned grid"

  let registerBox = document.createElement('div')
  registerBox.className = "column login-box"

  let registerHeader = document.createElement('h2')
  registerHeader.className = "ui blue header"
  registerHeader.innerText = "Register as a new user"

  let registerForm = document.createElement('form')
  registerForm.id = 'register-form'
  registerForm.className = "ui large form"

  let registerDiv = document.createElement('div')
  registerDiv.className = "ui stacked segment"

  let registerName = document.createElement('div')
  registerName.className = "field"

  let nameInput = document.createElement('input')
  nameInput.id = 'register-name'
  nameInput.placeholder = 'Full Name'

  let registerUsername = document.createElement('div')
  registerUsername.className = "field"

  let usernameInput = document.createElement('input')
  usernameInput.id = 'register-username'
  usernameInput.placeholder = 'Username'

  let registerEmail = document.createElement('div')
  registerEmail.className = "field"

  let emailInput = document.createElement('input')
  emailInput.id = 'register-email'
  emailInput.placeholder = 'Email'

  let registerButton = document.createElement('div')
  registerButton.className = "ui fluid blue large submit button"
  registerButton.id = "register"
  registerButton.innerText = "Register"
  registerButton.addEventListener('click', function() {
    event.preventDefault()

    let data = { name: getRegisterName().value, username: getRegisterUsername().value, email: getRegisterEmail().value }

    fetch(apiURL + 'users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json()).then(user => {
      console.log(user)
      logged_in = true
      current_user = user
      //current_user_id = user.id
      getMovies()
    })
  })

  document.body.appendChild(registerContainer)
  registerContainer.appendChild(registerBox)
  registerBox.append(registerHeader, registerForm)
  registerForm.appendChild(registerDiv)
  registerDiv.append(registerName, registerUsername, registerEmail, registerButton)
  registerName.appendChild(nameInput)
  registerUsername.appendChild(usernameInput)
  registerEmail.appendChild(emailInput)
}

function verifyUser() {
  event.preventDefault()

  let name = getLoginUsername().value //event.target.children[0].value

  fetch(apiURL + 'users').then(res => res.json()).then(data => {
    let found = data.find( user => { return user.username === name})

    if(found) {
      logged_in = true
      current_user = found
      //current_user_id = found.id
      renderNav()
      getMovies()
    }

    else{
      renderNav()
    }
  })
}

///////// HOME PAGE /////////
function getMovies() {
  document.body.innerHTML = ""

  renderNav()
  if(event) {
    event.preventDefault()
    //if(getUpdateForm()) { getUpdateForm().remove() }
  }

  // if(getMovieForm() === null) {
  //   let movieForm = document.createElement('form')
  //   let titleInput = document.createElement('input')
  //   titleInput.name = 'search'
  //   movieForm.innerText = 'Search: '
  //   movieForm.id = 'movie-form'
  //   movieForm.addEventListener('submit', getMovies)
  //   let submit = document.createElement('input')
  //   submit.type = 'submit'
  //
  //   movieForm.append(titleInput, submit)
  //   document.body.appendChild(movieForm)
  // }

  if(movieContainer() === null) {
    let container = document.createElement('div')
    container.id = 'movie-container'
    container.className = "ui five stackable cards"
    document.body.appendChild(container)
  }

  else { movieContainer().innerHTML = '' }

  if(logged_in && (!event || (event.type === 'click' && event.target.id != 'search-icon'))) {
    if(getLoginForm()) { getLoginForm().style.display = 'none' }
      fetch(apiURL + `/users/${current_user.id}`/*`/users/${current_user_id}`*/)
        .then(res => res.json()).then(revData => {

          let movies = revData.reviews.map( rev => rev.movie_id)

          if(movies.length === 0) {
            movieContainer().innerText = 'You have not reviewed any movies yet. Search now to find a movie to review.'
          }
          else {
            movies.forEach( id => {
              fetch(showURL + id).then(res => res.json())
                .then(mov => renderMovie(mov))
            })
          }
          //data['Search'].forEach(movie => renderMovie(movie))
      })
    }

    else {
      let searchTerm = event.target.value ? event.target.value : event.target.previousSibling.value

      fetch(searchURL + searchTerm)
        .then(res => res.json()).then(data => {
          if(data['Search']) {
            data['Search'].forEach(movie => renderMovie(movie))
          }
          else {
            movieContainer().innerText = 'No movies were found in your search.'
          }
      })

      //getMovieForm().reset()
    }
}

function renderMovie(mov) {
  let movieCard = document.createElement('div')
  movieCard.addEventListener('click', fetchMovie)
  movieCard.className = "fluid black card"
  movieCard.dataset.movieId = mov["imdbID"]

  let imageHolder = document.createElement('div')
  imageHolder.className = "image"

  let poster = document.createElement('img')
  poster.src = mov['Poster']
  poster.setAttribute('onerror', "this.onerror=null;this.src='https://rawapk.com/wp-content/uploads/2018/09/Movie-HD-Icon.png';")

  let content = document.createElement('div')
  content.className = "center aligned content"

  let title = document.createElement('div')
  title.className = "header"
  title.innerText = mov['Title']

  imageHolder.appendChild(poster)
  content.appendChild(title)
  movieCard.append(imageHolder, content)

  movieContainer().appendChild(movieCard)
}

/////////// MOVIE REVIEWS PAGE ////////////////

function fetchMovie() {
  movieContainer().innerHTML = ''
  fetch(showURL + event.currentTarget.dataset.movieId)
    .then(res => res.json()).then(data => showMovie(data))
}

function showMovie(mov) {
  // create movie card //
  let movieCard = document.createElement('div')
  movieCard.dataset.movieId = mov["imdbID"]

  /// add poster //
  let poster = document.createElement('img')
  poster.src = mov["Poster"]
  poster.setAttribute('onerror', "this.onerror=null;this.src='https://rawapk.com/wp-content/uploads/2018/09/Movie-HD-Icon.png';")

  // add title & year ////
  let titleYear = document.createElement('p')
  titleYear.innerText = `${mov['Title']} (${mov['Year']})`

  ////////// Runtime + Genre + Release Date ////////
  let lengthGenreDate = document.createElement('div')
  let runtime = document.createElement('span')
  let genre = document.createElement('span')
  let release_date = document.createElement('span')
  runtime.innerText = mov["Runtime"]
  genre.innerText = mov["Genre"]
  release_date.innerText = mov["Released"]
  lengthGenreDate.append(runtime, genre, release_date)

  /////////// plot //////////
  let plot = document.createElement('p')
  plot.innerText = mov["Plot"]

  ////////// production + director + writer + cast /////////
  let production = document.createElement('p')
  let director = document.createElement('p')
  let writer = document.createElement('p')
  let actors = document.createElement('p')
  production.innerText = mov["Production"]
  director.innerText = mov["Director"]
  writer.innerText = mov["Writer"]
  actors.innerText = mov["Actors"]

  movieCard.append(poster, titleYear, lengthGenreDate, plot, director, writer, actors)
  movieContainer().appendChild(movieCard)
  renderReviewForm()
}

function postReview() {
  event.preventDefault()
  let data = { movie_id: event.target.previousSibling.dataset.movieId, content: event.target.children[0].value , user_id: current_user.id}

  getReviewForm().reset()

  fetch(apiURL + 'reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(revData => renderReview(revData))
}

function updateReview() {
  event.preventDefault()

  let data = { content: event.target.children[0].value }

  getReviewForm().reset()

  fetch(apiURL + `reviews/${event.target.dataset.reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(revData => updateReviewContent(revData))
}

function makeReviewSection() {
  let revList = document.createElement('ul')
  revList.innerText = 'REVIEWS'
  revList.id = "review-container"
  movieContainer().appendChild(revList)
  loadReviews()
}

function renderReview(rev) {
  let revEl = document.createElement('li')
  revEl.innerText = rev.content
  revEl.dataset.revId = rev.id
  reviewContainer().appendChild(revEl)
}

function updateReviewContent(rev) {
  getMyReview(rev.id).innerText = rev.content
}

function loadReviews() {
  fetch(apiURL + 'reviews').then(res => res.json()).then(reviews => {
    let movRevs = reviews.filter( rev => rev.movie_id === getMoviePageId())
    movRevs.forEach(movRev => renderReview(movRev))
  })
}

//////////////// FORMS ///////////////


function renderReviewForm() {
  let revForm = document.createElement('form')
  let revInput = document.createElement('textarea')
  let revSubmit = document.createElement('input')
  revSubmit.type = 'submit'
  revForm.id = 'review-form'

  fetch(apiURL + `users/${current_user.id}`/*`users/${current_user_id}`*/)
    .then(res => res.json()).then(user => {
      let myRev = user.reviews.find(rev => rev.movie_id === getMoviePageId())

      if(myRev) {
        revInput.value = myRev.content
        revForm.dataset.reviewId = myRev.id
        revForm.addEventListener('submit', updateReview)
      }

      else {
        revForm.addEventListener('submit', postReview)
      }
  })

  revForm.appendChild(revInput)
  revForm.appendChild(revSubmit)
  movieContainer().appendChild(revForm)
  makeReviewSection()
}



/////////// HELPER METHODS ///////////////

function reviewContainer() {
  return document.querySelector('#review-container')
}

function getMyReview(id) {
  return document.querySelector(`[data-rev-id='${id}']`)
}

function getReviewForm() {
  return document.querySelector('#review-form')
}

function getMovieForm() {
  return document.querySelector('#movie-form')
}

function movieContainer() {
  return document.querySelector('#movie-container')
}

function loginLink() {
  return document.querySelector('#login')
}

function homeLink() {
  return document.querySelector('#home')
}

function reviewsLink() {
  return document.querySelector('#my-reviews')
}

function getLoginForm() {
  return document.querySelector('#login-form')
}

function getMoviePageId() {
  return movieContainer().firstElementChild.dataset.movieId
}

function refresh() {
  window.location.reload()
}

function renderNav() {

  if (logged_in) {
    let nav = document.createElement('nav')
    nav.className = "ui horizontal menu"

    let myReviewsLink = document.createElement('a')
    myReviewsLink.className = "link item"
    myReviewsLink.id = "my-reviews"
    myReviewsLink.innerText = "My Reviews"
    myReviewsLink.addEventListener('click', getMovies)

    let myProfileLink = document.createElement('a')
    myProfileLink.className = "link item"
    myProfileLink.id = "my-profile"
    myProfileLink.innerText = "My Profile"
    myProfileLink.addEventListener('click', loadProfile)

    let rightNav = document.createElement('div')
    rightNav.className = "right menu"

    let searchBarDiv = document.createElement('div')
    searchBarDiv.className = "item"

    let searchBar = document.createElement('div')
    searchBar.className = "ui icon input"

    let searchInput = document.createElement('input')
    searchInput.name = "search"
    searchInput.placeholder = "Search for a movie..."
    searchInput.addEventListener('keypress', function() {
      if(event.key === "Enter") {
        getMovies()
      }
    })

    let searchIcon = document.createElement('i')
    searchIcon.id = 'search-icon'
    searchIcon.className = "search link icon"
    searchIcon.addEventListener('click', getMovies)

    let logoutLink = document.createElement('a')
    logoutLink.className = "ui item"
    logoutLink.id = "logout"
    logoutLink.innerText = "Logout"
    logoutLink.addEventListener('click', refresh)

    document.body.appendChild(nav)
    nav.append(myReviewsLink, myProfileLink, rightNav)
    rightNav.append(searchBarDiv, logoutLink)
    searchBarDiv.appendChild(searchBar)
    searchBar.append(searchInput, searchIcon)
  }
}


function loadProfile() {

  document.body.innerHTML = ''
  renderNav()

  let updateContainer = document.createElement('div')
  updateContainer.className = "ui middle aligned center aligned grid"

  let updateBox = document.createElement('div')
  updateBox.className = "column login-box"

  let updateHeader = document.createElement('h2')
  updateHeader.className = "ui black header"
  updateHeader.innerText = "My Profile"

  let updateForm = document.createElement('form')
  updateForm.id = 'update-form'
  updateForm.className = "ui large form"

  let updateDiv = document.createElement('div')
  updateDiv.className = "ui stacked segment"

  let updateName = document.createElement('div')
  updateName.className = "field"

  let nameInput = document.createElement('input')
  nameInput.id = 'update-name'
  nameInput.placeholder = 'Full Name'
  nameInput.value = current_user.name

  let updateUsername = document.createElement('div')
  updateUsername.className = "field"

  let usernameInput = document.createElement('input')
  usernameInput.id = 'update-username'
  usernameInput.placeholder = 'Username'
  usernameInput.value = current_user.username

  let updateEmail = document.createElement('div')
  updateEmail.className = "field"

  let emailInput = document.createElement('input')
  emailInput.id = 'update-email'
  emailInput.placeholder = 'Email'
  emailInput.value = current_user.email

  let updateButton = document.createElement('div')
  updateButton.className = "ui fluid blue large submit button"
  updateButton.id = "update"
  updateButton.innerText = "Update Profile"
  updateButton.addEventListener('click', updateProfile)

  document.body.appendChild(updateContainer)
  updateContainer.appendChild(updateBox)
  updateBox.append(updateHeader, updateForm)
  updateForm.appendChild(updateDiv)
  updateDiv.append(updateName, updateUsername, updateEmail, updateButton)
  updateName.appendChild(nameInput)
  updateUsername.appendChild(usernameInput)
  updateEmail.appendChild(emailInput)
}

function updateProfile() {
  event.preventDefault()
  if(event.target.id = 'update') {
    alert('Profile successfully updated!')
  }

  let profile = event.currentTarget.children
  let data = { name: getUpdateName().value, username: getUpdateUsername().value, email: getUpdateEmail().value }

  fetch(apiURL + `users/${current_user.id}`/*`users/${current_user_id}`*/, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(user => {
    current_user = user
    loadProfile()
  })
}

// function  updateProfileContent(user) {
//   let formInputs = getProfileForm().children
//   formInputs[0].value = user.name
//   formInputs[1].value = user.username
//   formInputs[2].value = user.email
//
//   alert('Profile successfully updated!')
// }

function getUpdateForm() {
  return document.querySelector('#update-form')
}

function getLoginUsername() {
  return document.querySelector('#login-username')
}

function getRegisterName() {
  return document.querySelector('#register-name')
}

function getRegisterUsername() {
  return document.querySelector('#register-username')
}

function getRegisterEmail() {
  return document.querySelector('#register-email')
}

function getUpdateName() {
  return document.querySelector('#update-name')
}

function getUpdateUsername() {
  return document.querySelector('#update-username')
}

function getUpdateEmail() {
  return document.querySelector('#update-email')
}
