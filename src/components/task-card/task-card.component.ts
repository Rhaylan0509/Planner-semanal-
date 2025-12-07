import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, PASTEL_COLORS, ColorTheme } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  task = input.required<Task>();
  viewMode = input<boolean>(false);
  
  edit = output<Task>();
  delete = output<string>();
  toggleComplete = output<string>();

  colorTheme = computed<ColorTheme>(() => {
    return PASTEL_COLORS.find(c => c.name === this.task().color) ?? PASTEL_COLORS[0];
  });

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.edit.emit(this.task());
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit(this.task().id);
  }

  onToggleComplete(event: Event) {
    event.stopPropagation();
    this.toggleComplete.emit(this.task().id);
  }
}