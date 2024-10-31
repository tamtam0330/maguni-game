let Count = 0; // "아니" 카운트
let isStoppedManually = false; // 사용자가 수동으로 녹음을 중지했는지 여부
const transcriptElement = document.getElementById('subtitles'); // 자막 표시 요소
const countElement = document.getElementById('count'); // 카운트 표시 요소

// SpeechRecognition 객체 생성
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'ko-KR'; // 한국어 설정
recognition.continuous = true; // 연속 음성 인식
recognition.interimResults = true; // 중간 결과 활성화

recognition.onstart = () => {
    console.log('녹음이 시작되었습니다.');
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
};

recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    // 인식된 결과 처리
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
            finalTranscript += transcript + ' ';
            countOccurrences(transcript); // "아니" 단어 카운트
        } else {
            interimTranscript += transcript + ' '; // 중간 결과 추가
        }
    }

    // 자막 업데이트
    transcriptElement.innerText = finalTranscript + interimTranscript;
};

recognition.onend = () => {
    console.log('녹음이 종료되었습니다.');

    if (!isStoppedManually) {
        console.log('자동으로 음성 인식 재시작');
        recognition.start(); // 사용자가 수동으로 중지하지 않은 경우에만 재시작
    }
};

recognition.onerror = (event) => {
    console.error('음성 인식 오류:', event.error);
    if (event.error !== 'no-speech') {
        recognition.stop();
        recognition.start();
    }
};

// "아니" 단어 카운트 함수
const countOccurrences = (transcript) => {
    const word = "아니";
    const occurrences = (transcript.match(new RegExp(word, 'g')) || []).length;
    Count += occurrences; // "아니" 카운트 업데이트
    updateCountDisplay(); // 카운트 업데이트
};

// 카운트 표시 함수
const updateCountDisplay = () => {
    countElement.innerText = `"아니" 카운트: ${Count}`; // 카운트 업데이트
};

// 버튼 이벤트 설정
document.getElementById('startButton').addEventListener('click', () => {
    isStoppedManually = false; // 자동으로 다시 시작되도록 설정
    recognition.start(); // 녹음 시작
});

document.getElementById('stopButton').addEventListener('click', () => {
    isStoppedManually = true; // 수동으로 녹음 중지
    recognition.stop(); // 녹음 중지
    Count = 0;
    updateCountDisplay();
    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
});
