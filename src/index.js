const searchURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&s='
const showURL = 'https://www.omdbapi.com/?apikey=1d0d9f45&i='
const apiURL = 'http://localhost:3000/api/v1/'

let logged_in = false
let current_user_id = null

document.addEventListener('DOMContentLoaded', function(){
  if(logged_in) {
    getMovies()
  }

  else {
        loginButton().addEventListener('click', renderLogin)
  }
})

///////// LOGIN //////////
function renderLogin() {
  document.body.innerHTML = ''

  let loginForm = document.createElement('form')
  let usernameEl = document.createElement('input')
  let submitEl = document.createElement('input')
  submitEl.type = 'submit'
  loginForm.id = 'login-form'

  loginForm.addEventListener('submit', verifyUser)
  loginForm.appendChild(usernameEl)
  loginForm.appendChild(submitEl)

  document.body.appendChild(loginForm)

}

function verifyUser() {
  event.preventDefault()
  let name = event.target.children[0].value

  fetch(apiURL + 'users').then(res => res.json()).then(data => {
    let found = data.find( user => { return user.username === name})
    if(found) {
      logged_in = true
      current_user_id = found.id
      getMovies()
    }
  })


}

///////// HOME PAGE /////////
function getMovies() {
  if(event) {
    event.preventDefault()
  }

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

  if(movieContainer() === null) {
    let container = document.createElement('div')
    container.id = 'movie-container'
    document.body.appendChild(container)
  }

  else { movieContainer().innerHTML = '' }

  if(logged_in && !event) {
      getLoginForm().style.display = 'none'
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

/////////// SHOW PAGE ////////////////

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

function makeReviewSection() {
  let revList = document.createElement('ul')
  revList.innerText = 'REVIEWS'
  revList.id = "review-container"
  movieContainer().appendChild(revList)
}

function renderReview(rev) {
  let revEl = document.createElement('li')
  revEl.innerText = rev.content
  reviewContainer().appendChild(revEl)
}

//////////////// FORMS ///////////////


function renderReviewForm() {
  let revForm = document.createElement('form')
  let revInput = document.createElement('textarea')
  let revSubmit = document.createElement('input')
  revSubmit.type = 'submit'
  revForm.id = 'review-form'

  revForm.addEventListener('submit', postReview)
  revForm.appendChild(revInput)
  revForm.appendChild(revSubmit)
  movieContainer().appendChild(revForm)
  makeReviewSection()
}

/////////// HELPER METHODS ///////////////

function reviewContainer() {
  return document.querySelector('#review-container')
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

function loginButton() {
  return document.querySelector('#login')
}

function getLoginForm() {
  return document.querySelector('#login-form')
}
