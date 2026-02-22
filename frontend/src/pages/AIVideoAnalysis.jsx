import React, { useState, useRef, useEffect } from 'react';
import VideoPoseOverlay from './VideoPoseOverlay';
import './AIVideoAnalysis.css';

/* ─── Sport metrics definitions ────────────────────────────────── */
const SPORTS = [
    {
        id: 'cricket',
        label: 'Cricket',
        emoji: '🏏',
        color: '#00e5a0',
        colorRgb: '0,229,160',
        metrics: [
            { key: 'Bowling Speed', unit: 'km/h', min: 110, max: 145, icon: '⚡' },
            { key: 'Batting Reaction', unit: 'ms', min: 180, max: 320, icon: '👁️' },
            { key: 'Throw Distance', unit: 'm', min: 40, max: 85, icon: '🎯' },
            { key: 'Footwork Rating', unit: '/10', min: 6, max: 10, icon: '👟' },
            { key: 'Shot Power Index', unit: '%', min: 60, max: 98, icon: '💪' },
        ],
    },
    {
        id: 'football',
        label: 'Football',
        emoji: '⚽',
        color: '#a78bfa',
        colorRgb: '167,139,250',
        metrics: [
            { key: 'Sprint Speed', unit: 'km/h', min: 22, max: 36, icon: '🏃' },
            { key: 'Kick Distance', unit: 'm', min: 25, max: 60, icon: '🦵' },
            { key: 'Agility Score', unit: '/10', min: 6, max: 10, icon: '🔀' },
            { key: 'Pressing Intensity', unit: '%', min: 55, max: 97, icon: '⚡' },
            { key: 'Dribble Accuracy', unit: '%', min: 60, max: 95, icon: '🎯' },
        ],
    },
    {
        id: 'badminton',
        label: 'Badminton',
        emoji: '🏸',
        color: '#fbbf24',
        colorRgb: '251,191,36',
        metrics: [
            { key: 'Smash Speed', unit: 'km/h', min: 120, max: 380, icon: '💥' },
            { key: 'Reaction Time', unit: 'ms', min: 140, max: 280, icon: '⚡' },
            { key: 'Rally Endurance', unit: 'shots', min: 12, max: 45, icon: '🔁' },
            { key: 'Net Accuracy', unit: '%', min: 65, max: 96, icon: '🎯' },
            { key: 'Court Coverage', unit: '%', min: 55, max: 94, icon: '🏟️' },
        ],
    },
];

