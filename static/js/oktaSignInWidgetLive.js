var typingDelayTimer = false;
var returnFocusToEditorDelay     = 200; // ms
var refreshWidgetFromEditorDelay = 800; // ms
var currentEditor = false;

var sass = new Sass();

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
  mode: "sass",
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
evalSass(cssEditor.getValue());


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

function updateColorsForLogo(url) {
  Vibrant.from("http:" + url).getPalette((err, palette) => {
    mySass = cssEditor.getValue();
    logoVibrantColor = "rgb(" + palette["Vibrant"]._rgb.join(', ') + ");";
    buttonBgColor = "$primary-button-bg-color: " + logoVibrantColor;
    mySass = mySass.replace(/\$primary-button-bg-color:.*?;/, buttonBgColor);

    if(palette['LightVibrant']) {
      mahColor = "rgb(" + palette["LightVibrant"]._rgb.join(', ') + ");";
      mahButtonBgColor = "$light-text-color: " + mahColor;
      mySass = mySass.replace(/\$light-text-color:.*?;/, mahButtonBgColor);
    }
    cssEditor.getDoc().setValue(mySass);
    evalSass(cssEditor.getValue());
  });
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
    ga('send', 'event', 'demo', 'logo-change', signInWidgetConfig.logo);
    updateColorsForLogo(signInWidgetConfig.logo);
    break;
  case "sass":
    evalSass(codeMirror.getValue());
    break;
  }
}

// HTTP requests are made relative to worker
var base = '../../static/sass';

// the directory files should be made available in
var directory = '';

// the files to load (relative to both base and directory)
var files = [
  '_base.scss',
  '_container.scss',
  '_fonts.scss',
  '_helpers.scss',
  '_ie.scss',
  '_layout.scss',
  '_variables.scss',
  'common/admin/icons/_all.scss',
  'common/admin/icons/_classes-social.scss',
  'common/admin/icons/_classes.scss',
  'common/admin/icons/_functions.scss',
  'common/admin/icons/_variables-theme.scss',
  'common/admin/icons/_variables-unicode-social.scss',
  'common/admin/icons/_variables-unicode.scss',
  'common/admin/modules/infobox/_infobox.scss',
  'common/enduser/_helpers.scss',
  'common/enduser/_reset.scss',
  'common/enduser/_responsive-variables.scss',
  'common/foo.scss',
  'common/shared/helpers/_all.scss',
  'common/shared/helpers/_mixins.scss',
  'common/shared/helpers/_variables.scss',
  'common/shared/o-forms/_o-form-variable.scss',
  'common/shared/o-forms/_o-form.scss',
  'modules/_accessibility.scss',
  'modules/_app-login-banner.scss',
  'modules/_beacon.scss',
  'modules/_btns.scss',
  'modules/_consent.scss',
  'modules/_enroll.scss',
  'modules/_factors-dropdown.scss',
  'modules/_footer.scss',
  'modules/_forgot-password.scss',
  'modules/_forms.scss',
  'modules/_header.scss',
  'modules/_infobox.scss',
  'modules/_mfa-challenge-forms.scss',
  'modules/_okta-footer.scss',
  'modules/_qtip.scss',
  'modules/_registration.scss',
  'modules/_social.scss',
  'okta-sign-in.scss',
  'okta-theme.scss',
  'widgets/_chosen.scss',
  'widgets/_jquery.qtip.scss',
  'widgets/_mega-drop-down.scss',
];

function evalSass(input) {
  sass.compile(input, function(result) {
    console.log("SASS compiled");
    document.getElementById('css-style').remove();
    createStyleTag();
    var style = document.getElementById('css-style');
    style.innerHTML = result.text;
  });
}

// register the files to be loaded when required
sass.preloadFiles(base, directory, files, function() {
  console.log('SAAS files loaded')
});
