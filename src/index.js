const searchURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&s='
const showURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&i='
const apiURL = 'http://localhost:3000/api/v1/'

let logged_in = false
let current_user_id = null

document.addEventListener('DOMContentLoaded', function(){
  renderLogin()
  //renderNav()
  // loginLink().addEventListener('click', renderLogin)
  // homeLink().addEventListener('click', function(){
  // })
  // reviewsLink().addEventListener('click', getMovies)
  //
  // if(logged_in) {
  //   getMovies()
  // }
  //
  // else {
  //
  // }
})

///////// LOGIN //////////
function renderLogin() {
  document.body.innerHTML = ''

  let loginForm = document.createElement('form')
  let usernameEl = document.createElement('input')
  let submitEl = document.createElement('input')
  submitEl.type = 'submit'
  loginForm.id = 'login-form'

  loginForm.appendChild(usernameEl)
  loginForm.appendChild(submitEl)


  loginForm.addEventListener('submit', verifyUser)

  let signup = document.createElement('a')
  signup.innerText = 'Register as a New User'
  signup.addEventListener('click', newUserForm)

  document.body.append(loginForm, signup)
}

function newUserForm() {
  document.body.innerHTML = ''

  let userForm = document.createElement('form')
  userForm.id = 'user-form'

  let name = document.createElement('input')
  let username = document.createElement('input')
  let email = document.createElement('input')
  let submit = document.createElement('input')
  submit.type = 'submit'



  userForm.addEventListener('submit', function() {
    event.preventDefault()

    let form = event.target

    let data = { name: form.children[0].value, username: form.children[1].value, email: form.children[2].value }

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
      current_user_id = user.id
      getMovies()
    })
  })

  userForm.append(name, username, email, submit)
  document.body.appendChild(userForm)
}

function verifyUser() {
  event.preventDefault()
  let name = event.target.children[0].value

  fetch(apiURL + 'users').then(res => res.json()).then(data => {
    let found = data.find( user => { return user.username === name})

    if(found) {
      logged_in = true
      current_user_id = found.id
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
    if(getProfileForm()) { getProfileForm().remove() }
  }

  if(getMovieForm() === null) {
    let movieForm = document.createElement('form')
    let titleInput = document.createElement('input')
    titleInput.name = 'search'
    movieForm.innerText = 'Search: '
    movieForm.id = 'movie-form'
    movieForm.addEventListener('submit', getMovies)
    let submit = document.createElement('input')
    submit.type = 'submit'

    movieForm.append(titleInput, submit)
    document.body.appendChild(movieForm)
  }

  if(movieContainer() === null) {
    let container = document.createElement('div')
    container.id = 'movie-container'
    document.body.appendChild(container)
  }

  else { movieContainer().innerHTML = '' }

  debugger

  if(logged_in && (!event || event.type == 'click')) {
    if(getLoginForm()) { getLoginForm().style.display = 'none' }
      fetch(apiURL + `/users/${current_user_id}`)
        .then(res => res.json()).then(revData => {

          let movies = revData.reviews.map( rev => rev.movie_id)

          if(movies.length === 0) {
            movieContainer().innerText = 'You have not reviewed any movies yet. Search now to find a movie to review.'
          }
          movies.forEach( id => {
            fetch(showURL + id).then(res => res.json())
              .then(mov => renderMovie(mov))
          })
          //data['Search'].forEach(movie => renderMovie(movie))
      })
    }

    else {
      fetch(searchURL + event.target.children[0].value)
        .then(res => res.json()).then(data => {
          data['Search'].forEach(movie => renderMovie(movie))
      })

      getMovieForm().reset()
    }
}

function renderMovie(mov) {
  let movieCard = document.createElement('div')
  movieCard.addEventListener('click', fetchMovie)

  let poster = document.createElement('img')
  poster.src = mov['Poster']

  let title = document.createElement('div')
  title.innerText = mov['Title']

  movieCard.append(poster, title)
  movieCard.dataset.movieId = mov["imdbID"]
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
  let data = { movie_id: event.target.previousSibling.dataset.movieId, content: event.target.children[0].value , user_id: 1}

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

////////////// USER REVIEWS PAGE /////////////////////


//////////////// FORMS ///////////////


function renderReviewForm() {
  let revForm = document.createElement('form')
  let revInput = document.createElement('textarea')
  let revSubmit = document.createElement('input')
  revSubmit.type = 'submit'
  revForm.id = 'review-form'

  fetch(apiURL + `users/${current_user_id}`)
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
  let nav = document.createElement('nav')

  if(logged_in) {
    let logout = document.createElement('a')
    logout.id = 'logout'
    logout.innerText = 'Logout'


    let myReviews = document.createElement('a')
    myReviews.id = 'my-reviews'
    myReviews.innerText = 'My Reviews'

    let profile = document.createElement('a')
    profile.id = 'profile'
    profile.innerText = 'My Profile'

    logout.addEventListener('click', refresh)
    myReviews.addEventListener('click', getMovies)
    profile.addEventListener('click', loadProfile)
    nav.append(logout, myReviews, profile)

    document.body.appendChild(nav)
  }
}

function loadProfile() {
  document.body.innerHTML = ''
  renderNav()
  let current_user

  let profile_form = document.createElement('form')
  profile_form.id = 'profile-form'
  let name = document.createElement('input')
  let username = document.createElement('input')
  let email = document.createElement('input')
  let submit = document.createElement('input')
  submit.type = 'submit'

  fetch(apiURL + `users/${current_user_id}`)
    .then(res => res.json()).then(user => {

      current_user = user
      name.value = current_user.name
      username.value = current_user.username
      email.value = current_user.email
    })

  profile_form.addEventListener('submit', updateProfile)
  profile_form.append(name, username, email, submit)
  document.body.append(profile_form)
}

function updateProfile() {
  event.preventDefault()
  let profile = event.currentTarget.children
  let data = { name: profile[0].value, username: profile[1].value, email: profile[2].value }

  fetch(apiURL + `users/${current_user_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(user => updateProfileContent(user))
}

function  updateProfileContent(user) {
  let formInputs = getProfileForm().children
  formInputs[0].value = user.name
  formInputs[1].value = user.username
  formInputs[2].value = user.email

  alert('Profile successfully updated!')
}

function getProfileForm() {
  return document.querySelector('#profile-form')
}
