// Meteor Logics
Template.editor.codeSession = function() {
  var codeSessionId = Session.get("codeSessionId");
  return CodeSession.findOne({_id: codeSessionId});
};

Template.editor.events({

  'dropover #editorInstance' : function(e, t) {
    e.preventDefault();
  },

  'drop #editorInstance' : function(e, t) {
    e.preventDefault();
  }

});

Template.editor.rendered = function() {
  cocodojo.editor = {};
  cocodojo.editor.updateDue = false;
  cocodojo.editor.local_uid = (((1+Math.random())*0x10000)|0).toString(16).slice(1);
  cocodojo.editor.editorInstance = ace.edit("editorInstance");
  cocodojo.editor.editorInstance.setTheme("ace/theme/monokai");
  cocodojo.editor.editorInstance.getSession().setMode("ace/mode/javascript");


  // Manual Manipulation
  cocodojo.editor.editorInstance.getSession().getDocument().on("change", function(e){
    if(cocodojo.editor.updateDue){ cocodojo.editor.updateDue = false; }
    else{
      console.log(e);
      CodeSession.update(
        {_id: Session.get("codeSessionId")}, 
        { $set: 
          { newDelta: e.data,//cocodojo.editor.editorInstance.getValue(),
            sender_uid: cocodojo.editor.local_uid }
        }
      );
    }
  });

  var mongoQuery = CodeSession.find({_id: Session.get("codeSessionId")});
  mongoQuery.observe({
    changed : function(newDoc, oldIndex, oldDoc) {
      if(newDoc.sender_uid !== cocodojo.editor.local_uid){
        console.log(newDoc.newDelta);
        cocodojo.editor.updateDue = true;
        cocodojo.editor.editorInstance.getSession().getDocument().applyDeltas([newDoc.newDelta]);
      }
    }
  });

  cocodojo.editor.editorInstance.addEventListener("drop", function(e) {
    // find image data from e.target
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
    e.dataTransfer.setData("Text", imageText);
  });

  cocodojo.editor.editorInstance.addEventListener("dropover", function(e) {
    // find image data from e.target
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
    e.dataTransfer.setData("Text", imageText);
  });
};
