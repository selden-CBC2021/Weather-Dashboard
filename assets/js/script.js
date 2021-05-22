var apiKey = 'c85fbbfef608740795a61fc521400e24';
var cityInput = document.querySelector('#search-input');
var citySearchBtn = document.querySelector('#search-btn');
var cityName = document.querySelector('#city-name');
var searchArr = [];

var handleFormSubmit = function (event) {
    event.preventDefault();
    // capitalizes first letter in each word lowercase the rest
    var citySelect = cityInput.value.trim().toLowerCase().split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    if (citySelect) {
        getCityLocation(citySelect);
        cityInput.value = '';

    } else {
        alert('Type any city name');
    }
}

var getCityLocation = function(city) {
    
    var currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  
    fetch(currentWeatherApi)
    .then(function (response) { 
          if(response.ok) 
          console.log(response)
            response.json().then(function(data) {
                var lon = data.coord['lon'];
                var lat = data.coord['lat'];
                getForecast(city, lon, lat);
                // prevent city from being saved twice on the city-list
                if (document.querySelector('.city-list')) {
                    document.querySelector('.city-list').remove();
                }
                saveCity(city);
                loadSearches();
        })
      })
      
    }
    // get forecast for selected city
    var getForecast = function(city, lon, lat) {
        var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        fetch(oneCallApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
        // shows city name with date
                cityName.textContent = `${city} ${moment().format("dddd, MMMM Do YYYY")}`; 
                console.log(data)
                currentCityForecast(data);
                fiveDayForecast(data);
            }
        )}
    })
    } 

    var displayTemp = function(element, temperature) {
        var tempEl = document.querySelector(element);
        var elementText = Math.round(temperature);
        tempEl.textContent = elementText;
    }


    var currentCityForecast = function(forecast) {
    var forecastEl = document.querySelector('.current-forecast');
    forecastEl.classList.remove('invisible');

    var weatherIconEl = document.querySelector('#today-icon');
    var currentIcon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute('src', `http://openweathermap.org/img/wn/${currentIcon}.png`);
    weatherIconEl.setAttribute('alt', forecast.current.weather[0].main)

    displayTemp('#current-temp', forecast.current['temp']);
    displayTemp('#current-feels-like', forecast.current['feels_like']);
    displayTemp('#current-high', forecast.daily[0].temp.max);
    displayTemp('#current-low', forecast.daily[0].temp.min);

    var currentConditionEl = document.querySelector('#current-condition');
    // will make first letter of each word capitalized
    currentConditionEl.textContent = forecast.current.weather[0].description
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    var currentHumidityEl = document.querySelector('#current-humidity');
    currentHumidityEl.textContent = forecast.current['humidity'];

    var currentWindEl = document.querySelector('#current-wind-speed')
    currentWindEl.textContent = forecast.current['wind_speed'];

    var uviEl = document.querySelector('#current-uvi')
    var currentUvi = forecast.current['uvi'];
    uviEl.textContent = currentUvi;
    
    // uvi colors 
    if (currentUvi <= 3) {
        uviEl.className = 'badge badge-success';
    }
    if (currentUvi <= 5) {
        uviEl.className = 'badge badge-warning';
    }
    if (currentUvi <= 7) {
        uviEl.className = 'badge badge-danger';
    }
    if (currentUvi == 0) {
        uviEl.className = 'badge text-dark';
        uviEl.setAttribute('style', 'background-color: white');
    }
}

    var fiveDayForecast = function(forecast) { 

    for (var i = 1; i < 6; i++) {
        var dateFiveDay = document.querySelector('#date' + i);
        dateFiveDay.textContent = moment().add(i, 'days').format("ddd, Do");

        var iconImg = document.querySelector('#icon' + i);
        // setting iconcode for the daily weather icon for its corresponding day
        var iconCode = forecast.daily[i].weather[0].icon;
        iconImg.setAttribute('src', `http://openweathermap.org/img/wn/${iconCode}.png`);
        iconImg.setAttribute('alt', forecast.daily[i].weather[0].main);

        displayTemp('#temp' + i, forecast.daily[i].temp.day);
        displayTemp('#wind-speed' + i, forecast.daily[i]['wind_speed']);
        displayTemp('#humidity' + i, forecast.daily[i]['humidity']);

        // displayTemp('#high-' + i, forecast.daily[i].temp.max);
        // displayTemp('#low-' + i, forecast.daily[i].temp.min);
        displayTemp('#feels-like' + i, forecast.daily[i].feels_like.day);
    }
}


var saveCity = function(city) {
    for (var i = 0; i < searchArr.length; i++) {
        if (city === searchArr[i]) {
            // if city is already in the searchArr this will remove or replace existing elements 
            searchArr.splice(i, 1);
        }
    }
        // will add the recent search to the end (top) of the array
        searchArr.push(city);
        localStorage.setItem('searches', JSON.stringify(searchArr));
    }

var loadSearches = function() {
    searchArr = JSON.parse(localStorage.getItem('searches'));
    if (!searchArr) {
        searchArr = [];
        return false;
    } else if (searchArr.length > 5) {
        // will remove the 1st element from the list and shift the array
        // if there are 5 cities there and you search a 6th
        searchArr.shift();
    }
    var recentSearches = document.querySelector('#recent-searches');
    var cityListUl = document.createElement('ul');
    // adding list-group class from bootstrap and city-list to add click listener functionality later
    cityListUl.className = 'list-group city-list';
    recentSearches.appendChild(cityListUl);

    for (var i = 0; i < searchArr.length; i++) {
        var cityListItem = document.createElement('button');
        cityListItem.setAttribute('type', 'button');
        cityListItem.className = 'list-group-item-info';
        cityListItem.setAttribute('value', searchArr[i]);
        cityListItem.textContent = searchArr[i];
        cityListUl.prepend(cityListItem);
    }

    var cityList = document.querySelector('.city-list');
    cityList.addEventListener('click', selectRecent)
}

var selectRecent = function(event) {
    var recentCity = event.target.getAttribute('value');
    getCityLocation(recentCity);
}

loadSearches();
citySearchBtn.addEventListener('click', handleFormSubmit);
   
  
  // helper function that allows enter to be used for clicking the search button 
  cityInput.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        citySearchBtn.click();
    }
}); 
