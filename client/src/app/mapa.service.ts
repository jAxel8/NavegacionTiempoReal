import {Injectable, EventEmitter} from '@angular/core';
import * as mapboxgl from 'mapbox-gl' ;
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Socket} from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  cbAddress: EventEmitter<any> = new EventEmitter<any>();
  mapbox = (mapboxgl as typeof mapboxgl);
  map:mapboxgl.Map;
  style = "mapbox://styles/mapbox/streets-v11";
  lat = 16.793825336089032;
  lng =  -99.82531923359484;
  zoom = 10;
  wayPoints: Array<any> = [];
  markerDriver: any = null;


  constructor(private httpClient: HttpClient, private socket: Socket) {
    this.mapbox.accessToken = environment.mapPk;
   }




  initMap(): Promise<any> {
    /**
     * TODO: Aqui construimos el mapa
     */
    return new Promise((resolve, reject) => {
      try {
        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat]
        });

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl
        });

        geocoder.on('result', ($event) => {
          const {result} = $event;
          geocoder.clear();
          console.log('*********', result)
          this.cbAddress.emit(result);
        })

        resolve({
          map: this.map,
          geocoder
        });

      } catch (e) {
        reject(e);
      }
    });
  }

  loadCoords(coords): void {

    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving/`,
      `${coords[0][0]},${coords[0][1]};${coords[1][0]},${coords[1][1]}`,
      `?steps=true&geometries=geojson&access_token=${environment.mapPk}`,
    ].join('');

    this.httpClient.get(url).subscribe((res: any) => {


      const data = res.routes[0];
      const route = data.geometry.coordinates;

      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        }
      });


      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': 'black',
          'line-width': 5
        }
      });

      this.wayPoints = route;
      this.map.fitBounds([route[0], route[route.length - 1]], {
        padding: 100
      })

      this.socket.emit('find-driver', {points: route});

    });


  }

  agregarMarcador(coords): void {
    const el = document.createElement('div');
    el.className = 'marker';
    if (!this.markerDriver) {
      this.markerDriver = new mapboxgl.Marker(el);
    } else {
      this.markerDriver
        .setLngLat(coords)
        .addTo(this.map);
    }
  }




}
