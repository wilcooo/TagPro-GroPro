// ==UserScript==
// @name         TagPro GroPro
// @version      1.2
// @description  Enhance your group experience!
// @author       Ko
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @website      https://redd.it/no-post-yet
// @icon         https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/G(roPro).png
// @download     https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/tpgp.user.js
// @match        http://*.koalabeast.com:*/*
// @grant        GM_notification
// @require      https://greasyfork.org/scripts/40189-tagpro-groups-on-homepage/code/TagPro%20Groups%20on%20Homepage.user.js
// @license      MIT
// ==/UserScript==




////////////////////////////////////////////////////////////////////////////////////////////
//     ### --- OPTIONS --- ###                                                            //
////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                      //  //
// Check this for a guide on how to change these options:                             //  //
// https://www.reddit.com/r/TagPro/wiki/modding#wiki_how_to_modify_a_userscript       //  //
                                                                                      //  //
// Show a notification when you are on another right tab (f.e. browsing /r/TagPro)    //  //
const show_notifications = true;                                                      //  //
                                                                                      //  //
// Play a 'bwep' sound whenever someone sends a message                               //  //
const sound_on_chat = true;                                                           //  //
                                                                                      //  //
// Play a 'dink' sound whenever someone joines                                        //  //
const sound_on_join = true;                                                           //  //
                                                                                      //  //
// Play a 'donk' sound whenever someone leaves                                        //  //
const sound_on_left = true;                                                           //  //
                                                                                      //  //
// You can change those 3 sounds in the box below the options                         //  //
                                                                                      //  //
// Color names in chat, according to the team of that player                          //  //
// (Red&Blue teams, Green playing pubs, White spectating, Gray waiting)               //  //
const color_names = true;                                                             //  //
                                                                                      //  //
// Show a timestamp next to every chat message.                                       //  //
const show_timestamps = true;                                                         //  //
                                                                                      //  //
// This requires the `show_timestamps` to be true.                                    //  //
// It will add seconds to the timestamp as well.                                      //  //
const show_seconds = false;                                                           //  //
                                                                                      //  //
// This requires the `show_timestamps` to be true.                                    //  //
// It will fade the timestamp when you have read the message                          //  //
const fade_read_chats = true;                                                         //  //
                                                                                      //  //
// Use the arrow up/down keys to scroll to earlier sent messages (like in a console)  //  //
const chat_history = true;                                                            //  //
                                                                                      //  //
// Don't scroll down for new messages when you are scrolling through old ones.        //  //
// Instead it will show an arrow, indicating that new messages are available.         //  //
const prevent_scroll = true;                                                          //  //
                                                                                      //  //
// Shows available groups on the homepage, and lets you create a new group with       //  //
// a single click from there too. When already in a group, it shows only that one.    //  //
const groups_on_home = true;                                                          //  //
                                                                                      //  //
// Position on homepage ( can be 'top', 'home', or 'bottom' )                         //  //
// 'home' means beneath the video on the homepage                                     //  //
// TODO: link to a picture that explains these positions                              //  //
const position = 'top';                                                               //  //
                                                                                      //  //
// Shows the group description as set by the leader/admins                            //  //
// If there is no description, and when you don't have the rights to edit,            //  //
// it is still hidden. Not recommended to turn off, because you could miss important  //  //
// information. Balls without this script *do* still see the description.             //  //
const show_description = true;                                                        //  //
                                                                                      //  //
// Show 'Ready!' beneath everyone who has checked the 'ready' button.                 //  //
const show_ready_states = true;                                                       //  //
                                                                                      //  //
// Show the 'ready' button, to tell everyone that you are ready.                      //  //
// Not recommended to turn of, as others might unnecessarily wait on you when you     //  //
// don't click the ready button!                                                      //  //
const show_ready_btn = true;                                                          //  //
                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////  //
//                                                     ### --- END OF OPTIONS --- ###     //
////////////////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     ### --- SOUNDS --- ###                                                                                             //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                                                      //  //
var chat_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/chat.wav');          //  //
var left_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/left.mp3');          //  //
var join_sound = new Audio('https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/audio/joined.mp3');        //  //
                                                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  //
//                                                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






//////////////////////////////////////
// SCROLL FURTHER AT YOUR OWN RISK! //
//////////////////////////////////////




