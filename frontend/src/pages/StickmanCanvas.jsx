import React, { useRef, useEffect } from 'react';

const PI = Math.PI;
const TAU = 2 * PI;

/* ── helpers ──────────────────────────────────────────────────────
   lerp: linear interpolate
   pt(x,y): shorthand
───────────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;

/* ── Draw stickman from joint map ─────────────────────────────── */
const SKELETON = [
    ['head', 'neck'],
    ['neck', 'chest'],
    ['chest', 'pelvis'],
    ['chest', 'rShoulder'],
    ['chest', 'lShoulder'],
    ['rShoulder', 'rElbow'],
    ['rElbow', 'rWrist'],
    ['lShoulder', 'lElbow'],
    ['lElbow', 'lWrist'],
    ['pelvis', 'rHip'],
    ['pelvis', 'lHip'],
    ['rHip', 'rKnee'],
    ['rKnee', 'rAnkle'],
    ['lHip', 'lKnee'],
    ['lKnee', 'lAnkle'],
];

function drawPose(ctx, joints, color, scale = 1) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    // Draw skeleton segments
    for (const [a, b] of SKELETON) {
        if (!joints[a] || !joints[b]) continue;
        ctx.beginPath();
        ctx.moveTo(joints[a][0], joints[a][1]);
        ctx.lineTo(joints[b][0], joints[b][1]);
        ctx.stroke();
    }

    // Draw head circle
    if (joints.head) {
        ctx.beginPath();
        ctx.arc(joints.head[0], joints.head[1], 10 * scale, 0, TAU);
        ctx.fillStyle = 'transparent';
        ctx.strokeStyle = color;
        ctx.stroke();
        // Filled inner glow
        ctx.shadowBlur = 14;
        ctx.fillStyle = color + '22';
        ctx.fill();
    }

    ctx.restore();
}

/* ══════════════════════════════════════════════════════════════
   SPORT POSE FUNCTIONS  — t ∈ [0, 2π], returns joint map
   Canvas is 160 × 240; ground at y=228, pelvis at roughly 148
══════════════════════════════════════════════════════════════ */

// Shared limb lengths
const L = {
    HEAD: 10, NECK: 12, TORSO: 40, HIP: 8,     // axial
    UPPER_ARM: 22, FORE_ARM: 18,                    // arms
    THIGH: 38, SHIN: 36,                            // legs
    SHOULDER_W: 14,                                 // half shoulder width
};

function joints_from_angles(pelvis, trunkAngle, {
    rShoulder, rElbow, lShoulder, lElbow,
    rHip, rKnee, lHip, lKnee,
}) {
    // trunk: pelvis → chest → neck → head
    const chestX = pelvis[0] + Math.sin(trunkAngle) * L.TORSO;
    const chestY = pelvis[1] - Math.cos(trunkAngle) * L.TORSO;
    const neckX = chestX + Math.sin(trunkAngle) * L.NECK;
    const neckY = chestY - Math.cos(trunkAngle) * L.NECK;
    const headX = neckX + Math.sin(trunkAngle) * (L.NECK * 0.5);
    const headY = neckY - Math.cos(trunkAngle) * (L.NECK * 0.5);

    // shoulders (perpendicular to trunk)
    const perpX = -Math.cos(trunkAngle);
    const perpY = -Math.sin(trunkAngle);
    const rShouX = chestX + perpX * L.SHOULDER_W;
    const rShouY = chestY + perpY * L.SHOULDER_W;
    const lShouX = chestX - perpX * L.SHOULDER_W;
    const lShouY = chestY - perpY * L.SHOULDER_W;

    // right arm
    const rEbX = rShouX + Math.cos(rShoulder) * L.UPPER_ARM;
    const rEbY = rShouY + Math.sin(rShoulder) * L.UPPER_ARM;
    const rWrX = rEbX + Math.cos(rShoulder + rElbow) * L.FORE_ARM;
    const rWrY = rEbY + Math.sin(rShoulder + rElbow) * L.FORE_ARM;

    // left arm
    const lEbX = lShouX + Math.cos(lShoulder) * L.UPPER_ARM;
    const lEbY = lShouY + Math.sin(lShoulder) * L.UPPER_ARM;
    const lWrX = lEbX + Math.cos(lShoulder + lElbow) * L.FORE_ARM;
    const lWrY = lEbY + Math.sin(lShoulder + lElbow) * L.FORE_ARM;

    // hips
    const rHipX = pelvis[0] + perpX * (L.HIP);
    const rHipY = pelvis[1] + perpY * (L.HIP);
    const lHipX = pelvis[0] - perpX * (L.HIP);
    const lHipY = pelvis[1] - perpY * (L.HIP);

    // right leg
    const rKnX = rHipX + Math.cos(rHip) * L.THIGH;
    const rKnY = rHipY + Math.sin(rHip) * L.THIGH;
    const rAnX = rKnX + Math.cos(rHip + rKnee) * L.SHIN;
    const rAnY = rKnY + Math.sin(rHip + rKnee) * L.SHIN;

    // left leg
    const lKnX = lHipX + Math.cos(lHip) * L.THIGH;
    const lKnY = lHipY + Math.sin(lHip) * L.THIGH;
    const lAnX = lKnX + Math.cos(lHip + lKnee) * L.SHIN;
    const lAnY = lKnY + Math.sin(lHip + lKnee) * L.SHIN;

    return {
        head: [headX, headY],
        neck: [neckX, neckY],
        chest: [chestX, chestY],
        pelvis: [pelvis[0], pelvis[1]],
        rShoulder: [rShouX, rShouY],
        lShoulder: [lShouX, lShouY],
        rElbow: [rEbX, rEbY],
        rWrist: [rWrX, rWrY],
        lElbow: [lEbX, lEbY],
        lWrist: [lWrX, lWrY],
        rHip: [rHipX, rHipY],
        lHip: [lHipX, lHipY],
        rKnee: [rKnX, rKnY],
        rAnkle: [rAnX, rAnY],
        lKnee: [lKnX, lKnY],
        lAnkle: [lAnX, lAnY],
    };
}

