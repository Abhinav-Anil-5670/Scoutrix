import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PostPage.css';

const API = 'http://localhost:3000/api';

/* ── time-ago helper ─────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

/* ══════════════════════════════════════════════════════════════════
   UPLOAD MODE — pre-recorded or live capture
══════════════════════════════════════════════════════════════════ */
const Composer = ({ onPosted }) => {
    const [mode, setMode] = useState(null);           // 'upload' | 'live'
    const [videoBlob, setVideoBlob] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
    const [caption, setCaption] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');

    // Live capture state
    const [liveState, setLiveState] = useState('idle'); // idle | previewing | recording | recorded
    const [countdown, setCountdown] = useState(null);
    const [recSeconds, setRecSeconds] = useState(0);

    const fileInputRef = useRef();
    const videoRef = useRef();
    const mediaRecorderRef = useRef();
    const streamRef = useRef();
    const chunksRef = useRef([]);
    const timerRef = useRef();

    /* ── cleanup on unmount ── */
    useEffect(() => {
        return () => {
            stopStream();
            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        };
    }, []);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        clearInterval(timerRef.current);
    };

    /* ── FILE UPLOAD path ── */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoBlob(file);
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
    };

    /* ── LIVE CAPTURE path ── */
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                videoRef.current.play();
            }
            setLiveState('previewing');
        } catch (err) {
            setError('Camera access denied. Please allow camera permissions.');
        }
    };

    const startCountdown = () => {
        let n = 3;
        setCountdown(n);
        const id = setInterval(() => {
            n -= 1;
            if (n <= 0) {
                clearInterval(id);
                setCountdown(null);
                beginRecording();
            } else {
                setCountdown(n);
            }
        }, 1000);
    };

    const beginRecording = () => {
        chunksRef.current = [];
        const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mr;
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setVideoBlob(blob);
            const url = URL.createObjectURL(blob);
            setVideoPreviewUrl(url);
            setLiveState('recorded');
            stopStream();
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = url;
                videoRef.current.muted = false;
                videoRef.current.controls = true;
            }
        };
        mr.start();
        setLiveState('recording');
        let s = 0;
        timerRef.current = setInterval(() => { s++; setRecSeconds(s); }, 1000);
    };

    const stopRecording = () => {
        clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
    };

    const retake = () => {
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setVideoBlob(null);
        setVideoPreviewUrl(null);
        setRecSeconds(0);
        setLiveState('idle');
        setError('');
    };

    /* ── SUBMIT ── */
    const handleSubmit = async () => {
        if (!videoBlob) return;
        setSubmitting(true);
        setError('');
        try {
            setProgress('Uploading video to server…');
            const formData = new FormData();
            const ext = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
            formData.append('video', videoBlob, `clip_${Date.now()}.${ext}`);
            if (caption) formData.append('caption', caption);

            setProgress('AI is analysing your clip… this may take 30–60s');

            const res = await fetch(`${API}/videos/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || 'Upload failed');
            }

            const post = await res.json();
            setProgress('');
            setSubmitting(false);
            onPosted(post);

        } catch (err) {
            setError(err.message);
            setProgress('');
            setSubmitting(false);
        }
    };

    /* ─────────────── render ─────────────────────────────── */

    /* Mode selector */
    if (!mode) {
        return (
            <div className="pp-composer pp-mode-select">
                <div className="pp-composer-header">
                    <div className="pp-badge"><span className="pp-dot" />NEW POST</div>
                    <h2 className="pp-title">Share Your Performance</h2>
                    <p className="pp-subtitle">Upload a clip or record live — AI will analyse it automatically.</p>
                </div>

                <div className="pp-mode-cards">
                    <button className="pp-mode-card" onClick={() => { setMode('upload'); }}>
                        <span className="pp-mode-icon">📁</span>
                        <span className="pp-mode-label">Upload Video</span>
                        <span className="pp-mode-desc">Choose a pre-recorded match or training clip from your device</span>
                        <div className="pp-mode-glow" style={{ '--mc': '#00e5a0' }} />
                    </button>
                    <button className="pp-mode-card" onClick={() => { setMode('live'); startCamera(); }}>
                        <span className="pp-mode-icon">🎥</span>
                        <span className="pp-mode-label">Record Live</span>
                        <span className="pp-mode-desc">Capture directly from your camera right now</span>
                        <div className="pp-mode-glow" style={{ '--mc': '#f43f5e' }} />
                    </button>
                </div>
            </div>
        );
    }

    /* Upload path — file chosen */
    if (mode === 'upload' && !videoPreviewUrl) {
        return (
            <div className="pp-composer">
                <div className="pp-composer-header">
                    <h2 className="pp-title">Choose Video</h2>
                </div>
                <div
                    className="pp-drop-zone"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span className="pp-drop-icon">🎬</span>
                    <p className="pp-drop-primary">Drag & drop or click to browse</p>
                    <p className="pp-drop-secondary">MP4 · MOV · AVI · WebM</p>
                    <button className="pp-browse-btn">Choose File</button>
                    <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
                <button className="pp-back-link" onClick={() => setMode(null)}>← Back</button>
            </div>
        );
    }

    /* Live capture UI */
    if (mode === 'live' && liveState !== 'recorded') {
        return (
            <div className="pp-composer">
                <div className="pp-composer-header">
                    <h2 className="pp-title">
                        {liveState === 'recording'
                            ? <><span className="pp-rec-dot" /> Recording… {recSeconds}s</>
                            : 'Camera Preview'}
                    </h2>
                </div>

                <div className="pp-live-wrap">
                    <video ref={videoRef} className="pp-live-video" autoPlay muted playsInline />
                    {countdown !== null && (
                        <div className="pp-countdown">{countdown}</div>
                    )}
                </div>

                {liveState === 'previewing' && (
                    <button className="pp-rec-btn" onClick={startCountdown}>
                        ● Start Recording
                    </button>
                )}
                {liveState === 'recording' && (
                    <button className="pp-rec-btn stop" onClick={stopRecording}>
                        ■ Stop Recording
                    </button>
                )}
                <button className="pp-back-link" onClick={() => { stopStream(); setMode(null); setLiveState('idle'); }}>
                    ← Cancel
                </button>
            </div>
        );
    }

    /* Preview + caption + submit (both paths) */
    return (
        <div className="pp-composer">
            <div className="pp-composer-header">
                <h2 className="pp-title">
                    {mode === 'live' ? '✅ Clip Ready' : '✅ Video Selected'}
                </h2>
                <p className="pp-subtitle">Add a caption and post it to your feed.</p>
            </div>

            <video src={videoPreviewUrl} className="pp-preview-video" controls muted={false} />

            <textarea
                className="pp-caption-input"
                placeholder="Add a caption… (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={300}
            />

            {error && <p className="pp-error">{error}</p>}
            {progress && (
                <div className="pp-progress-notice">
                    <span className="pp-progress-dot" />
                    {progress}
                </div>
            )}

            <div className="pp-action-row">
                <button className="pp-back-link" onClick={retake} disabled={submitting}>
                    ← Retake
                </button>
                <button
                    className="pp-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Posting…' : '🚀 Post'}
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   POST GRID — Instagram-style
══════════════════════════════════════════════════════════════════ */
const PostGrid = ({ posts, onNewPost, user }) => {
    const [focusedPost, setFocusedPost] = useState(null);

    if (focusedPost) {
        return (
            <div className="pp-focused-overlay" onClick={() => setFocusedPost(null)}>
                <div className="pp-focused-card" onClick={(e) => e.stopPropagation()}>
                    <button className="pp-focused-close" onClick={() => setFocusedPost(null)}>✕</button>
                    <video src={focusedPost.videoUrl} className="pp-focused-video" controls autoPlay />
                    <div className="pp-focused-meta">
                        {focusedPost.scoutSummary && (
                            <p className="pp-focused-summary">{focusedPost.scoutSummary}</p>
                        )}
                        {focusedPost.aiMetrics && Object.keys(focusedPost.aiMetrics).length > 0 && (
                            <div className="pp-focused-metrics">
                                {Object.entries(focusedPost.aiMetrics)
                                    .filter(([k]) => k !== 'scout_summary' && k !== 'scoutSummary')
                                    .map(([k, v]) => (
                                        <div key={k} className="pp-metric-chip">
                                            <span className="pp-metric-chip-key">{k.replace(/_/g, ' ')}</span>
                                            <span className="pp-metric-chip-val">{v}</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                        <span className="pp-focused-time">{timeAgo(focusedPost.createdAt)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pp-feed-view">
            {/* Profile strip */}
            <div className="pp-profile-strip">
                <div className="pp-avatar-large">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="pp-profile-info">
                    <h3 className="pp-profile-name">{user?.name || 'Athlete'}</h3>
                    <p className="pp-profile-sub">{user?.sport || 'Sport'} · {user?.location || ''}</p>
                    <p className="pp-post-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
                </div>
                <button className="pp-new-post-btn" onClick={onNewPost}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Post
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="pp-empty">
                    <span className="pp-empty-icon">🎬</span>
                    <p>No posts yet. Share your first performance!</p>
                    <button className="pp-submit-btn" onClick={onNewPost}>
                        + Create First Post
                    </button>
                </div>
            ) : (
                <div className="pp-grid">
                    {posts.map((post) => (
                        <button
                            key={post._id}
                            className="pp-grid-cell"
                            onClick={() => setFocusedPost(post)}
                            aria-label="View post"
                        >
                            <video
                                src={post.videoUrl}
                                className="pp-grid-thumb"
                                muted
                                playsInline
                                preload="metadata"
                            />
                            <div className="pp-grid-overlay">
                                <span className="pp-grid-time">{timeAgo(post.createdAt)}</span>
                                {post.scoutSummary && (
                                    <span className="pp-grid-score">✓ Verified</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════ */
const PostPage = ({ user }) => {
    const [view, setView] = useState('grid'); // 'grid' | 'compose'
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/videos/my-posts`, { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setPosts(d); }
        } catch (_) { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

    const handlePosted = (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
        setView('grid');
    };

    return (
        <div className="pp-page">
            {view === 'compose' ? (
                <div className="pp-compose-wrap">
                    <Composer onPosted={handlePosted} />
                    {view === 'compose' && (
                        <button className="pp-back-link top" onClick={() => setView('grid')}>
                            ← Back to my posts
                        </button>
                    )}
                </div>
            ) : loading ? (
                <div className="pp-loading">
                    <div className="pp-spinner" />
                    <p>Loading your posts…</p>
                </div>
            ) : (
                <PostGrid
                    posts={posts}
                    onNewPost={() => setView('compose')}
                    user={user}
                />
            )}
        </div>
    );
};

export default PostPage;
