import $ from 'jquery';
import { OpenVidu } from 'openvidu-browser';
import {calculateFilterPosition} from '../filter/calculate-filter-position.ts';
import { loadDetectionModel } from '../filter/load-detection-model.js';
//import SUNGLASS from "../src/assets/images/sunglasses.png";
import MUSTACHE from "../src/assets/images/mustache.png";
import MUMURI from "../src/assets/images/mumuri.png";
import DISH from "../src/assets/images/dish.png";
import GOONGYE from "../src/assets/images/goongYe.png";
import RCEYE from "../src/assets/images/RCeye.png";
import SMILEMOUTH from "../src/assets/images/smileMouth2.png";
import MINIONS from "../src/assets/images/minions.png";
// import MAGUNI from "../src/assets/images/maguni.gif";


var OV;
var session;
export var subscribers = [];
var FRAME_RATE = 30;

// 외부 변수로 선언
let gMediaStream;
let compositeStream;
let publisher;

// function drawGIFOnCanvas(ctx, gifSrc, x, y, width, height) {
//    // gifSrc는 이미지 파일 경로
//    const gifImage = new Image();
//    gifImage.src = gifSrc; // MAGUNI 경로를 gifImage에 설정

//    // 이미지가 로드된 후에 그리기 시작
//    gifImage.onload = () => {
//        const interval = setInterval(() => {
//            ctx.clearRect(0, 0, width, height); // 이전 프레임 제거
//            ctx.drawImage(gifImage, x, y, width, height); // 새로운 프레임 그리기
//        }, 1000 / FRAME_RATE);
//    };

//    gifImage.onerror = () => {
//        console.error("GIF 이미지를 불러오는 데 실패했습니다:", gifSrc);
//    };
// }

/* OPENVIDU METHODS */

export function joinSession(mySessionId,myUserName) {

   // --- 1) Get an OpenVidu object ---

   OV = new OpenVidu();

   // --- 2) Init a session ---

   session = OV.initSession();

   // --- 3) Specify the actions when events take place in the session ---

   // On every new Stream received...
   session.on('streamCreated', event => {

      // Subscribe to the Stream to receive it. HTML video will be appended to element with 'video-container' id
      //let subscriber = session.subscribe(event.stream, 'video-container');

      //등록하되 생성하진 않음
      let subscriber = session.subscribe(event.stream, 'video-container');

      subscribers = [...subscribers,subscriber];

      //const videoContainer = document.getElementById('video-container');


      // When the HTML video has been appended to DOM...
      subscriber.on('videoElementCreated', event => {
      //    // 비디오 element가 생성될 때 해당 element를 반환하여 GameRoomPage.jsx에서 필터링 처리
      //   const videoElement = event.element;
      //   // 이벤트 발생 시 videoElement를 콜백으로 호출
      //   handleVideoElementCreated(videoElement, subscriber.stream.connection);

         // Add a new <p> element for the user's nickname just below its video
         appendUserData(event.element, subscriber.stream.connection);
      });
   });

   // On every Stream destroyed...
   session.on('streamDestroyed', event => {

      // Delete the HTML element with the user's nickname. HTML videos are automatically removed from DOM
      removeUserData(event.stream.connection);

      subscribers.filter((sub) =>
      sub !== event.stream.streamManager);
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
            OV.getUserMedia({
               audioSource: false,
               videoSource: undefined,
               // resolution: '1280x720',
               resolution: '640x480',
               frameRate: FRAME_RATE,
            }).then((mediaStream) =>{
               gMediaStream = mediaStream;
               startStreaming(session,OV,mediaStream);
            });

            // --- 5) Set page layout for active call ---

            document.getElementById('session-title').innerText = mySessionId;
            document.getElementById('join').style.display = 'none';
            document.getElementById('session').style.display = 'block';

         })
         .catch(error => {
         });
   });
}

