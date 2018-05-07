var typingDelayTimer = false;
var returnFocusToEditorDelay     = 200; // ms
var refreshWidgetFromEditorDelay = 800; // ms
var currentEditor = false;

CodeMirror.defineInitHook(function(cm) {
  cm.on("changes", editHook);
});

var jsEditor = CodeMirror.fromTextArea(document.getElementById("javascript-editor"), {
  lineNumbers: true,
  mode: "javascript",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  matchBrackets: true,
  theme: 'neat'
});


var cssEditor = CodeMirror.fromTextArea(document.getElementById("css-editor"), {
  lineNumbers: true,
  mode: "css",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  matchBrackets: true,
  theme: 'neat'
});

function createStyleTag() {
  var tag = document.createElement('style');
  tag.id = 'css-style';
  tag.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(tag);
}

function evalCss(content) {
  document.getElementById('css-style').remove();
  createStyleTag();
  var style = document.getElementById('css-style');
  style.innerHTML = cssEditor.getValue();
}


// This assumes that the #editor textarea has the widget config
eval(jsEditor.getValue());

createStyleTag();
evalCss(cssEditor.getValue());


// Return control back to the editor after the Okta Sign-In Widget steals it
signInWidget.on('pageRendered', function (data) {
  setTimeout(function(){ currentEditor.focus(); }, returnFocusToEditorDelay);
});

function editHook(codeMirror) {
  if(typingDelayTimer) {
    clearTimeout(typingDelayTimer);
  }
  typingDelayTimer = setTimeout(function(){ updateWidget(codeMirror); }, refreshWidgetFromEditorDelay);
}

function updateWidget(codeMirror) {
  var mode = codeMirror.options.mode;
  var linterHasError = (codeMirror.state.lint.marked.length !== 0);
  if(linterHasError) {
    return;
  }

  currentEditor = codeMirror;
  switch (mode) {
  case "javascript":
    signInWidget.remove();
    eval(codeMirror.getValue());
    break;
  case "css":
    evalCss(codeMirror.getValue());
    break;
  }

}
