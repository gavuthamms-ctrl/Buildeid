'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import CanvasCard from '@/components/CanvasCard';

const BUILDER_TITLES = [
  'Ship‑Fast Operator',
  'Vibe Debugger',
  'Full‑Stack Wave Rider',
  'Pixel Surfer',
  'Code Tide Keeper',
  'Quantum Builder',
  'Sunset Scripter',
  'Beach‑side Architect',
  'Hacker Harvester',
  'Tropical Optimizer',
  'Spaghetti Refactorer',
  'Bug Whisperer',
  'Infinite Loop Breaker',
  'Cache Invalidator',
  'Late‑Night Deployer',
  'Regex Wrangler',
  'Stack Overflow Surfer',
  'Div Aligner',
  'Pull Request Ninja',
  'Terminal Hermit',
  '10x Chai Drinker',
  'Build‑in‑Public Prophet',
  'Startup Alchemist',
  'One‑More‑Commit Guy',
  'Zero‑to‑Demo Sprinter',
  'Async Philosopher',
  'Error 404: Sleep',
  'git push --force Survivor',
  'Recursive Dreamer',
  'MVP Maximalist'
];

type Step = 'landing' | 'upload' | 'details' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('landing');
  const [imageURL, setImageURL] = useState<string>('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState(BUILDER_TITLES[0]);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif') {
      setError('Please select a valid image file (JPG, PNG, or HEIC).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Please choose an image under 20 MB.');
      return;
    }
    try {
      let blob: Blob = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' ||
          file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        const heic2any = (await import('heic2any')).default;
        blob = (await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })) as Blob;
      }
      const url = URL.createObjectURL(blob);
      setImageURL(url);
      setStep('details');
    } catch (e) {
      setError('Could not read this image. It may be corrupt. Please try another file.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const regenerateTitle = () => {
    let next: string;
    do { next = BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)]; }
    while (next === title);
    setTitle(next);
  };

  const getCanvas = (): HTMLCanvasElement | null =>
    document.getElementById('card-canvas') as HTMLCanvasElement | null;

  const downloadPNG = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'builder';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hhgoa2026-builder-id-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 'image/png');
  };

  const shareToX = async () => {
    const canvas = getCanvas();
    if (!canvas || sharing) return;
    setSharing(true);
    const captionText = `Just built my HH Goa 2026 Builder ID 🏝️⚡ ${name || 'Builder'} · ${role || 'Builder'}. Building at Hacker House Goa this October. #FrameInGoa`;
    canvas.toBlob(async (blob) => {
      if (!blob) { setSharing(false); return; }
      const file = new File([blob], 'builder-id.png', { type: 'image/png' });
      // Try Web Share API
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: captionText });
          setShared(true);
        } catch {}
        setSharing(false);
        return;
      }
      // Fallback: upload to get public URL for OG tag
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { url } = await res.json();
          const cardUrl = `${window.location.origin}/card?img=${encodeURIComponent(url)}`;
          const tweet = encodeURIComponent(`${captionText} ${cardUrl}`);
          window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
        } else {
          // Pure text fallback
          const tweet = encodeURIComponent(captionText);
          window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
        }
      } catch {
        const tweet = encodeURIComponent(captionText);
        window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
      }
      setSharing(false);
      setShared(true);
    }, 'image/png');
  };

  const caption = `Just built my HH Goa 2026 Builder ID 🏝️⚡ ${name || 'Builder'} · ${role || 'Builder'}. Building at Hacker House Goa this October. #FrameInGoa`;

  return (
    <main className="app-root">
      {/* ── LANDING ───────────────────────────────────────── */}
      {step === 'landing' && (
        <section className="landing">
          <div className="landing-badge">🏝️ Hacker House Goa 2026</div>
          <h1 className="landing-h1">Build your<br /><span className="gradient-text">Builder ID Card</span></h1>
          <p className="landing-sub">Upload a photo. Fill 3 fields. Get a card to flex on X.</p>

          {/* Animated demo card */}
          <div className="demo-card-wrap">
            <div className="demo-card">
              <div className="demo-header">
                <span className="mono">HH GOA 2026</span>
                <span className="demo-badge">⚡</span>
              </div>
              <div className="demo-photo-slot">
                <div className="demo-avatar-ring">
                  <div className="demo-avatar-inner">🧑‍💻</div>
                </div>
              </div>
              <div className="demo-text-block">
                <div className="demo-name">Your Name Here</div>
                <div className="demo-role mono">Full‑Stack · Solana</div>
                <div className="demo-title-pill">⚡ Ship‑Fast Operator</div>
              </div>
              <div className="demo-footer mono">#FrameInGoa · 28‑31 Oct</div>
            </div>
            <div className="demo-glow" />
          </div>

          <button className="btn-primary" onClick={() => setStep('upload')}>
            Make My Builder ID →
          </button>
          <p className="landing-hint">No login · No signup · 15 seconds flat</p>
        </section>
      )}

      {/* ── UPLOAD ────────────────────────────────────────── */}
      {step === 'upload' && (
        <section className="upload-section">
          <button className="back-btn" onClick={() => setStep('landing')}>← Back</button>
          <h2 className="section-h2">Add your photo</h2>
          <p className="section-sub">Your selfie, portrait, or any photo you like.</p>

          <div
            className={`dropzone${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <span className="dropzone-icon">📸</span>
            <p className="dropzone-text">Tap to choose or drop image here</p>
            <p className="dropzone-hint mono">JPG · PNG · HEIC supported</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="sr-only"
            onChange={handleFileChange}
          />

          {error && <p className="error-msg">{error}</p>}
        </section>
      )}

      {/* ── DETAILS ───────────────────────────────────────── */}
      {step === 'details' && imageURL && (
        <section className="details-section">
          <button className="back-btn" onClick={() => setStep('upload')}>← Back</button>
          <h2 className="section-h2">Your details</h2>

          {/* Live canvas preview */}
          <div className="preview-wrap">
            <CanvasCard imageSrc={imageURL} name={name} role={role} title={title} />
          </div>

          <div className="form-group">
            <label className="form-label mono">Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Arjun Kumar"
              maxLength={24}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <span className="char-count mono">{name.length}/24</span>
          </div>

          <div className="form-group">
            <label className="form-label mono">Stack / Role *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full‑Stack · Solana"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label mono">Builder Title</label>
            <div className="title-row">
              <input
                type="text"
                className="form-input flex-1"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <button className="shuffle-btn" onClick={regenerateTitle} title="Shuffle title">🎲</button>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            className="btn-primary"
            onClick={() => { if (name.trim()) setStep('result'); else setError('Please enter your name.'); }}
          >
            Generate Card →
          </button>
        </section>
      )}

      {/* ── RESULT ────────────────────────────────────────── */}
      {step === 'result' && (
        <section className="result-section">
          <button className="back-btn" onClick={() => { setStep('details'); setShared(false); }}>← Edit</button>
          <h2 className="section-h2">Your Builder ID is ready 🎉</h2>

          <div className="preview-wrap">
            <CanvasCard imageSrc={imageURL} name={name} role={role || 'Builder'} title={title} />
          </div>

          <div className="action-row">
            <button className="btn-secondary" onClick={downloadPNG}>⬇ Download PNG</button>
            <button className="btn-primary share-btn" onClick={shareToX} disabled={sharing}>
              {sharing ? 'Preparing…' : '𝕏 Share to X'}
            </button>
          </div>

          <div className="caption-preview">
            <p className="caption-label mono">Pre‑filled tweet text:</p>
            <p className="caption-text">{caption}</p>
          </div>

          {shared && (
            <div className="shared-confirm">
              🏝️ Nice — go tag your team!&nbsp;
              <button className="another-btn" onClick={() => {
                setStep('landing'); setImageURL(''); setName(''); setRole('');
                setTitle(BUILDER_TITLES[0]); setShared(false);
              }}>Make another →</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
