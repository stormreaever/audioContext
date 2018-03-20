var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var distortion = audioCtx.createWaveShaper();

var audioPlaying = false;

var scales = [
	[
		// pentatonic major
		261.626, // C
		293.665, // D
		329.628, // E
		391.995, // G
		440.000  // A

	],
	[
		// C major
		261.626, // C
		293.665, // D
		329.628, // E
		349.228, // F
		391.995, // G
		440.000, // A
		493.883  // B

	],
	[
		// C minor
		220.000, // A
		246.942, // B
		261.626, // C
		293.665, // D
		329.628, // E
		349.228, // F
		391.995  // G

	]
]

var scaleIndex = 0;
var scale = scales[scaleIndex];

function cycleScale() {
	if (scaleIndex ++ >= scales.length - 1) {
		scaleIndex = 0;
	}
	scale = scales[scaleIndex];
}

distortion.curve = makeDistortionCurve(400);
distortion.oversample = '4x';

// connect nodes together
oscillator.connect(distortion);
distortion.connect(gainNode);
gainNode.connect(audioCtx.destination);

// play some notes
oscillator.type = 'sine';
oscillator.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.05);

// start "playing" at very low volume
gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
oscillator.start(0);

function toggleAudio() {
	audioPlaying = !audioPlaying;
	if (!audioPlaying) {
		stopAudio();
	}
}

function triggerOnce() {
	startAudio(0);

	// not stopping creates a continuous stream of music -- no "notes"
	// or long, blending notes
	if (getRandomInt(2) == 1) {
		setTimeout(stopAudio, 450); // this affects the note length
	}
}

function startAudio() {
	gainNode.gain.exponentialRampToValueAtTime(
		1, audioCtx.currentTime + 0.04
	)
}

function stopAudio() {
  gainNode.gain.exponentialRampToValueAtTime(
    0.00001, audioCtx.currentTime + 0.04
  )
}

setInterval(
	function(){
		if (audioPlaying){
			playRandomNote();
		}
	}, 330
);

function playRandomNote() {
	// change note freq to be a random value from our scale
	var newNote = scale[getRandomInt(scale.length)] / 2;
	if (getRandomInt(2) == 1) {
		newNote = newNote / 2;
	}
	// oscillator.frequency.value = newNote;
	oscillator.frequency.linearRampToValueAtTime(newNote, audioCtx.currentTime + 0.05);

	// trigger half the time
	if (getRandomInt(4) < 3) {
		triggerOnce();
	}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}



// ----- Distortion

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
