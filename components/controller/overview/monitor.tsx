"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize2, Minimize2, Tv } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  useControllerStore,
  subscribeScreenFrame,
  subscribeRtcSignal,
} from "@/store/controllerStore";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun.cloudflare.com:3478",
      ],
    },
  ],
};

export default function MonitorController() {
  const {
    keyCode,
    isConnected,
    isProgramOnline,
    screenFrame,
    screenResolution,
    isMonitorPaused,
    isMonitorFullscreen,
    toggleMonitorPaused,
    setIsMonitorFullscreen,
    sendRtcSignal,
  } = useControllerStore();

  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const fullscreenImgRef = useRef<HTMLImageElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const viewerIdRef = useRef<string>(
    `web_${Math.random().toString(36).slice(2, 8)}`
  );

  // Attach MediaStream to both preview and fullscreen <video> elements
  const attachStreamToVideos = (stream: MediaStream | null) => {
    if (previewVideoRef.current && previewVideoRef.current.srcObject !== stream) {
      previewVideoRef.current.srcObject = stream;
      if (stream) {
        void previewVideoRef.current.play().catch(() => {});
      }
    }
    if (
      fullscreenVideoRef.current &&
      fullscreenVideoRef.current.srcObject !== stream
    ) {
      fullscreenVideoRef.current.srcObject = stream;
      if (stream) {
        void fullscreenVideoRef.current.play().catch(() => {});
      }
    }
  };

  // Sync fullscreen <video> stream whenever modal opens
  useEffect(() => {
    if (isMonitorFullscreen && remoteStreamRef.current) {
      const timer = setTimeout(() => {
        attachStreamToVideos(remoteStreamRef.current);
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isMonitorFullscreen]);

  // Direct DOM fast-path for fallback WebP frames before WebRTC P2P connects
  useEffect(() => {
    const unsubscribe = subscribeScreenFrame((frame) => {
      if (previewImgRef.current && previewImgRef.current.src !== frame) {
        previewImgRef.current.src = frame;
      }
      if (fullscreenImgRef.current && fullscreenImgRef.current.src !== frame) {
        fullscreenImgRef.current.src = frame;
      }
    });
    return unsubscribe;
  }, []);

  // WebRTC P2P Signaling & PeerConnection consumer
  useEffect(() => {
    if (!isConnected || !isProgramOnline || !keyCode) {
      if (peerRef.current) {
        try {
          peerRef.current.close();
        } catch {}
        peerRef.current = null;
      }
      remoteStreamRef.current = null;
      setIsWebRtcConnected(false);
      return;
    }

    const viewerId = viewerIdRef.current;

    const handleIncomingSignal = async (signal: Record<string, unknown>) => {
      const targetViewer = String(signal.viewerId || "default");
      if (targetViewer !== viewerId && targetViewer !== "default") {
        return;
      }

      if (signal.signalType === "OFFER" && signal.sdp) {
        if (peerRef.current) {
          try {
            peerRef.current.close();
          } catch {}
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerRef.current = pc;

        pc.ontrack = (evt) => {
          const [stream] = evt.streams;
          if (stream) {
            remoteStreamRef.current = stream;
            attachStreamToVideos(stream);
            setIsWebRtcConnected(true);
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setIsWebRtcConnected(true);
          } else if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            setIsWebRtcConnected(false);
          }
        };

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.sdp as RTCSessionDescriptionInit)
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          // รอรวม ICE Candidates เข้า SDP ก้อนเดียวเพื่อยิง API แค่ 1 ครั้ง
          if (pc.iceGatheringState !== "complete") {
            await new Promise<void>((resolve) => {
              const t = setTimeout(resolve, 200);
              const onGather = () => {
                if (pc.iceGatheringState === "complete") {
                  clearTimeout(t);
                  pc.removeEventListener("icegatheringstatechange", onGather);
                  resolve();
                }
              };
              pc.addEventListener("icegatheringstatechange", onGather);
            });
          }

          await sendRtcSignal({
            viewerId: targetViewer,
            signalType: "ANSWER",
            sdp: pc.localDescription,
          });
        } catch {}
      } else if (signal.signalType === "ICE_CANDIDATE" && signal.candidate) {
        if (peerRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(signal.candidate as RTCIceCandidateInit)
            );
          } catch {}
        }
      }
    };

    const unsubRtc = subscribeRtcSignal((sig) => {
      void handleIncomingSignal(sig);
    });

    // ขอ SDP Offer จากตัวโปรแกรมทันทีเพื่อเริ่มสตรีม WebRTC P2P
    void sendRtcSignal({
      viewerId,
      signalType: "REQUEST_OFFER",
    });

    return () => {
      unsubRtc();
      if (peerRef.current) {
        try {
          peerRef.current.close();
        } catch {}
        peerRef.current = null;
      }
      setIsWebRtcConnected(false);
    };
  }, [isConnected, isProgramOnline, keyCode, sendRtcSignal]);

  const hasVideoOrFrame = Boolean(isWebRtcConnected || screenFrame);
  const isLiveStreaming =
    isConnected && isProgramOnline && hasVideoOrFrame && !isMonitorPaused;

  return (
    <>
      <FadeIn
        direction="up"
        delay={0}
        className="flex min-w-0 flex-1 flex-col rounded-md border border-neutral-800 bg-neutral-950 p-2 sm:p-2.5"
      >
        {/* 16:9 Screen Viewport */}
        <div className="relative aspect-video min-h-[190px] w-full overflow-hidden rounded-md border border-neutral-800/80 bg-black sm:min-h-[260px]">
          {/* Top Floating Controls Overlay */}
          <div className="absolute inset-x-2 top-2 z-20 flex items-center justify-between gap-2 pointer-events-none sm:inset-x-3 sm:top-3">
            {/* Left: Stream Status Badge */}
          

            {/* Right: Play/Pause & Fullscreen Action Buttons */}
            <div className="flex items-center gap-1 pointer-events-auto sm:gap-1.5">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                disabled={!isConnected || !isProgramOnline}
                onClick={() => toggleMonitorPaused()}
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border backdrop-blur-xs text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 sm:h-7 sm:w-7 ${
                  isMonitorPaused
                    ? "border-blue-500/40 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "border-neutral-800 bg-neutral-950/80 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
                title={isMonitorPaused ? "กลับมาแสดงภาพสด" : "พักการส่งภาพหน้าจอ"}
              >
                {isMonitorPaused ? (
                  <Play size={12} strokeWidth={1.8} className="sm:h-3.5 sm:w-3.5" />
                ) : (
                  <Pause size={12} strokeWidth={1.8} className="sm:h-3.5 sm:w-3.5" />
                )}
              </button>

              {/* Fullscreen Expand */}
              <button
                type="button"
                disabled={!hasVideoOrFrame}
                onClick={() => setIsMonitorFullscreen(true)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950/80 backdrop-blur-xs text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40 sm:h-7 sm:w-7"
                title="ขยายเต็มจอ"
              >
                <Maximize2 size={12} strokeWidth={1.8} className="sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          </div>

          {hasVideoOrFrame && isProgramOnline ? (
            <>
              {/* Native Hardware-Decoded WebRTC <video> Stream */}
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full select-none object-contain ${
                  isWebRtcConnected ? "block" : "hidden"
                }`}
              />

              {/* Instant Fallback <img> while WebRTC P2P handshakes */}
              {!isWebRtcConnected && screenFrame && (
                <img
                  ref={previewImgRef}
                  src={screenFrame}
                  decoding="async"
                  alt="Realtime Full Screen Monitor"
                  className="h-full w-full select-none object-contain"
                />
              )}

              {isMonitorPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <div className="flex flex-col items-center gap-2.5 rounded-md border border-neutral-800 bg-neutral-950/95 px-5 py-4 text-center">
                    <Pause
                      size={20}
                      className="text-amber-400"
                      strokeWidth={1.8}
                    />
                    
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-4 pt-10 pb-4 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-neutral-400 sm:h-11 sm:w-11">
                <Tv size={18} strokeWidth={1.8} className="sm:h-5 sm:w-5" />
              </div>

              <h4 className="mt-2 text-xs font-semibold text-white sm:text-sm">
                {!isConnected
                  ? "ยังไม่ได้เชื่อมต่อคีย์ใช้งาน"
                  : !isProgramOnline
                    ? "รอรับสัญญาณภาพหน้าจอจากตัวโปรแกรม..."
                    : "กำลังเชื่อมต่อ WebRTC P2P..."}
              </h4>

              <p className="mt-1 hidden max-w-sm text-[11px] leading-relaxed text-neutral-500 sm:block">
                {!isConnected
                  ? "กรอกรหัสคีย์และกดเชื่อมต่อเพื่อดูหน้าจอการทำงานแบบเรียลไทม์"
                  : "เมื่อตัวโปรแกรม Hertz Auto Post เชื่อมต่อออนไลน์ ภาพหน้าจอคอมพิวเตอร์จะแสดงขึ้นที่นี่อัตโนมัติ"}
              </p>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Fullscreen Modal Dialog */}
      <Dialog
        open={isMonitorFullscreen}
        onOpenChange={(open) => setIsMonitorFullscreen(open)}
      >
        <DialogContent
          maxWidth="max-w-6xl"
          onClose={() => setIsMonitorFullscreen(false)}
        >
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMonitorPaused()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:text-white"
                >
                  {isMonitorPaused ? (
                    <>
                      <Play size={14} strokeWidth={1.8} />
                      <span>เล่นต่อ</span>
                    </>
                  ) : (
                    <>
                      <Pause size={14} strokeWidth={1.8} />
                      <span>พักจอ</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMonitorFullscreen(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:text-white"
                >
                  <Minimize2 size={14} strokeWidth={1.8} />
                  <span>ย่อหน้าจอ</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-3 aspect-video w-full overflow-hidden rounded-md border border-neutral-800 bg-black">
            <video
              ref={fullscreenVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full select-none object-contain ${
                isWebRtcConnected ? "block" : "hidden"
              }`}
            />
            {!isWebRtcConnected && screenFrame ? (
              <img
                ref={fullscreenImgRef}
                src={screenFrame}
                decoding="async"
                alt="Fullscreen Live Monitor"
                className="h-full w-full select-none object-contain"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
