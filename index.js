const resultsSection = document.getElementById("results-section")
const headerMainTitle = document.getElementById("main-title")
const headerSubtitle = document.getElementById("subtitle")
const searchBarContainer = document.getElementById("search-bar-container")
let watchListStorage=[]
//this file will be hidden with .gitignore
import { OMDb_API_KEY } from "/data.js"


//loads homepage content
document.onload = homePageDisplay()

//listens for page clicks
document.body.addEventListener("click", e => {
    getSearchResults(e.target.id)
    watchlistDisplay(e.target.id)
    addFilmtoWatchlist(e.target)
    homePageRedirect(e)
    removeFilmFromWatchlist(e.target)
})

//listens for toggle switches between light and dark mode
document.getElementById("checkbox").addEventListener("change", () => {
    document.body.classList.toggle("dark")
})

//listens for search bar queries
function getSearchResults(id)
{
    if(id === document.getElementById("search-btn").id) {
       generateFilmResults(document.getElementById("search-bar").value)
    }
}

//retrieves all possible films matching user search criteria
async function generateFilmResults(userInput)
{
    const resp = await fetch(`http://www.omdbapi.com/?s=${userInput}&type=movie&apikey=${OMDb_API_KEY}`)
    const data = await resp.json()
    //checks if valid film results exist
    if(data.Response != "False") {
        resultsSection.innerHTML =""
        data.Search.forEach((current,index) => {
            getSpecificFilmInfo(data.Search[index].imdbID)
       })
    }
    //if no results found, user receives following prompt
    else {
        resultsSection.innerHTML = ` <h3 class="watch-list-desc"> 
            Unable to find what you're looking for. Please try another search. </h3> `
    }
}

//obtains specific info about a given film
async function getSpecificFilmInfo(userInput)
{
    let FilmIndex = 1
    const resp = await fetch(`http://www.omdbapi.com/?i=${userInput}&type=movie&apikey=${OMDb_API_KEY}`)
    const data = await resp.json()
    //filters out films that qualify as "shorts"
    if(parseInt(data.Runtime) >=40)
        { filmResultsDisplay(data, FilmIndex) }
}

//displays film data to page from given data
function filmResultsDisplay(data, index)
{ 
     resultsSection.innerHTML+=  
        `
            <div class ="film-result" id = "${data.imdbID}">
                <div class ="film-graphic"> 
                    <img src="${data.Poster}">
                </div>
                <div class ="film-info">
                    <h4> ${data.Title} </h4> <i class="fas fa-star"></i> <h6> ${data.imdbRating} </h6>
                    <p> ${data.Runtime} &ensp; ${data.Genre}  &ensp;</p>  
                    <i class="fas fa-plus-circle remove add" id ="${data.imdbID}-btn"></i> 
                    <button class= "remove add" id ="remove-btn-${index}">  Watchlist </button>
                    <h5> ${data.Plot} </h5>
                </div>
            </div>
        `
        index++
}

//displays home page content
function homePageDisplay()
{
    headerMainTitle.textContent ="FilmFinder"
    headerSubtitle.textContent ="My Watchlist"
    resultsSection.innerHTML = 
        ` <h3 class="watch-list-desc"> <i class="fas fa-film"></i> <br> Start Exploring </h3> `  
}

//listens for home page requests
function homePageRedirect(id)
{
    if(id.target.id === headerMainTitle.id) { 
        //main title is clicked on watchlist page and redirects to home page
        if(headerSubtitle.textContent === "Search For Films") {
            searchBarContainer.classList.toggle("hide")
            homePageDisplay() 
        }
        //main title is clicked while on home page, no redirect occurs
        else { 
            homePageDisplay() 
        }  
    } 
    // "+ lets add some films" btn is clicked from watchlist page and redirects to home page
    else if(id.target.classList.contains("add-film") == true ) {
        searchBarContainer.classList.toggle("hide")
        homePageDisplay() 
    }
}

//listens for watchlist page requests
function watchlistDisplay(id)
{//id === headerSubtitle.id && headerSubtitle.textContent == "My Watchlist"
    if(id === headerSubtitle.id && headerMainTitle.textContent === "FilmFinder") {
        headerMainTitle.textContent ="Watchlist"
        headerSubtitle.textContent ="Search For Films"
        searchBarContainer.classList.toggle("hide")
        //displays each film in watchlist and changes associated watchlist icon button
        if(watchListStorage.length > 0) {
            resultsSection.innerHTML=""
            watchListStorage.forEach(currentFilm => {
                getSpecificFilmInfo(currentFilm)
                setTimeout(() => {
                    document.getElementById(`${currentFilm}-btn`).setAttribute("class", "fas fa-minus-circle remove add")
                }, 120)
            })
        }
        //displays user prompt if watchlist is empty
        else {
            resultsSection.innerHTML = 
            `
                <h3 class="watch-list-desc"> Your watchlist is looking a little empty... </h3>
                <button class="add-film-btn add-film">
                    <i class="fas fa-plus-circle add-film"></i> Let's add some films! 
                </button> 
            `
        }
    }
    //subtitle is clicked while on watchlist page, redirects back to home page
    else if(id === headerSubtitle.id && headerSubtitle.textContent == "Search For Films") {
        searchBarContainer.classList.toggle("hide")
        homePageDisplay() 
    }
}

//listens for any watchlist queries and additions to watchlist
function addFilmtoWatchlist(id)
{ 
    //"+ watchlist" btn is clicked when current page is search results
    if(id.classList.contains("add") == true && headerSubtitle.textContent!=="Search For Films") {
        let selectedFilmID = id.parentElement.parentElement.id
        if(watchListStorage.includes(selectedFilmID)!=true) {   
            //pushes selected film id to watchlistStorage
            watchListStorage.push(selectedFilmID)
            //updates plus symbol to checkmark symbol and changes text colour
            id.parentElement.children[4].style.color="green"
            id.parentElement.children[4].setAttribute("class", "fas fa-check-square")
            id.parentElement.children[5].style.color="green"
        }   
    }
}

//listens for requests to remove a film from watchlist
function removeFilmFromWatchlist(id)
{   //checks if current page is watchlist page
    if(headerMainTitle.textContent == "Watchlist")
    {   //gets id of selected film then removes it from page and watchlistStorage
        if(id.classList.contains("add") == true) {
            const selectedFilmID = id.parentElement.parentElement.id
            watchListStorage.forEach((current, index) => {
                if(current === selectedFilmID) {
                    watchListStorage.splice(index, index+1)
                    document.getElementById(selectedFilmID).innerHTML=""
                }
            })
        }
    }
}