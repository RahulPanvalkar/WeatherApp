import { Injectable } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { WeatherData } from 'src/app/models/weather.model';
import { WeatherForecast } from 'src/app/models/forecast.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  constructor(
    private weatherService: WeatherService, // Inject the WeatherService
  ) { }

  /**
   * Fetches weather data based on geographic coordinates (latitude and longitude).
   * 
   * @param lat - Latitude of the location
   * @param lon - Longitude of the location
   * @returns An Observable containing both weather data and forecast data
   */
  fetchWeatherDataByGeoLocation(lat: number, lon: number): Observable<{ weather: WeatherData; forecast: WeatherForecast }> {
    return new Observable(observer => {
      // First, fetch the weather data using geographic coordinates
      this.weatherService.getWeatherDataByGeoLocation(lat, lon).subscribe({
        next: weatherResponse => {
          // After fetching weather data, fetch the forecast data
          this.weatherService.getForecastDataByGeoLocation(lat, lon).subscribe({
            next: forecastResponse => {
              // Return the combined weather and forecast data
              observer.next({ weather: weatherResponse, forecast: forecastResponse });
              this.weatherService.storeWeatherAndForecastData(weatherResponse, forecastResponse); // Store data in service
              observer.complete();
            },
            error: error => observer.error(error), // Handle forecast data fetch error
          });
        },
        error: error => observer.error(error), // Handle weather data fetch error
      });
    });
  }

  /**
   * Fetches weather and forecast data by city name.
   * 
   * @param cityName - The name of the city
   * @returns An Observable containing both weather data and forecast data
   */
  fetchWeatherDataByCity(cityName: string): Observable<{ weather: WeatherData; forecast: WeatherForecast }> {
    return new Observable(observer => {
      // Fetch the weather data by city name
      this.weatherService.getWeatherData(cityName).subscribe({
        next: weatherResponse => {
          // After fetching weather data, fetch the forecast data
          this.weatherService.getForecastData(cityName).subscribe({
            next: forecastResponse => {
              // Return the combined weather and forecast data
              observer.next({ weather: weatherResponse, forecast: forecastResponse });
              this.weatherService.storeWeatherAndForecastData(weatherResponse, forecastResponse); // Store data in service
              observer.complete();
            },
            error: error => observer.error(error), // Handle forecast data fetch error
          });
        },
        error: error => observer.error(error), // Handle weather data fetch error
      });
    });
  }

  /**
   * Retrieves stored weather and forecast data from the service.
   * 
   * @returns The previously stored weather and forecast data
   */
  getStoredWeatherData(): { weather: WeatherData; forecast: WeatherForecast } {
    return this.weatherService.getPreviousData(); // Retrieve data from the weather service
  }
  
}