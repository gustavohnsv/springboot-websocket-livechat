'use strict';

var username_page = document.querySelector('#username-page');
var chat_page = document.querySelector('#chat-page');

var username_form = document.querySelector('#username-form');
var chat_form = document.querySelector('#message-form');

var message_input = document.querySelector('#message');
var message_area = document.querySelector('#messages');
var connecting_el = document.querySelector('#connecting');

var stomp_client = null;
var username = null;

var colors = [
    "red", "green", "blue", "yellow", "purple", "pink", "orange", "cyan",
    "magenta", "lime", "teal", "indigo", "violet", "brown", "black", "white",
    "gray", "gold", "silver", "maroon", "navy", "olive", "coral", "turquoise",
    "lavender", "beige", "peach", "crimson", "skyblue", "chartreuse", "plum", "salmon"
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if (username) {
        username_page.classList.add('hidden');
        chat_page.classList.remove('hidden');

        var socket = new SockJS('/chat');
        stomp_client = Stomp.over(socket)
        stomp_client.connect({}, onConnect, onError);
    }
    event.preventDefault();
}

function onConnect() {
    // Se inscreve no tópico publico '/topic/public'
    stomp_client.subscribe('/topic/public', onMessageReceived)

    // Avisa que um novo usuário se conectou
    stomp_client.send('/app/add-user', {}, JSON.stringify({sender: username, type: 'JOIN'}));
    connecting_el.classList.add('hidden');
}

function onError() {
    connecting_el.textContent = 'Não foi possível estabelecer conexão. Tente novamente mais tarde.';
    connecting_el.style.color = 'red';
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var message_el = document.createElement('li');

    message_el.classList.add('flex', 'items-center', 'gap-3', 'mb-4');

    if (message.type === 'JOIN') {
        message_el.classList.add('event_message');
        message.content = message.sender + ' entrou para o bate-papo!';

        var text_el = document.createElement('p');
        var msg_text = document.createTextNode(message.content);
        text_el.appendChild(msg_text);
        text_el.classList.add('text-green-500');

        message_el.appendChild(text_el);
    } else if (message.type === 'LEAVE') {
        message_el.classList.add('event_message');
        message.content = message.sender + ' saiu da mesa de conversa!';

        var text_el = document.createElement('p');
        var msg_text = document.createTextNode(message.content);
        text_el.appendChild(msg_text);
        text_el.classList.add('text-red-500');

        message_el.appendChild(text_el);
    } else {
        message_el.classList.add('chat-message');

        var avatar_el = document.createElement('i');
        var avatar_text = document.createTextNode(message.sender[0]);
        avatar_el.appendChild(avatar_text);
        avatar_el.style['background-color'] = getAvatarColor(message.sender);
        avatar_el.classList.add('p-4', 'w-10', 'h-10', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text-white', 'font-bold');

        var message_container = document.createElement('div');
        message_container.classList.add('flex', 'flex-col', 'gap-1');

        var user_el = document.createElement('span');
        var user_text = document.createTextNode(message.sender);
        user_el.appendChild(user_text);
        user_el.classList.add('text-sm', 'text-gray-500');

        var text_el = document.createElement('p');
        var msg_text = document.createTextNode(message.content);
        text_el.appendChild(msg_text);
        text_el.classList.add('bg-slate-100', 'p-2', 'rounded-lg', 'text-black', 'break-all');

        message_container.appendChild(user_el);
        message_container.appendChild(text_el);

        message_el.appendChild(avatar_el);
        message_el.appendChild(message_container);
    }

    message_area.appendChild(message_el);
    message_area.scrollTop = message_area.scrollHeight;
}

function sendMessage(event) {
    var message_content = message_input.value.trim();
    if (message_content && stomp_client) {
        var chat_msg = {
            sender: username,
            content: message_content,
            type: 'CHAT'
        }
        stomp_client.send('/app/send-message', {}, JSON.stringify(chat_msg));
        message_input.value = '';
    }
    event.preventDefault();
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

username_form.addEventListener('submit', connect, true);
chat_form.addEventListener('submit', sendMessage, true);