
// Enter your OpenWeatherMap API key here
const API_KEY = "9bda8bea3ad6216484c11463005cf326";

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const weatherContent = document.getElementById("weather-content");

const searchButton = document.getElementById("search-btn");

// Search city when form is submitted
searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    await getWeather(city);
});

// Get current weather and forecast
async function getWeather(city) {
    loading.hidden = false;
    errorMessage.hidden = true;
    weatherContent.hidden = true;
    searchButton.disabled = true;

    try {
        if (API_KEY === "YOUR_API_KEY") {
            throw new Error("Please add your OpenWeatherMap API key in script.js.");
        }

        // Current weather API
        const currentURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        // Five-day forecast API
        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentURL),
            fetch(forecastURL)
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (!currentResponse.ok) {
            throw new Error(currentData.message || "City not found.");
        }

        if (!forecastResponse.ok) {
            throw new Error(forecastData.message || "Unable to load forecast.");
        }

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        weatherContent.hidden = false;

    } catch (error) {
        showError(error.message);
    } finally {
        loading.hidden = true;
        searchButton.disabled = false;
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);

    document.getElementById("city-name").textContent =
        `${data.name}, ${data.sys.country}`;

    document.getElementById("date").textContent =
        new Date().toLocaleString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.getElementById("temperature").textContent = temperature;
    document.getElementById("feels-like").textContent =
        `Feels like ${feelsLike}°C`;

    document.getElementById("weather-condition").textContent =
        data.weather[0].description;

    document.getElementById("humidity").textContent =
        `${data.main.humidity}%`;

    document.getElementById("wind").textContent =
        `${data.wind.speed} m/s`;

    document.getElementById("pressure").textContent =
        `${data.main.pressure} hPa`;

    const iconCode = data.weather[0].icon;

    document.getElementById("weather-icon").src =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.getElementById("weather-icon").alt =
        data.weather[0].description;

    // Change background based on weather
    const weatherType = data.weather[0].main.toLowerCase();
    const isNight = iconCode.endsWith("n");

    document.body.className = "";

    if (isNight) {
        document.body.classList.add("night");
    } else if (weatherType.includes("rain") ||
        weatherType.includes("drizzle") ||
        weatherType.includes("thunderstorm")) {
        document.body.classList.add("rainy");
    } else if (weatherType.includes("cloud")) {
        document.body.classList.add("cloudy");
    } else {
        document.body.classList.add("clear");
    }
}

// Display five-day forecast
function displayForecast(data) {
    const forecastList = document.getElementById("forecast-list");

    forecastList.innerHTML = "";

    // Select one forecast around midday for each day
    const dailyForecasts = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    ).slice(0, 5);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt_txt);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const icon = day.weather[0].icon;
        const description = day.weather[0].description;
        const temp = Math.round(day.main.temp);

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <p>${dayName}</p>
            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >
            <h3>${temp}°C</h3>
            <p>${description}</p>
        `;

        forecastList.appendChild(card);
    });
}

// Display error messages
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    weatherContent.hidden = true;
}
