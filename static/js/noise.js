/**
 * Noise Generator - Web Audio API Implementation
 * Generates white, pink, and brown noise for sleep, focus, and relaxation
 */

class NoiseGenerator {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.analyser = null;

        // Filter nodes
        this.lowCutFilter = null;
        this.highCutFilter = null;

        // Modulation
        this.lfo = null;
        this.lfoGain = null;

        // Noise sources
        this.noiseNodes = {
            white: { source: null, gain: null },
            pink: { source: null, gain: null },
            brown: { source: null, gain: null },
            blue: { source: null, gain: null },
            violet: { source: null, gain: null }
        };

        this.isPlaying = false;
        this.timerInterval = null;
        this.timerRemaining = 0;

        // Advanced settings
        this.settings = {
            lowCut: 20,
            highCut: 20000,
            stereoWidth: 100,
            oscillation: 0,
            oscillationRate: 0.1,
            fadeTime: 3
        };

        // Visualization
        this.canvas = null;
        this.canvasCtx = null;
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
    }

    initAudioContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create filters
        this.lowCutFilter = this.audioContext.createBiquadFilter();
        this.lowCutFilter.type = 'highpass';
        this.lowCutFilter.frequency.value = this.settings.lowCut;
        this.lowCutFilter.Q.value = 0.7;

        this.highCutFilter = this.audioContext.createBiquadFilter();
        this.highCutFilter.type = 'lowpass';
        this.highCutFilter.frequency.value = this.settings.highCut;
        this.highCutFilter.Q.value = 0.7;

        // Create LFO for oscillation/modulation
        this.lfo = this.audioContext.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.value = this.settings.oscillationRate;

        this.lfoGain = this.audioContext.createGain();
        this.lfoGain.gain.value = 0; // Start with no modulation

        this.lfo.connect(this.lfoGain);
        this.lfo.start();

        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.5;

        // Connect LFO to master gain for tremolo effect
        this.lfoGain.connect(this.masterGain.gain);

        // Create analyser for visualization
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;

        // Signal chain: noise sources -> masterGain -> lowCut -> highCut -> analyser -> destination
        this.masterGain.connect(this.lowCutFilter);
        this.lowCutFilter.connect(this.highCutFilter);
        this.highCutFilter.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Create noise sources
        this.createWhiteNoiseSource();
        this.createPinkNoiseSource();
        this.createBrownNoiseSource();
        this.createBlueNoiseSource();
        this.createVioletNoiseSource();
    }

    createWhiteNoiseSource() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        whiteNoise.connect(gainNode);
        gainNode.connect(this.masterGain);

        whiteNoise.start();

        this.noiseNodes.white = { source: whiteNoise, gain: gainNode };
    }

    createPinkNoiseSource() {
        // Pink noise using Paul Kellet's refined method
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }

        const pinkNoise = this.audioContext.createBufferSource();
        pinkNoise.buffer = noiseBuffer;
        pinkNoise.loop = true;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        pinkNoise.connect(gainNode);
        gainNode.connect(this.masterGain);

        pinkNoise.start();

        this.noiseNodes.pink = { source: pinkNoise, gain: gainNode };
    }

    createBrownNoiseSource() {
        // Brown (Brownian/Red) noise - integrated white noise
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Gain compensation
        }

        const brownNoise = this.audioContext.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        brownNoise.connect(gainNode);
        gainNode.connect(this.masterGain);

        brownNoise.start();

        this.noiseNodes.brown = { source: brownNoise, gain: gainNode };
    }

    createBlueNoiseSource() {
        // Blue noise - +3 dB/octave (opposite of pink)
        // Generated by differentiating white noise with smoothing
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastWhite = 0;
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Differentiation: current - previous
            const diff = white - lastWhite;
            // Apply smoothing filter to reduce harshness
            output[i] = 0.7 * diff + 0.3 * lastOut;
            lastWhite = white;
            lastOut = output[i];
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < bufferSize; i++) {
            if (Math.abs(output[i]) > max) max = Math.abs(output[i]);
        }
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (output[i] / max) * 0.7;
        }

        const blueNoise = this.audioContext.createBufferSource();
        blueNoise.buffer = noiseBuffer;
        blueNoise.loop = true;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        blueNoise.connect(gainNode);
        gainNode.connect(this.masterGain);

        blueNoise.start();

        this.noiseNodes.blue = { source: blueNoise, gain: gainNode };
    }

    createVioletNoiseSource() {
        // Violet noise - +6 dB/octave (opposite of brown)
        // Generated by differentiating white noise
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastSample = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = white - lastSample;
            lastSample = white;
        }

        // Normalize to prevent clipping
        let max = 0;
        for (let i = 0; i < bufferSize; i++) {
            if (Math.abs(output[i]) > max) max = Math.abs(output[i]);
        }
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (output[i] / max) * 0.5; // Lower gain due to high frequency harshness
        }

        const violetNoise = this.audioContext.createBufferSource();
        violetNoise.buffer = noiseBuffer;
        violetNoise.loop = true;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        violetNoise.connect(gainNode);
        gainNode.connect(this.masterGain);

        violetNoise.start();

        this.noiseNodes.violet = { source: violetNoise, gain: gainNode };
    }

    setNoiseLevel(type, value) {
        if (this.noiseNodes[type] && this.noiseNodes[type].gain) {
            this.noiseNodes[type].gain.gain.setTargetAtTime(
                value,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(
                value,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    // Advanced control setters
    setLowCut(frequency) {
        this.settings.lowCut = frequency;
        if (this.lowCutFilter) {
            this.lowCutFilter.frequency.setTargetAtTime(
                frequency,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    setHighCut(frequency) {
        this.settings.highCut = frequency;
        if (this.highCutFilter) {
            this.highCutFilter.frequency.setTargetAtTime(
                frequency,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    setOscillationDepth(depth) {
        this.settings.oscillation = depth;
        if (this.lfoGain) {
            // Depth 0-1 maps to modulation amount
            this.lfoGain.gain.setTargetAtTime(
                depth * 0.5, // Max 50% modulation
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    setOscillationRate(rate) {
        this.settings.oscillationRate = rate;
        if (this.lfo) {
            this.lfo.frequency.setTargetAtTime(
                rate,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    setFadeTime(seconds) {
        this.settings.fadeTime = seconds;
    }

    applyPreset(preset) {
        const presets = {
            sleep: { white: 0, pink: 0.3, brown: 0.7, blue: 0, violet: 0 },
            focus: { white: 0.2, pink: 0.6, brown: 0.2, blue: 0, violet: 0 },
            relax: { white: 0, pink: 0.5, brown: 0.5, blue: 0, violet: 0 },
            white: { white: 1, pink: 0, brown: 0, blue: 0, violet: 0 },
            pink: { white: 0, pink: 1, brown: 0, blue: 0, violet: 0 },
            brown: { white: 0, pink: 0, brown: 1, blue: 0, violet: 0 },
            blue: { white: 0, pink: 0, brown: 0, blue: 1, violet: 0 },
            violet: { white: 0, pink: 0, brown: 0, blue: 0, violet: 1 },
            tinnitus: { white: 0, pink: 0.6, brown: 0.2, blue: 0.2, violet: 0 },
            deep: { white: 0, pink: 0.2, brown: 0.8, blue: 0, violet: 0 }
        };

        if (presets[preset]) {
            const p = presets[preset];

            // Update sliders for all noise types
            const noiseTypes = ['white', 'pink', 'brown', 'blue', 'violet'];
            noiseTypes.forEach(type => {
                const slider = document.getElementById(type + 'Level');
                const display = document.getElementById(type + 'Value');
                if (slider && display) {
                    slider.value = (p[type] || 0) * 100;
                    display.textContent = Math.round((p[type] || 0) * 100) + '%';
                }
                this.setNoiseLevel(type, p[type] || 0);
            });

            // Update active button
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.preset === preset) {
                    btn.classList.add('active');
                }
            });
        }
    }

    play() {
        this.initAudioContext();

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.updatePlayButton();
        this.updateStatus('playing');
        this.startVisualization();

        // Apply current slider values for all noise types
        const noiseTypes = ['white', 'pink', 'brown', 'blue', 'violet'];
        noiseTypes.forEach(type => {
            const slider = document.getElementById(type + 'Level');
            if (slider) {
                this.setNoiseLevel(type, slider.value / 100);
            }
        });
    }

    stop() {
        if (!this.audioContext) return;

        // Fade out all noise sources
        const noiseTypes = ['white', 'pink', 'brown', 'blue', 'violet'];
        noiseTypes.forEach(type => this.setNoiseLevel(type, 0));

        this.isPlaying = false;
        this.updatePlayButton();
        this.updateStatus('ready');
        this.stopVisualization();
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    updatePlayButton() {
        const btn = document.getElementById('playButton');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');

        if (this.isPlaying) {
            btn.classList.add('playing');
            icon.className = 'ri-stop-fill';
            text.textContent = 'Stop';
        } else {
            btn.classList.remove('playing');
            icon.className = 'ri-play-fill';
            text.textContent = 'Play';
        }
    }

    updateStatus(state) {
        const badge = document.getElementById('statusBadge');
        const text = badge.querySelector('.status-text');

        badge.className = 'status-badge ' + state;
        text.textContent = state === 'playing' ? 'Playing' : 'Ready';
    }

    // Timer functionality
    startTimer(minutes) {
        this.stopTimer();

        this.timerRemaining = minutes * 60;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            this.updateTimerDisplay();

            if (this.timerRemaining <= 0) {
                this.stopTimer();
                this.stop();
            }
        }, 1000);

        document.getElementById('timerDisplay').classList.add('active');
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerRemaining = 0;
        document.getElementById('timerDisplay').classList.remove('active');
        document.getElementById('timerValue').textContent = '--:--';
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerRemaining / 60);
        const seconds = this.timerRemaining % 60;
        document.getElementById('timerValue').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Visualization
    setupCanvas() {
        this.canvas = document.getElementById('waveformCanvas');
        if (!this.canvas) return;

        this.canvasCtx = this.canvas.getContext('2d');
        this.resizeCanvas();

        window.addEventListener('resize', () => this.resizeCanvas());

        // Draw initial static state
        this.drawStaticWaveform();
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = 120 * dpr;

        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = '120px';

        this.canvasCtx.scale(dpr, dpr);

        if (!this.isPlaying) {
            this.drawStaticWaveform();
        }
    }

    drawStaticWaveform() {
        if (!this.canvasCtx) return;

        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.canvasCtx.fillStyle = '#000';
        this.canvasCtx.fillRect(0, 0, width, height);

        // Draw center line
        this.canvasCtx.strokeStyle = '#333';
        this.canvasCtx.lineWidth = 1;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(0, height / 2);
        this.canvasCtx.lineTo(width, height / 2);
        this.canvasCtx.stroke();
    }

    startVisualization() {
        if (!this.analyser) return;

        const draw = () => {
            if (!this.isPlaying) return;

            this.animationId = requestAnimationFrame(draw);

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteTimeDomainData(dataArray);

            const width = this.canvas.width / (window.devicePixelRatio || 1);
            const height = this.canvas.height / (window.devicePixelRatio || 1);

            this.canvasCtx.fillStyle = '#000';
            this.canvasCtx.fillRect(0, 0, width, height);

            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeStyle = '#10b981';
            this.canvasCtx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    this.canvasCtx.moveTo(x, y);
                } else {
                    this.canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.canvasCtx.lineTo(width, height / 2);
            this.canvasCtx.stroke();
        };

        draw();
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.drawStaticWaveform();
    }

    setupEventListeners() {
        // Play button
        document.getElementById('playButton')?.addEventListener('click', () => {
            this.toggle();
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
                if (!this.isPlaying) {
                    this.play();
                }
            });
        });

        // Noise level sliders
        ['white', 'pink', 'brown', 'blue', 'violet'].forEach(type => {
            const slider = document.getElementById(type + 'Level');
            const display = document.getElementById(type + 'Value');

            slider?.addEventListener('input', (e) => {
                const value = e.target.value / 100;
                display.textContent = Math.round(value * 100) + '%';
                if (this.isPlaying) {
                    this.setNoiseLevel(type, value);
                }

                // Clear active preset
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            });
        });

        // Master volume
        const volumeSlider = document.getElementById('volume');
        const volumeDisplay = document.getElementById('volumeValue');

        volumeSlider?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            volumeDisplay.textContent = Math.round(value * 100) + '%';
            this.setMasterVolume(value);
        });

        // Timer controls
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.time);

                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));

                if (minutes === 0) {
                    this.stopTimer();
                } else {
                    btn.classList.add('active');
                    this.startTimer(minutes);
                    if (!this.isPlaying) {
                        this.play();
                    }
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Advanced controls
        this.setupAdvancedControls();
    }

    setupAdvancedControls() {
        // Low cut filter
        const lowCutSlider = document.getElementById('lowCut');
        const lowCutDisplay = document.getElementById('lowCutValue');
        lowCutSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            lowCutDisplay.textContent = value + ' Hz';
            this.setLowCut(value);
        });

        // High cut filter
        const highCutSlider = document.getElementById('highCut');
        const highCutDisplay = document.getElementById('highCutValue');
        highCutSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            highCutDisplay.textContent = value + ' Hz';
            this.setHighCut(value);
        });

        // Stereo width (visual only for now - would require stereo processing)
        const stereoSlider = document.getElementById('stereoWidth');
        const stereoDisplay = document.getElementById('stereoWidthValue');
        stereoSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            stereoDisplay.textContent = value + '%';
            this.settings.stereoWidth = value;
        });

        // Oscillation depth
        const oscSlider = document.getElementById('oscillation');
        const oscDisplay = document.getElementById('oscillationValue');
        oscSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100;
            oscDisplay.textContent = Math.round(value * 100) + '%';
            this.setOscillationDepth(value);
        });

        // Oscillation rate
        const rateSlider = document.getElementById('oscillationRate');
        const rateDisplay = document.getElementById('oscillationRateValue');
        rateSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100; // 0.01 to 1 Hz
            rateDisplay.textContent = value.toFixed(2) + ' Hz';
            this.setOscillationRate(value);
        });

        // Fade time
        const fadeSlider = document.getElementById('fadeTime');
        const fadeDisplay = document.getElementById('fadeTimeValue');
        fadeSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            fadeDisplay.textContent = value + ' sec';
            this.setFadeTime(value);
        });

        // Preset saving
        this.setupPresetSaving();
    }

    // Get current mix settings
    getCurrentMix() {
        const noiseTypes = ['white', 'pink', 'brown', 'blue', 'violet'];
        const mix = {};
        noiseTypes.forEach(type => {
            const slider = document.getElementById(type + 'Level');
            if (slider) {
                mix[type] = parseInt(slider.value);
            }
        });
        mix.volume = parseInt(document.getElementById('volume')?.value || 50);
        return mix;
    }

    // Apply a saved mix
    applySavedMix(mix) {
        const noiseTypes = ['white', 'pink', 'brown', 'blue', 'violet'];
        noiseTypes.forEach(type => {
            const slider = document.getElementById(type + 'Level');
            const display = document.getElementById(type + 'Value');
            if (slider && display && mix[type] !== undefined) {
                slider.value = mix[type];
                display.textContent = mix[type] + '%';
                if (this.isPlaying) {
                    this.setNoiseLevel(type, mix[type] / 100);
                }
            }
        });

        // Apply volume
        if (mix.volume !== undefined) {
            const volumeSlider = document.getElementById('volume');
            const volumeDisplay = document.getElementById('volumeValue');
            if (volumeSlider && volumeDisplay) {
                volumeSlider.value = mix.volume;
                volumeDisplay.textContent = mix.volume + '%';
                this.setMasterVolume(mix.volume / 100);
            }
        }

        // Clear active preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // Generate URL for current mix
    generateShareUrl() {
        const mix = this.getCurrentMix();
        const params = new URLSearchParams();
        Object.keys(mix).forEach(key => {
            if (mix[key] > 0) {
                params.set(key, mix[key]);
            }
        });
        return window.location.origin + window.location.pathname + '?' + params.toString();
    }

    // Load mix from URL
    loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.toString()) {
            const mix = {};
            ['white', 'pink', 'brown', 'blue', 'violet', 'volume'].forEach(key => {
                if (params.has(key)) {
                    mix[key] = parseInt(params.get(key));
                }
            });
            if (Object.keys(mix).length > 0) {
                this.applySavedMix(mix);
                // Auto-play if URL has parameters
                setTimeout(() => this.play(), 500);
            }
        }
    }

    // Setup preset saving UI
    setupPresetSaving() {
        this.loadSavedPresets();

        // Save preset button
        document.getElementById('savePresetBtn')?.addEventListener('click', () => {
            const name = document.getElementById('presetName')?.value.trim();
            if (!name) {
                alert('Please enter a preset name');
                return;
            }
            this.savePreset(name);
            document.getElementById('presetName').value = '';
        });

        // Share link button
        document.getElementById('sharePresetBtn')?.addEventListener('click', () => {
            const url = this.generateShareUrl();
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.getElementById('sharePresetBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="ri-check-line"></i> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }).catch(() => {
                prompt('Copy this link:', url);
            });
        });

        // Load from URL if parameters exist
        this.loadFromUrl();
    }

    // Save preset to localStorage
    savePreset(name) {
        const presets = JSON.parse(localStorage.getItem('noisePresets') || '[]');
        const mix = this.getCurrentMix();

        // Check if preset with same name exists
        const existingIndex = presets.findIndex(p => p.name === name);
        if (existingIndex >= 0) {
            presets[existingIndex].mix = mix;
        } else {
            // Limit to 10 presets
            if (presets.length >= 10) {
                presets.shift();
            }
            presets.push({ name, mix, created: Date.now() });
        }

        localStorage.setItem('noisePresets', JSON.stringify(presets));
        this.loadSavedPresets();
    }

    // Delete preset
    deletePreset(name) {
        const presets = JSON.parse(localStorage.getItem('noisePresets') || '[]');
        const filtered = presets.filter(p => p.name !== name);
        localStorage.setItem('noisePresets', JSON.stringify(filtered));
        this.loadSavedPresets();
    }

    // Load and display saved presets
    loadSavedPresets() {
        const container = document.getElementById('savedPresets');
        if (!container) return;

        const presets = JSON.parse(localStorage.getItem('noisePresets') || '[]');

        if (presets.length === 0) {
            container.innerHTML = '<p class="no-presets">No saved presets yet. Create your perfect mix and save it below.</p>';
            return;
        }

        container.innerHTML = presets.map(preset => `
            <div class="saved-preset-item" data-preset-name="${preset.name}">
                <button class="load-preset-btn" title="Load this preset">
                    <i class="ri-play-circle-line"></i>
                    <span>${preset.name}</span>
                </button>
                <button class="delete-preset-btn" title="Delete this preset">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.load-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.closest('.saved-preset-item').dataset.presetName;
                const preset = presets.find(p => p.name === name);
                if (preset) {
                    this.applySavedMix(preset.mix);
                    if (!this.isPlaying) {
                        this.play();
                    }
                }
            });
        });

        container.querySelectorAll('.delete-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.closest('.saved-preset-item').dataset.presetName;
                if (confirm(`Delete preset "${name}"?`)) {
                    this.deletePreset(name);
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.noiseGenerator = new NoiseGenerator();
});