/* ── Cricket Batsman: front-foot drive ─────────────────────────── */
function poseСricket(t) {
    const sw = Math.sin(t);              // -1 → 1 (backswing → follow-through)
    const swC = (sw + 1) / 2;           // 0 → 1

    // Pelvis position: slightly shifts forward on drive
    const pelvis = [80 + 5 * sw, 148];

    // Trunk leans slightly forward
    const trunkAngle = 0.12 + 0.08 * swC;

    // Right arm (top hand) — sweeps from back-high to front-high
    // At t=−1 (backswing): arm is back and up. At t=+1 (follow-through): arm is forward-high
    const rShoulder = lerp(-PI * 0.9, -PI * 0.3, swC);  // -162° to -54°
    const rElbow = lerp(PI * 0.2, -PI * 0.3, swC);   // elbow bends then straightens

    // Left arm — secondary, guides the bat
    const lShoulder = lerp(-PI * 0.85, -PI * 0.35, swC);
    const lElbow = lerp(-PI * 0.1, PI * 0.1, swC);

    // Legs: right = back foot, left = front foot lunges out
    const rHip = PI * 0.5 + 0.1;          // right hip mostly straight
    const rKnee = 0.18;
    const lHip = PI * 0.5 + 0.35 * swC;  // left leg steps forward
    const lKnee = -0.2 * swC;

    return joints_from_angles(pelvis, trunkAngle, {
        rShoulder, rElbow, lShoulder, lElbow,
        rHip, rKnee, lHip, lKnee,
    });
}

/* ── Football: penalty kick ──────────────────────────────────────── */
function poseFootball(t) {
    const sw = Math.sin(t);
    const swC = (sw + 1) / 2;

    // Plant foot (left), kicking foot (right) swings
    const kick = Math.sin(t - PI * 0.2); // slightly delayed swing

    const pelvis = [80 - 8 * swC + 5 * (1 - swC), 148];
    const trunkAngle = -0.2 * swC + 0.1; // leans forward into kick

    // Left arm swings back as right leg comes forward (counter-balance)
    const rShoulder = lerp(-PI * 0.5, -PI * 0.8, swC);
    const rElbow = lerp(0.3, -0.1, swC);
    const lShoulder = lerp(-PI * 0.9, -PI * 0.3, swC);
    const lElbow = lerp(-0.2, 0.3, swC);

    // Left leg: plant leg, slight bend
    const lHip = PI * 0.5 + 0.15;
    const lKnee = 0.2;

    // Right leg: backswing → powerful kick forward
    const rHipBase = PI * 0.5;
    const rHip = rHipBase + lerp(0.55, -0.6, swC); // swings behind then forward
    const rKnee = lerp(-0.6, 0.55, swC);             // coils behind, snaps through

    return joints_from_angles(pelvis, trunkAngle, {
        rShoulder, rElbow, lShoulder, lElbow,
        rHip, rKnee, lHip, lKnee,
    });
}

