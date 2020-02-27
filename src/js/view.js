import moment from "moment";
import {
  TaskModel
} from "./model";
import {
  timeConvert
} from "./scripts";
import taskEvents from "./task-events";
import {
  MDCDialog
} from "@material/dialog";
import {
  MDCSnackbar
} from "@material/snackbar";

export default class View {
  constructor(tasksListContainer) {
    this.tasksListContainer = tasksListContainer;
    const domElementSelector = {
      form: "#task-form",
      tasksList: ".tasks",
      startBtn: '.start-btn',
      finishBtn: '.finish-btn',
      deleteBtn: '.tasks__item__close',
      pauseBtn: '.pause-btn',
      periodEndField: '.task__item__period-end',
      taskItem: '.tasks__item'
    };
    this.getDomElementSelector = (el) => domElementSelector[el];
  }

  addTask(e, cb) {
    e.preventDefault();
    this.form = e.target;
    const formData = this.formData;
    cb(formData);
  }

  drawTasks(tasks) {
    if (!tasks) {
      console.error('wrong data passed');
    } else {

      const tasksDOM = document.querySelector(this.tasksListContainer);
      tasksDOM.innerHTML = '';
      for (const task of tasks) {
        const taskModel = new TaskModel();
        taskModel.load(task);
        const viewItem = `
          <div class="tasks__item" data-id='${taskModel.id}'>
            
            <div class="tasks__item__description">
              ${taskModel.description}
            </div>
            <button class="tasks__item__close">
              <i class="material-icons">close</i>
            </button>
            <button class="tasks__item__expand-details " title="details">
              <i class="material-icons">expand_more</i>
            </button>
            <div class="tasks__item__details">
              <h3>Table of spent time</h3>
              <table>
                <thead>
                  <tr>
                    <th>Start time</th>
                    <th>End time</th>
                    <th>Earned sum</th>
                  </tr>
                </thead>
                <tbody>
                  
                </tbody>
                <tfoot>
                  <tr>
                    <td>Rate per hour: <strong>${taskModel.rate}$</strong></td>
                    <td>Total spent time: <strong>${timeConvert(taskModel.totalSpentTime)}</strong></td>
                    <td>Total earned sum: <strong>${taskModel.totalEarnedSum}$</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        `;




        const viewItemDOMObject = new DOMParser().parseFromString(viewItem, 'text/html').firstChild.querySelector('.tasks__item');

        if (!task.endTime) {
          const viewItemActions = `
            <div class="tasks__item__btns">
              ${
                taskModel.unfinishedPeriod 
                ?
                '<button class="mdc-button mdc-button--raised my-surface start-btn"><i class="material-icons">mood</i> start</button>'
                :
                '<button class="mdc-button mdc-button--raised my-surface pause-btn">pause <i class="material-icons">mood_bad</i></button>'
              }
              <br>
              <button class="mdc-button mdc-button--raised my-surface finish-btn">Finish <i class="material-icons">mood</i></button>
            </div>
          `;
          const viewItemActionsDOMObject = new DOMParser().parseFromString(viewItemActions, 'text/html').firstChild.querySelector('.tasks__item__btns');
          viewItemDOMObject.prepend(viewItemActionsDOMObject);
        }

        let viewItemPeriods = '';
        let periodIndex = 0;
        for (const period of taskModel.periods) {
          viewItemPeriods += `
            <tr data-id='${periodIndex}'>
              <td>${moment(period.startTime).format('YYYY-MM-DD HH:mm')}</td>
              <td>
              ${
                period.endTime
                ?
                "<input class='task__item__period-end' value='" + moment(period.endTime).format('YYYY-MM-DD HH:mm') + "'>"
                : 
                "---"
              }
              </td>
              <td>${period.endTime ? (this.getHoursFromPeriods(period) * taskModel.rate).toFixed(2) : 0}$</td>
            </tr>
          `;
          periodIndex++;
        }
        viewItemDOMObject.querySelector('tbody').innerHTML = viewItemPeriods;
        tasksDOM.prepend(viewItemDOMObject);
      }


    }
  }

  getHoursFromPeriods(period) {
    return (period.endTime - period.startTime) / ((3600 * 1000) / 60) / 60;
  }

  handleTaskEvents(e, cb) {
    const target = e.target;
    const taskItem = target.closest(this.getDomElementSelector('taskItem'));
    const id = +taskItem.dataset.id;
    let eventType;
    let periodEndTime = null;
    let periodIndex = -1;
    const confirmDialogContent = document.getElementById('confirm-dialog-content');
    const taskDescription = taskItem.querySelector('.tasks__item__description').textContent;

    if (target.closest(this.getDomElementSelector('startBtn'))) {
      // console.log('start event');
      eventType = taskEvents.start;
    } else if (target.closest(this.getDomElementSelector('pauseBtn'))) {
      // console.log('pause event');
      eventType = taskEvents.pause;
    } else if (target.closest(this.getDomElementSelector('finishBtn')) && e.type === 'click') {
      // console.log('finish task event');
      this.createConfirmDialog(taskEvents.finish, id, cb);
      if (confirmDialogContent) {
        // console.log(taskItem)
        confirmDialogContent.textContent = `Do you really want to finish - "${taskDescription}"`;
        this.confirmDialog.open();
      }
      // eventType = taskEvents.finish;
    } else if (target.closest(this.getDomElementSelector('deleteBtn')) && e.type === 'click') {
      // console.log('delete task event');
      this.createConfirmDialog(taskEvents.delete, id, cb);
      if (confirmDialogContent) {
        // console.log(taskItem)
        confirmDialogContent.textContent = `Do you really want to delete - "${taskDescription}"`;
        this.confirmDialog.open();
      }
      // eventType = taskEvents.delete;
    } else if (e.type === 'keyup' && e.keyCode === 13 && target.closest(this.getDomElementSelector('periodEndField'))) {
      // console.log('task period edit event');

      const value = Date.parse(target.value);
      periodIndex = +target.parentNode.parentNode.dataset.id;
      if (isNaN(value)) {
        this.createSnackbar();
        this.snackbar.labelText = 'Wrong date';
        this.snackbar.open();
      } else {
        eventType = taskEvents.editPeriodEndTime
        periodEndTime = value;
      }

    }
    if (eventType) {
      cb(eventType, id, periodEndTime, periodIndex);
    }
  }

  get formData() {
    const data = [];
    if (!this.form || this.form instanceof HTMLElement === false) {
      return data;
    }
    const inputs = this.form.querySelectorAll('[name]');
    for (const input of Object.values(inputs)) {
      data[input.name] = input.value;
    }
    return data;
  }

  createConfirmDialog(eventType, id, cb, ) {
    if (!this.confirmDialog) {
      this.confirmDialog = new MDCDialog(document.querySelector('.confirm-dialog'));
      this.listenConfirmDialog(eventType, id, cb);
    }
  }

  createSnackbar() {
    if (!this.snackbar) {
      this.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
    }
  }

  listenConfirmDialog(eventType, id, cb) {
    this.confirmDialog.listen('MDCDialog:closing', (e) => {
      if (e.detail.action === 'yes') {
        cb(eventType, id);
        this.confirmDialog = false; // reset confirm dialog
      }
    });
  }


}