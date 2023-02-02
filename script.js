"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (new Date() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [latitude, longitude]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([0, 0], 12, 30, 120);
const cycling1 = new Cycling([0, 0], 24, 12, 240);
console.log(run1, cycling1);

///////////////////////////////////////////////
/// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    // After data submit, eventhandlings
    form.addEventListener("submit", this._newWorkout.bind(this));

    // When type is chaged, toggle from cadence to elevation input
    inputType.addEventListener("change", this._toggleElevationField);
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
    this.#map = L.map("map").setView(coords, 12);

    // Changed map theme from https:/tile.openstreetmap.org/{z}/{x}/{y}.png
    L.tileLayer("https:/{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Click on map to show form
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Click on map and display the input field
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    // Distructure map latitude and longitude
    const { lat, lng } = this.#mapEvent.latlng;

    // Display marker
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        // Popup box options
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Fit Zone")
      .openPopup();
  }
}

const app = new App();
