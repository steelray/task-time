import Model from "./model";
import View from "./view";

export default class Controller {

  constructor(tasksView = 'actual', tasksListContainer = '#actual-tasks') {
    this.tasksView = tasksView; // actual || archive
    this.model = new Model();
    this.view = new View(tasksListContainer);

  }

  init() {
    this.model.bindTasksChanged(this.onTasksChanged.bind(this));
    this.onTasksChanged(true);

    const form = document.querySelector(this.view.getDomElementSelector('form'));
    if (form) {
      form.addEventListener('submit', e => this.view.addTask(e, this.bindAddTask.bind(this)));
    }

    document.querySelector(this.view.getDomElementSelector('tasksList')).addEventListener('click', e => this.view.handleTaskEvents(e, this.model.handleTaskEvents.bind(this.model)));

    document.querySelector(this.view.getDomElementSelector('tasksList')).addEventListener('keyup', e => this.view.handleTaskEvents(e, this.model.handleTaskEvents.bind(this.model)));
  }

  bindTaskEvents(eventType, taskID, periodEndTime = null) {
    this.model.handleTaskEvents(eventType, taskID, periodEndTime = null)
  }


  bindAddTask(task) {
    this.model.addTask(task);
  }


  onTasksChanged(execute = false) {
    if (execute) {
      const tasks = this.model.getTasks(this.tasksView);
      // console.log(tasks);
      this.view.drawTasks(tasks);
    }
  }


}