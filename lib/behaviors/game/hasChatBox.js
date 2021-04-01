// hasChatBox
const Input = require('../../Geoffrey/Input');
const Things = require('../../Geoffrey/Things');

module.exports = {
  create: function hasChatBoxCreate (sprite, game) {
    var tKey = sprite.input.keyboard.addKey('T');
    tKey.on('down', function(event) {
      openChatBox();
    });
    function openChatBox (){
      $('.chatBox').show();
    };
    var escKey = sprite.input.keyboard.addKey('ESC');
    escKey.on('down', function(event) {
      closeChatBox();
    });
    var enterKey = sprite.input.keyboard.addKey('ENTER');
    enterKey.on('down', function(event) {
      sendChatMessage();
    });
    function openChatBox (){
      $('.chatBox').show();
      window['game'].gamestate.inputsDisabled = true;
      Input.removeAll(window['game']);
      // TODO: disable all other keys...
    };
    function closeChatBox (){
      $('.chatBox').hide();
      window['game'].gamestate.inputsDisabled = false;
    };
    function sendChatMessage () {
      let msg = $('.chatBoxArea').val();
      // TODO: how do Behaviors / Things send state to the peer broadcaster???
      // TODO: add out of band websocket message for doing real-time chat?
      // Bridge.emit('chat::message', msg);
      closeChatBox();
    }
    $('body').append(`
      <style>
        .chatBox {
          border: solid;
          height: 200px;
          width: 400px;
          position: absolute;
          top: 400px;
          left: 600px;
          color: white;
          display: none;
        }
        .chatBoxArea {
          width: 100%;
        }
      </style>
      <div class="chatBox">
        Talk son<br/>
        <textarea class="chatBoxArea" cols="20" rows="10"></textarea><br/>
        <button>Send</button>
      </div>
    `);
    $('.chatBox button').on('click', function(){
      sendChatMessage();
      return false;
    });
  },
  update: function hasChatBoxUpdate (sprite, game) {
  }
};