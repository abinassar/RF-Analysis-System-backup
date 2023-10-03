import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

@Component({
  selector: 'app-plotly-graphic',
  templateUrl: './plotly-graphic.component.html',
  styleUrls: ['./plotly-graphic.component.scss'],
})
export class PlotlyGraphicComponent implements OnInit, OnChanges {

  data: any;
  layout: any;

  @Input() inputData;
  @Input() inputLayout;
  @Input() insideComponent: boolean = false;
  @Output() showFullScreenGraphic = new EventEmitter<void>();

  constructor(private screenOrientation: ScreenOrientation) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes) {

      this.data = changes['inputData'].currentValue;
      this.layout = changes['inputLayout'].currentValue;
      
    }

  }

  landscapeOrientation() {

    if (this.insideComponent) {

      this.showFullScreenGraphic.emit();
      
    } else {

      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

    }

  }

  portraitOrientation() {
    if (!this.insideComponent) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }
  
}
