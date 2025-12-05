"use client";

/**
 * Voice Service for TTS/STT integration
 * This is a browser-based implementation using Web Speech API
 * For production, you may want to use services like:
 * - ElevenLabs for TTS
 * - Google Speech-to-Text for STT
 * - Azure Speech Services
 */

export class VoiceService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any = null; // SpeechRecognition

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      
      // Initialize Speech Recognition (Chrome/Edge)
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * Text-to-Speech: Speak text
   */
  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available');
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options?.rate) utterance.rate = options.rate;
      if (options?.pitch) utterance.pitch = options.pitch;
      if (options?.volume) utterance.volume = options.volume;
      if (options?.voice) utterance.voice = options.voice;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Speech-to-Text: Start listening
   */
  startListening(
    onResult: (text: string) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not available. Use Chrome or Edge browser.');
    }

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      if (onError) {
        onError(event.error);
      }
    };

    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check if voice features are available
   */
  isAvailable(): { tts: boolean; stt: boolean } {
    return {
      tts: !!this.synthesis,
      stt: !!this.recognition,
    };
  }
}

// For server-side or external TTS services
export class ExternalVoiceService {
  /**
   * Use ElevenLabs TTS (requires API key)
   */
  async speakWithElevenLabs(
    text: string,
    apiKey: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM'
  ): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Use Google Speech-to-Text (requires API key)
   */
  async transcribeWithGoogle(
    audioBlob: Blob,
    apiKey: string
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('config', JSON.stringify({
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    }));

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Google STT error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results?.[0]?.alternatives?.[0]?.transcript || '';
  }
}

export const voiceService = typeof window !== 'undefined' 
  ? new VoiceService() 
  : null;

export const externalVoiceService = new ExternalVoiceService();

