import * as faceapi from 'face-api.js'

// 모델 로드 및 얼굴 인식 시작
export async function startFaceDetection(videoElement, canvasElement, sunglassesImageSrc) {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  
      // Canvas 설정 및 얼굴 인식 코드 이어서 진행
      const ctx = canvasElement.getContext('2d');
      const sunglassesImage = new Image();
      sunglassesImage.src = sunglassesImageSrc;
  
      videoElement.addEventListener('playing', () => {
        function render() {
          ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
          faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .then(detections => {
              detections.forEach(detection => {
                const { x, y, width, height } = detection.detection.box;
                ctx.drawImage(sunglassesImage, x, y - 20, width, width * 0.5);
              });
            });
  
          requestAnimationFrame(render);
        }
        render();
      });
    } catch (error) {
      console.error("Error loading models:", error);
    }
  }
  