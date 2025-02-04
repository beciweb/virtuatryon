const webcam = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const glassesSelect = document.getElementById('glassesSelect');

// Ngarkimi i modeleve të Face-api.js
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'), // Modeli i detektimit të fytyrës
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // Modeli për identifikimin e pikave të fytyrës
    faceapi.nets.faceRecognitionNet.loadFromUri('/models') // Modeli për njohjen e fytyrës
]).then(startWebcam);

// Aktivizimi i kamerës
function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then((stream) => {
            webcam.srcObject = stream;
            webcam.onloadedmetadata = () => {
                webcam.play();
                canvas.width = webcam.videoWidth;
                canvas.height = webcam.videoHeight;
                detectFace(); // Thirr funksionin për detektimin e fytyrës
            };
        })
        .catch((err) => {
            console.error('Gabim me kamerën: ', err);
            alert('Nuk mund të hapet kamera. Kontrollo cilësimet e shfletuesit dhe sigurohu që kamera është e disponueshme!');
        });
}

// Detektimi i fytyrës dhe pozicionimi i syzeve
async function detectFace() {
    const detections = await faceapi.detectAllFaces(webcam).withFaceLandmarks().withFaceDescriptors();

    if (detections.length > 0) {
        // Gjetja e pozitave të syve
        const { positions } = detections[0].landmarks;
        const leftEye = positions[36]; // Pozita e syrit të majtë
        const rightEye = positions[45]; // Pozita e syrit të djathtë

        // Përmasat e syzeve (për këtë rast, mund të përdorim një madhësi konstante)
        const glassesWidth = Math.abs(leftEye.x - rightEye.x) * 1.5; // Gjerësia e syzeve, mund të rregullohet
        const glassesHeight = glassesWidth * 0.5; // Lartësia e syzeve, në përpjesëtim me gjerësinë

        // Pozicionimi i imazhit të syzeve mbi fytyrë
        const glassesX = leftEye.x - (glassesWidth * 0.3); // Pozicioni horizontal
        const glassesY = leftEye.y - glassesHeight * 0.6; // Pozicioni vertikal

        // Vendosja e imazhit të syzeve në canvas
        const glassesImage = new Image();
        glassesImage.src = `images/${glassesSelect.value}.png`; // Zgjedhja e syzeve nga dropdown

        glassesImage.onload = () => {
            ctx.drawImage(glassesImage, glassesX, glassesY, glassesWidth, glassesHeight);
        };
    }

    requestAnimationFrame(detectFace); // Përsëritja e detektimit
}
