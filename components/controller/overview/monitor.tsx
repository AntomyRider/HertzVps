"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Tv } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  useControllerStore,
  subscribeScreenFrame,
  subscribeRtcSignal,
} from "@/store/controllerStore";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"],
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
    config,
    isMonitorFullscreen,
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
    `web_${Math.random().toString(36).slice(2, 8)}`,
  );

  const hasVideoOrFrame = Boolean(isWebRtcConnected || screenFrame);
  const isScreenShareAllowed =
    hasVideoOrFrame ||
    (config && typeof config.screenShareEnabled === "boolean"
      ? config.screenShareEnabled
      : true);
  const isLiveStreaming =
    isConnected && isProgramOnline && hasVideoOrFrame && isScreenShareAllowed;

  // Attach MediaStream to both preview and fullscreen <video> elements
  const attachStreamToVideos = (stream: MediaStream | null) => {
    if (
      previewVideoRef.current &&
      previewVideoRef.current.srcObject !== stream
    ) {
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
    if (!isConnected || !isProgramOnline || !keyCode || !isScreenShareAllowed) {
      if (peerRef.current) {
        try {
          peerRef.current.close();
        } catch {}
        peerRef.current = null;
      }
      remoteStreamRef.current = null;
      attachStreamToVideos(null);
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
            new RTCSessionDescription(signal.sdp as RTCSessionDescriptionInit),
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
              new RTCIceCandidate(signal.candidate as RTCIceCandidateInit),
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
      remoteStreamRef.current = null;
      attachStreamToVideos(null);
      setIsWebRtcConnected(false);
    };
  }, [
    isConnected,
    isProgramOnline,
    keyCode,
    isScreenShareAllowed,
    sendRtcSignal,
  ]);

  return (
    <>
      <FadeIn
        direction="up"
        delay={0}
        className="flex min-w-0 flex-1 flex-col sm:p-2.5"
      >
        {/* 16:9 Screen Viewport */}
        <div className="relative aspect-video h-full w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 ">
          {/* Viewport Content */}
          {hasVideoOrFrame && isProgramOnline && isScreenShareAllowed ? (
            <>
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full select-none object-contain ${
                  isWebRtcConnected ? "block" : "hidden"
                }`}
              />

              {!isWebRtcConnected && screenFrame && (
                <img
                  ref={previewImgRef}
                  src={screenFrame}
                  decoding="async"
                  alt="Realtime Full Screen Monitor"
                  className="h-full w-full select-none object-contain"
                />
              )}
            </>
          ) : isConnected && isProgramOnline && !isScreenShareAllowed ? (
            <div className="relative flex h-full w-full flex-col items-center justify-center px-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                <Tv size={26} strokeWidth={1.7} />
              </div>

              <h4 className="mt-4 text-sm font-medium tracking-tight text-white sm:text-base">
                รอสัญญาณการเชื่อมต่อจากโปรแกรม
              </h4>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/50">
                กรุณาเปิดฟังก์ชันแชร์หน้าจอในโปรแกรม Hertz Manager
                แล้วรอสักครู่ ระบบจะแสดงภาพให้อัตโนมัติ
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                <span className="text-xs text-amber-300">กำลังรอสัญญาณ</span>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
                <Tv size={26} strokeWidth={1.7} />
              </div>

              <h4 className="mt-4 text-sm font-medium tracking-tight text-white">
                {!isConnected
                  ? "ยังไม่ได้เชื่อมต่อคีย์ใช้งาน"
                  : !isProgramOnline
                    ? "รอรับสัญญาณจากโปรแกรม"
                    : "กำลังเชื่อมต่อโปรแกรม..."}
              </h4>

              <p className="mt-2 hidden max-w-sm text-xs leading-relaxed text-white/40 sm:block">
                {!isConnected
                  ? "กรอกรหัสคีย์และกดเชื่อมต่อเพื่อดูหน้าจอการทำงาน"
                  : !isProgramOnline
                    ? "รอให้โปรแกรม Hertz Manager เชื่อมต่อออนไลน์"
                    : "กำลังเตรียมช่องทางสตรีมภาพความละเอียดสูง"}
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
                <span className="text-sm font-semibold text-white">
                  ถ่ายทอดสดหน้าจอ
                </span>
                {screenResolution && (
                  <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-2xs text-neutral-400">
                    {screenResolution}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
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

          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-md border border-neutral-800 bg-black">
            {!isScreenShareAllowed ? (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/80 text-amber-400">
                  <Tv size={20} strokeWidth={1.8} />
                </div>
                <h4 className="mt-2 text-sm font-semibold text-white">
                  ไม่ได้เปิด &ldquo;อนุญาตให้แชร์หน้าจอ&rdquo;
                </h4>
                <p className="mt-1 text-xs text-neutral-400">
                  ตัวโปรแกรมบนเครื่องตั้งค่าไม่อนุญาตให้แชร์หน้าจอ
                  สามารถเปิดได้ที่เมนูตั้งค่าขั้นสูง
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
