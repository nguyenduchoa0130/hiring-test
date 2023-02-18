import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BackendService } from '../backend.service';
import { LoadingSpinnerService } from '../loading-spinner.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  private readonly ALL = 'all';
  private readonly IN_PROGRESS = 'in_progress';
  form: FormGroup;
  createNewTaskForm: FormGroup;
  displayTasks: any[];
  originalTasks: any[];
  userOptions: any[];
  unsubscribe$: Subject<any> = new Subject();
  forceReload$: Subject<any> = new Subject();
  @ViewChild('btnCancel') btnCancel: ElementRef;

  constructor(
    private backendService: BackendService,
    private loadingSpinnerService: LoadingSpinnerService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showLoading = (): void => {
    this.loadingSpinnerService.setLoading(true);
  };

  hideLoading = (): void => {
    this.loadingSpinnerService.setLoading(false);
  };

  getStatusStyle(isCompleted: boolean) {
    return isCompleted ? 'badge-success' : 'badge-secondary';
  }

  loadData(): void {
    this.forceReload$
      .pipe(
        tap(this.showLoading),
        switchMap(() => combineLatest([this.backendService.tasks(), this.backendService.users()])),
        map(([tasks, users]) => {
          const displayTasks = tasks.map((t) => {
            const user = users.find((u) => u.id === t.assigneeId);
            return {
              ...t,
              username: user ? user.name : null,
            };
          });
          return displayTasks;
        }),
        catchError((err) => {
          this.hideLoading();
          alert(err.message);
          return EMPTY;
        }),
        tap(this.hideLoading),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((displayTasks) => {
        this.displayTasks = displayTasks;
        this.originalTasks = displayTasks;
      });
    this.forceReload$.next();
  }

  navigateToDetail(taskId: number) {
    this.router.navigate(['tasks', taskId]);
  }

  completeTask(taskId: number): void {
    this.backendService.complete(taskId, true);
    this.forceReload$.next();
  }

  initForm(): void {
    this.form = this.fb.group({
      filter: '',
      status: 'all',
    });
    this.createNewTaskForm = this.fb.group({
      desc: ['', [Validators.required, Validators.pattern(new RegExp('\\S'))]],
    });
    this.trackingFilterFormValue();
  }

  trackingFilterFormValue(): void {
    this.form.valueChanges
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        const { filter, status } = value;
        this.displayTasks = this.originalTasks.filter((task) => {
          const isMatchFilterText = filter.trim()
            ? this.isMatchFilterText(filter.trim(), task.description, task.username)
            : true;
          const isMatchStatus =
            status === this.ALL ? true : this.isMatchStatus(status, task.completed);
          return isMatchFilterText && isMatchStatus;
        });
      });
  }

  isMatchFilterText(filterText: string, desc: string, username: string): boolean {
    const regex = new RegExp(filterText, 'ig');
    return regex.test(desc) || regex.test(username);
  }

  isMatchStatus(status: string, taskStatus: boolean): boolean {
    return status === this.IN_PROGRESS ? !taskStatus : taskStatus;
  }

  clearFilter(): void {
    this.form.patchValue({ filter: '' });
  }

  isDisplayClearFilter(): boolean {
    const { filter } = this.form.value;
    return filter;
  }

  createNewTask() {
    const { desc } = this.createNewTaskForm.value;
    this.backendService
      .newTask({
        description: desc,
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

  cancelCreateNewTask(): void {
    this.createNewTaskForm.reset();
  }
}
