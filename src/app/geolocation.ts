import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
 
export interface OpenMeteoGeocodingResponse{
  results: Array<{
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
    admin1: string;
    admin2: string;
    country: string;
  }>;
};

export interface Coords{
  latitude: number;
  longitude: number
};
 
@Injectable({ providedIn: 'root' })

export class Geolocation {
 
  constructor(private http: HttpClient) {}
 
 
  getLocation(name: string) {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(name)}`+
      `&count=1&language=en&format=json`;
    return this.http.get<OpenMeteoGeocodingResponse>(url);
  }
}