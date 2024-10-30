import { type Keypoint } from "@tensorflow-models/face-landmarks-detection";

const facePoint = {
  leftEyeTop: 124,
  rightEyeTop: 276,
  leftEyeBottom: 111,
};

export function calculateFilterPosition(keypoints) {
  const xPadding = 45;
  const yPadding = 20;

  const leftEyeTop = keypoints[facePoint.leftEyeTop];
  const rightEyeTop = keypoints[facePoint.rightEyeTop];
  const leftEyeBottom = keypoints[facePoint.leftEyeBottom];

  const x = leftEyeTop.x - xPadding;
  const y = leftEyeTop.y - yPadding;
  const width = rightEyeTop.x - leftEyeTop.x + xPadding * 2;
  const height = leftEyeBottom.y - leftEyeTop.y + yPadding * 2;

  // 회전 각도 계산
  const angle = Math.atan2(rightEyeTop.y - leftEyeTop.y, rightEyeTop.x - leftEyeTop.x);

  return { x, y, width, height, angle };
}

