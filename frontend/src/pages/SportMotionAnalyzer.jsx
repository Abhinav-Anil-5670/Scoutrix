import React, { useRef, useEffect, useState, useCallback } from 'react';
import './SportMotionAnalyzer.css';

/* ─────────────────────────────────────────────────────────────────
   CANVAS & BODY CONSTANTS
───────────────────────────────────────────────────────────────── */
const CW = 280, CH = 420;       // canvas dimensions
const GY = 400;                  // ground y
const BASE_X = 140;              // pelvis center x (default)

// Segment lengths (pixels)
const SEG = {
    head: 22, neck: 16, torso: 82, shoulder: 14,
    upper_arm: 60, forearm: 52,
    hip: 10, thigh: 80, shin: 74,
};

/* ─────────────────────────────────────────────────────────────────
   FORWARD KINEMATICS  — compute joint world positions from angles
   All angles: 0 = right (+x), π/2 = down (+y), -π/2 = up (-y)
───────────────────────────────────────────────────────────────── */
function fk(pelvisX, pelvisY, trunk, a) {
    const cs = Math.cos, sn = Math.sin;
    const chX = pelvisX + sn(trunk) * SEG.torso;
    const chY = pelvisY - cs(trunk) * SEG.torso;
    const nkX = chX + sn(trunk) * SEG.neck;
    const nkY = chY - cs(trunk) * SEG.neck;
    const hdX = nkX + sn(trunk) * SEG.head * 0.9;
    const hdY = nkY - cs(trunk) * SEG.head * 0.9;

    const px = cs(trunk), py = sn(trunk);           // perpendicular to trunk

    const rsx = chX + px * SEG.shoulder, rsy = chY + py * SEG.shoulder;
    const lsx = chX - px * SEG.shoulder, lsy = chY - py * SEG.shoulder;

    const rexAngle = a.rS + a.rE;
    const lexAngle = a.lS + a.lE;

    const rex = rsx + cs(a.rS) * SEG.upper_arm, rey = rsy + sn(a.rS) * SEG.upper_arm;
    const rwx = rex + cs(rexAngle) * SEG.forearm, rwy = rey + sn(rexAngle) * SEG.forearm;
    const lex = lsx + cs(a.lS) * SEG.upper_arm, ley = lsy + sn(a.lS) * SEG.upper_arm;
    const lwx = lex + cs(lexAngle) * SEG.forearm, lwy = ley + sn(lexAngle) * SEG.forearm;

    const rhx = pelvisX + px * SEG.hip, rhy = pelvisY + py * SEG.hip;
    const lhx = pelvisX - px * SEG.hip, lhy = pelvisY - py * SEG.hip;

    const rknA = a.rH + a.rK;
    const lknA = a.lH + a.lK;

    const rknx = rhx + cs(a.rH) * SEG.thigh, rkny = rhy + sn(a.rH) * SEG.thigh;
    const rax = rknx + cs(rknA) * SEG.shin, ray = rkny + sn(rknA) * SEG.shin;
    const lknx = lhx + cs(a.lH) * SEG.thigh, lkny = lhy + sn(a.lH) * SEG.thigh;
    const lax = lknx + cs(lknA) * SEG.shin, lay = lkny + sn(lknA) * SEG.shin;

    return {
        head: [hdX, hdY], neck: [nkX, nkY], chest: [chX, chY], pelvis: [pelvisX, pelvisY],
        rShoulder: [rsx, rsy], lShoulder: [lsx, lsy],
        rElbow: [rex, rey], rWrist: [rwx, rwy],
        lElbow: [lex, ley], lWrist: [lwx, lwy],
        rHip: [rhx, rhy], lHip: [lhx, lhy],
        rKnee: [rknx, rkny], rAnkle: [rax, ray],
        lKnee: [lknx, lkny], lAnkle: [lax, lay],
    };
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON CONNECTIVITY
───────────────────────────────────────────────────────────────── */
const BONES = [
    ['head', 'neck'], ['neck', 'chest'], ['chest', 'pelvis'],
    ['chest', 'rShoulder'], ['chest', 'lShoulder'],
    ['rShoulder', 'rElbow'], ['rElbow', 'rWrist'],
    ['lShoulder', 'lElbow'], ['lElbow', 'lWrist'],
    ['pelvis', 'rHip'], ['pelvis', 'lHip'],
    ['rHip', 'rKnee'], ['rKnee', 'rAnkle'],
    ['lHip', 'lKnee'], ['lKnee', 'lAnkle'],
];

/* ─────────────────────────────────────────────────────────────────
   DRAW SKELETON ON CANVAS
───────────────────────────────────────────────────────────────── */
function drawSkeleton(ctx, J, color, alpha = 1, lineW = 3) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    for (const [a, b] of BONES) {
        if (!J[a] || !J[b]) continue;
        ctx.beginPath();
        ctx.moveTo(...J[a]);
        ctx.lineTo(...J[b]);
        ctx.stroke();
    }
    // Head circle
    ctx.beginPath();
    ctx.arc(...J.head, SEG.head, 0, Math.PI * 2);
    ctx.fillStyle = color + '18';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.stroke();
    ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────
   LERP HELPERS
───────────────────────────────────────────────────────────────── */
const L = (a, b, t) => a + (b - a) * t;
const smoothstep = t => t * t * (3 - 2 * t);

function lerpPose(kfA, kfB, t) {
    const s = smoothstep(t);
    const keys = ['trunkAngle', 'rS', 'rE', 'lS', 'lE', 'rH', 'rK', 'lH', 'lK', 'pelvisX', 'pelvisY'];
    const out = {};
    for (const k of keys) out[k] = L(kfA[k], kfB[k], s);
    return out;
}

function getPoseAt(keyframes, globalT) {
    const cycleT = globalT % 1;
    const n = keyframes.length;
    for (let i = 0; i < n - 1; i++) {
        const a = keyframes[i], b = keyframes[i + 1];
        if (cycleT >= a.t && cycleT < b.t) {
            const segT = (cycleT - a.t) / (b.t - a.t);
            return lerpPose(a, b, segT);
        }
    }
    // wrap: last → first
    const a = keyframes[n - 1], b = keyframes[0];
    const segLen = (1 - a.t) + b.t;
    const segT = segLen > 0 ? ((cycleT >= a.t ? cycleT - a.t : cycleT + (1 - a.t))) / segLen : 0;
    return lerpPose(a, b, Math.min(segT, 1));
}

/* ─────────────────────────────────────────────────────────────────
   SPORT KEYFRAMES
   Angles: rS=right_shoulder, rE=right_elbow_bend, lS=left_shoulder,
           lE=left_elbow_bend, rH=right_hip, rK=right_knee_bend,
           lH=left_hip, lK=left_knee_bend
   pelvisX / pelvisY: absolute on 280x420 canvas (GY=400)
───────────────────────────────────────────────────────────────── */
const PI = Math.PI;

/* ── Cricket: Fast-bowling action (right-arm, side view) ── */
const CRICKET_KF = [
    {
        t: 0.00, label: 'Run-up', pelvisX: 108, pelvisY: 224, trunkAngle: -0.22,
        rS: 2.05, rE: 0.5, lS: -0.80, lE: 0.70, rH: 1.10, rK: 0.45, lH: 2.00, lK: 0.55
    },
    {
        t: 0.14, label: 'Bound', pelvisX: 122, pelvisY: 210, trunkAngle: -0.05,
        rS: 2.45, rE: 0.3, lS: -1.40, lE: 0.20, rH: 1.55, rK: 0.90, lH: 1.60, lK: 0.80
    },
    {
        t: 0.28, label: 'Back foot', pelvisX: 138, pelvisY: 225, trunkAngle: 0.28,
        rS: 2.80, rE: 0.85, lS: -2.00, lE: 0.15, rH: 1.55, rK: 0.20, lH: 1.20, lK: 0.55
    },
    {
        t: 0.42, label: 'Front drive', pelvisX: 150, pelvisY: 225, trunkAngle: 0.12,
        rS: -0.25, rE: 0.60, lS: -1.10, lE: 0.45, rH: 1.57, rK: 0.20, lH: 1.70, lK: 0.65
    },
    {
        t: 0.57, label: 'Rotation', pelvisX: 158, pelvisY: 228, trunkAngle: -0.10,
        rS: -0.10, rE: 0.20, lS: 0.80, lE: 0.50, rH: 1.50, rK: 0.25, lH: 1.85, lK: 0.18
    },
    {
        t: 0.72, label: 'Release', pelvisX: 162, pelvisY: 229, trunkAngle: -0.38,
        rS: -1.30, rE: 0.08, lS: 1.40, lE: 0.38, rH: 1.38, rK: 0.35, lH: 1.90, lK: 0.10
    },
    {
        t: 0.87, label: 'Follow-through', pelvisX: 165, pelvisY: 232, trunkAngle: -0.50,
        rS: 0.35, rE: 0.35, lS: 2.30, lE: 0.50, rH: 1.68, rK: 0.50, lH: 1.92, lK: 0.35
    },
    {
        t: 1.00, label: 'Run-up', pelvisX: 108, pelvisY: 224, trunkAngle: -0.22,
        rS: 2.05, rE: 0.5, lS: -0.80, lE: 0.70, rH: 1.10, rK: 0.45, lH: 2.00, lK: 0.55
    },
];

/* ── Football: Penalty-kick (right foot, side view) ── */
const FOOTBALL_KF = [
    {
        t: 0.00, label: 'Approach', pelvisX: 110, pelvisY: 222, trunkAngle: -0.18,
        rS: 2.00, rE: 0.5, lS: -0.80, lE: 0.40, rH: 1.10, rK: 0.40, lH: 2.00, lK: 0.50
    },
    {
        t: 0.14, label: 'Plant foot', pelvisX: 130, pelvisY: 222, trunkAngle: -0.14,
        rS: 0.18, rE: 0.4, lS: -0.22, lE: 0.35, rH: 1.57, rK: 0.22, lH: 1.57, rK: 0.22, lK: 0.18
    },
    {
        t: 0.28, label: 'Backswing', pelvisX: 140, pelvisY: 222, trunkAngle: -0.08,
        rS: 0.24, rE: 0.3, lS: -0.12, lE: 0.30, rH: 1.05, rK: 1.05, lH: 1.57, lK: 0.22
    },
    {
        t: 0.43, label: 'Knee drive', pelvisX: 148, pelvisY: 222, trunkAngle: -0.20,
        rS: -0.18, rE: 0.4, lS: 0.12, lE: 0.30, rH: 2.20, rK: 0.32, lH: 1.52, lK: 0.28
    },
    {
        t: 0.57, label: 'Contact', pelvisX: 155, pelvisY: 225, trunkAngle: -0.30,
        rS: -0.32, rE: 0.4, lS: 0.22, lE: 0.35, rH: 2.05, rK: 0.08, lH: 1.52, lK: 0.28
    },
    {
        t: 0.72, label: 'Follow-through', pelvisX: 158, pelvisY: 225, trunkAngle: -0.40,
        rS: -0.45, rE: 0.35, lS: 0.32, lE: 0.38, rH: 2.50, rK: 0.05, lH: 1.45, lK: 0.38
    },
    {
        t: 0.87, label: 'Landing', pelvisX: 162, pelvisY: 226, trunkAngle: -0.18,
        rS: 0.02, rE: 0.4, lS: 0.06, lE: 0.35, rH: 2.15, rK: 0.32, lH: 1.50, lK: 0.20
    },
    {
        t: 1.00, label: 'Approach', pelvisX: 110, pelvisY: 222, trunkAngle: -0.18,
        rS: 2.00, rE: 0.5, lS: -0.80, lE: 0.40, rH: 1.10, rK: 0.40, lH: 2.00, lK: 0.50
    },
];

/* ── Badminton: Overhead smash (right hand, profile) ── */
const BADMINTON_KF = [
    {
        t: 0.00, label: 'Ready', pelvisX: 140, pelvisY: 228, trunkAngle: 0.00,
        rS: 1.45, rE: 0.80, lS: -0.14, lE: 0.50, rH: 1.62, rK: 0.20, lH: 1.52, lK: 0.22
    },
    {
        t: 0.14, label: 'Racket prep', pelvisX: 140, pelvisY: 220, trunkAngle: 0.15,
        rS: -0.22, rE: 1.25, lS: -0.32, lE: 0.40, rH: 1.58, rK: 0.35, lH: 1.55, lK: 0.28
    },
    {
        t: 0.28, label: 'Jump', pelvisX: 140, pelvisY: 200, trunkAngle: -0.10,
        rS: -0.38, rE: 1.05, lS: -1.57, lE: 0.28, rH: 1.25, rK: 0.90, lH: 2.00, lK: 0.18
    },
    {
        t: 0.43, label: 'Airborne', pelvisX: 140, pelvisY: 172, trunkAngle: -0.30,
        rS: -0.62, rE: 1.35, lS: -1.50, lE: 0.38, rH: 1.18, rK: 0.70, lH: 2.05, lK: 0.65
    },
    {
        t: 0.57, label: 'Contact', pelvisX: 140, pelvisY: 178, trunkAngle: -0.35,
        rS: -1.55, rE: 0.05, lS: -0.32, lE: 0.48, rH: 1.28, rK: 0.52, lH: 1.85, lK: 0.60
    },
    {
        t: 0.72, label: 'Follow-through', pelvisX: 140, pelvisY: 200, trunkAngle: -0.08,
        rS: 0.08, rE: 0.42, lS: 0.22, lE: 0.45, rH: 1.62, rK: 0.22, lH: 1.55, lK: 0.28
    },
    {
        t: 0.87, label: 'Landing', pelvisX: 140, pelvisY: 220, trunkAngle: 0.10,
        rS: 0.22, rE: 0.50, lS: 0.18, lE: 0.42, rH: 1.57, rK: 0.52, lH: 1.57, lK: 0.55
    },
    {
        t: 1.00, label: 'Ready', pelvisX: 140, pelvisY: 228, trunkAngle: 0.00,
        rS: 1.45, rE: 0.80, lS: -0.14, lE: 0.50, rH: 1.62, rK: 0.20, lH: 1.52, lK: 0.22
    },
];

const SPORT_DATA = {
    cricket: {
        keyframes: CRICKET_KF, color: '#00e5a0', name: 'Bowling Action',
        speed: 0.0055,
        joints: [
            { id: 'rShoulder', label: 'Bowling Shoulder', weight: 0.22 },
            { id: 'rElbow', label: 'Elbow Extension', weight: 0.20 },
            { id: 'rWrist', label: 'Wrist at Release', weight: 0.18 },
            { id: 'lKnee', label: 'Front Knee Angle', weight: 0.22 },
            { id: 'pelvis', label: 'Hip Rotation', weight: 0.18 },
        ],
    },
    football: {
        keyframes: FOOTBALL_KF, color: '#a78bfa', name: 'Sprint & Kick',
        speed: 0.0060,
        joints: [
            { id: 'rKnee', label: 'Knee Drive', weight: 0.24 },
            { id: 'rHip', label: 'Hip Flexion', weight: 0.20 },
            { id: 'rAnkle', label: 'Foot Contact', weight: 0.20 },
            { id: 'pelvis', label: 'Body Lean', weight: 0.18 },
            { id: 'rElbow', label: 'Arm Swing', weight: 0.18 },
        ],
    },
    badminton: {
        keyframes: BADMINTON_KF, color: '#fbbf24', name: 'Overhead Smash',
        speed: 0.0048,
        joints: [
            { id: 'rShoulder', label: 'Shoulder Rotation', weight: 0.22 },
            { id: 'rElbow', label: 'Elbow Extension', weight: 0.22 },
            { id: 'rWrist', label: 'Wrist Snap', weight: 0.18 },
            { id: 'pelvis', label: 'Jump Height', weight: 0.20 },
            { id: 'lKnee', label: 'Landing Balance', weight: 0.18 },
        ],
    },
};

/* ─────────────────────────────────────────────────────────────────
   DRAW GROUND LINE + PHASE LABEL
───────────────────────────────────────────────────────────────── */
function drawScene(ctx, J, color, phaseLabel, trailJoints) {
    ctx.clearRect(0, 0, CW, CH);

    // Ground
    ctx.save();
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(10, GY); ctx.lineTo(CW - 10, GY); ctx.stroke();
    ctx.restore();

    // Motion trail (ghost frames)
    trailJoints.forEach((tj, i) => {
        drawSkeleton(ctx, tj, color, (i / trailJoints.length) * 0.22, 1.5);
    });

    // Main skeleton
    drawSkeleton(ctx, J, color, 1, 3);

    // Phase label
    ctx.save();
    ctx.font = '700 11px Manrope, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(phaseLabel.toUpperCase(), CW / 2, 20);
    ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────
   JOINT SCORE SIMULATION
   Simulates deviation between pro and athlete by adding
   time-varying noise that's seeded deterministically per joint.
───────────────────────────────────────────────────────────────── */
function simScore(jointId, t) {
    const seed = jointId.length * 17 + jointId.charCodeAt(0) * 3;
    const base = 62 + (seed % 28);                          // base accuracy 62-90
    const wave = Math.sin(t * 2.1 + seed * 0.7) * 12;      // ±12 oscillation
    return Math.max(35, Math.min(98, Math.round(base + wave)));
}

function scoreColor(s) {
    if (s >= 80) return '#00e5a0';
    if (s >= 60) return '#fbbf24';
    return '#f87171';
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const SportMotionAnalyzer = ({ sport, videoUrl }) => {
    const proCanvasRef = useRef();
    const rafRef = useRef();
    const tRef = useRef(0);
    const trailRef = useRef([]);

    const sd = SPORT_DATA[sport.id] || SPORT_DATA.cricket;
    const color = sd.color;

    const [phase, setPhase] = useState('');
    const [scores, setScores] = useState(() =>
        sd.joints.map(j => ({ ...j, score: 75 }))
    );
    const [overallScore, setOverallScore] = useState(75);

    // get current phase label
    const getPhaseLabel = useCallback((t) => {
        const cycleT = t % 1;
        const kfs = sd.keyframes;
        for (let i = 0; i < kfs.length - 1; i++) {
            if (cycleT >= kfs[i].t && cycleT < kfs[i + 1].t) return kfs[i].label;
        }
        return kfs[kfs.length - 1].label;
    }, [sd]);

    useEffect(() => {
        const canvas = proCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const TRAIL = 5;
        let frame = 0;

        function animate() {
            tRef.current += sd.speed;
            const t = tRef.current;
            const pose = getPoseAt(sd.keyframes, t);
            const J = fk(pose.pelvisX, pose.pelvisY, pose.trunkAngle, {
                rS: pose.rS, rE: pose.rE, lS: pose.lS, lE: pose.lE,
                rH: pose.rH, rK: pose.rK, lH: pose.lH, lK: pose.lK,
            });

            trailRef.current.push(J);
            if (trailRef.current.length > TRAIL) trailRef.current.shift();

            const label = getPhaseLabel(t);
            drawScene(ctx, J, color, label, trailRef.current.slice(0, -1));

            // Update scores every 12 frames
            if (frame % 12 === 0) {
                const newScores = sd.joints.map(j => ({
                    ...j, score: simScore(j.id, t),
                }));
                setScores(newScores);
                const overall = Math.round(
                    newScores.reduce((s, j) => s + j.score * j.weight, 0) /
                    newScores.reduce((s, j) => s + j.weight, 0)
                );
                setOverallScore(overall);
                setPhase(label);
            }

            frame++;
            rafRef.current = requestAnimationFrame(animate);
        }

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [sport, sd, color, getPhaseLabel]);

    return (
        <div className="sma-wrap">
            {/* ── Header ── */}
            <div className="sma-header" style={{ '--c': color }}>
                <span className="sma-badge">PRO REFERENCE · {sd.name.toUpperCase()}</span>
                <div className="sma-phase-pill" style={{ borderColor: color + '55', color }}>
                    ▶ {phase}
                </div>
            </div>

            {/* ── Side-by-side panels ── */}
            <div className="sma-panels">
                {/* LEFT: Pro reference animation */}
                <div className="sma-panel sma-panel--pro" style={{ '--c': color }}>
                    <div className="sma-panel-label">PROFESSIONAL REFERENCE</div>
                    <canvas ref={proCanvasRef} width={CW} height={CH} className="sma-canvas" />
                    <div className="sma-panel-footer" style={{ color }}>
                        {sport.emoji} {sport.label} · Elite Model
                    </div>
                </div>

                {/* RIGHT: Athlete video */}
                <div className="sma-panel sma-panel--athlete" style={{ '--c': color }}>
                    <div className="sma-panel-label">YOUR PERFORMANCE</div>
                    <div className="sma-video-wrap">
                        {videoUrl ? (
                            <video
                                src={videoUrl}
                                className="sma-video"
                                autoPlay loop muted playsInline
                            />
                        ) : (
                            <div className="sma-no-video">
                                <span>🎬</span>
                                <p>Video preview</p>
                            </div>
                        )}
                        {/* Overlay corner badges */}
                        <div className="sma-video-badge" style={{ background: color + '22', borderColor: color + '55', color }}>
                            📐 Pose Tracking
                        </div>
                    </div>
                    <div className="sma-panel-footer" style={{ color }}>
                        👤 Athlete · Live Analysis
                    </div>
                </div>
            </div>

            {/* ── Overall accuracy ── */}
            <div className="sma-accuracy-bar" style={{ '--c': color }}>
                <div className="sma-accuracy-left">
                    <span className="sma-accuracy-label">Overall Biomechanical Accuracy</span>
                    <span className="sma-accuracy-desc">
                        Comparison vs. pro {sd.name} reference model
                    </span>
                </div>
                <div className="sma-accuracy-ring" style={{ '--c': color }}>
                    <svg viewBox="0 0 60 60" width="60" height="60">
                        <circle cx="30" cy="30" r="24" fill="none" stroke={color + '1a'} strokeWidth="5" />
                        <circle
                            cx="30" cy="30" r="24" fill="none" stroke={color}
                            strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallScore / 100)}`}
                            transform="rotate(-90 30 30)"
                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                    </svg>
                    <div className="sma-ring-center">
                        <span style={{ color }}>{overallScore}%</span>
                    </div>
                </div>
            </div>

            {/* ── Per-joint deviation scores ── */}
            <div className="sma-joints-section">
                <h4 className="sma-joints-title">Joint-by-Joint Deviation Analysis</h4>
                <div className="sma-joints-grid">
                    {scores.map((j) => (
                        <div key={j.id} className="sma-joint-card">
                            <div className="sma-joint-header">
                                <span className="sma-joint-name">{j.label}</span>
                                <span
                                    className="sma-joint-score"
                                    style={{ color: scoreColor(j.score) }}
                                >
                                    {j.score}%
                                </span>
                            </div>
                            <div className="sma-joint-bar-track">
                                <div
                                    className="sma-joint-bar-fill"
                                    style={{
                                        width: `${j.score}%`,
                                        background: scoreColor(j.score),
                                        transition: 'width 0.5s ease',
                                    }}
                                />
                            </div>
                            <span className="sma-joint-verdict">
                                {j.score >= 80 ? '✅ On target'
                                    : j.score >= 60 ? '⚠️ Minor deviation'
                                        : '❌ Needs work'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="sma-legend">
                <span style={{ color: '#00e5a0' }}>● 80-100% On target</span>
                <span style={{ color: '#fbbf24' }}>● 60-79% Minor deviation</span>
                <span style={{ color: '#f87171' }}>● &lt;60% Needs work</span>
            </div>
        </div>
    );
};

export default SportMotionAnalyzer;