function applyEnhancedMouthDistortion(ctx, keypoints) {
   const mouthCenter = keypoints[13]; // 입 중심 좌표 (입을 나타내는 키포인트)
   const radius = 50; // 입 주변의 효과 범위 조정 반경
   const strength = 0.5; // 왜곡 강도 (값을 높일수록 왜곡이 강해짐)

   // 입 주변의 픽셀 데이터를 가져옵니다.
   const imageData = ctx.getImageData(
       mouthCenter.x - radius,
       mouthCenter.y - radius,
       radius * 2,
       radius * 2
   );

   const data = imageData.data;
   const width = imageData.width;
   const height = imageData.height;
   const centerX = radius;
   const centerY = radius;

   // 왜곡된 픽셀 데이터를 저장할 새로운 버퍼 생성
   const outputData = new Uint8ClampedArray(data);

   // 왜곡 효과 적용
   for (let y = 0; y < height; y++) {
       for (let x = 0; x < width; x++) {
           const dx = x - centerX;
           const dy = y - centerY;
           const dist = Math.sqrt(dx * dx + dy * dy);

           if (dist < radius) {
               // 중심에서의 거리에 따라 왜곡 강도 계산
               const factor = 1 + strength * (1 - dist / radius);
               const newX = Math.floor(centerX + dx * factor);
               const newY = Math.floor(centerY + dy * factor);

               // 새 좌표가 이미지 경계를 벗어나지 않도록 제한
               if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                   const idx = (y * width + x) * 4;
                   const newIdx = (newY * width + newX) * 4;

                   // 왜곡된 위치로 색상 값을 이동 (outputData에 저장)
                   outputData[newIdx] = data[idx];
                   outputData[newIdx + 1] = data[idx + 1];
                   outputData[newIdx + 2] = data[idx + 2];
                   outputData[newIdx + 3] = data[idx + 3];
               }
           }
       }
   }

   // 왜곡된 데이터를 원본 imageData에 복사
   for (let i = 0; i < data.length; i++) {
       data[i] = outputData[i];
   }

   // 왜곡된 이미지 데이터를 캔버스에 다시 그립니다.
   ctx.putImageData(imageData, mouthCenter.x - radius, mouthCenter.y - radius);
}

function applyEnhancedLensDistortion(ctx, keypoints) {
   const noseCenter = keypoints[4]; // 코 중심 좌표
   const radius = 80; // 효과 범위를 조정하는 반경
   const strength = 0.5; // 왜곡 강도 (값을 높일수록 왜곡이 강해짐)

   // 코 주변의 픽셀 데이터를 가져옵니다.
   const imageData = ctx.getImageData(
       noseCenter.x - radius,
       noseCenter.y - radius,
       radius * 2,
       radius * 2
   );

   const data = imageData.data;
   const width = imageData.width;
   const height = imageData.height;
   const centerX = radius;
   const centerY = radius;

   // 왜곡된 픽셀 데이터를 저장할 새로운 버퍼 생성
   const outputData = new Uint8ClampedArray(data);

   // 왜곡 효과 적용
   for (let y = 0; y < height; y++) {
       for (let x = 0; x < width; x++) {
           const dx = x - centerX;
           const dy = y - centerY;
           const dist = Math.sqrt(dx * dx + dy * dy);

           if (dist < radius) {
               // 중심에서의 거리에 따라 왜곡 강도 계산
               const factor = 1 + strength * (1 - dist / radius);
               const newX = Math.floor(centerX + dx * factor);
               const newY = Math.floor(centerY + dy * factor);

               // 새 좌표가 이미지 경계를 벗어나지 않도록 제한
               if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                   const idx = (y * width + x) * 4;
                   const newIdx = (newY * width + newX) * 4;

                   // 왜곡된 위치로 색상 값을 이동 (outputData에 저장)
                   outputData[newIdx] = data[idx];
                   outputData[newIdx + 1] = data[idx + 1];
                   outputData[newIdx + 2] = data[idx + 2];
                   outputData[newIdx + 3] = data[idx + 3];
               }
           }
       }
   }

   // 왜곡된 데이터를 원본 imageData에 복사
   for (let i = 0; i < data.length; i++) {
       data[i] = outputData[i];
   }

   // 왜곡된 이미지 데이터를 캔버스에 다시 그립니다.
   ctx.putImageData(imageData, noseCenter.x - radius, noseCenter.y - radius);
}

