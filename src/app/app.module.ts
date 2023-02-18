import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { LoadingSpinnerService } from './loading-spinner.service';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskListComponent } from './task-list/task-list.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    TaskListComponent,
    LoadingSpinnerComponent,
    TaskDetailComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [BackendService, LoadingSpinnerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