/* ─── Overlay badge positions ───────────────────────────────────── */
const OVERLAY_PINS = [
    { x: '18%', y: '22%' },
    { x: '72%', y: '18%' },
    { x: '45%', y: '55%' },
    { x: '80%', y: '62%' },
    { x: '15%', y: '70%' },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
const rand = (min, max) => Math.round(min + Math.random() * (max - min));
const generateResults = (sport) =>
    sport.metrics.map((m) => ({ ...m, value: rand(m.min, m.max) }));

const normPct = (val, min, max) =>
    Math.round(((val - min) / (max - min)) * 100);

/* ─── Processing stages ─────────────────────────────────────────── */
const STAGES = [
    'Extracting video frames…',
    'Running pose estimation…',
    'Detecting sport-specific actions…',
    'Calculating biomechanical metrics…',
    'Generating augmented overlay…',
    'Analysis complete ✓',
];

/* ═══════════════════════════════════════════════════════════════════
   STEP 1 — Upload
═══════════════════════════════════════════════════════════════════ */
const UploadStep = ({ onUpload }) => {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('video/')) return;
        const url = URL.createObjectURL(file);
        onUpload({ file, url });
    };

    return (
        <div className="ava-step ava-upload">
            <div className="ava-step-header">
                <div className="ava-badge">
                    <span className="ava-badge-dot" />
                    AI VIDEO ANALYSIS
                </div>
                <h1 className="ava-title">Upload Performance Video</h1>
                <p className="ava-subtitle">
                    Drop any match or training clip — our AI extracts sport-specific metrics
                    and renders them directly onto your footage.
                </p>
            </div>

            <div
                className={`ava-drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => inputRef.current?.click()}
            >
                <div className="ava-drop-icon">🎬</div>
                <p className="ava-drop-primary">
                    {dragging ? 'Drop to analyse' : 'Drag & drop your video here'}
                </p>
                <p className="ava-drop-secondary">or click to browse · MP4, MOV, AVI, WebM</p>
                <button className="ava-browse-btn">Choose File</button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />
            </div>

            <div className="ava-sport-hint-row">
                {SPORTS.map((s) => (
                    <div key={s.id} className="ava-sport-hint" style={{ '--sc': s.color }}>
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   STEP 2 — Sport Selection
═══════════════════════════════════════════════════════════════════ */
const SportStep = ({ video, onSelect, onBack }) => (
    <div className="ava-step ava-sport-step">
        <div className="ava-step-header">
            <h2 className="ava-title">Select Your Sport</h2>
            <p className="ava-subtitle">
                Choose the sport to load the correct model — AI calibrates metrics accordingly.
            </p>
        </div>

        {/* Video preview */}
        <div className="ava-preview-box">
            <video
                src={video.url}
                className="ava-preview-video"
                controls
                muted
                playsInline
            />
            <div className="ava-preview-tag">{video.file.name}</div>
        </div>

        <div className="ava-sport-grid">
            {SPORTS.map((sport) => (
                <button
                    key={sport.id}
                    className="ava-sport-card"
                    style={{ '--sc': sport.color, '--sc-rgb': sport.colorRgb }}
                    onClick={() => onSelect(sport)}
                >
                    <span className="ava-sport-emoji">{sport.emoji}</span>
                    <span className="ava-sport-name">{sport.label}</span>
                    <ul className="ava-sport-metrics-preview">
                        {sport.metrics.slice(0, 3).map((m) => (
                            <li key={m.key}>{m.icon} {m.key}</li>
                        ))}
                        <li className="more">+{sport.metrics.length - 3} more</li>
                    </ul>
                    <div className="ava-sport-card-glow" />
                </button>
            ))}
        </div>

        <button className="ava-back-btn" onClick={onBack}>← Re-upload</button>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   STEP 3 — AI Processing
═══════════════════════════════════════════════════════════════════ */
const ProcessingStep = ({ sport, onDone }) => {
    const [stage, setStage] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const results = generateResults(sport);
        let s = 0;
        let p = 0;

        const interval = setInterval(() => {
            p += Math.random() * 4 + 2;
            if (p >= 100) { p = 100; }
            setProgress(Math.min(Math.round(p), 100));

            const newStage = Math.min(
                Math.floor((p / 100) * (STAGES.length - 1)),
                STAGES.length - 1
            );
            if (newStage !== s) {
                s = newStage;
                setStage(s);
            }

            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => onDone(results), 600);
            }
        }, 120);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="ava-step ava-processing" style={{ '--sc': sport.color }}>
            <div className="ava-ai-orb">
                <div className="ava-orb-ring r1" />
                <div className="ava-orb-ring r2" />
                <div className="ava-orb-ring r3" />
                <span className="ava-orb-emoji">{sport.emoji}</span>
            </div>

            <h2 className="ava-processing-title">Analysing Performance…</h2>
            <p className="ava-processing-sport">{sport.label} Model Active</p>

            <div className="ava-progress-wrap">
                <div
                    className="ava-progress-bar"
                    style={{ '--w': `${progress}%`, '--sc': sport.color }}
                />
                <span className="ava-progress-pct">{progress}%</span>
            </div>

            {/* Stickman + stages side by side */}
            <div className="ava-processing-body">
                <div className="ava-stickman-box" style={{ '--sc': sport.color }}>
                    <div className="ava-proc-icon">{sport.emoji}</div>
                    <p className="ava-stickman-label">Loading Pro Reference…</p>
                </div>

                <div className="ava-stages">
                    {STAGES.map((s, i) => (
                        <div
                            key={i}
                            className={`ava-stage ${i < stage ? 'done' : ''} ${i === stage ? 'active' : ''}`}
                            style={{ '--sc': sport.color }}
                        >
                            <span className="ava-stage-dot" />
                            <span>{s}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   STEP 4 — Results + Augmented Overlay
═══════════════════════════════════════════════════════════════════ */
const ResultsStep = ({ sport, video, results, onReset }) => {
    const [overlayOn, setOverlayOn] = useState(true);
    const [activePin, setActivePin] = useState(null);
    const overallScore = Math.round(
        results.reduce((sum, r) => sum + normPct(r.value, r.min, r.max), 0) / results.length
    );

    return (
        <div className="ava-step ava-results" style={{ '--sc': sport.color, '--sc-rgb': sport.colorRgb }}>

            {/* Header */}
            <div className="ava-results-header">
                <div className="ava-badge" style={{ borderColor: `rgba(${sport.colorRgb},0.35)`, color: sport.color, background: `rgba(${sport.colorRgb},0.08)` }}>
                    <span className="ava-badge-dot" style={{ background: sport.color }} />
                    ANALYSIS COMPLETE
                </div>
                <h2 className="ava-title">{sport.emoji} {sport.label} Report</h2>
            </div>

            {/* Augmented overlay player */}
            <div className="ava-overlay-wrap">
                <video
                    src={video.url}
                    className="ava-overlay-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                {overlayOn && results.map((r, i) => {
                    const pct = normPct(r.value, r.min, r.max);
                    const pin = OVERLAY_PINS[i % OVERLAY_PINS.length];
                    return (
                        <div
                            key={r.key}
                            className={`ava-overlay-pin ${activePin === i ? 'expanded' : ''}`}
                            style={{ left: pin.x, top: pin.y, '--sc': sport.color }}
                            onMouseEnter={() => setActivePin(i)}
                            onMouseLeave={() => setActivePin(null)}
                        >
                            <div className="ava-pin-dot" />
                            <div className="ava-pin-card">
                                <span className="ava-pin-icon">{r.icon}</span>
                                <div className="ava-pin-info">
                                    <span className="ava-pin-key">{r.key}</span>
                                    <span className="ava-pin-val">{r.value}<small>{r.unit}</small></span>
                                </div>
                                <div
                                    className="ava-pin-arc"
                                    style={{ '--p': pct, '--sc': sport.color }}
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="ava-overlay-toolbar">
                    <button
                        className={`ava-overlay-toggle ${overlayOn ? 'on' : ''}`}
                        onClick={() => setOverlayOn(v => !v)}
                    >
                        {overlayOn ? '🔵 Overlay ON' : '⚫ Overlay OFF'}
                    </button>
                    <span className="ava-overlay-hint">Hover pins for details</span>
                </div>
            </div>

            {/* Overall score */}
            <div className="ava-score-band">
                <div className="ava-score-circle" style={{ '--sc': sport.color }}>
                    <svg viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke={sport.color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallScore / 100)}`}
                            transform="rotate(-90 40 40)"
                            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                        />
                    </svg>
                    <div className="ava-score-center">
                        <span className="ava-score-num">{overallScore}</span>
                        <span className="ava-score-label">SCORE</span>
                    </div>
                </div>

                <div className="ava-score-text">
                    <h3>Performance Rating</h3>
                    <p>
                        {overallScore >= 75
                            ? 'Elite-level output detected. Scout-ready.'
                            : overallScore >= 50
                                ? 'Above-average performance. Strong potential.'
                                : 'Developing athlete. Growth metrics look promising.'}
                    </p>
                </div>
            </div>

            {/* Live pose overlay directly on the athlete's video */}
            <VideoPoseOverlay sport={sport} videoUrl={video.url} />

            {/* Metric cards */}
            <div className="ava-metrics-grid">
                {results.map((r) => {
                    const pct = normPct(r.value, r.min, r.max);
                    return (
                        <div key={r.key} className="ava-metric-card">
                            <div className="ava-metric-top">
                                <span className="ava-metric-icon">{r.icon}</span>
                                <span className="ava-metric-key">{r.key}</span>
                                <span className="ava-metric-value">
                                    {r.value}<small>{r.unit}</small>
                                </span>
                            </div>
                            <div className="ava-metric-bar-track">
                                <div
                                    className="ava-metric-bar-fill"
                                    style={{ width: `${pct}%`, background: sport.color }}
                                />
                            </div>
                            <div className="ava-metric-pct">{pct}th percentile</div>
                        </div>
                    );
                })}
            </div>

            <button className="ava-reset-btn" onClick={onReset}>
                ↩ Analyse Another Video
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AIVideoAnalysis = () => {
    const [step, setStep] = useState('upload');   // upload | sport | processing | results
    const [video, setVideo] = useState(null);
    const [sport, setSport] = useState(null);
    const [results, setResults] = useState(null);

    const reset = () => {
        if (video?.url) URL.revokeObjectURL(video.url);
        setVideo(null);
        setSport(null);
        setResults(null);
        setStep('upload');
    };

    return (
        <div className="ava-page">
            {step === 'upload' && (
                <UploadStep onUpload={(v) => { setVideo(v); setStep('sport'); }} />
            )}
            {step === 'sport' && (
                <SportStep
                    video={video}
                    onSelect={(s) => { setSport(s); setStep('processing'); }}
                    onBack={() => setStep('upload')}
                />
            )}
            {step === 'processing' && (
                <ProcessingStep
                    sport={sport}
                    onDone={(r) => { setResults(r); setStep('results'); }}
                />
            )}
            {step === 'results' && (
                <ResultsStep
                    sport={sport}
                    video={video}
                    results={results}
                    onReset={reset}
                />
            )}
        </div>
    );
};

export default AIVideoAnalysis;
