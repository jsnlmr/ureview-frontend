const searchURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&s='
const showURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&i='
const apiURL = 'https://ureview-back.herokuapp.com/api/v1/'
//const movieTrailer = require('movie-trailer');

let logged_in = false
let current_user = null
let current_movie = null

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

  let name = getLoginUsername().value

  fetch(apiURL + 'users').then(res => res.json()).then(data => {
    let found = data.find( user => { return user.username === name})

    if(found) {
      logged_in = true
      current_user = found
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
  }

  if(movieContainer() === null) {
    let container = document.createElement('div')
    container.id = 'movie-container'
    container.className = "ui five stackable cards"
    document.body.appendChild(container)
  }

  else { movieContainer().innerHTML = '' }

  if(logged_in && (!event || (event.type === 'click' && event.target.id != 'search-icon'))) {
    if(getLoginForm()) { getLoginForm().style.display = 'none' }
    let userReviews = current_user.reviews

    if(userReviews.length != 0) {
      let movies = userReviews.map( rev => rev.movie_id)

      movies.forEach( id => {
        fetch(showURL + id).then(res => res.json())
          .then(mov => renderMovie(mov))
      })
    }

    else {
      movieContainer().innerText = 'You have not reviewed any movies yet. Search now to find a movie to review.'
    }
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
    }
}

function renderMovie(mov) {
  let movieCard = document.createElement('div')
  movieCard.addEventListener('click', fetchMovie)
  movieCard.className = "fluid black card"
  movieCard.dataset.movieId = mov["imdbID"]

  let imageHolder = document.createElement('div')
  imageHolder.className = "content image"

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
    .then(res => res.json()).then(mov => {
      current_movie = mov
      showMovie(mov)
    })
}

function showMovie(mov) {
  document.body.innerHTML = ''
  renderNav()

  let movieCard = document.createElement('div')
  movieCard.dataset.movieId = mov["imdbID"]
  movieCard.className = "ui celled grid"
  movieCard.id = 'movie-info'

  let rowDiv = document.createElement('div')
  rowDiv.className = "row"

  let column4wide = document.createElement('div')
  column4wide.className = "four wide column"

  let poster = document.createElement('img')
  poster.src = mov["Poster"]
  poster.setAttribute('onerror', "this.onerror=null;this.src='https://rawapk.com/wp-content/uploads/2018/09/Movie-HD-Icon.png';")

  let column12wide = document.createElement('div')
  column12wide.className = "twelve wide column"

  let movieInfoDiv = document.createElement('div')

  let titleYear = document.createElement('h1')
  titleYear.innerText = `${mov['Title']} (${mov['Year']})`

  let lengthGenreDate = document.createElement('div')

  let runtime = document.createElement('span')
  runtime.id = 'runtime'
  runtime.innerText = mov["Runtime"]

  let genre = document.createElement('span')
  genre.id = 'genre'
  //debugger
  genre.innerText = mov["Genre"]

  let release_date = document.createElement('span')
  release_date.id = 'release-date'
  release_date.innerText = mov["Released"]

  let plot = document.createElement('p')
  plot.innerText = mov["Plot"]

  let plotHeader = document.createElement('h4')
  plotHeader.innerText = "Plot Summary"

  let production = document.createElement('h4')
  production.innerText = mov["Production"]

  let director = document.createElement('p')
  director.innerText = mov["Director"]
  let directorHeader = document.createElement('h4')
  directorHeader.innerText = "Director(s):"

  let writer = document.createElement('p')
  writer.innerText = mov["Writer"]
  let writerHeader = document.createElement('h4')
  writerHeader.innerText = "Writers(s):"

  let actors = document.createElement('p')
  actors.innerText = mov["Actors"]
  let actorsHeader = document.createElement('h4')
  actorsHeader.innerText = "Featured Cast:"

  document.body.appendChild(movieCard)
  movieCard.appendChild(rowDiv)
  rowDiv.append(column4wide, column12wide)
  column4wide.appendChild(poster)
  lengthGenreDate.append(runtime, ' | ', genre, ' | ', release_date)
  column12wide.append(titleYear, production, lengthGenreDate, plotHeader, plot, directorHeader, director, writerHeader, writer, actorsHeader, actors)
  renderReviewForm()
}

function postReview() {
  event.preventDefault()

  let data = {
    movie_id: document.querySelector('#movie-info')
      .dataset.movieId,
    content: document.querySelector('#review-content').value,
    user_id: current_user.id
  }

  getReviewForm().reset()

  fetch(apiURL + 'reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(revData => {
    current_user.reviews.push(revData)
    renderReview(revData)
  })
}

