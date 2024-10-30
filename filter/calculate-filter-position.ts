import { type Keypoint } from "@tensorflow-models/face-landmarks-detection";

const eyePoint = {
  leftEyeTop: 124,
  rightEyeTop: 276,
  leftEyeBottom: 111,
};

const facePoint = {
  leftSideTop: 130,     // 왼쪽 귀 윗부분을 의미하는 좌표
  leftSideBottom: 250,  // 왼쪽 귀 아랫부분을 의미하는 좌표
  rightSideTop: 360,    // 오른쪽 귀 윗부분을 의미하는 좌표
  rightSideBottom: 480  // 오른쪽 귀 아랫부분을 의미하는 좌표
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

function calculateFaceFilterPosition(keypoints){
  const faceWidthPaddingRatio = 0.35; // 얼굴 너비 대비 패딩 비율
    const faceHeightPaddingRatio = 0.35; // 얼굴 높이 대비 패딩 비율

    const leftSideTop = keypoints[facePoint.leftSideTop];
    const rightSideTop = keypoints[facePoint.rightSideTop];
    const leftSideBottom = keypoints[facePoint.leftSideBottom];
    const rightSideBottom = keypoints[facePoint.rightSideBottom];

    // 얼굴의 너비와 높이 계산
    const width = Math.abs(rightSideTop.x - leftSideTop.x);
    const height = (Math.abs(leftSideBottom.y - leftSideTop.y) + Math.abs(rightSideBottom.y - rightSideTop.y)) / 2;

    // 패딩을 포함한 폭과 높이 계산
    const paddedWidth = width + width * faceWidthPaddingRatio;
    const paddedHeight = height + height * faceHeightPaddingRatio;

    // 중심점 계산
    const centerX = (leftSideTop.x + rightSideTop.x) / 2;
    const centerY = (leftSideTop.y + leftSideBottom.y) / 2;

    // 얼굴 기울기를 기준으로 회전 각도 조정 (양쪽 상단 좌표 사용)
    const angle = Math.atan2(rightSideTop.y - leftSideTop.y, rightSideTop.x - leftSideTop.x);

    return {
        x: centerX - paddedWidth / 2,
        y: centerY - paddedHeight / 2,
        width: paddedWidth,
        height: paddedHeight,
        angle
    };
}

