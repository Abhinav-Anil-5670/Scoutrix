import React, { useRef, useEffect, useState } from 'react';
import './VideoPoseOverlay.css';

/*
 * TF.js is loaded from CDN browser bundles (no npm imports).
 * The browser .min.js bundles expose window.tf and window.poseDetection
 * and have no CommonJS `module` references — they work in all browsers.
 */

/* ─── CDN script loader ─────────────────────────────────────────── */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(s);
    });
}

async function loadTF() {
    if (window._tfPoseReady) return;
    // TF.js core + WebGL backend (proper browser bundle — no CJS module issues)
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
    // MoveNet via pose-detection browser bundle
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');
    await window.tf.ready();
    window._tfPoseReady = true;
}

/* ─── MoveNet keypoint indices ─────────────────────────────────── */
const KP = {
    NOSE: 0, L_EYE: 1, R_EYE: 2,
    L_SHOULDER: 5, R_SHOULDER: 6,
    L_ELBOW: 7, R_ELBOW: 8,
    L_WRIST: 9, R_WRIST: 10,
    L_HIP: 11, R_HIP: 12,
    L_KNEE: 13, R_KNEE: 14,
    L_ANKLE: 15, R_ANKLE: 16,
};

const CONNECTIONS = [
    [KP.NOSE, KP.L_SHOULDER], [KP.NOSE, KP.R_SHOULDER],
    [KP.L_SHOULDER, KP.R_SHOULDER],
    [KP.L_SHOULDER, KP.L_ELBOW], [KP.L_ELBOW, KP.L_WRIST],
    [KP.R_SHOULDER, KP.R_ELBOW], [KP.R_ELBOW, KP.R_WRIST],
    [KP.L_SHOULDER, KP.L_HIP], [KP.R_SHOULDER, KP.R_HIP],
    [KP.L_HIP, KP.R_HIP],
    [KP.L_HIP, KP.L_KNEE], [KP.L_KNEE, KP.L_ANKLE],
    [KP.R_HIP, KP.R_KNEE], [KP.R_KNEE, KP.R_ANKLE],
];

/* ─── Draw skeleton — keypoints are pixel coords in videoW×videoH space ── */
function drawSkeleton(ctx, kps, canvasW, canvasH, videoW, videoH, color) {
    if (!kps?.length) return;
    const sx = canvasW / videoW;
    const sy = canvasH / videoH;

    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // Draw bones
    ctx.lineWidth = 3; ctx.shadowBlur = 12; ctx.shadowColor = color;
    for (const [a, b] of CONNECTIONS) {
        const A = kps[a], B = kps[b];
        if (!A || !B || A.score < 0.3 || B.score < 0.3) continue;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(A.x * sx, A.y * sy);
        ctx.lineTo(B.x * sx, B.y * sy);
        ctx.stroke();
    }

    // Draw joints
    for (const idx of Object.values(KP)) {
        const kp = kps[idx];
        if (!kp || kp.score < 0.3) continue;
        const cx = kp.x * sx, cy = kp.y * sy;
        // glow aura
        ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = color + '28'; ctx.shadowBlur = 16; ctx.fill();
        // solid joint
        ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.shadowBlur = 10; ctx.fill();
        // white center
        ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 0; ctx.fill();
    }
    ctx.restore();
}

/* ─── Joint angle ────────────────────────────────────────────────── */
function deg(A, B, C) {
    if (!A || !B || !C) return 180;
    const ba = { x: A.x - B.x, y: A.y - B.y }, bc = { x: C.x - B.x, y: C.y - B.y };
    const dot = ba.x * bc.x + ba.y * bc.y;
    const mag = Math.sqrt(ba.x ** 2 + ba.y ** 2) * Math.sqrt(bc.x ** 2 + bc.y ** 2);
    return mag < 1e-6 ? 180 : Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI);
}

