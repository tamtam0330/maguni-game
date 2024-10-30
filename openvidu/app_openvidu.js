import $ from 'jquery';
import { OpenVidu } from 'openvidu-browser';

var OV;
var session;


/* OPENVIDU METHODS */

export function joinSession() {

   var mySessionId = document.getElementById("sessionId").value;
   var myUserName = document.getElementById("userName").value;

   // --- 1) Get an OpenVidu object ---

   OV = new OpenVidu();

   // --- 2) Init a session ---

   session = OV.initSession();

   // --- 3) Specify the actions when events take place in the session ---

   // On every new Stream received...
   session.on('streamCreated', event => {

      // Subscribe to the Stream to receive it. HTML video will be appended to element with 'video-container' id
      var subscriber = session.subscribe(event.stream, 'video-container');

      // When the HTML video has been appended to DOM...
      subscriber.on('videoElementCreated', event => {

         // Add a new <p> element for the user's nickname just below its video
         appendCanvas(event.element, subscriber.stream.connection);
         appendUserData(event.element, subscriber.stream.connection);
      });
   });



   session.on('signal:apply-filter', (event) => {
      const { targetUserId } = JSON.parse(event.data);
      applyFilterToUser(targetUserId);
   });

   // function applyFilterToUser(targetUserId) {
   //    const videoElement = document.getElementById(`video-${targetUserId}`);
   //    const canvasElement = document.getElementById(`canvas-${targetUserId}`);
   //    if (videoElement && canvasElement) {
   //       canvasElement.style.display = 'block';
   //       // 필터 적용 로직 추가
   //    }
   


   // On every Stream destroyed...
   session.on('streamDestroyed', event => {

      // Delete the HTML element with the user's nickname. HTML videos are automatically removed from DOM
      removeUserData(event.stream.connection);
   });

   // On every asynchronous exception...
   session.on('exception', (exception) => {
      console.warn(exception);
   });

   // --- 4) Connect to the session with a valid user token ---

   // Get a token from the OpenVidu deployment
   getToken(mySessionId).then(token => {

      // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
      session.connect(token, { clientData: myUserName })
         .then(() => {

            // --- 5) Set page layout for active call ---

            document.getElementById('session-title').innerText = mySessionId;
            document.getElementById('join').style.display = 'none';
            document.getElementById('session').style.display = 'block';

            // --- 6) Get your own camera stream with the desired properties ---

            var publisher = OV.initPublisher('video-container', {
               audioSource: undefined, // The source of audio. If undefined default microphone
               videoSource: undefined, // The source of video. If undefined default webcam
               publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
               publishVideo: true,     // Whether you want to start publishing with your video enabled or not
               resolution: '640x480',  // The resolution of your video
               frameRate: 30,         // The frame rate of your video
               insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
               mirror: false          // Whether to mirror your local video or not
            });

            // --- 7) Specify the actions when events take place in our publisher ---

            // When our HTML video has been added to DOM...
            publisher.on('videoElementCreated', function (event) {
               // initMainVideo(event.element, myUserName);
               appendCanvas(event.element, myUserName);
               appendUserData(event.element, myUserName);
               event.element['muted'] = true;
            });

            // --- 8) Publish your stream ---

            session.publish(publisher);

         })
         .catch(error => {
            console.log('There was an error connecting to the session:', error.code, error.message);
         });
   });
}

export function leaveSession() {

   // --- 9) Leave the session by calling 'disconnect' method over the Session object ---

   session.disconnect();

   // Removing all HTML elements with user's nicknames.
   // HTML videos are automatically removed when leaving a Session
   removeAllUserData();

   // Back to 'Join session' page
   document.getElementById('join').style.display = 'block';
   document.getElementById('session').style.display = 'none';
}

window.onbeforeunload = function () {
   if (session) session.disconnect();
};


function appendCanvas(videoElement, connection) {
   var userData;
   var nodeId;
   if (typeof connection === "string") {
      userData = connection;
      nodeId = connection;
   } else {
      userData = JSON.parse(connection.data).clientData;
      nodeId = connection.connectionId;
   }

   // 공통 부모 요소를 생성합니다.
   const container = document.createElement('div');
   container.style.position = 'relative';
   container.style.width = 640;
   container.style.height = 480;

   // 기존 비디오 요소를 부모 요소로 이동합니다.
   videoElement.parentNode.insertBefore(container, videoElement);
   container.appendChild(videoElement);

   var canvas = document.createElement('canvas');
   canvas.className = "canvas";
   canvas.id = "canvas-" + userData;
   canvas.width = 640;
   canvas.height = 480;
   canvas.style.position = 'absolute';
   canvas.style.top = '0';
   canvas.style.left = '0';
   canvas.style.zIndex = '1';

   container.appendChild(canvas);
}

function appendUserData(videoElement, connection) {
   var userData;
   var nodeId;
   if (typeof connection === "string") {
      userData = connection;
      nodeId = connection;
   } else {
      userData = JSON.parse(connection.data).clientData;
      nodeId = connection.connectionId;
   }
   var dataNode = document.createElement('p');
   dataNode.className = "data-node";
   dataNode.id = "data-" + nodeId;
   dataNode.innerHTML = userData;
   videoElement.parentNode.insertBefore(dataNode, videoElement.nextSibling);

   // var filterButton = document.createElement('button');
   // filterButton.innerText = "필터 시작";
   // filterButton.onclick = startFiltering; // 클릭 이벤트 핸들러 연결
   // videoElement.parentNode.insertBefore(filterButton, videoElement.nextSibling);
}



function removeUserData(connection) {
   var dataNode = document.getElementById("data-" + connection.connectionId);
   var container = dataNode.parentNode;
   container.remove();
}

function removeAllUserData() {
   var nicknameElements = document.getElementsByClassName('data-node');
   while (nicknameElements[0]) {
      nicknameElements[0].parentNode.remove();
   }
}

export function sendFilterSignal(Username) {
   session.signal({
      data: JSON.stringify({ targetUserId }), // 대상 사용자 ID
      type: 'apply-filter' // 신호 타입 설정
   });
}


/**
 * --------------------------------------------
 * GETTING A TOKEN FROM YOUR APPLICATION SERVER
 * --------------------------------------------
 * The methods below request the creation of a Session and a Token to
 * your application server. This keeps your OpenVidu deployment secure.
 *
 * In this sample code, there is no user control at all. Anybody could
 * access your application server endpoints! In a real production
 * environment, your application server must identify the user to allow
 * access to the endpoints.
 *
 * Visit https://docs.openvidu.io/en/stable/application-server to learn
 * more about the integration of OpenVidu in your application server.
 */

var APPLICATION_SERVER_URL = "https://mmyopenvidu.onrender.com/";

function getToken(mySessionId) {
   return createSession(mySessionId).then(sessionId => createToken(sessionId));
}

function createSession(sessionId) {
   return new Promise((resolve, reject) => {
      $.ajax({
         type: "POST",
         url: APPLICATION_SERVER_URL + "api/sessions",
         data: JSON.stringify({ customSessionId: sessionId }),
         headers: { "Content-Type": "application/json" },
         success: response => resolve(response), // The sessionId
         error: (error) => reject(error)
      });
   });
}

function createToken(sessionId) {
   return new Promise((resolve, reject) => {
      $.ajax({
         type: 'POST',
         url: APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections',
         data: JSON.stringify({}),
         headers: { "Content-Type": "application/json" },
         success: (response) => resolve(response), // The token
         error: (error) => reject(error)
      });
   });
}