// Module-level singleton — survives Next.js client-side navigation.
// Owns the MediaRecorder, stream, and chunk accumulator so recording
// continues even when the LiveSessionPanel component unmounts.

import { useChroniclerStore } from "@/stores/chronicler-store";

const AUDIO_SLICE_MS = 5_000;
const CHUNK_INTERVAL_MS = 30_000;

let _stream: MediaStream | null = null;
let _recorder: MediaRecorder | null = null;
let _chunkAccumulator = "";
let _chunkTimer: ReturnType<typeof setInterval> | null = null;
let _sliceTimer: ReturnType<typeof setInterval> | null = null;
let _activeSessionId: string | null = null;
let _mimeType = "";
let _cachedKeywords: string[] = [];

async function _transcribeBlob(blob: Blob): Promise<void> {
  if (blob.size < 1000) return;
  try {
    const params = new URLSearchParams();
    for (const kw of _cachedKeywords) params.append("keywords", kw);
    const url = params.size ? `/api/chronicler/transcribe?${params}` : "/api/chronicler/transcribe";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": _mimeType || "audio/webm" },
      body: blob,
    });
    if (!res.ok) return;
    const { transcript } = await res.json();
    if (transcript?.trim()) {
      useChroniclerStore.getState().appendTranscript(transcript);
      _chunkAccumulator = _chunkAccumulator
        ? `${_chunkAccumulator} ${transcript}`
        : transcript;
    }
  } catch (err) {
    console.error("[recording-manager] transcribe error:", err);
  }
}

// Start a fresh MediaRecorder cycle. Each cycle produces a self-contained
// audio file (with its own headers), avoiding the old bug where the first
// chunk's audio was re-transcribed with every subsequent chunk.
function _startRecorderCycle(): void {
  if (!_stream || useChroniclerStore.getState().phase !== "recording") return;

  const chunks: Blob[] = [];
  _recorder = new MediaRecorder(_stream, _mimeType ? { mimeType: _mimeType } : undefined);

  _recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  _recorder.onstop = () => {
    if (chunks.length > 0 && useChroniclerStore.getState().phase === "recording") {
      const blob = new Blob(chunks, { type: _mimeType || "audio/webm" });
      _transcribeBlob(blob);
    }
  };

  _recorder.start(); // no timeslice — we stop/restart on a timer instead
}

async function _sendChunk(): Promise<void> {
  const chunk = _chunkAccumulator.trim();
  if (!chunk || !_activeSessionId) return;
  _chunkAccumulator = "";
  try {
    await fetch("/api/chronicler/process-chunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: _activeSessionId, chunk }),
    });
  } catch (err) {
    console.error("[recording-manager] process-chunk error:", err);
  }
}

export function isRecording(): boolean {
  return !!_recorder && _recorder.state !== "inactive";
}

export async function startRecording(sessionId: string, keywords?: string[]): Promise<void> {
  if (isRecording()) return; // already running

  if (keywords) _cachedKeywords = keywords;

  const store = useChroniclerStore.getState();
  store.setMicError(null);

  try {
    _stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _activeSessionId = sessionId;

    _mimeType =
      ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find(
        (m) => MediaRecorder.isTypeSupported(m)
      ) ?? "";

    store.setSessionStartTime(Date.now());
    store.setPhase("recording");
    store.addAgentLog("microphone active — listening...");

    // Start the first recorder cycle
    _startRecorderCycle();

    // Every AUDIO_SLICE_MS, stop the current recorder (triggering onstop →
    // transcription) and start a fresh one. Each cycle produces a complete,
    // self-contained audio file with proper headers.
    if (_sliceTimer) clearInterval(_sliceTimer);
    _sliceTimer = setInterval(() => {
      if (_recorder && _recorder.state === "recording") {
        _recorder.stop(); // triggers onstop → _transcribeBlob
        _startRecorderCycle();
      }
    }, AUDIO_SLICE_MS);

    if (_chunkTimer) clearInterval(_chunkTimer);
    _chunkTimer = setInterval(_sendChunk, CHUNK_INTERVAL_MS);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Microphone error";
    useChroniclerStore.getState().setMicError(msg);
    useChroniclerStore.getState().setPhase("idle");
  }
}

export function stopRecording(): void {
  // Set phase BEFORE stopping recorder so the onstop guard
  // rejects the final chunk.
  useChroniclerStore.getState().setPhase("idle");
  if (_sliceTimer) { clearInterval(_sliceTimer); _sliceTimer = null; }
  if (_chunkTimer) { clearInterval(_chunkTimer); _chunkTimer = null; }
  if (_recorder && _recorder.state !== "inactive") {
    _recorder.stop();
    _recorder = null;
  }
  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
  }
  // Flush any remaining accumulated text
  _sendChunk();
}

export function pauseRecording(): void {
  // Set phase BEFORE stopping recorder so the onstop guard
  // rejects the final chunk.
  useChroniclerStore.getState().setPhase("paused");
  if (_sliceTimer) { clearInterval(_sliceTimer); _sliceTimer = null; }
  if (_chunkTimer) { clearInterval(_chunkTimer); _chunkTimer = null; }
  if (_recorder && _recorder.state !== "inactive") {
    _recorder.stop();
    _recorder = null;
  }
  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
  }
  _sendChunk();
}

export function flushChunk(): void {
  _sendChunk();
}
