import './scss/styles.scss';
import {
  initBasicScripts
} from './js/scripts';
import Controller from './js/controller';


initBasicScripts();


const controller = new Controller();

const routes = [
  '/', 'archive'
];


window.addEventListener('hashchange', (e) => {
  controller.onTasksChanged(true);
})

const route = window.location.hash.replace('#/', '');
if (routes.findIndex(r => r === route) !== -1) {
  console.log('ok')
}

controller.init();