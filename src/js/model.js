export class TaskModel {
  constructor(
    description, rate, endTime, periods
  ) {
    this.description = description;
    this.rate = rate;
    this.endTime = endTime;
    this.periods = periods;
  }


  load(task) {
    this.description = task.description || '';
    this.rate = task.rate || '';
    this.endTime = task.endTime || '';
    this.periods = task.periods || '';
    this.id = task.id || '';
  }

  // check for period of task that not ended yet
  get unfinishedPeriod() {
    return this.periods.find(period => period.endTime === null) === undefined;
  }

  // spent time in minutes
  get totalSpentTime() {
    const total = this.periods.reduce((currentTotal, period) => {
      return period.endTime ?
        (period.endTime - period.startTime) / ((3600 * 1000) / 60) + currentTotal :
        currentTotal;
    }, 0);
    return Math.round(total);
  }

  get totalEarnedSum() {
    return ((this.totalSpentTime / 60) * this.rate).toFixed(2);
  }

}

export default class Model {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  }

  getTasks(view = 'actual') {
    return this.tasks.filter(task => {
      return view === 'archive' ? task.endTime !== null : task.endTime === null;
    });
  }

  addTask(task) {
    if (!task.description || !task.rate) {
      this.onTasksChanged(false);
      return;
    }
    let newTask = {
      description: task.description,
      rate: task.rate,
      endTime: null
    };
    newTask.id = this.tasks.length ? this.tasks[this.tasks.length - 1].id + 1 : 1;
    newTask = this.addPeriodToTask(newTask);
    // console.log(newTask.unfinishedPeriod);
    // newTask.periods[0].endTime = new Date().getTime() + 1800 * 1000;
    // newTask = this.addPeriodToTask(newTask);
    // // console.log(newTask.unfinishedPeriod);
    // newTask.periods[1].endTime = new Date().getTime() + 3600 * 1000;
    this.tasks.push(newTask);
    this.commitTasks();
  }

  commitTasks() {
    // console.log(this.tasks);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.onTasksChanged(true);
  }



  bindTasksChanged(cb) {
    this.onTasksChanged = cb;
  }



  addPeriodToTask(task) {
    if (task.unfinishedPeriod) {
      return task; // allready exists period wich is not ended yet
    } else if (!task.periods) {
      task.periods = [];
    }
    const period = {
      startTime: new Date().getTime(),
      endTime: null
    };
    task.periods.push(period)
    return task;
  }


  handleTaskEvents(eventType, id, periodEndTime = null, periodIndex = -1) {
    // console.log(arguments);
    try {
      // console.log(eventType);
      this[eventType](id, periodEndTime, periodIndex);
    } catch (err) {
      console.error('Unknown method');
    }

  }


  startTask(id) {
    this.tasks.map(task => {
      if (task.id === id) {
        return this.addPeriodToTask(task);
      } else {
        return task;
      }
    });
    // console.log(this.tasks);
    this.commitTasks();
  }


  pauseTask(id) {
    this.tasks.map(task => {
      if (task.id === id) {
        task.periods = this.endPeriod(task.periods);
      }
      return task;
    });
    this.commitTasks();
  }

  endPeriod(periods) {
    const unfinishedPeriodID = periods.findIndex(period => period.endTime === null);
    if (unfinishedPeriodID !== -1) {
      periods[unfinishedPeriodID].endTime = periods[unfinishedPeriodID].endTime = new Date().getTime();
    }
    return periods;
  }

  finishTask(id) {
    this.tasks.map(task => {
      if (task.id === id) {
        task.periods = this.endPeriod(task.periods); // end unfinished period if isset
        task.endTime = new Date().getTime();
      }
      return task;
    });
    this.commitTasks();
  }

  deleteTask(id) {
    // console.log(id)
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.commitTasks();
  }

  editTaskPeriod(id, periodEndTime, periodIndex) {
    this.tasks.map(task => {
      if (task.id === id) {
        task.periods = task.periods.map((period, index) => {
          if (index === periodIndex) {
            period.endTime = periodEndTime;
          }
          return period;
        });
      }
      return task;
    });
    this.commitTasks();
    // console.log(this.tasks);
  }

}