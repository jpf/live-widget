var typingDelayTimer = false;
var returnFocusToEditorDelay     = 200; // ms
var refreshWidgetFromEditorDelay = 800; // ms

var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  lineNumbers: true,
  mode: "javascript",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  matchBrackets: true,
  theme: 'neat'
});


// This assumes that the #editor textarea has the widget config
eval(editor.getValue());

// Return control back to the editor after the Okta Sign-In Widget steals it
signInWidget.on('pageRendered', function (data) {
  setTimeout(function(){ editor.focus(); }, returnFocusToEditorDelay);
});

CodeMirror.defineInitHook(function(cm) {
  cm.on("changes", editHook);
});

function editHook(codeMirror) {
  if(typingDelayTimer) {
    clearTimeout(typingDelayTimer);
  }
  typingDelayTimer = setTimeout(function(){ updateWidget(codeMirror); }, refreshWidgetFromEditorDelay);
}

function updateWidget(codeMirror) {
  var linterHasError = (codeMirror.state.lint.marked.length !== 0);
  if(linterHasError) {
    return;
  }
  signInWidget.remove();
  eval(codeMirror.getValue());
}
