const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')
app.use(express.json())
let db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDBandServer()

const getTheMovieName = dbObj => {
  return {
    movieName: dbObj.movie_name,
  }
}

const getMovieAllDetails = dbObj => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  }
}

const getTheDirectorDetails = dbObj => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const allMoviesQuery = `
    SELECT 
        *
    FROM    
        movie
    ORDER BY 
        movie_id;
    `
  const movieNameArray = await db.all(allMoviesQuery)
  response.send(
    movieNameArray.map(eachMovie => {
      return getTheMovieName(eachMovie)
    }),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO 
        movie(director_id, movie_name, lead_actor)
    VALUES(${directorId}, '${movieName}', '${leadActor}');
    `
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieQuery = `
    SELECT 
        *
    FROM    
        movie
    WHERE 
        movie_id = ${movieId};
    `
  const movieDetails = await db.get(movieQuery)
  response.send(movieDetails)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE 
        movie
    SET 
      director_id =${directorId}, 
      movie_name ='${movieName}' ,
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};
    `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMoviesQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};  
  `
  await db.run(deleteMoviesQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const allDirectorQuery = `
    SELECT 
        *
    FROM    
        director
    ORDER BY 
        director_id;
    `
  const directorsArray = await db.all(allDirectorQuery)
  response.send(
    directorsArray.map(eachDirector => {
      getTheDirectorDetails(eachDirector)
    }),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorMovieQuery = `
    SELECT 
        *
    FROM    
        director
    WHERE 
        director_id = ${directorId};
    `
  const movieDetails = await db.get(directorMovieQuery)
  response.send(movieDetails)
})

module.exports = app
