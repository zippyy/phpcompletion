/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
  "use strict";

  var AppInit               = brackets.getModule("utils/AppInit"),
      EditorManager         = brackets.getModule("editor/EditorManager"),
      CodeHintManager       = brackets.getModule("editor/CodeHintManager"),
      ProjectManager        = brackets.getModule("project/ProjectManager")
      ;


  /**
   * The object
   */
  function PhpCompletion() {
    this.phpFiles = []
    this.hints = []

    this.loadFiles()
  }

  /**
   * Method called by constructor
   * 
   * @return {[void]} [Nothing is returned here]
   */
  PhpCompletion.prototype.loadFiles = function() {
    var $this = this

    var manager = ProjectManager.getAllFiles(function(file,index,result) {
      var ext = file.name.replace(/.+\./, '')
      if (ext === 'php') {
        $this.phpFiles.push(file)
      }
    })

    manager.done(function(allFiles) {
      console.log('All files loaded')
    })
  }

  PhpCompletion.prototype.fileObjects = function(Doc, size) {

    var hints = []

    for (var i=0; i<size;i++) {
      var line = Doc.getLine(i)
      

      if (line.indexOf('protected') !== -1) {
        var isFunc = false
        if (line.indexOf('function') !== -1) {
          isFunc = true
        }
        
        line = line.replace(/^(protected|public|private)\s+\$/, '').replace(/\s.+/, '')

        if (isFunc) {

          console.log(line)

          hints.push(line+'()')
        } else {
          hints.push(line)
        }
        // console.log(line)
      }

    }

    return hints
  }

  /**
   * Method called by HintProvider
   * 
   * @param  {[Editor]}  editor       [The Editor object]
   * @param  {[char]}  implicitChar [Last typed char by user]
   * @return {Boolean}              [If there's hints to the current mouse position]
   */
  PhpCompletion.prototype.hasHints = function (editor, implicitChar) {

    // Reset result set
    this.hints = []

    // Document is not able to be edited
    if (!editor.document.editable) {
      return false
    }

    // Get needle information
    var cursor = editor.getCursorPos()
    var curCharPos = cursor.ch
    var curLinePos = cursor.line
    var lineStr = editor._codeMirror.getLine(curLinePos)
    var totalLines = editor._codeMirror.doc.size

    var whatIsIt = lineStr.substr(0, curCharPos).replace(/.+\s/, '')

    // Get Variables
    if (whatIsIt.indexOf('$') !== -1) {
      whatIsIt = '$'+(whatIsIt.replace(/(.+)?\$/gi, ''))
    }


    /**
     * Depending on the type of element we'll get
     * hints to complete the code
     */
    
    if (whatIsIt.indexOf('$this') !== -1) {
      
      this.hints = this.fileObjects(editor.document, totalLines)


    } else if ((whatIsIt[0] === '$') && (whatIsIt.indexOf('>') !== -1)) {

      console.log('A class instance object')

    } else if (whatIsIt[0] === '$') {

      console.log('A local variable')

    } else if (lineStr.indexOf('new '+whatIsIt)) {

      console.log('New Instance')

    } else {

      console.log('Can be anything')

    }

    console.log(whatIsIt)

    // lineStr.forEach(function(item,i) {
    //   // console.log([curLinePos, item.lines[curLinePos]])

    //   for (var li in item.lines) {
    //     console.log(item.lines[li].text)
    //   }
    // })

    // var token = TokenUtils.getInitialContext(editor._codeMirror, editor.getCursorPos());
    
    return (this.hints.length !== 0)
  }

  /**
   * Return the hints list
   * 
   * @param  {[char]} implicitChar [Last char typed by the user]
   * @return {[Object]}              The hints list
   */
  PhpCompletion.prototype.getHints = function (implicitChar)
  {
    // editor = EditorManager.getFocusedEditor()
    // cursor = editor.getCursorPos()
    // token  = TokenUtils.getInitialContext(editor._codeMirror, cursor);

    // var result = []

    // for (var i in phpFiles) {
    //   result.push(phpFiles[i].name)
    // }
    
    return {
      hints: this.hints,
      match: false,
      selectInitial: true,
      handleWideResults: false
    }
  }

  /**
   * When app is ready to begin
   * @param  {PhpCompletion} ) {               var phpCompletion [description]
   * @return {[type]}          [description]
   */
  AppInit.appReady(function () {

    var phpCompletion = new PhpCompletion()

    // register the provider.  Priority = 10 to be the provider of choice for php
    CodeHintManager.registerHintProvider(phpCompletion, ["php"], 10);

  })

});
