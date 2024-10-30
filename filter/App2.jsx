import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./app.css";
import { calculateFilterPosition } from "./calculate-filter-position";
import { loadDetectionModel } from "./load-detection-model";

const videoSize = {
  width: 640,
  height: 480,
};

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const initialLoadedRef = useRef(false);
  const [status, setStatus] = useState("Initializing...");

  const estimateFacesLoop = (model, image, ctx) => {
    const video = webcamRef.current?.video;
    console.log(webcamRef)
    console.log(webcamRef.current)
    console.log(`ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ: ${video}`);

    if (!video) return;

    model.estimateFaces(video).then((face) => {
      ctx.clearRect(0, 0, videoSize.width, videoSize.height);
      if (face[0]) {
        const { x, y, width, height } = calculateFilterPosition(face[0].keypoints);
        ctx.drawImage(image, x, y, width, height);
      }
      requestAnimationFrame(() => estimateFacesLoop(model, image, ctx));
    });
  };


  useEffect(() => {
    const canvasContext = canvasRef.current?.getContext("2d");

    if (!canvasContext || initialLoadedRef.current) return;

    initialLoadedRef.current = true;

    const image = new Image();
    image.src = "mumuri.png";


    setStatus("Load Model...");

    loadDetectionModel().then((model) => {
      setStatus("Model Loaded");
      requestAnimationFrame(() =>
        estimateFacesLoop(model, image, canvasContext),
      );
    });
  }, []);

  return (
    <main>
      <div className="webcam-container" style={{ position: 'relative', height: videoSize.height }}>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Webcam
            width={videoSize.width}
            height={videoSize.height}
            ref={webcamRef}
          />
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <canvas
            width={videoSize.width}
            height={videoSize.height}
            ref={canvasRef}
            className="filter-canvas"
          />
        </div>
      </div>
      <p className="status">{status}</p>
    </main>
  );
}

export default App;
