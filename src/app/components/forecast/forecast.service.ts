import { Injectable } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { DummyDataService } from 'src/app/components/forecast/dummy-data.service';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  // Holds the daily forecast data
  dataCard: any[] = [];

  // Holds the hourly forecast data for the selected day
  hourlyDataCard: any[] = [];

  // Index of the currently selected daily forecast card
  selectedCardIndex: number = 0;

  // Starting index for the hourly data currently displayed
  currentIndex: number = 0;

  constructor(private weatherService: WeatherService, private dummyData: DummyDataService) { }

  /**
   * Loads forecast data into `dataCard` and initializes `hourlyDataCard`.
   * If no valid data is available from the WeatherService, dummy data is used.
   */
  loadForecastData(): void {
    const dataObj = this.weatherService.getPreviousData();
    let forecastData: any;

    // Check if data from WeatherService is valid; fallback to dummy data if not
    if (dataObj && dataObj.weather && dataObj.forecast) {
      forecastData = dataObj.forecast;
    } else {
      //console.warn('DataObj or its properties are undefined');
      //forecastData = this.dummyData.forecastData();
      return;
    }

    // Populate daily and hourly forecast data
    this.dataCard = forecastData.forecast.forecastday;
    this.hourlyDataCard = this.dataCard[1]?.hour || []; // to set next days hourly data
  }

  /**
   * Moves to the next set of hourly forecast cards based on the `cardsToShow` limit.
   * Ensures the index does not exceed the total length of hourly data.
   * 
   * @param cardsToShow - Number of hourly cards to display at a time
   */
  getNextCards(cardsToShow: number): void {
    if (this.currentIndex + cardsToShow < this.hourlyDataCard.length) {
      this.currentIndex += cardsToShow;
    }
  }

  /**
   * Moves to the previous set of hourly forecast cards based on the `cardsToShow` limit.
   * Ensures the index does not go below 0.
   * 
   * @param cardsToShow - Number of hourly cards to display at a time
   */
  getPreviousCards(cardsToShow: number): void {
    if (this.currentIndex - cardsToShow >= 0) {
      this.currentIndex -= cardsToShow;
    }
  }

  /**
   * Retrieves the currently visible hourly forecast cards based on the `cardsToShow` limit.
   * 
   * @param cardsToShow - Number of hourly cards to display at a time
   * @returns - Array of hourly forecast data for the current view
   */
  getVisibleCards(cardsToShow: number): any[] {
    const startIndex = this.currentIndex;
    const endIndex = this.currentIndex + cardsToShow;
    return this.hourlyDataCard.slice(startIndex, endIndex);
  }

  /**
   * Handles the selection of a daily forecast card.
   * Updates `hourlyDataCard` with the hourly data for the selected day and resets `currentIndex`.
   * 
   * @param card - The selected daily forecast card
   */
  selectCard(card: any): void {
    this.selectedCardIndex = this.dataCard.indexOf(card); // Find the index of the selected card
    this.hourlyDataCard = card.hour; // Update hourly data with the selected day's hours
    this.currentIndex = 0; // Reset the index for hourly data to the start

    // Calculate the center index of the array (assuming center is at position 1)
    const selectedIndex = this.selectedCardIndex;
    const temp = this.dataCard[selectedIndex];

    // Move the selected card to index 1
    this.dataCard[selectedIndex] = this.dataCard[1];
    this.dataCard[1] = temp;

    // Reorder other cards
    let date1 = this.dataCard[0].date;
    let date2 = this.dataCard[2].date;
    if (date1 > date2) {
      let tempcard = this.dataCard[0];
      this.dataCard[0] = this.dataCard[2];
      this.dataCard[2] = tempcard;
    }
  }
}