function updateReview() {
  event.preventDefault()

  let data = { content: getReviewContent().value }

  getReviewForm().reset()

  fetch(apiURL + `reviews/${getReviewContent().dataset.reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(revData => {
    getMyReview(revData.id).remove()
    getReviewContent().value = revData.content
    alert('Review updated!')
    renderReview(revData)
  })
}

function makeReviewSection() {
  let revList = document.createElement('div')
  revList.id = 'review-container'
  revList.className = 'ui large comments'

  let revHeader = document.createElement('h3')
  revHeader.className = 'ui dividing header'
  revHeader.innerText = 'Latest Reviews'
  revHeader.id = 'latest'
  revList.appendChild(revHeader)
  document.body.appendChild(revList)
  // revList.innerText = 'REVIEWS'
  // revList.id = "review-container"
  // document.body.appendChild(revList)
  loadReviews()
}

function renderReview(rev) {
  let revDiv = document.createElement('div')
  revDiv.className = "comment"
  revDiv.dataset.revId = rev.id

  let contentDiv = document.createElement('div')
  contentDiv.className = 'content'

  let randomDiv = document.createElement('div')

  let dataSpan = document.createElement('span')
  dataSpan.innerText = 'Reviewed by '

  let authorSpan = document.createElement('span')
  authorSpan.className = 'author'
  authorSpan.innerText = rev.user.username

  let dateSpan = document.createElement('span')
  dateSpan.className = 'aligned right metadata date'

  let textDiv = document.createElement('div')
  textDiv.className = 'text'
  textDiv.innerText = rev.content

  let date
  createdDate = Date.parse(rev.created_at)
  updatedDate = Date.parse(rev.updated_at)

  if(createdDate < updatedDate) {
    date = new Date(updatedDate).toLocaleString()
    dateSpan.innerText = `Updated at ${date}`
  }

  else {
    date = new Date(createdDate).toLocaleString()
    dateSpan.innerText = `Posted at ${date}`
  }


  //debugger
  reviewContainer().insertBefore(revDiv, document.querySelector('#latest').nextSibling)
  //document.querySelector('h3').nextSibling.insert

  //else { reviewContainer().appendChild(revDiv) }
  //reviewContainer().appendChild(revDiv)
  revDiv.appendChild(contentDiv)
  contentDiv.append(randomDiv, textDiv)
  randomDiv.appendChild(dataSpan)
  dataSpan.append(authorSpan, dateSpan)
  //BOOKMARK
  //////// PREVIOUS ///////
  // let revEl = document.createElement('li')
  // revEl.innerText = rev.content
  // revEl.dataset.revId = rev.id
  // reviewContainer().appendChild(revEl)

}

function updateReviewContent(rev) {

  renderReview()
}

function loadReviews() {
  fetch(apiURL + 'reviews')
    .then(res => res.json()).then(reviews => {

      let movRevs = reviews.filter( rev => {
        return rev.movie_id === current_movie.imdbID
      })

      //debugger
      movRevs.sort( (a,b) => {
        return Date.parse(a.updated_at) - Date.parse(b.updated_at)
      }).forEach(movRev => renderReview(movRev))
    })
}

//////////////// FORMS ///////////////


function renderReviewForm() {
  let revForm = document.createElement('form')
  revForm.className = 'ui reply form'

  let fieldDiv = document.createElement('div')
  fieldDiv.className = 'field'

  let revInput = document.createElement('textarea')
  revInput.id = 'review-content'

  let revSubmit = document.createElement('div')
  revSubmit.className = "ui blue labeled submit icon button"

  let editIcon = document.createElement('i')
  editIcon.className='icon edit'

  revForm.id = 'review-form'

  let formHeader = document.createElement('h3')
  formHeader.className = 'ui dividing header'


  let userRev = current_user.reviews.find(rev => {
    return rev.movie_id === current_movie.imdbID
  })

  if(userRev) {
    revInput.value = userRev.content
    revInput.dataset.reviewId = userRev.id
    revSubmit.innerText = 'Edit Review'
    formHeader.innerText = 'Edit Your Previous Review'
    revSubmit.addEventListener('click', updateReview)
  }

  else {
    revSubmit.innerText = 'Post Review'
    formHeader.innerText = 'Add a New Review'
    revSubmit.addEventListener('click', postReview)
  }

  document.body.appendChild(revForm)
  revForm.append(formHeader, fieldDiv, revSubmit)
  fieldDiv.appendChild(revInput)
  revSubmit.appendChild(editIcon)
  makeReviewSection()

  // fetch(apiURL + `users/${current_user.id}`)
  //   .then(res => res.json()).then(user => {
  //     let myRev = user.reviews.find(rev => rev.movie_id === getMoviePageId())
  //
  //     if(myRev) {
  //       revInput.value = myRev.content
  //       revForm.dataset.reviewId = myRev.id
  //       revForm.addEventListener('submit', updateReview)
  //     }
  //
  //     else {
  //       revForm.addEventListener('submit', postReview)
  //     }
  // })

  // revForm.appendChild(revInput)
  // revForm.appendChild(revSubmit)
  // document.body.appendChild(revForm)
  //makeReviewSection()
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

  fetch(apiURL + `users/${current_user.id}`, {
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

function getReviewContent() {
  return document.querySelector('#review-content')
}
