import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';

// 모델 로드 함수
export function loadDetectionModel() {
  return faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'tfjs', // 사용하려는 런타임
      maxFaces: 2,     // 최대 얼굴 감지 수
      refineLandmarks: false, // 랜드마크 정제 여부
    }
  );
}
