// ==UserScript==
// @name         TagPro GroPro
// @version      0.1
// @description  Enhance your group experience!
// @author       Ko
// @icon         https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/G(roPro).png
// @include      http://tagpro-*.koalabeast.com*
// @grant        GM_notification
// ==/UserScript==


const show_time = true;


if (window.location.pathname === '/groups') {  // If we are on the groups selection page
}

if (window.location.pathname.match(/^\/groups\/[a-z]{8}$/)) {  // If we are in a group

    tagpro.ready( function(){

        var events = ['port','member','removed','full','banned','you','private','setting','publicGroup','play'];



        // Show notifications on receiving chats
        tagpro.group.socket.on('chat', function(chat){
            if (! document.hasFocus())
                // GM_notification( text, title, icon (defaults to script icon), onclick)
                GM_notification( chat.message, chat.from || 'GroPro', null, window.focus );
        });

        // Replace TagPro's function that puts chats in the chat-log
        tagpro.group.socket.listeners('chat')[0] = function(chat) {
            var chat_log = $(".js-chat-log");

            with (new Date()) var time = ('0'+getHours()).slice(-2) + ':' + ('0'+getMinutes()).slice(-2);
            var timestamp = show_time ? $("<span></span>").addClass("timestamp").text( time ) : null;

            var player_name = chat.from ? $("<span></span>").addClass("player-name team-1").text(chat.from + ": ") : null;
            var chat_message = $("<span></span>").text(chat.message).addClass("chat-message");
            $("<div></div>").addClass("chat-line").append(timestamp).append(player_name).append(chat_message).appendTo(chat_log);
            chat_log.scrollTop(chat_log.get(0).scrollHeight);
        };

        // Find the correct styleSheet
        for (var styleSheet of document.styleSheets) if (styleSheet.href.includes('/style.css')) break;

        // Add a rule to the sheet for the timestamp
        styleSheet.insertRule(".group .chat-log .timestamp { margin-right: 5px; color: Yellow; }");
        styleSheet.insertRule(".group .chat-log .player-name.team-1 { margin-right: 5px; color: Red; }");
        styleSheet.insertRule(".group .chat-log .player-name.team-2 { margin-right: 5px; color: Blue; }");

        for (let event of events) {
            tagpro.group.socket.on(event, function(data){console.log('Group socket event \'' + event + '\':',data);});
        }
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
