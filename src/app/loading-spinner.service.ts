import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class LoadingSpinnerService {
  private isLoading$ = new BehaviorSubject<boolean>(false);

  getLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  setLoading(isLoading: boolean): void {
    this.isLoading$.next(isLoading);
  }
}
