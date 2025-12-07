

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlannerService } from './services/planner.service';
import { Task, DayOfWeek, ALL_DAYS, Periodo, ALL_PERIODS } from './models/task.model';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { TaskFormComponent } from './components/task-form/task-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, NgClass, DragDropModule, TaskCardComponent, TaskFormComponent],
})
export class AppComponent {
  plannerService = inject(PlannerService);
  days: DayOfWeek[] = ALL_DAYS;
  periods: Periodo[] = ALL_PERIODS;
  tasksByDayAndPeriod = this.plannerService.tasksByDayAndPeriod;
  hasTasks = this.plannerService.hasTasks;

  isModalOpen = signal(false);
  editingTask = signal<Task | null>(null);
  taskToDelete = signal<Task | null>(null);
  isViewMode = signal(false);

  isDeleteAllConfirm1Open = signal(false);
  isDeleteAllConfirm2Open = signal(false);

  isMenuOpen = signal(false);
  toastMessage = signal<string | null>(null);
  tasksToImport = signal<Task[] | null>(null);

  today: DayOfWeek = this.getCurrentDay();

  private getCurrentDay(): DayOfWeek {
    const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dayMap: { [key: number]: DayOfWeek } = {
        1: 'Segunda',
        2: 'Terça',
        3: 'Quarta',
        4: 'Quinta',
        5: 'Sexta',
        6: 'Sábado',
        0: 'Domingo',
    };
    return dayMap[dayIndex];
  }

  isToday(day: DayOfWeek): boolean {
    return this.today === day;
  }
  
  getTasksForSlot(day: DayOfWeek, periodo: Periodo): Task[] {
    return this.tasksByDayAndPeriod().get(day)?.get(periodo) || [];
  }

  drop(event: CdkDragDrop<Task[], any>) {
    if (event.previousContainer === event.container) {
      // Reordering in the same list
      const updatedTasks = [...event.container.data];
      moveItemInArray(updatedTasks, event.previousIndex, event.currentIndex);
      const [day, periodo] = event.container.id.split('-') as [DayOfWeek, Periodo];
      this.plannerService.updateSlotTasks(day, periodo, updatedTasks);
    } else {
      // Transferring item to a different list
      const previousTasks = [...event.previousContainer.data];
      const currentTasks = [...event.container.data];

      transferArrayItem(
        previousTasks,
        currentTasks,
        event.previousIndex,
        event.currentIndex
      );

      const [prevDay, prevPeriodo] = event.previousContainer.id.split('-') as [DayOfWeek, Periodo];
      const [currDay, currPeriodo] = event.container.id.split('-') as [DayOfWeek, Periodo];
      
      const movedTask = currentTasks[event.currentIndex];
      currentTasks[event.currentIndex] = { ...movedTask, day: currDay, periodo: currPeriodo };

      this.plannerService.updateTwoSlotsTasks(prevDay, prevPeriodo, previousTasks, currDay, currPeriodo, currentTasks);
    }
  }

  openAddTaskModal() {
    this.editingTask.set(null);
    this.isModalOpen.set(true);
  }

  openEditTaskModal(task: Task) {
    this.editingTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingTask.set(null);
  }

  handleSaveTask(taskData: Omit<Task, 'id' | 'completed'> | Task) {
    if ('id' in taskData) {
      this.plannerService.updateTask(taskData as Task);
    } else {
      this.plannerService.addTask(taskData as Omit<Task, 'id' | 'completed'>);
    }
    this.closeModal();
  }

  handleDeleteTask(taskId: string) {
    const task = this.plannerService.tasks().find(t => t.id === taskId);
    if (task) {
        this.taskToDelete.set(task);
    }
  }

  confirmDelete() {
    const task = this.taskToDelete();
    if(task) {
      this.plannerService.deleteTask(task.id);
      this.taskToDelete.set(null);
    }
  }

  cancelDelete() {
    this.taskToDelete.set(null);
  }

  handleToggleCompletion(taskId: string) {
    this.plannerService.toggleTaskCompletion(taskId);
  }

  toggleViewMode() {
    this.isViewMode.update(v => !v);
  }

  openDeleteAllConfirm1() {
    this.isDeleteAllConfirm1Open.set(true);
  }

  proceedToDeleteAllConfirm2() {
    this.isDeleteAllConfirm1Open.set(false);
    this.isDeleteAllConfirm2Open.set(true);
  }

  confirmDeleteAll() {
    this.plannerService.deleteAllTasks();
    this.isDeleteAllConfirm2Open.set(false);
  }

  cancelDeleteAll() {
    this.isDeleteAllConfirm1Open.set(false);
    this.isDeleteAllConfirm2Open.set(false);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
  
  showComingSoonMessage() {
    this.isMenuOpen.set(false);
    this.toastMessage.set('Em breve...');
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  exportToFile() {
    this.isMenuOpen.set(false);
    const tasks = this.plannerService.tasks();
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planner-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event) {
    this.isMenuOpen.set(false);
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const tasks = JSON.parse(reader.result as string);
        if (Array.isArray(tasks)) {
          this.tasksToImport.set(tasks);
        } else {
          this.toastMessage.set('Erro: Arquivo JSON inválido.');
          setTimeout(() => this.toastMessage.set(null), 3000);
        }
      } catch (e) {
        this.toastMessage.set('Erro ao ler o arquivo.');
        setTimeout(() => this.toastMessage.set(null), 3000);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  confirmImport() {
    const tasks = this.tasksToImport();
    if (tasks) {
      this.plannerService.importTasks(tasks);
      this.tasksToImport.set(null);
    }
  }

  cancelImport() {
    this.tasksToImport.set(null);
  }
}