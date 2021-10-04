const currentDayCard = document.querySelector('.today-weather');
const searchHistoryEl = document.querySelector('.search-history');
const searchBtn = document.querySelector('#search-typed-city');
const apiKey = '95d906b07f593f4392e9dcc32de64324'

const lastSearchCity = localStorage.getItem('lastCity') ? localStorage.getItem('lastCity') : 'Atlanta';

let currCity = {};
let currDay = moment().format('M/D/YY');
let weatherData;
let forecastData;
let searchHistory = localStorage.getItem('searchHistory');

getCurrentWeather(lastSearchCity);


function setCurrentCity(city) {
    const currentCityEl = document.querySelector('#current-city');
    currDay = moment().format('M/D/YY');
    currentCityEl.textContent = city + " " + currDay;
};

function updateCurrentWeatherCard(city) {
    currCity.name = city;
    currCity.lat = weatherData.coord.lat;
    currCity.lon = weatherData.coord.lon;

    setCurrentCity(city);
    document.querySelector('#current-temp').textContent = Math.floor(weatherData.main.temp);
    document.querySelector('#current-wind').textContent = weatherData.wind.speed;
    document.querySelector('#current-humidity').textContent = Math.floor(weatherData.main.humidity);
    document.querySelector('#today-icon').setAttribute("src", getWeatherIcon(weatherData));
    handlehistoricSearches(city);
    getFiveDayForecast();
}

function getWeatherIcon(dayData) {
    return "http://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
}

function updateFiveDayForecast() {
    handleUvColor();
    for(var i = 1; i <= 5; i++) {
        updateFutureDayCard(i, forecastData.daily[i]);
    }
}

function updateFutureDayCard(index, dayForecast) {
    var thisDayCard = document.querySelector('#day-' + index + '-card');
    thisDayCard.querySelector(".card-title").textContent = moment.unix(dayForecast.dt).format('M/D/YY');
    thisDayCard.querySelector(".temp-section").textContent = Math.floor(dayForecast.temp.day);
    thisDayCard.querySelector(".wind-section").textContent = dayForecast.wind_speed;
    thisDayCard.querySelector(".humidity-section").textContent = dayForecast.humidity;
    thisDayCard.querySelector(".weather-icon").setAttribute("src", getWeatherIcon(dayForecast));
}

function handleUvColor() {
    const uvButton = document.querySelector('#current-uv-index');
    uvButton.textContent = forecastData.current.uvi;
    uvButton.classList.remove('btn-success', 'btn-danger', 'btn-warning');
    if (forecastData.current.uvi < 3) {
        uvButton.classList.add('btn-success');
    } else if (forecastData.current.uvi > 3 && forecastData.current.uvi < 6) {
        uvButton.classList.add('btn-warning');
    } else if (forecastData.current.uvi > 6) {
        uvButton.classList.add('btn-danger');
    }
}

function addSearchedButton(city) {
    var historyButton = document.createElement('button');
    historyButton.classList.add('btn', 'btn-info');
    historyButton.setAttribute('type', 'button');
    historyButton.textContent = city;
    historyButton.addEventListener('click', function (event) {
        event.preventDefault();
        getCurrentWeather(city);
    });
    searchHistoryEl.appendChild(historyButton);
}

function handlehistoricSearches(currSearch) {
    searchHistory = localStorage.getItem('searchHistory')
    if (!searchHistory) {
        let searchArray = [];
        localStorage.setItem("searchHistory", JSON.stringify(searchArray));
    }
    if (!currSearch) {
        return JSON.parse(localStorage.getItem('searchHistory'));
    } else {
        let searchObj = JSON.parse(localStorage.getItem('searchHistory'))
        let searchArray = [...searchObj];
        searchArray.push(currSearch);
        let distinct = [... new Set(searchArray)];
        localStorage.setItem("searchHistory", JSON.stringify(distinct));
        localStorage.setItem("lastCity", currSearch);
    }
    populatePastButtons()
}

function populatePastButtons() {
    const searchedArray = handlehistoricSearches();
    searchHistoryEl.innerHTML = '';
    searchedArray.forEach(city => {
        addSearchedButton(city);
    });
}

//------------------AJAX Calls------------------//

function getFiveDayForecast() {
    let baseUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}';
    baseUrl = baseUrl.replace('{lat}', currCity.lat);
    baseUrl = baseUrl.replace('{lon}', currCity.lon);
    baseUrl = baseUrl.replace('{part}', 'minutely,hourly,alerts');
    baseUrl = baseUrl.replace('{API key}', apiKey);
    baseUrl += '&units=imperial'
    $.ajax({
        url: baseUrl,
        type: "GET",
        dataType: 'json'
    }).done ((data) => {
        forecastData = data;
        updateFiveDayForecast();
    }).fail (() => {
        console.log("Something went wrong with the call for the future forecast");
    })
}

function getCurrentWeather(city) {
    let baseUrl = 'https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}';
    baseUrl = baseUrl.replace('{city name}', city);
    baseUrl = baseUrl.replace('{API key}', apiKey);
    baseUrl += '&units=imperial'
    $.ajax({
        url: baseUrl,
        type: "GET",
        dataType: 'json'
    }).done ((data) => {
        weatherData = data;
        updateCurrentWeatherCard(city)
    }).fail (() => {
        console.log("Something went wrong with the call for current weather");
    })
}
//------------------End AJAX Calls------------------//

//------------------Event Listeners------------------//
searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    const citySearched = document.querySelector("#city-input").value.trim();
    if (!citySearched) {
        return;
    }
    getCurrentWeather(citySearched);
});