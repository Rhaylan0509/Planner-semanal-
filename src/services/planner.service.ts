import { Injectable, signal, computed } from '@angular/core';
import { Task, DayOfWeek, ALL_DAYS, Periodo, ALL_PERIODS } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class PlannerService {
  private _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  readonly hasTasks = computed(() => this._tasks().length > 0);

  readonly tasksByDayAndPeriod = computed(() => {
    const grouped = new Map<DayOfWeek, Map<Periodo, Task[]>>();
    ALL_DAYS.forEach(day => {
      const periodMap = new Map<Periodo, Task[]>();
      ALL_PERIODS.forEach(periodo => {
        periodMap.set(periodo, []);
      });
      grouped.set(day, periodMap);
    });

    this._tasks().forEach(task => {
      const dayMap = grouped.get(task.day);
      if (dayMap) {
        const periodTasks = dayMap.get(task.periodo) || [];
        periodTasks.push(task);
        dayMap.set(task.periodo, periodTasks);
      }
    });

    return grouped;
  });

  constructor() {
    const savedTasks = localStorage.getItem('plannerTasks');
    if (savedTasks) {
      this._tasks.set(JSON.parse(savedTasks));
    } else {
      this.loadInitialData();
    }
  }

  private saveTasks() {
    localStorage.setItem('plannerTasks', JSON.stringify(this._tasks()));
  }

  private loadInitialData() {
    this._tasks.set([
      { id: '1', title: 'Entregar projeto', content: 'Enviar .zip', tags: ['Importante', 'Trabalho', 'ProjetoX'], day: 'Sexta', periodo: 'Tarde', completed: false, color: 'rose', isBlock: false },
      { id: '2', title: 'Cinema', content: 'Ver o novo filme do estúdio Ghibli', tags: ['Lazer'], day: 'Sexta', periodo: 'Noite', completed: false, color: 'violet', isBlock: false },
      { id: '3', title: 'Estudar JavaScript', content: 'Módulos, Promises...', tags: ['Estudo', 'JS'], day: 'Segunda', periodo: 'Manhã', completed: false, color: 'amber', isBlock: false },
      { id: '4', title: 'Ir à academia', content: 'Treino de pernas', tags: ['Saúde'], day: 'Terça', periodo: 'Manhã', completed: true, color: 'sky', isBlock: false },
      { id: '5', title: 'Reunião de equipe', content: 'Discutir o progresso da sprint', tags: ['Trabalho'], day: 'Quarta', periodo: 'Tarde', completed: false, color: 'white', isBlock: false },
    ]);
  }

  addTask(taskData: Omit<Task, 'id' | 'completed'>) {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
    };
    this._tasks.update(tasks => [...tasks, newTask]);
    this.saveTasks();
  }

  updateTask(updatedTask: Task) {
    this._tasks.update(tasks =>
      tasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
    this.saveTasks();
  }
  
  deleteTask(taskId: string) {
    this._tasks.update(tasks => tasks.filter(task => task.id !== taskId));
    this.saveTasks();
  }

  deleteAllTasks() {
    this._tasks.set([]);
    this.saveTasks();
  }

  toggleTaskCompletion(taskId: string) {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    this.saveTasks();
  }

  updateSlotTasks(day: DayOfWeek, periodo: Periodo, updatedTasksForSlot: Task[]) {
    this._tasks.update(allTasks => {
        const otherTasks = allTasks.filter(t => t.day !== day || t.periodo !== periodo);
        return [...otherTasks, ...updatedTasksForSlot];
    });
    this.saveTasks();
  }

  updateTwoSlotsTasks(fromDay: DayOfWeek, fromPeriodo: Periodo, fromTasks: Task[], toDay: DayOfWeek, toPeriodo: Periodo, toTasks: Task[]) {
    this._tasks.update(allTasks => {
        const otherTasks = allTasks.filter(t => 
            (t.day !== fromDay || t.periodo !== fromPeriodo) &&
            (t.day !== toDay || t.periodo !== toPeriodo)
        );
        return [...otherTasks, ...fromTasks, ...toTasks];
    });
    this.saveTasks();
  }

  importTasks(tasks: Task[]) {
    this._tasks.set(tasks);
    this.saveTasks();
  }
}