var short_name = 'gropro';             // An alphabetic (no spaces/numbers, preferably lowercase) distinctive name for the script.
var version = GM_info.script.version;  // The version number is automatically fetched from the metadata.
tagpro.ready(function(){ tagpro.scripts = Object.assign( tagpro.scripts || {}, {short_name:{version:version}} ); });
console.log('START: ' + GM_info.script.name + ' (v' + version + ' by ' + GM_info.script.author + ')');





// Userscripts load in the order that they appear in Tamermonkey.
// Set this option to true if you want this script to be inserted to
// the page above than previously load scripts, instead of below.
const insertBefore = false;



if (window.location.pathname === '/groups') {  // If we are on the groups selection page
}

else if (window.location.pathname.match(/^\/groups\/[a-z]{8}$/)) {  // If we are in a group

    tagpro.ready( function(){




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
            chat.time = Date.now(); // This is not in the original TagPro code, but it's handy
            group.chat.push(chat);
        });

        socket.on('port', function(port) {
            group.currentGamePort = port;
        });

        socket.on('member', function(member) {
            if (!group.players[member.id]) send_description();  // Not original TP code either

            // This is slightly altered to allow a 'ready' variable to persist
            group.players[member.id] = Object.assign(group.players[member.id] || {}, member);

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



        var chat_log = document.getElementsByClassName('js-chat-log')[0];





        // Show notifications on receiving chats // Play sound
        function notify(chat){
            if (show_notifications && !document.hasFocus()) {
                // GM_notification( text, title, icon (defaults to script icon), onclick)
                GM_notification( chat.message, chat.from || group.settings.groupName, null, window.focus );
            }

            // Play a sound
            if (chat.from && sound_on_chat) chat_sound.play();
            else if (chat.message.endsWith(' has left the group.') && sound_on_left)
                left_sound.play();
            else if (chat.message.endsWith(' has joined the group.') && sound_on_join)
                join_sound.play();
            else if (sound_on_chat) chat_sound.play();
        }





        // This function will fade the timestamp when you've seen the message
        function fadeTimestamp(t) {

            // If the window isn't focussed
            if(!document.hasFocus()) {
                return window.addEventListener("focus", function() {
                    fadeTimestamp(t);
                }, {once:true});
            }

            // If the chat row is not in view (due to scrolling)
            if ( t[0].offsetTop < chat_log.scrollTop || t[0].offsetTop > chat_log.scrollTop + chat_log.clientHeight ) {
                return chat_log.addEventListener("scroll", function(){
                    fadeTimestamp(t);
                }, {once:true});
            }

            // Wait 3 secs, and fade if the document is still focussed
            else {
                setTimeout( function(){
                    if (document.hasFocus())
                        t.fadeTo("slow",0.4);
                    else fadeTimestamp(t);
                }, 3000);
            }
        }





        // Don't scroll down when reading old messages

        var scrolled = true;

        chat_log.addEventListener("scroll", function(){
            scrolled = chat_log.scrollTop >= chat_log.scrollHeight - chat_log.clientHeight;
            if (scrolled) arrow.style.display = 'none';
        });

        function scrollChat() {
            if (!prevent_scroll || scrolled)
                chat_log.scrollTop = chat_log.scrollHeight;

            else {arrow.style.display = '';}
        }

        var last_chat = '';

        $('<img id="chat-log-arrow" style="position:absolute;right:30px;top:150px;display:none" src="https://raw.githubusercontent.com/wilcooo/TagPro-GroPro/master/arrow.png">').appendTo(chat_log);
        var arrow = document.getElementById('chat-log-arrow');
        arrow.style.cursor = 'pointer';
        arrow.title = 'New messages!';
        arrow.onclick = function(){
            chat_log.scrollTop = chat_log.scrollHeight;
            arrow.style.display = 'none';
        };





        // This function receives all chat messages

        function handleChat(chat) {

            var player = group.players[Object.keys(group.players).filter( id => group.players[id].name == chat.from )[0]];
            var match;

            // Append messages starting with ⋯
            var last = group.chat[group.chat.length-1] || {from:null};

            if ( chat.message.startsWith('⋯') && last.from == chat.from && last.time > Date.now()-5) {
                last_chat = last_chat + chat.message.slice(1);
                $(".js-chat-log .chat-message").last().text( last_chat );

                scrollChat();

                return;
            }

            // Handle commands
            if ( ( match = chat.message.match(/^\[GroPro:(\w{1,11})\](.{0,100})$/) ) ) { // If the message is of the form [GroPro:xxx]yyy
                var command = match[1], // the xxx part
                    value = match[2];   // the yyy part

                if (command=='description' && player.leader) {
                    group.description = value;

                    if (show_description) update_gd();

                    return;
                }

                if (command=='ready') {
                    player.ready = true;
                    updateReadyStates();
                    if (!value) return;
                }

                if (command=='notready') {
                    player.ready = false;
                    updateReadyStates();
                    if (!value) return;
                }

                var warning = tagpro.helpers.displayError('Someone sent an unrecognizable command (as you can see in chat). The sender probably doesn\'t know what GroPro is, or you don\'t have the latest version installed.');
                warning[0].onclick = ()=>warning.fadeOut(); // Click to hide
                warning[0].style.cursor = 'pointer';
                warning[0].title = 'Click to hide';
            }

            // Handle an actual message
            last_chat = chat.message;


            var timestamp;

            if (show_timestamps) {
                var time = new Date().toTimeString().substr(0,  show_seconds ? 8 : 5  );
                timestamp = $("<span></span>").addClass("timestamp").text( time );
                if (fade_read_chats) fadeTimestamp(timestamp);
            }

            var player_name = null;
            if (chat.from) {
                var team = player && player.team+1 ? " team-"+player.team : "";

                player_name = $("<span></span>").addClass("player-name" + team).text(chat.from + ": ");
            }

            var chat_message = $("<span></span>").text(chat.message).addClass("chat-message");
            $("<div></div>").addClass("chat-line").append(timestamp).append(player_name).append(chat_message).appendTo(chat_log);

            scrollChat();

            notify(chat);
        }

        // Replace TagPro's function that puts chats in the chat-log
        socket.listeners('chat')[0] = handleChat;

        // Find the correct styleSheet
        for (var styleSheet of document.styleSheets) if (styleSheet.href.includes('/style.css')) break;

        // Add a rule to the sheet for the timestamp and player names
        styleSheet.insertRule(".group .chat-log .timestamp { margin-right: 5px; color: Yellow; }");

        if (color_names) {
            styleSheet.insertRule(".group .chat-log .player-name { color: #4c4c4c }");          // Gray
            styleSheet.insertRule(".group .chat-log .player-name.team-0 { color: #8BC34A; }");  // Green
            styleSheet.insertRule(".group .chat-log .player-name.team-1 { color: #D32F2F; }");  // Red
            styleSheet.insertRule(".group .chat-log .player-name.team-2 { color: #1976D2; }");  // Blue
            styleSheet.insertRule(".group .chat-log .player-name.team-3 { color: #e0e0e0; }");  // White
        }





        // Split long messages, so that you can send those too
        // Also save all sent messages
        // for the history option

        var sent = [], hist = -1, curr = "";

        $('.js-chat-input').off('keydown');  // Remove old handler

        document.getElementsByClassName('js-chat-input')[0].onkeydown = function(key){
            if (key.which == 13) {  // ENTER
                sent.unshift(this.value);
                hist = -1;

                if (this.value.length <= 120) socket.emit("chat", this.value);
                else {
                    var cut, chats = [ this.value.slice( 0, 120 ) ];
                    while ((cut = this.value.slice( chats.length*119+1 ))) {
                        chats.push( '⋯' + cut.slice(0,119) );
                    }

                    for (var c of chats) socket.emit("chat", c);
                }
                this.value = "";

                //chat_log.scrollTop = chat_log.scrollHeight;
            }

            if (chat_history && key.which == 38) { // ARROW-UP
                if (hist == -1) curr = this.value;
                if (hist < sent.length-1) {
                    this.value = sent[ ++hist ];
                    key.preventDefault();   // Prevent the caret/cursor to jump to the start
                }
            }
            if (chat_history && key.which == 40) { // ARROW-DOWN
                if (hist > -1) {
                    this.value = sent[ --hist ] || curr;
                    key.preventDefault();   // Prevent the caret to jump to the end
                }
            }
        };





        // Group description

        document.getElementsByClassName('js-chat-input')[0].placeholder = 'Send a message';

        if (show_description) {

            $(`
                <div id="gd-container" class="col-md-12" style="display:none"><hr>
                    <h3 style="float:left;font-size:16px">Group Description</h3>
                    <div id="gd-btns" style="display:none;float:right;margin-bottom:14px">
                        <a id="gd-save" class="btn btn-default">Save</a>
                        <a id="gd-cancel" class="btn btn-default">Cancel</a>
                    </div>
                    <textarea readonly id="gd-text" maxlength=100 placeholder="Group description (this is also sent to those without the script)" type="text" style="background:#212121;width:100%;padding:5px 10px;resize:vertical" class="chat"></textarea>
                <hr></div>`).insertAfter(document.getElementById('group-chat').parentNode);

            var gd_container = document.getElementById('gd-container');
            var gd_text = document.getElementById('gd-text');
            var gd_save = document.getElementById('gd-save');
            var gd_cancel = document.getElementById('gd-cancel');
            var gd_btns = document.getElementById('gd-btns');

            gd_save.onclick = function(){
                if (gd_text.value != group.description)
                    socket.emit('chat', "[GroPro:description]"+gd_text.value);

                gd_btns.style.display = 'none';
            };

            gd_cancel.onclick = function(){
                update_gd();

                gd_btns.style.display = 'none';
            };

            socket.once('you', function(you){

                update_gd();
                socket.on('member', function(member){
                    if (member.id == group.self.id)
                        update_gd(false);
                });
            });
        }

        group.description = "";

        function editDescription(){
            // Show the save/cancel buttons
            gd_btns.style.display = '';
        }

        function onLeader(){
            gd_text.readOnly = false;
            gd_text.onfocus = editDescription;
        }

        function onNonLeader(){
            gd_text.readOnly = true;
            gd_text.onfocus = null;
            gd_text.value = group.description;

            gd_btns.style.display = 'none';
        }

        function update_gd(text=true) {

            if (!show_description) return;

            if (group.description || group.self.leader)
                gd_container.style.display = '';  //show
            else
                gd_container.style.display = 'none';  //hide

            if (group.self.leader) {
                gd_text.readOnly = false;
                gd_text.onfocus = editDescription;
            } else {
                gd_text.readOnly = true;
                gd_text.onfocus = null;

                gd_btns.style.display = 'none';
            }

            if (text) gd_text.value = group.description;
        }

        function send_description() {

            if (group.self && group.self.leader && group.description ) {
                socket.emit('chat', "[GroPro:description]"+gd_text.value);
            }
        }





        // Ready button

        // First, add the button

        if (show_ready_btn) {

            var ready_public_btn = document.createElement('label');
            ready_public_btn.className = 'btn btn-default group-setting';
            ready_public_btn.style.marginRight = '14px';
            ready_public_btn.innerHTML = '<input type="checkbox" style="margin:0;vertical-align:middle"> I\'m Ready!';
            var ready_private_btn = ready_public_btn.cloneNode(true);

            var launch_public_btn = document.getElementById('launch-public-btn');
            var launch_private_btn = document.getElementById('launch-private-btn');

            launch_public_btn.parentElement.insertBefore( ready_public_btn, launch_public_btn);
            launch_private_btn.parentElement.insertBefore( ready_private_btn, launch_private_btn);

            var ready_public_box = ready_public_btn.getElementsByTagName('input')[0];
            var ready_private_box = ready_private_btn.getElementsByTagName('input')[0];

            var ready_state = false;
            var last_clicked;

            ready_public_btn.onchange = ready_private_btn.onchange = function(change){

                // Find out what your new readystate is
                ready_state = change.target.checked;

                // Update both buttons accordingly (one of them obviously is already right)
                ready_public_btn.getElementsByTagName('input')[0].checked = ready_state;
                ready_private_btn.getElementsByTagName('input')[0].checked = ready_state;

                // Disable the buttons for a few seconds to prevent spamming
                console.log(ready_public_btn.style.cursor);
                ready_public_btn.style.cursor = 'wait';
                ready_private_btn.style.cursor = 'wait';

                ready_public_box.style.cursor = 'wait';
                ready_private_box.style.cursor = 'wait';

                ready_public_box.disabled = true;
                ready_private_box.disabled = true;

                setTimeout(function(){
                    ready_public_btn.style.cursor = '';
                    ready_private_btn.style.cursor = '';

                    ready_public_box.style.cursor = '';
                    ready_private_box.style.cursor = '';

                    ready_public_box.disabled = false;
                    ready_private_box.disabled = false;
                },3000);

                // Warn if the state is changed right after the delay runs out
                if (last_clicked > Date.now() - 6000) {
                    let warning = tagpro.helpers.displayError('Please don\'t change your ready-state more often than needed. Players without the script receive a chat message every time you change it. Thank you :)');
                    warning[0].onclick = ()=>warning.fadeOut(); // Click to hide
                    warning[0].style.cursor = 'pointer';
                    warning[0].title = 'Click to hide';
                }
                last_clicked = Date.now();

                // Tell it to the world
                socket.emit('chat', ready_state ? "[GroPro:ready]" : "[GroPro:notready]");

            };
        }

        for (var event of ['port','member','removed','you','private'])
            socket.on(event, updateReadyStates);

        // This function updates the ready tag beneath each player

        function updateReadyStates(){

            if (!show_ready_states) return;

            for (var player_item of document.getElementsByClassName('player-item')) {
                var player = group.players[ $(player_item).data('model') && $(player_item).data('model').id ];

                var location = player_item.getElementsByClassName('player-location')[0];

                if (player.ready && player.location == "page") {
                    location.innerText = 'Ready!';
                    location.style.color = '#8BC34A';
                }

                else {
                    switch (player.location) {
                        case "page":
                            location.innerText = "In Here";
                            break;
                        case "joining":
                            location.innerText = "Joining a Game";
                            break;
                        case "game":
                            location.innerText = "In a Game";
                    }
                    location.style.color = '';
                }
            }
        }

    });

}

