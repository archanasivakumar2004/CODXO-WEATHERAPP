const apiKey = 'b3a11790c786eebf5be32e8f65739dcc'; // You may need to replace this with a valid API key
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const cloudiness = document.getElementById('cloudiness');
const rainfall = document.getElementById('rainfall');
const windSpeed = document.getElementById('wind-speed');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const forecastContainer = document.getElementById('forecast-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});

function showLoading() {
    loading.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
}

function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    showLoading();

    Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    ])
        .then(responses => Promise.all(responses.map(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })))
        .then(([currentData, forecastData]) => {
            hideLoading();
            if (currentData.cod === '404' || forecastData.cod === '404') {
                showError('City not found. Please check the city name and try again.');
            } else {
                updateCurrentWeather(currentData);
                updateForecast(forecastData);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            if (error.message.includes('401')) {
                showError('There was an error authenticating with the weather service. Please check your API key.');
            } else {
                showError('An error occurred while fetching the weather data. Please try again later.');
            }
        });
}

function updateCurrentWeather(data) {
    if (!data || !data.weather || data.weather.length === 0) {
        showError('Invalid data received from the weather service.');
        return;
    }

    cityName.textContent = data.name;
    weatherIcon.innerHTML = getWeatherIcon(data.weather[0].icon);
    weatherDescription.textContent = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    cloudiness.textContent = `${data.clouds.all}%`;
    
    const rain = data.rain && data.rain['1h'] ? data.rain['1h'] : 0;
    rainfall.textContent = `${rain} mm`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    currentWeather.classList.remove('hidden');
}

function updateForecast(data) {
    if (!data || !data.list || data.list.length === 0) {
        showError('Invalid forecast data received from the weather service.');
        return;
    }

    forecastContainer.innerHTML = '';
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather[0].icon)}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });

    forecast.classList.remove('hidden');
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️',
        '01n': '🌙',
        '02d': '⛅',
        '02n': '☁️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '☁️',
        '04n': '☁️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌧️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️'
    };
    return iconMap[iconCode] || '❓';
}