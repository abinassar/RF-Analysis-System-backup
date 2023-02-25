import { Component, OnInit } from '@angular/core';
import { Antenna } from '../../models';

@Component({
  selector: 'app-antenna-list',
  templateUrl: './antenna-list.component.html',
  styleUrls: ['./antenna-list.component.scss'],
})
export class AntennaListComponent implements OnInit {

  antennaList: Antenna[] = [
    {
      name: "Antenna 1",
      imgPath: "https://www.pngarts.com/files/3/Pokemon-Pikachu-Transparent-Background-PNG.png",
      efficiency: 1,
      frecuency: 300,
      wavelength: 5,
      gain: 5
    }
  ];

  constructor() { }

  ngOnInit() {}

}
