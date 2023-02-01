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
