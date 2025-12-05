"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Square, Play } from "lucide-react";

interface VideoRecorderProps {
  onRecordingComplete?: (videoBlob: Blob, audioBlob: Blob) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  disabled?: boolean;
}

export function VideoRecorder({
  onRecordingComplete,
  onTranscriptUpdate,
  disabled = false,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = transcript;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          const newTranscript = finalTranscript + interimTranscript;
          setTranscript(newTranscript);
          onTranscriptUpdate?.(newTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };
      }
    }

    return () => {
      stopRecording();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, onTranscriptUpdate]);

  const startRecording = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      mediaStreamRef.current = stream;

      // Check if we got video and audio tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      setHasVideo(videoTracks.length > 0);
      setHasAudio(audioTracks.length > 0);

      // Display video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Setup MediaRecorder for video
      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp9,opus",
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = "video/webm";
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
        // Video blob contains both video and audio tracks
        // For now, pass the same blob for both (can be separated later if needed)
        onRecordingComplete?.(videoBlob, videoBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Failed to access camera/microphone. Please check permissions and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <VideoOff className="w-12 h-12 opacity-50" />
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              {hasVideo ? (
                <Video className="w-4 h-4 text-green-500" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-500" />
              )}
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              {hasAudio ? (
                <Mic className="w-4 h-4 text-green-500" />
              ) : (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
              <span>Microphone</span>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Listening...</span>
              </div>
            )}
          </div>

          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled}
              className="bg-red-600 hover:bg-red-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {transcript && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Live Transcript:</p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">
              {transcript}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