function stretchForehead(ctx, keypoints) {
   const foreheadCenter = keypoints[10]; // 이마 중심 좌표 (이마를 나타내는 키포인트)
   const radius = 60; // 이마 주변의 효과 범위 조정 반경
   const stretchFactor = 1.3; // 이마를 위쪽으로 늘리는 강도 (값을 높일수록 늘어남)

   // 이마 주변의 픽셀 데이터를 가져옵니다.
   const imageData = ctx.getImageData(
       foreheadCenter.x - radius,
       foreheadCenter.y - radius,
       radius * 2,
       radius * 2
   );

   const data = imageData.data;
   const width = imageData.width;
   const height = imageData.height;
   const centerX = radius;
   const centerY = radius;

   // 왜곡된 픽셀 데이터를 저장할 새로운 버퍼 생성
   const outputData = new Uint8ClampedArray(data);

   // 이마를 위쪽으로 늘리는 왜곡 효과 적용
   for (let y = 0; y < height; y++) {
       for (let x = 0; x < width; x++) {
           const dx = x - centerX;
           const dy = y - centerY;
           const dist = Math.sqrt(dx * dx + dy * dy);

           if (dist < radius) {
               // 중심에서의 거리와 y 위치에 따라 위쪽으로 늘리는 강도 계산
               const factor = 1 + stretchFactor * (1 - dist / radius);
               const newX = Math.floor(centerX + dx);
               const newY = Math.floor(centerY + dy * factor);

               // 새 좌표가 이미지 경계를 벗어나지 않도록 제한
               if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                   const idx = (y * width + x) * 4;
                   const newIdx = (newY * width + newX) * 4;

                   // 왜곡된 위치로 색상 값을 이동 (outputData에 저장)
                   outputData[newIdx] = data[idx];
                   outputData[newIdx + 1] = data[idx + 1];
                   outputData[newIdx + 2] = data[idx + 2];
                   outputData[newIdx + 3] = data[idx + 3];
               }
           }
       }
   }

   // 왜곡된 데이터를 원본 imageData에 복사
   for (let i = 0; i < data.length; i++) {
       data[i] = outputData[i];
   }

   // 왜곡된 이미지 데이터를 캔버스에 다시 그립니다.
   ctx.putImageData(imageData, foreheadCenter.x - radius, foreheadCenter.y - radius);
}

