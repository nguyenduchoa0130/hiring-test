import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CheckTaskIdGuard } from './task-detail/check-task-id.guard';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskListComponent } from './task-list/task-list.component';

const routes: Routes = [
  {
    path: 'tasks/:id',
    component: TaskDetailComponent,
    canActivate: [CheckTaskIdGuard],
  },
  {
    path: 'tasks',
    component: TaskListComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/tasks',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
