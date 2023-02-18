import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingSpinnerService } from '../loading-spinner.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(private readonly loadingSpinnerService: LoadingSpinnerService) {}

  ngOnInit(): void {
    this.isLoading$ = this.loadingSpinnerService.getLoading();
  }
}
