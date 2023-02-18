import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, EMPTY, of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BackendService, User } from '../backend.service';
import { LoadingSpinnerService } from '../loading-spinner.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task: any;
  taskId: number;
  isLoading: boolean;
  unsubscribe$ = new Subject<any>();
  forceReload$ = new Subject<any>();
  users: User[] = [];
  form: FormGroup;
  @ViewChild('btnCancel') btnCancel: ElementRef;

  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    private loadingSpinner: LoadingSpinnerService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.forceReload$
      .pipe(
        tap(this.showLoading),
        switchMap(() => this.route.params),
        switchMap((params) => {
          const { id } = params;
          this.taskId = +id;
          return this.backendService.task(+id);
        }),
        switchMap((task) => {
          if (!task) {
            return of(null);
          }
          return combineLatest([of(task), this.backendService.user(task.assigneeId)]);
        }),
        catchError((err) => {
          this.hideLoading();
          alert(err.message);
          return EMPTY;
        }),
        tap(this.hideLoading),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((rs) => {
        if (!rs) {
          this.task = null;
        } else {
          const [task, user] = rs;
          this.task = {
            ...task,
            username: user ? user.name : 'Not assign yet',
          };
          this.initForm();
        }
      });
    this.forceReload$.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showLoading = (): void => {
    this.isLoading = true;
    this.loadingSpinner.setLoading(true);
  };

  hideLoading = (): void => {
    this.isLoading = false;
    this.loadingSpinner.setLoading(false);
  };

  backToTaskList = (): void => {
    this.router.navigateByUrl('/tasks');
  };

  getStatusStyle(isCompleted: boolean) {
    return isCompleted ? 'badge-success' : 'badge-secondary';
  }

  completeTask() {
    this.backendService
      .complete(this.taskId, true)
      .pipe(
        tap(this.showLoading),
        catchError((err) => {
          this.hideLoading();
          return EMPTY;
        }),
        tap(this.hideLoading),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((updatedTask) => {
        this.task = {
          ...this.task,
          ...updatedTask,
        };
      });
  }

  initForm(): void {
    if (this.task) {
      this.form = this.fb.group({
        desc: [this.task.description, [Validators.required, Validators.pattern(new RegExp('\\S'))]],
        status: [this.task.completed ? 'completed' : 'in_progress'],
        assignee: [this.task.assigneeId],
      });
    }
  }

  getUsers() {
    this.backendService
      .users()
      .pipe(
        tap(this.showLoading),
        catchError((err) => {
          this.hideLoading();
          alert(err.message);
          return EMPTY;
        }),
        tap(this.hideLoading),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((users) => {
        this.users = users;
      });
  }

  updateTask() {
    const { desc, assignee, status } = this.form.value;
    this.backendService
      .update(this.task.id, {
        description: desc,
        assigneeId: +assignee,
        completed: status === 'completed',
      })
      .pipe(
        tap(this.showLoading),
        catchError((err) => {
          this.hideLoading();
          alert(err.message);
          return EMPTY;
        }),
        tap(this.hideLoading),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => {
        this.btnCancel.nativeElement.click();
        this.forceReload$.next();
      });
  }
}
