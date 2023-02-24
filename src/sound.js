import { hslToRgb } from './utils';

const WIDTH = 1000;
const HEIGHT = 400;
let analyzer;
let bufferLength;

// grab the canvas element and set their width
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;

function handleError(err) {
  console.log('You must give access to your mic in order to proceed');
}
// work with audio
async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(handleError);
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyzer);
  analyzer.fftSize = 2 ** 10;
  bufferLength = analyzer.frequencyBinCount;
  const timeData = new Uint8Array(bufferLength);
  const frequencyData = new Uint8Array(bufferLength);
  drawTimeData(timeData);
  drawFrequency(frequencyData);
}

// function for draw time data
function drawTimeData(timedata) {
  // inject timeData into our timeData Array
  analyzer.getByteTimeDomainData(timedata);

  // TODO: clear the canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // set some canvas drawings

  ctx.lineWidth = 10;
  ctx.beginPath();
  const sliceWidth = WIDTH / bufferLength;
  let x = 0;
  timedata.forEach((data, i) => {
    const v = data / 128;
    const [h, s, l] = [v * 1.5, 0.8, 0.5];
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    const y = (v * HEIGHT) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });
  ctx.stroke();
  requestAnimationFrame(() => {
    drawTimeData(timedata);
  });
}

function drawFrequency(frequencyData) {
  // get the frequency data into frequency data array
  analyzer.getByteFrequencyData(frequencyData);
  const barWidth = (WIDTH / bufferLength) * 2.5;

  let x = 0;
  frequencyData.forEach(amount => {
    const percent = amount / 255;

    const barHeight = (HEIGHT * percent) / 1.5;
    // TODO: hsl values
    const [h, s, l] = [percent - 0.5, 0.8, 0.5];

    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 5;
  });
  requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio();
