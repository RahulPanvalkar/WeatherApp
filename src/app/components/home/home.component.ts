import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeatherData } from 'src/app/models/weather.model';
import { WeatherForecast } from 'src/app/models/forecast.model';
import { ToggleService } from 'src/app/services/toggle.service';
import { HomeService } from './home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeolocationService } from 'src/app/services/geo-location.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    // Animation to fade in the content when entering
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 })) // Smooth fade-in effect
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  value = '';           // User input value for search
  loading: boolean = false; // Loading state for data fetching to show loading animation
  inCelsius!: boolean;   // Temperature unit toggle (true for Celsius, false for Fahrenheit)

  currentDateTime!: string; // Current date and time
  lastUpdatedTime!: string; // Last updated time of the weather data
  iconURL!: string;        // URL for weather icon
  cityName!: string;       // Name of the city
  weatherStatus!: string;  // Current weather status (e.g., "Sunny", "Cloudy")
  humidity!: number;       // Humidity percentage
  wind!: number;           // Wind speed in km/h
  minTemp_c!: number;      // Minimum temperature in Celsius
  maxTemp_c!: number;      // Maximum temperature in Celsius
  temperature_c!: number;  // Current temperature in Celsius
  minTemp_f!: number;      // Minimum temperature in Fahrenheit
  maxTemp_f!: number;      // Maximum temperature in Fahrenheit
  temperature_f!: number;  // Current temperature in Fahrenheit

  toggleValueSubscription!: Subscription; // Subscription to toggle value changes
  errorMessage: string | null = null;      // Error message for any API failure

  constructor(
    private toggleService: ToggleService,    // Service to manage the temperature unit toggle
    private homeService: HomeService,        // Service to fetch weather data
    private geolocationService: GeolocationService, // Service to get user's location
    private _snackBar: MatSnackBar            // Snackbar for displaying messages
  ) { }

  ngOnInit(): void {
    // Initialize dummy data for demonstration/testing purposes
    //this.dummyData();

    // Check if this is the user's first visit
    this.firstVisit();

    // Subscribe to toggle service to update the temperature unit
    this.inCelsius = !this.toggleService.toggleValue; // Default temperature unit is based on toggle state
    this.toggleValueSubscription = this.toggleService.toggleValue$.subscribe(
      value => (this.inCelsius = !value) // Toggle the unit based on the service's value
    );

    // Set previous weather data if available
    this.setPreviousData();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the toggle value subscription to prevent memory leaks
    this.toggleValueSubscription.unsubscribe();
  }

  /**
   * Check if this is the user's first visit and fetch weather data accordingly.
   */
  firstVisit() {
    const firstVisitFlag = sessionStorage.getItem('firstVisit'); // Check if "firstVisit" flag exists
    const isFirstVisit = !firstVisitFlag; // Determine if it is the first visit

    if (isFirstVisit) {
      this.getUserLocationAndWeather(); // Fetch weather data if it is the first visit
      sessionStorage.setItem('firstVisit', 'false'); // Set the "firstVisit" flag to false
    }
  }

  /**
   * Get user's current location and fetch weather data for that location.
   */
  getUserLocationAndWeather() {
    // Set a timeout to handle requests taking too long
    const { warningTimeout, timeout } = this.setTimeouts();

    this.geolocationService.getCurrentLocation()
      .then(position => {
        clearTimeout(warningTimeout); // Clear the warning timeout
        clearTimeout(timeout);        // Clear the main timeout
        const latitude = position.coords.latitude;   // Get latitude from position
        const longitude = position.coords.longitude; // Get longitude from position
        this.getWeatherDataForUserLocation(latitude, longitude); // Fetch weather data
      })
      .catch(error => {
        console.log("Geo-location error occurred.");
        this.errorMessage = 'Unable to retrieve Geolocation. Please enable location access.';
        this.openSnackBar(this.errorMessage, '', 'error'); // Snackbar for error
        clearTimeout(warningTimeout);
        clearTimeout(timeout);
      });
  }

  /**
   * Fetch weather data for a specific user location using latitude and longitude.
   * @param latitude - Latitude of the location
   * @param longitude - Longitude of the location
   */
  getWeatherDataForUserLocation(latitude: number, longitude: number) {
    this.loading = true; // Set loading state to true

    // Set a timeout to handle requests taking too long
    const { warningTimeout, timeout } = this.setTimeouts();

    // Subscribe to weather data fetching based on geo-location
    this.homeService.fetchWeatherDataByGeoLocation(latitude, longitude).subscribe({
      next: ({ weather, forecast }) => {
        this.updateView(weather, forecast); // Update the view with fetched weather data
        this.loading = false; // Set loading state to false
        clearTimeout(warningTimeout);
        clearTimeout(timeout);
      },
      error: error => {
        console.log("Error occurred while fetching weather data.");
        this.loading = false;
        this.errorMessage = 'Unable to fetch weather data for your location. Please try again.';
        this.openSnackBar(this.errorMessage, 'Dismiss', 'warning'); // Snackbar for error
        clearTimeout(warningTimeout);
        clearTimeout(timeout);
      },
    });
  }

  /**
   * Handle user search for a specific city and fetch weather data.
   */
  onSearch(): void {
    if (this.value) {
      this.loading = true; // Set loading state to true

      // Set a timeout to handle requests taking too long
      const { warningTimeout, timeout } = this.setTimeouts(500);

      // Fetch weather data by city name
      this.homeService.fetchWeatherDataByCity(this.value).subscribe({
        next: ({ weather, forecast }) => {
          this.updateView(weather, forecast); // Update the view with fetched weather data
          this.loading = false; // Set loading state to false
          clearTimeout(warningTimeout);
          clearTimeout(timeout);
          this.openSnackBar("Weather data fetched successfully!", '', 'success'); // Snackbar on success
        },
        error: error => {
          console.log("error cooasd");
          this.loading = false;
          this.errorMessage = 'Unable to fetch weather data. Please try again.';
          this.openSnackBar(this.errorMessage, 'Retry', 'error'); // Snackbar for error
          console.log("error cooasd 111");
          clearTimeout(warningTimeout);
          clearTimeout(timeout);
        },
      });
    }
  }

  /**
   * Set previously stored weather data if available.
   */
  setPreviousData(): void {
    const previousData = this.homeService.getStoredWeatherData();
    if (previousData?.weather && previousData?.forecast) {
      this.updateView(previousData.weather, previousData.forecast); // Update view with stored data
    }
  }

  /**
   * Update the view with the fetched weather data.
   * @param weatherData - Current weather data
   * @param forecastData - Weather forecast data
   */
  private updateView(weatherData: WeatherData, forecastData: WeatherForecast): void {
    this.iconURL = weatherData.current.condition.icon; // Set icon URL
    this.currentDateTime = weatherData.location.localtime; // Set current date/time
    this.lastUpdatedTime = weatherData.current.last_updated; // Set last updated time
    this.weatherStatus = weatherData.current.condition.text; // Set weather status
    this.humidity = weatherData.current.humidity; // Set humidity
    this.wind = weatherData.current.wind_kph; // Set wind speed
    this.cityName = weatherData.location.name; // Set city name

    // Set temperature values in both Celsius and Fahrenheit
    this.temperature_c = weatherData.current.temp_c;
    this.minTemp_c = forecastData.forecast.forecastday[0].day.mintemp_c;
    this.maxTemp_c = forecastData.forecast.forecastday[0].day.maxtemp_c;

    this.temperature_f = weatherData.current.temp_f;
    this.minTemp_f = forecastData.forecast.forecastday[0].day.mintemp_f;
    this.maxTemp_f = forecastData.forecast.forecastday[0].day.maxtemp_f;

    //console.log("City: ", this.cityName, "Current temperature (°C): ", this.temperature_c, "°C / ", this.temperature_f, "°F");
  }

  /**
   * Open Snackbar to display messages or errors to the user.
   * @param message - The message to display
   * @param action - The action to perform on Snackbar click
   * @param type - The type of Snackbar (success, error, warning)
   */
  openSnackBar(message: string, action: string, type: 'success' | 'error' | 'warning') {
    const panelClass = `snackbar-${type}`;
    //console.log("panelClass :: ", panelClass);
    this._snackBar.open(message, action, {
      //duration: 5000,
      panelClass: [panelClass], // Use dynamic class
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Sets two timeouts to handle request duration and show appropriate messages:
   *
   * 1. **Warning Timeout**: 
   *    - Triggers after 20 seconds to display a message indicating the request is taking longer than expected.
   * 2. **Timeout**:
   *    - Triggers after the specified `timeoutDelay` (default is 60 seconds) to indicate the request has timed out.
   * Returns:
   *    - An object containing both the warning timeout and the main timeout identifiers, allowing further control or cleanup if necessary.
   * @param timeoutDelay - The duration after which the main timeout occurs (defaults to 60000ms / 60 seconds).
   * @returns An object containing `warningTimeout` and `timeout` identifiers.
   */
  private setTimeouts(timeoutDelay: number = 60000): { warningTimeout: ReturnType<typeof setTimeout>, timeout: ReturnType<typeof setTimeout> } {
    console.log("setting timeout..");

    const warningTimeout = setTimeout(() => {
      console.log("setting warningTimeout..");
      const waitingMessage = "This is taking longer than expected. Please wait..";
      console.warn(waitingMessage);
      this.openSnackBar(waitingMessage, '', 'warning'); // Show snackbar with warning message
    }, 20000); // 20 seconds delay for the warning

    const timeout = setTimeout(() => {
      this.loading = false; // Stop loading spinner/process
      const timeoutMessage = "Request timed out! Please try again later.";
      this.openSnackBar(timeoutMessage, 'Dismiss', 'warning'); // Show snackbar with timeout message
      clearTimeout(warningTimeout); // Clear the warning timeout
    }, timeoutDelay); // Delay set by timeoutDelay parameter

    return { warningTimeout, timeout };
  }



  /**
   * Set dummy data for demonstration purposes.
   */
  dummyData() {
    console.warn('adding dummy data..');
    this.inCelsius = true;

    this.currentDateTime = new Date().toISOString();
    this.lastUpdatedTime = new Date().toISOString();

    this.iconURL = "https://www.example.com/weather-icon.png";
    this.cityName = "San Francisco";
    this.weatherStatus = "Sunny";
    this.humidity = 65;
    this.wind = 12;

    this.minTemp_c = 10;
    this.maxTemp_c = 22;
    this.temperature_c = 18;

    this.minTemp_f = (this.minTemp_c * 9) / 5 + 32;
    this.maxTemp_f = (this.maxTemp_c * 9) / 5 + 32;
    this.temperature_f = (this.temperature_c * 9) / 5 + 32;
  }
}
