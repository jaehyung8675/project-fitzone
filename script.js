"use strict";

class Workout {
  date = new Date();
  id = (new Date().getTime() + "").slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [latitude, longitude]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  // Set description for workout list
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // Use public interface
  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

///////////////////////////////////////////////
/// APPLICATION ARCHITECTURE

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // After data submit, eventhandlings
    form.addEventListener("submit", this._newWorkout.bind(this));

    // When type is chaged, toggle from cadence to elevation input
    inputType.addEventListener("change", this._toggleElevationField);

    // When list item is clicked, map to marker
    containerWorkouts.addEventListener("click", this._moveToMarker.bind(this));
  }

  _getPosition() {
    // Getting Geolocation
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        // Alert when current location is blocked
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    // Distructring latitude and longitude to get data
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // Leaflet source to display current location on map
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    // Changed map theme from https:/tile.openstreetmap.org/{z}/{x}/{y}.png
    L.tileLayer("https:/{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Click on map to show form
    this.#map.on("click", this._showForm.bind(this));

    // Load marker from local storage data
    this.#workouts.forEach((workout) => {
      this._renderMarker(workout);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Click on map and display the input field
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    // prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value ="";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // Check input is valided
    const validInputs = (...inputs) =>
      inputs.every((input) => Number.isFinite(input));

    // Check input is positive number
    const validPositiveNumber = (...inputs) =>
      inputs.every((input) => input > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // + To change number from string value
    const duration = +inputDuration.value;
    // Distructure map latitude and longitude
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Chech if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !validPositiveNumber(distance, duration, cadence)
      )
        return alert("PLEASE INPUT POSITIVE NUMBER!");

      // Add new object to workout array
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      // Chech if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !validPositiveNumber(distance, duration)
      )
        return alert("PLEASE INPUT POSITIVE NUMBER!");

      // Add new object to workout array
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout); // Push workout to array

    // Render workout on the map as marker
    this._renderMarker(workout);

    // Render workout on list
    this._renderList(workout);

    // Hide from and Clear input fields
    this._hideForm();

    // Set data to local storage
    this._setLocalStorage();
  }

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        // Popup box options
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderList(workout) {
    let listHTML = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === "running")
      listHTML += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
    `;

    if (workout.type === "cycling")
      listHTML += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
    `;

    form.insertAdjacentHTML("afterend", listHTML);
  }

  _moveToMarker(e) {
    const workoutElement = e.target.closest(".workout");

    if (!workoutElement) return;

    // Find matched workout from the workouts data
    const clickedWorkout = this.#workouts.find(
      (workout) => workout.id === workoutElement.dataset.id
    );

    // Leaflet source for moving to marker on map
    this.#map.setView(clickedWorkout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // Increase click value
    // clickedWorkout.click();
  }

  _setLocalStorage() {
    // Set data to local storage
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    // Get data from local storage
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return; // If there is no data, return

    this.#workouts = data; // set local data to workouts array
    this.#workouts.forEach((workout) => {
      this._renderList(workout); // render each local data to workout list
    });
  }

  // For reset data, use at console log -> app.reset()
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();

//////////////////////////////////////////////////
////// Additional features

// 1. ability to edit a workout
// 2. ability to delete a workout
// 3. ability to delete all workouts
// 4. ability to sort workouts by a certain field (e.g. distance)
// 5. Re-build Running and Cycling objects coming from Local Storage
// 6. More realistic error and confirmation message

// [Only after asynchronous section]
// 7. Geocode location from coordinates ("Run in Faro, Portugal")
// 8. Display weather data for workout time and place
