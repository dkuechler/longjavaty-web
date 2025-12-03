import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { MeasurementResponse, MeasurementType } from '../models/measurement.models';

@Injectable({
  providedIn: 'root',
})
export class HealthMetricsApiService {
  private readonly apiUrl = '/api/measurements';

  constructor(private http: HttpClient) {}

  getMeasurementsByType(
    userId: string,
    measurementType: MeasurementType,
    startDate?: Date,
    endDate?: Date
  ): Observable<MeasurementResponse[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<MeasurementResponse[]>(
      `${this.apiUrl}/${userId}/${measurementType}`,
      { params }
    );
  }

  getMeasurementsForTypes(
    userId: string,
    measurementTypes: MeasurementType[],
    startDate?: Date,
    endDate?: Date
  ): Observable<MeasurementResponse[][]> {
    const requests = measurementTypes.map((type) =>
      this.getMeasurementsByType(userId, type, startDate, endDate)
    );
    return forkJoin(requests);
  }

  getAllMeasurements(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<MeasurementResponse[][]> {
    const allTypes = Object.values(MeasurementType);
    return this.getMeasurementsForTypes(userId, allTypes, startDate, endDate);
  }
}
