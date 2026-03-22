// Module-level singleton — survives Next.js client-side navigation.
// Owns the MediaRecorder, stream, and chunk accumulator so recording
// continues even when the LiveSessionPanel component unmounts.

import { useChroniclerStore } from "@/stores/chronicler-store";

const AUDIO_SLICE_MS = 5_000;
const CHUNK_INTERVAL_MS = 30_000;

let _stream: MediaStream | null = null;
let _recorder: MediaRecorder | null = null;
let _headerBlob: Blob | null = null;
let _chunkAccumulator = "";
let _chunkTimer: ReturnType<typeof setInterval> | null = null;
let _activeSessionId: string | null = null;
let _mimeType = "";
let _isStarting = false; // guard against concurrent startRecording calls

async function _transcribeBlob(blob: Blob): Promise<void> {
  if (blob.size < 1000) return;
  try {
    const res = await fetch("/api/chronicler/transcribe", {
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

export async function startRecording(sessionId: string): Promise<void> {
  if (isRecording() || _isStarting) return;
  _isStarting = true;

  const store = useChroniclerStore.getState();
  store.setMicError(null);

  try {
    _stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _activeSessionId = sessionId;

    _mimeType =
      ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find(
        (m) => MediaRecorder.isTypeSupported(m)
      ) ?? "";

    _recorder = new MediaRecorder(_stream, _mimeType ? { mimeType: _mimeType } : undefined);
    _headerBlob = null;

    _recorder.ondataavailable = (e) => {
      if (e.data.size < 100) return;
      if (!_headerBlob) {
        // First chunk has container headers — save and skip sending
        _headerBlob = e.data;
        return;
      }
      const completeBlob = new Blob([_headerBlob, e.data], {
        type: _mimeType || "audio/webm",
      });
      _transcribeBlob(completeBlob);
    };

    _recorder.start(AUDIO_SLICE_MS);
    store.setSessionStartTime(Date.now());
    store.setPhase("recording");
    store.addAgentLog("microphone active — listening...");

    if (_chunkTimer) clearInterval(_chunkTimer);
    _chunkTimer = setInterval(_sendChunk, CHUNK_INTERVAL_MS);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Microphone error";
    useChroniclerStore.getState().setMicError(msg);
    useChroniclerStore.getState().setPhase("idle");
  } finally {
    _isStarting = false;
  }
}

export function stopRecording(): void {
  if (_chunkTimer) { clearInterval(_chunkTimer); _chunkTimer = null; }
  if (_recorder && _recorder.state !== "inactive") {
    _recorder.stop();
    _recorder = null;
  }
  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
  }
  _headerBlob = null;
  // Flush any remaining accumulated text
  _sendChunk();
  useChroniclerStore.getState().setPhase("idle");
}

export function flushChunk(): void {
  _sendChunk();
}
