import { type Keypoint } from "@tensorflow-models/face-landmarks-detection";

const eyePoint = {
  leftEyeTop: 124,
  rightEyeTop: 276,
  leftEyeBottom: 111,
};

const facePoint = {
  leftSideTop: 234,    // 왼쪽 귀 윗부분에 해당하는 인덱스
  leftSideBottom: 454, // 왼쪽 귀 아랫부분에 해당하는 인덱스
  rightSideTop: 4,     // 오른쪽 귀 윗부분에 해당하는 인덱스
  rightSideBottom: 234 // 오른쪽 귀 아랫부분에 해당하는 인덱스
}

export function calculateFilterPosition(type,keypoints) {
  
  switch(type){
    case "eyeFilter":
      return calculateEyeFilterPosition(keypoints);

    case "faceFilter":
      return calculateFaceFilterPosition(keypoints);
  }
}

function calculateEyeFilterPosition(keypoints){
  const xPadding = 40;
  const yPadding = 20;

  const leftEyeTop = keypoints[eyePoint.leftEyeTop];
  const rightEyeTop = keypoints[eyePoint.rightEyeTop];
  const leftEyeBottom = keypoints[eyePoint.leftEyeBottom];

  const x = leftEyeTop.x - xPadding;
  const y = leftEyeTop.y - yPadding;
  const width = rightEyeTop.x - leftEyeTop.x + xPadding * 2;
  const height = leftEyeBottom.y - leftEyeTop.y + yPadding * 2;

  // 회전 각도 계산
  const angle = Math.atan2(rightEyeTop.y - leftEyeTop.y, rightEyeTop.x - leftEyeTop.x);

  return { x, y, width, height, angle };
}

function calculateFaceFilterPosition(keypoints) {
  // 필터의 여백을 조정하기 위한 패딩 값
  const xPadding = 50;
  const yPadding = 50;

  // 얼굴의 각 귀 위치를 기준으로 좌표 설정
  const leftSideTop = keypoints[facePoint.leftSideTop];
  const leftSideBottom = keypoints[facePoint.leftSideBottom];
  const rightSideTop = keypoints[facePoint.rightSideTop];
  const rightSideBottom = keypoints[facePoint.rightSideBottom];

  // 얼굴의 상단과 하단 중앙을 기준으로 필터 위치 및 크기 설정
  const x = leftSideTop.x - xPadding;
  const y = Math.min(leftSideTop.y, rightSideTop.y) - yPadding;
  const width = (rightSideTop.x - leftSideTop.x) + xPadding * 2;
  const height = Math.max(leftSideBottom.y, rightSideBottom.y) - Math.min(leftSideTop.y, rightSideTop.y) + yPadding * 2;

  // 얼굴 각도에 따라 필터를 회전시키기 위한 각도 계산
  //const angle = Math.atan2(rightSideTop.y - leftSideTop.y, rightSideTop.x - leftSideTop.x);
  const angle = 0;

  return { x, y, width, height, angle };
}

