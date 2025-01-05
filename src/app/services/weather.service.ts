import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { WeatherData } from '../models/weather.model';
import { WeatherForecast } from '../models/forecast.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  proxyServiceUrl!: string; // URL of the backend proxy service
  previousWeatherData!: WeatherData; // Cache for the last retrieved weather data
  previousForecastData!: WeatherForecast; // Cache for the last retrieved forecast data

  constructor(private http: HttpClient) {
    // Initialize the proxy service URL (defaulting to localhost)
    this.proxyServiceUrl = 'http://localhost:8080';
  }

  /**
   * Fetches current weather data for a specific city.
   * @param cityName - The name of the city for which weather data is requested.
   * @returns Observable containing the weather data.
   */
  getWeatherData(cityName: string): Observable<WeatherData> {
    const url = `${this.proxyServiceUrl}/api/v1/weather/city`; 
    const params = new HttpParams().set('name', cityName);

    return this.http.get<any>(url, { params }).pipe(
      map((response: any) => response.data as WeatherData), // Transform API response to WeatherData model
      catchError(error => {
        console.error('Error fetching weather data:', error);
        const errorMessage = error?.error?.message || 'An unknown error occurred'; 
        return throwError(() => new Error(`${errorMessage}`)); 
      })
    );
  }

  /**
   * Fetches weather forecast data for a specific city.
   * @param cityName - The name of the city for which forecast data is requested.
   * @returns Observable containing the weather forecast data.
   */
  getForecastData(cityName: string): Observable<WeatherForecast> {
    const url = `${this.proxyServiceUrl}/api/v1/forecast/city`; 
    const params = new HttpParams().set('name', cityName);

    return this.http.get<any>(url, { params }).pipe(
      map((response: any) => response.data as WeatherForecast), // Transform API response to WeatherForecast model
      catchError(error => {
        console.error('Error fetching forecast data:', error);
        const errorMessage = error?.error?.message || 'An unknown error occurred'; 
        return throwError(() => new Error(`${errorMessage}`)); 
      })
    );
  }

  /**
   * Fetches current weather data based on geographical coordinates.
   * @param lat - Latitude of the location.
   * @param lon - Longitude of the location.
   * @returns Observable containing the weather data.
   */
  getWeatherDataByGeoLocation(lat: number, lon: number): Observable<WeatherData> {
    const url = `${this.proxyServiceUrl}/api/v1/weather/coordinates`; // API endpoint for geolocation weather
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString()); // Query parameters for latitude and longitude

    return this.http.get<any>(url, { params }).pipe(
      map((response: any) => response.data as WeatherData), // Transform API response to WeatherData model
      catchError(error => {
        console.error('Error fetching weather data:', error);
        const errorMessage = error?.error?.message || 'An unknown error occurred'; 
        return throwError(() => new Error(`${errorMessage}`)); 
      })
    );
  }

  /**
   * Fetches weather forecast data based on geographical coordinates.
   * @param lat - Latitude of the location.
   * @param lon - Longitude of the location.
   * @returns Observable containing the weather forecast data.
   */
  getForecastDataByGeoLocation(lat: number, lon: number): Observable<WeatherForecast> {
    const url = `${this.proxyServiceUrl}/api/v1/forecast/coordinates`; // API endpoint for geolocation forecast
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString()); // Query parameters for latitude and longitude

    return this.http.get<any>(url, { params }).pipe(
      map((response: any) => response.data as WeatherForecast), // Transform API response to WeatherForecast model
      catchError(error => {
        console.error('Error fetching forecast data:', error);
        const errorMessage = error?.error?.message || 'An unknown error occurred'; 
        return throwError(() => new Error(`${errorMessage}`));
      })
    );
  }

  /**
   * Stores the weather and forecast data in memory for later retrieval.
   * @param weatherData - The weather data to be stored.
   * @param forecastData - The forecast data to be stored.
   */
  storeWeatherAndForecastData(weatherData: WeatherData, forecastData: WeatherForecast): void {
    this.previousWeatherData = weatherData;
    this.previousForecastData = forecastData;
  }

  /**
   * Retrieves the last stored weather and forecast data.
   * @returns An object containing the weather and forecast data.
   */
  getPreviousData(): { weather: WeatherData, forecast: WeatherForecast } {
    return { weather: this.previousWeatherData, forecast: this.previousForecastData };
  }
}