else if (window.location.pathname === '/games/find') {  // In the process of joining a game
}

else if (window.location.port.match(/^8[0-9]{3}$/)) {  // If we are in a game
}

else if (window.location.pathname === '/') {  // If we are on the homepage

    if (groups_on_home) {

        // Create a container for the groups
        var container = document.createElement('div');
        container.id = 'GroPro-groups';
        container.className = 'container';

        // Add the container to the userscript-div and make unhide that
        var pos = document.getElementById('userscript-'+position);
        if (insertBefore) pos.insertBefore(container, pos.firstChild);
        else              pos.append(container);
        pos.classList.remove('hidden');

        // Load the groups from the /groups page
        // and put them inside the container.
        $(container).load('/groups #groups-list', function(result){

            if ( $(result).find('#groups-list').length > 0 ) { // true if you haven't yet joined a group

                groups_list = document.getElementById('groups-list');
                for (let group of groups_list.children) {

                    // Change the width of the group boxes (responsive)
                    group.className = 'col-sm-6 col-md-4';

                    // Replace the 'no groups available' message
                    if (group.innerText == "No public groups available. Create one!")
                        group.outerHTML = `
                            <div class="col-sm-6 col-md-4">
                                <div class="group-item">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="group-name">No public groups available. Create one!</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;

                }

                // Add a 'create group' widget
                groups_list.innerHTML += `
                        <div class="col-sm-6 col-md-4">
                            <div class="group-item">
                                <div class="row">
                                    <form method="post" action="/groups/create">
                                        <div class="col-md-12">
                                            <input name="name" class="group-name" style="background:0;border:0;width:100%" value="Your group">
                                        </div>
                                        <div class="col-md-12 pull-right">
                                        <label tabindex="0" onkeydown="labelKeyDown(event)" class="btn btn-default" style="margin:6px">
                                            <input tabindex="-1" type="checkbox" name="public">
                                            Public Group
                                        </label>
                                        <button class="btn btn-primary" style="margin:6px">Create Group</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>`;

                labelKeyDown = function(event) {
                    if (event.code == 'Space') {
                        event.preventDefault();
                        event.target.firstElementChild.checked ^= true;
                    }
                    if (event.code == 'Enter') {
                        event.preventDefault();
                        event.target.closest('form').submit();
                    }
                };
            }
        });
    }
}


else {  // If we are on any other page of the server
}
