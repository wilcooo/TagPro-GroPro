// ==UserScript==
// @name         TagPro GroPro
// @version      0.2
// @description  Enhance your group experience!
// @author       Ko
// @icon         https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/G(roPro).png
// @download     https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/tpgp.user.js
// @include      http://tagpro-*.koalabeast.com*
// @grant        GM_notification
// ==/UserScript==


const show_time = true;
const show_seconds = false;

var chat_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/chat.wav');
var left_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/left.mp3');
var join_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/joined.mp3');



if (window.location.pathname === '/groups') {  // If we are on the groups selection page
}

if (window.location.pathname.match(/^\/groups\/[a-z]{8}$/)) {  // If we are in a group

    tagpro.ready( function(){

        // Show notifications on receiving chats // Play sound
        tagpro.group.socket.on('chat', function(chat){
            if (! document.hasFocus()) {
                // GM_notification( text, title, icon (defaults to script icon), onclick)
                GM_notification( chat.message, chat.from || 'GroPro', null, window.focus );
            }

            // Play a sound
            if (chat.from) chat_sound.play();
            else if (chat.message.endsWith(' has left the group.'))
                left_sound.play();
            else if (chat.message.endsWith(' has joined the group.'))
                join_sound.play();
            else chat_sound.play();
        });


        // This function will fade the timestamp when you've seen the message
        function fadeTimestamp(t) {
            if (document.hasFocus()) {
                setTimeout( function(){
                    if (document.hasFocus())
                        t.fadeTo("slow",0.4);
                    else fadeTimestamp(t);
                }, 3000);
            } else {
                window.addEventListener("focus", function() {
                    fadeTimestamp(t);
                });
            }
        }

        var last_chat = '';

        // Replace TagPro's function that puts chats in the chat-log
        tagpro.group.socket.listeners('chat')[0] = function(chat) {
            var chat_log = $(".js-chat-log");

            if ( chat.message.startsWith('⋯') && group.chat[group.chat.length-1].from == chat.from) {
                last_chat = last_chat + chat.message.slice(1);
                $(".js-chat-log .chat-message").last().text( last_chat );
            } else {
                last_chat = chat.message;

                var time = new Date().toTimeString().substr(0,  show_seconds ? 8 : 5  );
                var timestamp = show_time ? $("<span></span>").addClass("timestamp").text( time ) : null;

                fadeTimestamp(timestamp);

                var player_name = null;
                if (chat.from) {
                    var player = group.players[Object.keys(group.players).filter( id => group.players[id].name == chat.from )[0]];
                    var team = player && player.team+1 ? " team-"+player.team : "";

                    player_name = $("<span></span>").addClass("player-name" + team).text(chat.from + ": ");
                }

                var chat_message = $("<span></span>").text(chat.message).addClass("chat-message");
                $("<div></div>").addClass("chat-line").append(timestamp).append(player_name).append(chat_message).appendTo(chat_log);
            }

            chat_log.scrollTop(chat_log.get(0).scrollHeight);
        };

        // Find the correct styleSheet
        for (var styleSheet of document.styleSheets) if (styleSheet.href.includes('/style.css')) break;

        // Add a rule to the sheet for the timestamp
        styleSheet.insertRule(".group .chat-log .timestamp { margin-right: 5px; color: Yellow; }");
        styleSheet.insertRule(".group .chat-log .player-name { color: #4c4c4c }");          // Gray
        styleSheet.insertRule(".group .chat-log .player-name.team-0 { color: #8BC34A; }");  // Green
        styleSheet.insertRule(".group .chat-log .player-name.team-1 { color: #D32F2F; }");  // Red
        styleSheet.insertRule(".group .chat-log .player-name.team-2 { color: #1976D2; }");  // Blue
        styleSheet.insertRule(".group .chat-log .player-name.team-3 { color: #e0e0e0; }");  // White


        // Split long messages, so that you can send those too
        // Also save all sent messages

        var sent = [], hist = -1, curr = "";

        $('.js-chat-input').off('keydown');  // Remove old handler

        document.getElementsByClassName('js-chat-input')[0].onkeydown = function(key){
            if (key.which == 13) {  // ENTER
                sent.unshift(this.value);
                hist = -1;

                if (this.value.length <= 120) group.socket.emit("chat", this.value);
                else {
                    var cut, chats = [ this.value.slice( 0, 120 ) ];
                    while ((cut = this.value.slice( chats.length*119+1 ))) {
                        chats.push( '⋯' + cut.slice(0,119) );
                    }

                    for (var c of chats) group.socket.emit("chat", c);
                }
                this.value = "";
            }

            if (key.which == 38) { // ARROW-UP
                if (hist == -1) curr = this.value;
                if (hist < sent.length-1) {
                    this.value = sent[ ++hist ];
                    key.preventDefault();   // Prevent the caret/cursor to jump to the start
                }
            }
            if (key.which == 40) { // ARROW-DOWN
                if (hist > -1) {
                    this.value = sent[ --hist ] || curr;
                    key.preventDefault();   // Prevent the caret to jump to the end
                }
            }
        };

        // Group description
        document.getElementsByClassName('js-chat-input')[0].placeholder = 'Send a message';
        $('<div class="chat chat-input" style="margin-top:20px"><textarea id="group-description" maxlength=100 placeholder="Group description (also sent to those without the script)" type="text" style="border-top:none;background:#212121;width:100%;border:none;padding:5px 10px;resize:vertical">').appendTo(document.getElementById('group-chat').parentNode);

        // Keep track of all interesting variables.
        // TagPro does this too, but it's hidden :(
        // Thats why we do this ourselfs too :)

        var group = tagpro.group = Object.assign(tagpro.group, {
            self:            null,
            players:         {},
            privateGame:     $(".group.container").hasClass("js-private-game"),
            privateGroup:    false,
            currentGamePort: null,
            chat:            [],
            selfAssignment:  false,
            settings:        {},
            maxPlayers:      0,
            maxSpectators:   0,
        });

        var socket = group.socket;

        socket.on('chat', function(chat) {
            group.chat.push(chat);
        });

        socket.on('port', function(port) {
            group.currentGamePort = port;
        });

        socket.on('member', function(member) {
            var description;
            if (!group.players[member.id]  &&  (description = document.getElementById("group-description").value)) {
                group.socket.emit('chat', "[GroPro:description]"+description);
            }
            group.players[member.id] = member;
            if (group.self) group.self = group.players[group.self.id];
        });

        socket.on('removed', function(removed) {
            delete group.players[removed.id];
        });

        socket.on('full', function() {
            alert('GroPro: This group is full :(');
        });

        socket.on('banned', function() {
            alert('GroPro: You got banned :(');
        });

        socket.on('you', function(you) {
            group.self = group.players[you];
        });

        socket.on('private', function(private){
            group.privateGame = private.isPrivate;
            group.maxSpectators = private.maxSpectators;
            group.maxPlayers = private.maxPlayers;
            group.selfAssignment = private.selfAssignment;
            group.noScript = private.noScript;
            group.respawnWarnings = private.respawnWarnings;
        });

        socket.on('setting', function(setting) {
            group.settings[setting.name] = setting.value;
        });

        socket.on('publicGroup', function(publicGroup) {
            group.public = publicGroup;
        });
    });

}

if (window.location.pathname === '/games/find') {  // In the process of joining a game
}

if (window.location.port.match(/^8[0-9]{3}$/)) {  // If we are in a game
}

if (window.location.pathname === '/') {  // If we are on the homepage
}


else {  // If we are on any other page of the server
}