/* ── Badminton: overhead smash ───────────────────────────────────── */
function poseBadminton(t) {
    const sw = Math.sin(t);
    const swC = (sw + 1) / 2;

    // Jump: pelvis goes up then comes down (half-wave) — peak at swC=0.5
    const jumpH = 22 * Math.sin(swC * PI);
    const pelvis = [80, 148 - jumpH];

    // Body arches back then snaps forward for smash
    const trunkAngle = lerp(-0.35, 0.25, swC);

    // Right arm (racket arm): raised up then smashes down
    const rShoulder = lerp(-PI * 1.1, -PI * 0.05, swC); // from high overhead → down
    const rElbow = lerp(PI * 0.35, PI * 0.15, swC);   // snap extension

    // Left arm: balances, extends then pulls in
    const lShoulder = lerp(-PI * 0.55, -PI * 0.75, swC);
    const lElbow = lerp(0.4, 0.2, swC);

    // Both legs: jump preparation  → airborne → landing
    const legMid = Math.sin(swC * PI); // 0→1→0 (bent in air)
    const rHip = PI * 0.5 + 0.4 - 0.3 * legMid;
    const rKnee = -0.45 + 0.2 * legMid;
    const lHip = PI * 0.5 + 0.4 - 0.3 * legMid;
    const lKnee = -0.45 + 0.2 * legMid;

    return joints_from_angles(pelvis, trunkAngle, {
        rShoulder, rElbow, lShoulder, lElbow,
        rHip, rKnee, lHip, lKnee,
    });
}

const SPORT_POSE_FN = {
    cricket: poseСricket,
    football: poseFootball,
    badminton: poseBadminton,
};

/* ── Motion trail ───────────────────────────────────────────────── */
const MAX_TRAIL = 6;

/* ══════════════════════════════════════════════════════════════
   REACT COMPONENT
══════════════════════════════════════════════════════════════ */
const StickmanCanvas = ({ sport, size = 'large' }) => {
    const canvasRef = useRef();
    const rafRef = useRef();
    const trailRef = useRef([]);
    const tRef = useRef(0);

    const W = size === 'small' ? 110 : 180;
    const H = size === 'small' ? 160 : 260;
    const scale = size === 'small' ? 0.68 : 1;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const poseFn = SPORT_POSE_FN[sport.id] || poseСricket;
        const color = sport.color;

        function frame() {
            tRef.current += 0.032;
            const t = tRef.current;

            // Compute current pose with scaling applied to all joint coords
            const rawJoints = poseFn(t);
            const joints = {};
            for (const [k, [x, y]] of Object.entries(rawJoints)) {
                joints[k] = [x * scale, y * scale];
            }

            // Keep trail
            trailRef.current.push(joints);
            if (trailRef.current.length > MAX_TRAIL) trailRef.current.shift();

            // Clear
            ctx.clearRect(0, 0, W, H);

            // Draw floor guide line
            ctx.save();
            ctx.strokeStyle = `${color}33`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            const groundY = 228 * scale;
            ctx.beginPath();
            ctx.moveTo(10, groundY);
            ctx.lineTo(W - 10, groundY);
            ctx.stroke();
            ctx.restore();

            // Draw trail (faded older poses)
            trailRef.current.slice(0, -1).forEach((tj, i) => {
                const alpha = (i / MAX_TRAIL) * 0.3;
                ctx.globalAlpha = alpha;
                drawPose(ctx, tj, color, scale);
            });
            ctx.globalAlpha = 1;

            // Draw current pose
            drawPose(ctx, joints, color, scale);

            rafRef.current = requestAnimationFrame(frame);
        }

        rafRef.current = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(rafRef.current);
    }, [sport, scale]);

    return (
        <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ display: 'block' }}
        />
    );
};

export default StickmanCanvas;