const startStreaming = async (session, OV, mediaStream) => {

   // Publisher 화면에 원본 비디오 표시용 `publisherCanvas`
   const publisherCanvas = document.createElement('canvas');
   publisherCanvas.width = 640;
   publisherCanvas.height = 480;
   const publisherCtx = publisherCanvas.getContext('2d');

   // 필터 적용 후 Subscriber에게 전송할 `compositeCanvas`
   const compositeCanvas = document.createElement('canvas');
   compositeCanvas.width = 640;
   compositeCanvas.height = 480;
   const ctx = compositeCanvas.getContext('2d');
   
   // 비디오 요소 생성 및 원본 비디오 스트림 할당
   const video = document.createElement('video');
   video.srcObject = mediaStream;
   video.autoplay = true;
   video.playsInline = true;

   // Publisher 화면에 원본 비디오 표시
   document.getElementById('video-container').appendChild(publisherCanvas);

// 이미지와 필터 타입 배열
const filters = [
   //{ image: new Image(), type: "eyeFilter" },
   { image: new Image(), type: "mustacheFilter" },
   { image: new Image(), type: "baldFilter" },
   { image: new Image(), type: "fallingImage" },
   { image: new Image(), type: "goongYe" },
   { image: new Image(), type: "eyeFilter"},
   { image: new Image(), type: "mouthFilter"},
   { image: new Image(), type: "faceOutlineFilter" },
   { type: "noseEnlarge" },
   { type: "smile" },
   { type: "foreHead" },
   // { type: "gifPlay" }
 ];
 //filters[0].image.src = SUNGLASS;
 filters[0].image.src = MUSTACHE;
 filters[1].image.src = MUMURI;
 filters[2].image.src = DISH;
 filters[3].image.src = GOONGYE;
 filters[4].image.src = RCEYE;
 filters[5].image.src = SMILEMOUTH;
 filters[6].image.src = MINIONS;
 
 let activeFilters = [];

 // 얼굴 위치와 함께 이미지 애니메이션 추가
const IMG_WIDTH = 200;
const IMG_HEIGHT = 120;


 // 기존 필터 함수와 별개로 애니메이션을 위한 함수
function animateImage(ctx, x, yPosition) {
   ctx.drawImage(filters[2].image, x - IMG_WIDTH / 2, yPosition, IMG_WIDTH, IMG_HEIGHT);
}
 
 const startFiltering = () => {
   loadDetectionModel().then((model) => {
     const addFilter = (filter) => {
       const newFilter = { ...filter, yPosition: -IMG_HEIGHT, timeoutId: null };

       switch(filter.type){
         case "eyeFilter":
         case "mustacheFilter":
         case "baldFilter":
         case "fallingImage":
         case "goongYe":
         case "mouthFilter":
         case "faceOutlineFilter":
         // case "gifPlay":
            newFilter.timeoutId = setTimeout(() => {
               activeFilters = activeFilters.filter((f) => f !== newFilter);
            }, 2000);
            activeFilters.push(newFilter);
         break;
         case "noseEnlarge":
         case "smile":
         case "foreHead":
                              // 타이머가 만료되면 필터를 제거
         newFilter.timeoutId = setTimeout(() => {
            activeFilters = activeFilters.filter((f) => f !== newFilter);
         }, 3000);

         activeFilters.push(newFilter);
         break;
       }
       
      //  if(filter.type !== "noseEnlarge"){
      //    // 타이머가 만료되면 필터를 제거
      //    newFilter.timeoutId = setTimeout(() => {
      //       activeFilters = activeFilters.filter((f) => f !== newFilter);
      //    }, 2000);

      //    activeFilters.push(newFilter);
      //  }
      //  else{
      //             // 타이머가 만료되면 필터를 제거
      //    newFilter.timeoutId = setTimeout(() => {
      //       activeFilters = activeFilters.filter((f) => f !== newFilter);
      //    }, 10000);

      //    activeFilters.push(newFilter);
      //  }
       
     };
 
     const handleStartPenaltyFilter = () => {
       const nextFilter = filters[activeFilters.length % filters.length];
       addFilter(nextFilter);
     };
 
     window.addEventListener('startPenaltyFilter', handleStartPenaltyFilter);
 
     const estimateFacesLoop = () => {
       model.estimateFaces(publisherCanvas).then((faces) => {
         // Publisher 화면에는 원본 비디오 표시
         publisherCtx.clearRect(0, 0, publisherCanvas.width, publisherCanvas.height);
         publisherCtx.drawImage(video, 0, 0, publisherCanvas.width, publisherCanvas.height);

         // 필터가 적용된 영상은 `compositeCanvas`에 그리기
         ctx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
         ctx.drawImage(video, 0, 0, compositeCanvas.width, compositeCanvas.height);

 
         if (faces[0]) {
            activeFilters.forEach((filter) => {
              const { x, y, width, height, angle } = calculateFilterPosition(filter.type, faces[0].keypoints);

              switch (filter.type) {
                case "eyeFilter":
                case "mustacheFilter":
                case "baldFilter":
                case "mouthFilter":
                  // 기존 필터의 위치 계산
                  ctx.save();
                  ctx.translate(x + width / 2, y + height / 2);
                  ctx.rotate(angle);
                  ctx.drawImage(filter.image, -width / 2, -height / 2, width, height);
                  ctx.restore();
                  break;
          
                case "fallingImage":{
                  // 떨어지는 이미지 애니메이션
                  const fallPosition = faces[0].keypoints[10];
                  if (filter.yPosition < (fallPosition.y + 20))  {
                    filter.yPosition += 5; // 떨어지는 속도 조절
                  }
                  animateImage(ctx, fallPosition.x, filter.yPosition);
                  break;
                }
          
               case "goongYe":
                  // GOONGYE 이미지를 캔버스 전체에 그리기
                  ctx.drawImage(filter.image, 0, 0, compositeCanvas.width, compositeCanvas.height);
                  break;

               case "faceOutlineFilter":
                  ctx.drawImage(filter.image,x,y,width,height);
                  break;

               case "noseEnlarge":
                  //applyNoseEnlargeEffect(ctx, faces[0].keypoints,compositeCanvas); // 코 확대 필터 호출
                  applyEnhancedLensDistortion(ctx,faces[0].keypoints);
                  break;

               case "smile":
                  applyEnhancedMouthDistortion(ctx,faces[0].keypoints);
                  break;

               case "foreHead":
                  stretchForehead(ctx,faces[0].keypoints);
                  break;

               // case "gifPlay":
               //    console.log("check gif");
               //    drawGIFOnCanvas(ctx,MAGUNI,x,y,width,height);
               //    break;
               
                default:
                  console.warn(`Unknown filter type: ${filter.type}`);
              }
            });
          }
 
         requestAnimationFrame(estimateFacesLoop);
       });
     };
 
     requestAnimationFrame(estimateFacesLoop);
   });
 };

   // 비디오 메타데이터 로드 시 실행
   await new Promise((resolve) => {
       video.onloadedmetadata = () => {
           video.play();
           startFiltering();
           resolve();
       };
   });

   // 캔버스에서 스트림 생성
   compositeStream = compositeCanvas.captureStream(FRAME_RATE);
   publisher = OV.initPublisher(undefined, {
       audioSource: mediaStream.getAudioTracks()[0],
       videoSource: compositeStream.getVideoTracks()[0],
       frameRate: FRAME_RATE,
       videoCodec: 'H264',
   });

   await session.publish(publisher);

};

