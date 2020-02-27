// @ts-check
import {
  MDCRipple
} from "@material/ripple";
import {
  MDCTextField
} from "@material/textfield";
import {
  MDCCheckbox
} from "@material/checkbox";
import {
  MDCDataTable
} from "@material/data-table";

export function initBasicScripts() {

  document.addEventListener('click', (e) => {
    let target = e.target;

    // @ts-ignore
    for (let i = target; target; target = target.parentNode) {
      // @ts-ignore
      if (target.classList && target.classList.contains('tasks__item__expand-details')) {
        // @ts-ignore
        target.classList.toggle('active');
        // @ts-ignore
        const expandTarget = target.nextElementSibling;
        toggleSlide(expandTarget);
        break;
      }
    }

  });


  initMDCRipple();
  initMDCTextField();
  initMDCCheckboxes();
  initMDCDataTable();
}

export function slideDown(el, duration = 500) {

  if (el.style.display === 'block') {
    return false;
  }

  el.setAttribute('style', 'display:block;position:absolute;visibility:hidden;');

  setTimeout(() => {
    let height = el.clientHeight;
    el.setAttribute('style', `height: 0;overflow:hidden;display:block;transition: height ${duration / 1000}s`);
    setTimeout(() => {
      el.style.height = `${height}px`;
      setTimeout(() => {
        el.setAttribute('style', 'display:block;');
      }, duration)
    }, 10);
  });
}

export function slideUp(el, duration = 500) {
  if (el.style.display === 'none') {
    return false;
  }
  let styles = document.defaultView.getComputedStyle(el);
  const height = el.clientHeight;
  if (document.all) { // ie
    styles = el.currentStyle;
  }
  el.setAttribute('style', `transition: all ${duration / 1000}s;display:block; overflow: hidden;height: ${height}px`);
  setTimeout(() => {
    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
    setTimeout(() => el.setAttribute('style', 'display:none;'), duration + 10);
  }, 100);
}

export function toggleSlide(el, duration = 500) {

  if (slideDown(el, duration) === false) {
    slideUp(el, duration);
  }
  // if (!slideDown(el, duration)) {
  //   slideUp(el, duration);
  // }
}

export function initMDCRipple(className = 'my-surface') {
  const surfaces = document.querySelectorAll(`.${className}`);
  for (const surface of Object.values(surfaces)) {
    new MDCRipple(surface);
  }
}

export function initMDCTextField(el) {
  // init for all elements with class mdc-text-field
  if (!el) {
    const fields = document.querySelectorAll('.mdc-text-field');
    for (const field of Object.values(fields)) {
      new MDCTextField(field);
    }
  }
}


export function initMDCCheckboxes() {
  const checkboxes = document.querySelectorAll('.mdc-checkbox');
  for (const checkbox of Object.values(checkboxes)) {
    // @ts-ignore
    new MDCCheckbox(document.querySelector(checkbox));
  }
}

export function initMDCDataTable() {
  const dataTables = document.querySelectorAll('.mdc-data-table');
  for (const dataTable of Object.values(dataTables)) {
    // @ts-ignore
    new MDCDataTable(document.querySelector(dataTable));
  }
}

export function timeConvert(n) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  let res = '';
  if (rhours) {
    res += rhours + " h ";
  }
  if (rminutes) {
    res += rminutes + " m";
  }
  return res;
}