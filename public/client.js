function createToggle (text) {
  var el = document.createElement('span');
  var t = document.createTextNode(text);
  el.setAttribute('class', 'toggle');
  el.appendChild(t);
  return el;
}

var opts = Array.from(document.querySelectorAll('.togglable'));
for (var i = 0; i < opts.length; i++) {
  var clear = createToggle('Clear All');
  var select = createToggle('Select All');
  var wrapper = document.createElement('div');
  var pipe = document.createTextNode(' | ');
  wrapper.appendChild(clear);
  wrapper.appendChild(pipe);
  wrapper.appendChild(select);
  opts[i].appendChild(wrapper);

  clear.addEventListener('click', function (event) {
    var checkboxes = event.target.parentElement.parentElement.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) { checkboxes[i].checked = false; }
  })

  select.addEventListener('click', function (event) {
    var checkboxes = event.target.parentElement.parentElement.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) { checkboxes[i].checked = true; }
  })
}