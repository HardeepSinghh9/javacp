const apiKey = '1730a7f9156cbb51494924ed9613a1ed';
let apiUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;
let extendedApiUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric`;

document.addEventListener('DOMContentLoaded', () => {
    // Populate dropdown with recent searches on page load
    populateRecentSearches();
});

document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        fetchWeatherByCity(city);
        fetchExtendedWeather(city);
        hideDropdown();
    } else {
        alert('Please enter a valid city name');
    }
});

document.getElementById('current-location-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        }, error => {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

let searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];

// Update event listener to handle show and hide list events
const cityInput = document.getElementById('city-input');
cityInput.addEventListener('focus', () => {
    populateRecentSearches(); //
});

cityInput.addEventListener('blur', () => {
    setTimeout(() => hideDropdown(), 200); // Hide dropdown after a short delay
});

cityInput.addEventListener('input', () => {
    const input = cityInput.value.trim().toLowerCase();
    const dropdown = document.getElementById('input-dropdown');
    const dropdownList = document.getElementById('input-dropdown-list');

    if (input.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    // Filter searchedCities based on input
    const filteredCities = searchedCities.filter(city => city.toLowerCase().startsWith(input));

    // Clear existing items
    dropdownList.innerHTML = '';

    // Add filtered items
    filteredCities.forEach(city => {
        const item = document.createElement('div');
        item.textContent = city;
        item.classList.add('px-4', 'py-2', 'text-gray-700', 'hover:bg-gray-100', 'cursor-pointer');
        item.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeatherByCity(city);
            hideDropdown();
        });
        dropdownList.appendChild(item);
    });

    if (filteredCities.length > 0) {
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
});

function saveCity(city) {
    if (!searchedCities.includes(city)) {
        searchedCities.push(city);
        if (searchedCities.length > 5) {
            searchedCities = searchedCities.slice(-5); // latest 5 cities
        }
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
        populateRecentSearches(); // Update dropdown with recent searches
    }
}

async function fetchWeatherByCity(city) {
    try {
        const response = await fetch(`${apiUrl}&q=${city}`);
        const data = await response.json();
        if (data.cod === 200) {
            updateUI(data);
            saveCity(city);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        if (data.cod === 200) {
            updateUI(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateUI(data) {
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${data.main.temp}°C`;
    document.getElementById('description').textContent = data.weather[0].description;

    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    document.getElementById('icon').innerHTML = `<img src="${icon}" alt="Weather icon">`;
}

async function fetchExtendedWeather(city) {
    try {
        const response = await fetch(`${extendedApiUrl}&q=${city}`);
        const data = await response.json();
        if (data.cod === '200') {
            updateExtendedUI(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching extended weather data:', error);
    }
}

function updateExtendedUI(data) {
    const forecastContainer = document.getElementById('extended-forecast');
    forecastContainer.innerHTML = '';

    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) {  // 8 timestamps per day
            const date = new Date(forecast.dt_txt);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
            const temp = `${forecast.main.temp}°C`;
            const wind = `Wind: ${forecast.wind.speed} m/s`;
            const humidity = `Humidity: ${forecast.main.humidity}%`;

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('bg-gray-200', 'rounded-lg', 'shadow-lg', 'p-4', 'mb-4', 'text-center');
            forecastItem.innerHTML = `
                <div>${day}</div>
                <img src="${icon}" alt="Weather icon" class="mx-auto">
                <div>${temp}</div>
                <div>${wind}</div>
                <div>${humidity}</div>
            `;

            forecastContainer.appendChild(forecastItem);
        }
    });
}

function populateRecentSearches() {
    const dropdownList = document.getElementById('input-dropdown-list');
    dropdownList.innerHTML = '';

    for (let i = Math.max(0, searchedCities.length - 5); i < searchedCities.length; i++) {
        const city = searchedCities[i];
        const item = document.createElement('div');
        item.textContent = city;
        item.classList.add('px-4', 'py-2', 'text-gray-700', 'hover:bg-gray-100', 'cursor-pointer');
        item.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeatherByCity(city);
            hideDropdown();
        });
        dropdownList.appendChild(item);
    }

    const dropdown = document.getElementById('input-dropdown');
    if (searchedCities.length > 0 && cityInput === document.activeElement) {
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

function hideDropdown() {
    const dropdown = document.getElementById('input-dropdown');
    dropdown.classList.add('hidden');
}
