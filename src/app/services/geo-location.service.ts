import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  /**
   * Fetches the current geographic location of the user.
   * @returns A Promise that resolves with the GeolocationPosition object or rejects with an error.
   */
  getCurrentLocation(): Promise<GeolocationPosition> {
    console.log("Getting geo-location...");
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported by the user's browser
      if (navigator.geolocation) {
        // If supported, attempt to get the user's current position
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        // If not supported, reject the promise with an error message
        reject('Geolocation not supported by this browser.');
      }
    });
  }
}
