import { Component, ChangeDetectionStrategy, OnInit, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormArray } from '@angular/forms';
import { Task, DayOfWeek, ALL_DAYS, Periodo, ALL_PERIODS, PASTEL_COLORS, ColorTheme } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  taskToEdit = input<Task | null>();

  closeModal = output<void>();
  saveTask = output<Omit<Task, 'id' | 'completed'> | Task>();

  private fb = inject(FormBuilder);
  taskForm!: FormGroup;
  tagInput = new FormControl('');

  days: DayOfWeek[] = ALL_DAYS;
  periods: Periodo[] = ALL_PERIODS;
  colors: ColorTheme[] = PASTEL_COLORS;

  get isEditing(): boolean {
    return !!this.taskToEdit();
  }

  get tags(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.maxLength(500)],
      day: [this.days[0], Validators.required],
      periodo: [this.periods[0], Validators.required],
      tags: this.fb.array([]),
      color: [this.colors[0].name, Validators.required],
      isBlock: [false],
    });

    const task = this.taskToEdit();
    if (task) {
      this.populateForm(task);
    }
  }

  private populateForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      content: task.content,
      day: task.day,
      periodo: task.periodo,
      color: task.color,
      isBlock: task.isBlock,
    });
    this.tags.clear();
    task.tags.forEach(tag => this.tags.push(this.fb.control(tag)));
  }
  
  private processTagInput(): void {
    const tagValue = this.tagInput.value?.trim();
    if (tagValue && !this.tags.value.includes(tagValue)) {
      this.tags.push(this.fb.control(tagValue));
    }
    this.tagInput.reset('');
  }

  onTagInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.processTagInput();
    }
  }

  onTagInputBlur(): void {
    this.processTagInput();
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    
    const taskData = {
      title: formValue.title,
      content: formValue.content,
      day: formValue.day,
      periodo: formValue.periodo,
      tags: formValue.tags,
      color: formValue.color,
      isBlock: formValue.isBlock,
    };
    
    const task = this.taskToEdit();
    if (task) {
      this.saveTask.emit({ ...task, ...taskData });
    } else {
      this.saveTask.emit(taskData as Omit<Task, 'id' | 'completed'>);
    }
  }

  onCancel(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.closeModal.emit();
    }
  }

  selectColor(colorName: string): void {
    this.taskForm.get('color')?.setValue(colorName);
  }
}