/* ─── Style analysis ─────────────────────────────────────────────── */
function analyzeStyle(kps, sport) {
    if (!kps || kps.length < 17) return null;
    const g = i => (kps[i]?.score > 0.25 ? kps[i] : null);
    const rElbow = deg(g(KP.R_SHOULDER), g(KP.R_ELBOW), g(KP.R_WRIST));
    const lElbow = deg(g(KP.L_SHOULDER), g(KP.L_ELBOW), g(KP.L_WRIST));
    const rKnee = deg(g(KP.R_HIP), g(KP.R_KNEE), g(KP.R_ANKLE));
    const lKnee = deg(g(KP.L_HIP), g(KP.L_KNEE), g(KP.L_ANKLE));
    const rShoulder = deg(g(KP.R_ELBOW), g(KP.R_SHOULDER), g(KP.R_HIP));
    const lh = g(KP.L_HIP), rh = g(KP.R_HIP), ls = g(KP.L_SHOULDER), rs = g(KP.R_SHOULDER);
    const hipMid = lh && rh ? { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 } : null;
    const shoMid = ls && rs ? { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 } : null;
    const trunkLean = (hipMid && shoMid)
        ? Math.round(Math.atan2(shoMid.x - hipMid.x, hipMid.y - shoMid.y) * 180 / Math.PI) : 0;
    const angles = { rElbow, lElbow, rKnee, lKnee, rShoulder, trunkLean };

    let style, tags = [], notes = [], score = 70;

    if (sport.id === 'cricket') {
        style = rShoulder > 155 ? 'High-arm Bowling Action' : rShoulder > 118 ? 'Classic Bowling Action' : 'Round-arm Action';
        tags.push(Math.abs(trunkLean) < 10 ? { label: '📐 Side-on Technique', good: true } : trunkLean > 20 ? { label: '🔄 Front-on Technique', good: true } : { label: '↔️ Mixed Action', good: null });
        tags.push(rElbow > 155 ? { label: '💪 Legal Arm Extension', good: true } : { label: '⚠️ Check Elbow Bend', good: false });
        tags.push(lKnee < 145 ? { label: '🦵 Strong Front-leg Brace', good: true } : { label: '🦵 Stiffen Front Leg', good: false });
        if (rShoulder > 145) tags.push({ label: '🎯 High Release Point', good: true });
        score = Math.round(Math.min(rShoulder / 165, 1) * 30 + (rElbow > 155 ? 1 : 0.6) * 25 + Math.max(0, 1 - lKnee / 180) * 25 + 20);
        notes = [
            { icon: '⚡', text: `Shoulder ${rShoulder}° — ${rShoulder > 145 ? 'excellent high point' : 'raise arm higher at delivery'}` },
            { icon: '📐', text: `Trunk lean ${trunkLean}° — ${Math.abs(trunkLean) < 12 ? 'classic side-on position' : 'rotational drive detected'}` },
            { icon: '🦵', text: `Front knee ${lKnee}° — ${lKnee < 145 ? 'good bracing' : 'brace harder for better carry'}` },
        ];
    } else if (sport.id === 'football') {
        style = rKnee < 100 ? 'Power Strike Technique' : trunkLean > 18 ? 'Technical Placement Style' : 'Balanced Kick';
        tags.push(trunkLean > 18 ? { label: '📐 Good Forward Lean', good: true } : { label: '📐 Stay Over the Ball', good: false });
        tags.push(rKnee < 115 ? { label: '🦵 Maximum Knee Lift', good: true } : { label: '🦵 Increase Knee Drive', good: false });
        tags.push(rElbow < 105 ? { label: '💪 Strong Arm Balance', good: true } : { label: '💪 Use Arms More', good: null });
        if (rKnee < 90) tags.push({ label: '⚡ Power Kicker', good: true });
        score = Math.round(Math.max(0, (150 - rKnee) / 150) * 35 + (trunkLean > 15 ? 1 : 0.6) * 30 + (rElbow < 110 ? 1 : 0.7) * 20 + 15);
        notes = [
            { icon: '🦵', text: `Kicking knee ${rKnee}° — ${rKnee < 110 ? 'max power loaded' : 'pull further back for pace'}` },
            { icon: '📐', text: `Body lean ${trunkLean}° — ${trunkLean > 18 ? 'great forward drive' : 'lean into the kick more'}` },
            { icon: '💪', text: `Arms ${rElbow}° — ${rElbow < 110 ? 'excellent stability' : 'engage arms for balance'}` },
        ];
    } else {
        style = rShoulder > 160 ? 'Full-Extension Smash' : rShoulder > 130 ? 'Controlled Drive Smash' : 'Wrist-Snap Drive';
        tags.push(rShoulder > 155 ? { label: '🏸 Full Overhead Extension', good: true } : { label: '🏸 Reach Higher', good: false });
        tags.push(rElbow > 152 ? { label: '💪 Straight-arm Contact', good: true } : { label: '🎯 Wrist-driven Snap', good: null });
        tags.push(Math.min(rKnee, lKnee) < 130 ? { label: '⬆️ Jump Smash', good: true } : { label: '⬆️ Add Jump Power', good: false });
        score = Math.round(Math.min(rShoulder / 168, 1) * 35 + (rElbow > 150 ? 1 : 0.7) * 30 + Math.max(0, (150 - Math.min(rKnee, lKnee)) / 150) * 20 + 15);
        notes = [
            { icon: '💥', text: `Shoulder ${rShoulder}° — ${rShoulder > 155 ? 'elite arm position' : 'reach higher at contact'}` },
            { icon: '⚡', text: `Elbow ${rElbow}° — ${rElbow > 155 ? 'max racket speed' : 'straighten arm at contact'}` },
            { icon: '🦵', text: `Legs ${Math.min(rKnee, lKnee)}° — ${Math.min(rKnee, lKnee) < 130 ? 'explosive base' : 'load legs for jump'}` },
        ];
    }
    return { style, tags, notes, angles, score: Math.max(40, Math.min(98, score)) };
}

