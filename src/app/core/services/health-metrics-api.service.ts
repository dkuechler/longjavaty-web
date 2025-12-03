import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
  MeasurementResponse,
  MeasurementType,
  MeasurementRequest,
} from '../models/measurement.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HealthMetricsApiService {
  private readonly apiUrl = `${environment.apiUrl}/measurements`;

  constructor(private http: HttpClient) {}

  recordMeasurement(request: MeasurementRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(this.apiUrl, request);
  }

  getMeasurements(
    measurementType?: MeasurementType,
    from?: string,
    to?: string
  ): Observable<MeasurementResponse[]> {
    let params = new HttpParams();

    if (measurementType) {
      params = params.set('measurementType', measurementType);
    }
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<MeasurementResponse[]>(this.apiUrl, { params });
  }

  getMeasurementsForTypes(
    measurementTypes: MeasurementType[],
    from?: string,
    to?: string
  ): Observable<MeasurementResponse[][]> {
    const requests = measurementTypes.map((type) => this.getMeasurements(type, from, to));
    return forkJoin(requests);
  }

  getAllMeasurements(from?: string, to?: string): Observable<MeasurementResponse[]> {
    return this.getMeasurements(undefined, from, to);
  }
}