export function leaveSession() {

   if(session && publisher){
      session.unpublish(publisher);
   } 
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
   // var dataNode = document.createElement('div');
   // dataNode.className = "data-node";
   // dataNode.id = "data-" + nodeId;
   // dataNode.innerHTML = "<p>" + userData + "</p>";
   // videoElement.parentNode.insertBefore(dataNode, videoElement.nextSibling);
   // addClickListener(videoElement, userData);
   // var userData;
   // var nodeId;
   // if (typeof connection === "string") {
   //     userData = connection;
   //     nodeId = connection;
   // } else {
   //     userData = JSON.parse(connection.data).clientData;
   //     nodeId = connection.connectionId;
   // }

   // // 로딩 컨테이너 생성
   // const loadingContainer = document.createElement('div');
   // loadingContainer.className = "loading-container";
   // loadingContainer.innerHTML = `
   //     <div class="loading-spinner"></div>
   //     <div class="loading-text">접속 대기중...</div>
   // `;

   // // 비디오 요소가 로드되기 전에 로딩 컨테이너를 표시
   // videoElement.parentNode.insertBefore(loadingContainer, videoElement);

   // // 비디오가 실제로 재생되기 시작할 때 로딩 컨테이너를 제거
   // videoElement.addEventListener('playing', () => {
   //     if (loadingContainer.parentNode) {
   //         loadingContainer.parentNode.removeChild(loadingContainer);
   //     }
   //     videoElement.style.display = 'block';
   // });

   // var dataNode = document.createElement('div');
   // dataNode.className = "data-node";
   // dataNode.id = "data-" + nodeId;
   // dataNode.innerHTML = "<p>" + userData + "</p>";
   // videoElement.parentNode.insertBefore(dataNode, videoElement.nextSibling);
   // addClickListener(videoElement, userData);
}

function removeUserData(connection) {
   var dataNode = document.getElementById("data-" + connection.connectionId);
   dataNode.parentNode.removeChild(dataNode);
}

function removeAllUserData() {
   var nicknameElements = document.getElementsByClassName('data-node');
   while (nicknameElements[0]) {
      nicknameElements[0].parentNode.removeChild(nicknameElements[0]);
   }
}

function addClickListener(videoElement, userData) {
   videoElement.addEventListener('click', function () {
      var mainVideo = $('#main-video video').get(0);
      if (mainVideo.srcObject !== videoElement.srcObject) {
         $('#main-video').fadeOut("fast", () => {
            $('#main-video p').html(userData);
            mainVideo.srcObject = videoElement.srcObject;
            $('#main-video').fadeIn("fast");
         });
      }
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