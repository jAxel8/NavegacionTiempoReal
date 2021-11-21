import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

import {io,Socket} from "socket.io-client";
import { MapaService } from './mapa.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild('asGeoCoder') asGeoCoder: ElementRef;
  modeInput = 'inicio';
  puntoPartida: puntoPartida = {inicio: null, final: null};
  public socket = io('https://navegacion-tiempo-real.vercel.app');
  constructor(private _mapa:MapaService, private renderer2: Renderer2) {
  }

  
  ngOnInit(): void {
    this._mapa.initMap()
      .then(({geocoder, map}) => {
        // this.asGeoCoder
        this.renderer2.appendChild(this.asGeoCoder.nativeElement,
          geocoder.onAdd(map)
        );


        
      })
      .catch((err) => {
        console.log(err);
      });

    this._mapa.cbAddress.subscribe((getPoint) => {
      if (this.modeInput === 'inicio') {
        this.puntoPartida.inicio = getPoint;
      }
      if (this.modeInput === 'final') {
        this.puntoPartida.final = getPoint;
      }
    });

      this.socket.on('position',({coords})=>{
        console.log(coords);
        this._mapa.agregarMarcador(coords);
      })


  }

  

  dibujarRuta(): void {
   
    const coords = [
      this.puntoPartida.inicio.center,
      this.puntoPartida.final.center
    ];

    this._mapa.loadCoords(coords);
  }

  changeMode(mode: string): void {
    this.modeInput = mode;
  }

  testMarker(): void {
    this._mapa.agregarMarcador([-99.82531923359484,  16.793825336089032]);
  }
}

export class puntoPartida {
  inicio: any;
  final: any
}