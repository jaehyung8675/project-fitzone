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

// Getting Geolocation
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Distructring latitude and longitude to get data and apply it
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      // Leaflet source to create map
      const map = L.map("map").setView(coords, 12);

      // Changed map theme from https:/tile.openstreetmap.org/{z}/{x}/{y}.png
      L.tileLayer("https:/{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Click on map to display the spot of the event
      map.on("click", function (mapEvent) {
        // Distructure map latitude and longitude
        const { lat, lng } = mapEvent.latlng;

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
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
      });
    },
    // Alert when current location is blocked
    function () {
      alert("Could not get your position");
    }
  );