const scoreColor = s => s >= 80 ? '#00e5a0' : s >= 60 ? '#fbbf24' : '#f87171';

/* ─── Module-level singleton detector ──────────────────────────── */
let _detector = null;
let _loading = false;
const _waiters = [];

async function getDetector() {
    if (_detector) return _detector;
    if (_loading) {
        return new Promise((res, rej) => _waiters.push({ res, rej }));
    }
    _loading = true;
    try {
        await loadTF();
        const pd = window.poseDetection;
        if (!pd) throw new Error('window.poseDetection not found after CDN load');
        _detector = await pd.createDetector(
            pd.SupportedModels.MoveNet,
            { modelType: pd.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        _waiters.forEach(w => w.res(_detector));
        return _detector;
    } catch (err) {
        _loading = false;
        _waiters.forEach(w => w.rej(err));
        throw err;
    }
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
const VideoPoseOverlay = ({ sport, videoUrl }) => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const rafRef = useRef();
    const lastKpsRef = useRef(null);
    const frameRef = useRef(0);
    const vSizeRef = useRef({ w: 640, h: 480 });

    const [status, setStatus] = useState('loading');
    const [profile, setProfile] = useState(null);
    const [errMsg, setErrMsg] = useState('');

    /* ── Load detector ── */
    useEffect(() => {
        let cancelled = false;
        getDetector()
            .then(() => { if (!cancelled) setStatus('ready'); })
            .catch(err => {
                console.error('[PoseOverlay] detector load failed:', err);
                if (!cancelled) { setStatus('error'); setErrMsg(String(err?.message || err)); }
            });
        return () => { cancelled = true; };
    }, []);

    /* ── RAF loop ── */
    useEffect(() => {
        if (status !== 'ready') return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext('2d');
        const color = sport.color;

        const syncSize = () => {
            if (video.videoWidth && canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                vSizeRef.current = { w: video.videoWidth, h: video.videoHeight };
            }
        };

        const onMeta = () => { syncSize(); video.play().catch(() => { }); };
        video.addEventListener('loadedmetadata', onMeta);
        if (video.readyState >= 1) onMeta();

        async function loop() {
            if (!video.paused && !video.ended && video.readyState >= 2 && _detector) {
                syncSize();
                const { w: VW, h: VH } = vSizeRef.current;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (frameRef.current % 2 === 0) {
                    try {
                        const poses = await _detector.estimatePoses(video);
                        if (poses.length) lastKpsRef.current = poses[0].keypoints;
                    } catch (_) { }
                }

                const kps = lastKpsRef.current;
                if (kps) {
                    drawSkeleton(ctx, kps, canvas.width, canvas.height, VW, VH, color);
                    if (frameRef.current % 90 === 0) {
                        const p = analyzeStyle(kps, sport);
                        if (p) setProfile(p);
                    }
                }
            }
            frameRef.current++;
            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafRef.current);
            video.removeEventListener('loadedmetadata', onMeta);
        };
    }, [status, sport]);

    return (
        <div className="vpo-root" style={{ '--c': sport.color }}>
            <div className="vpo-header">
                <span className="vpo-badge"><span className="vpo-dot" />LIVE POSE ANALYSIS</span>
                <span className="vpo-sport-tag">{sport.emoji} {sport.label} · {profile?.style || 'Detecting pose…'}</span>
                {status === 'error' && <span className="vpo-err-notice" title={errMsg}>⚠️ CDN unavailable — check console</span>}
            </div>

            <div className="vpo-video-wrap">
                <video ref={videoRef} src={videoUrl} className="vpo-video" loop muted playsInline />
                <canvas ref={canvasRef} className="vpo-canvas" />
                {status === 'loading' && (
                    <div className="vpo-loader">
                        <div className="vpo-spinner" style={{ borderTopColor: sport.color }} />
                        <p>Loading pose model from CDN…</p>
                    </div>
                )}
                {profile && (
                    <div className="vpo-corner-tag" style={{ background: sport.color + '20', borderColor: sport.color + '55', color: sport.color }}>
                        🎯 {profile.style}
                    </div>
                )}
            </div>

            {profile && (
                <div className="vpo-profile">
                    <div className="vpo-tags">
                        {profile.tags.map((t, i) => (
                            <span key={i} className="vpo-tag" style={{
                                background: t.good === true ? 'rgba(0,229,160,0.1)' : t.good === false ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.05)',
                                borderColor: t.good === true ? 'rgba(0,229,160,0.35)' : t.good === false ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.1)',
                                color: t.good === true ? '#00e5a0' : t.good === false ? '#f87171' : '#94a3b8',
                            }}>{t.label}</span>
                        ))}
                    </div>

                    <div className="vpo-score-row">
                        <div className="vpo-score-ring">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                <circle cx="30" cy="30" r="24" fill="none" stroke={scoreColor(profile.score)}
                                    strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 24}`}
                                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - profile.score / 100)}`}
                                    transform="rotate(-90 30 30)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                            </svg>
                            <div className="vpo-ring-inner" style={{ color: scoreColor(profile.score) }}>
                                <span>{profile.score}%</span><small>FORM</small>
                            </div>
                        </div>
                        <div className="vpo-angles-grid">
                            {[
                                { label: 'R. Elbow', val: profile.angles.rElbow },
                                { label: 'R. Shoulder', val: profile.angles.rShoulder },
                                { label: 'R. Knee', val: profile.angles.rKnee },
                                { label: 'Trunk Lean', val: profile.angles.trunkLean },
                            ].map(a => (
                                <div key={a.label} className="vpo-angle-chip">
                                    <span className="vpo-angle-val" style={{ color: sport.color }}>{a.val}°</span>
                                    <span className="vpo-angle-label">{a.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vpo-notes">
                        <h4 className="vpo-notes-title">Technique Breakdown</h4>
                        {profile.notes.map((n, i) => (
                            <div key={i} className="vpo-note">
                                <span className="vpo-note-icon">{n.icon}</span>
                                <span className="vpo-note-text">{n.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPoseOverlay;
