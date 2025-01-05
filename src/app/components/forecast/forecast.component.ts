import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ForecastService } from './forecast.service';
import { ToggleService } from 'src/app/services/toggle.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css'],
  animations: [
    // Trigger for the slide animation
    trigger('slideAnimation', [
      // Transition for when a new element enters and the direction is 'right'
      transition('void => right', [
        style({ transform: 'translateX(100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      // Transition for when a new element enters and the direction is 'left'
      transition('void => left', [
        style({ transform: 'translateX(-100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ForecastComponent implements OnInit {
  isMobileView: boolean = true; // To handle responsive layout
  inCelsius!: boolean; // Toggle for Celsius/Fahrenheit display
  selectedCard: any; // Stores the selected forecast card

  cardsToShow: number = 5; // Number of hourly cards to show at a time
  animationTrigger: 'right' | 'left' = 'right';

  // Data arrays exposed via getters
  get dataCard() {
    return this.forecastService.dataCard;
  }

  // hourly forecast data for the selected day
  get hourlyDataCard() {
    return this.forecastService.hourlyDataCard;
  }

  // For pagination of hourly data
  get currentIndex() {
    return this.forecastService.currentIndex;
  }


  constructor(
    private breakpointObserver: BreakpointObserver,
    private forecastService: ForecastService,
    private toggleService: ToggleService
  ) { }

  ngOnInit(): void {

    // Observe screen size changes for responsive design
    this.breakpointObserver
      .observe(['(max-width: 650px)'])
      .subscribe((result) => {
        this.isMobileView = result.matches;
        (this.isMobileView) ? this.cardsToShow = 4 : this.cardsToShow = 5;
      });

    // Initialize temperature unit toggle
    this.inCelsius = !this.toggleService.toggleValue;
    this.toggleService.toggleValue$.subscribe((value) => {
      this.inCelsius = !value;
    });

    // Load forecast data from the service
    this.forecastService.loadForecastData();
    this.selectedCard = this.dataCard[1]; // Set the next day forecast card as selected
  }

  /**
   * Handles the selection of a forecast card. 
   * @param card Selected forecast card
   */
  selectCard(card: any): void {
    this.selectedCard = card;
    this.forecastService.selectCard(card);
    this.animationTrigger = 'right';
  }

  /**
   * Gets the subset of hourly data to display based on pagination from service function.
   * @returns Array of hourly data cards
   */
  getVisibleCards(): any[] {
    return this.forecastService.getVisibleCards(this.cardsToShow);
  }


  /**
   * Moves to the next set of hourly data cards.
   */
  getNextCards(): void {
    this.animationTrigger = 'right';
    this.forecastService.getNextCards(this.cardsToShow);
  }

  /**
   * Moves to the previous set of hourly data cards.
   */
  getPreviousCards(): void {
    this.animationTrigger = 'left';
    this.forecastService.getPreviousCards(this.cardsToShow);
  }
}
