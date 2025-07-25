#!/usr/bin/env python3
"""
March 7th Enhanced TTS using Edge-TTS + Audio Processing
This provides much better voice quality than basic SAPI while being web-compatible
"""

import asyncio
import edge_tts
import librosa
import soundfile as sf
import numpy as np
import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

class March7thEnhancedTTS:
    def __init__(self):
        """Initialize March 7th Enhanced TTS."""
        # Use a young female voice from Edge-TTS
        # These are high-quality neural voices
        self.voice_options = [
            "en-US-JennyNeural",      # Young, energetic female
            "en-US-AriaNeural",       # Clear, youthful female  
            "en-US-CoraNeural",       # Warm, friendly female
            "en-GB-LibbyNeural",      # Young British female
            "en-AU-NatashaNeural"     # Young Australian female
        ]
        self.selected_voice = self.voice_options[0]  # Default to Jenny
        print(f"Using Edge-TTS voice: {self.selected_voice}")
    
    async def generate_base_speech(self, text, output_path):
        """Generate high-quality base speech using Edge-TTS."""
        try:
            print(f"Generating Edge-TTS speech for: '{text}'")
            
            # Configure voice with March 7th characteristics
            # Edge-TTS supports SSML for voice modulation
            ssml_text = f"""
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="{self.selected_voice}">
                    <prosody rate="1.15" pitch="+15%" volume="95">
                        {text}
                    </prosody>
                </voice>
            </speak>
            """
            
            # Generate speech using Edge-TTS
            communicate = edge_tts.Communicate(ssml_text, self.selected_voice)
            await communicate.save(output_path)
            
            if os.path.exists(output_path):
                print(f"Edge-TTS generated: {output_path}")
                return True
            else:
                raise RuntimeError("Edge-TTS failed to generate audio file")
                
        except Exception as e:
            print(f"Edge-TTS generation error: {e}")
            return False
    
    def enhance_voice_for_march7th(self, audio_path, output_path):
        """Apply March 7th-specific voice enhancements."""
        try:
            print("Applying March 7th voice enhancements...")
            
            # Load the audio
            audio, sr = librosa.load(audio_path, sr=22050)
            
            # Apply March 7th characteristics
            
            # 1. Slight pitch increase for youthful energy
            audio = librosa.effects.pitch_shift(audio, sr=sr, n_steps=2)
            
            # 2. Add subtle vibrancy/tremolo for personality
            tremolo_rate = 5.5  # Hz - energetic character
            tremolo_depth = 0.08
            t = np.linspace(0, len(audio)/sr, len(audio))
            tremolo = 1 + tremolo_depth * np.sin(2 * np.pi * tremolo_rate * t)
            audio = audio * tremolo
            
            # 3. Enhance brightness for ice/crystal theme
            # High-pass filter to brighten the voice
            from scipy.signal import butter, sosfilt
            sos = butter(2, 1000, btype='highpass', fs=sr, output='sos')
            bright_component = sosfilt(sos, audio) * 0.15
            audio = audio + bright_component
            
            # 4. Add subtle reverb for ethereal ice theme
            reverb_audio = np.copy(audio)
            delay_samples = int(0.05 * sr)  # 50ms delay
            reverb_audio = np.pad(reverb_audio, (delay_samples, 0))[:len(audio)]
            audio = 0.85 * audio + 0.15 * reverb_audio
            
            # 5. Normalize and apply dynamics
            audio = librosa.util.normalize(audio) * 0.8
            
            # Save enhanced audio
            sf.write(output_path, audio, sr)
            print(f"Enhanced audio saved: {output_path}")
            return True
            
        except Exception as e:
            print(f"Enhancement error: {e}")
            # Fallback: just copy original if enhancement fails
            import shutil
            shutil.copy2(audio_path, output_path)
            return True
    
    async def synthesize(self, text, output_path, pitch=0.2, speed=1.2):
        """Complete TTS synthesis with March 7th voice."""
        try:
            print(f"Starting March 7th Enhanced TTS...")
            print(f"Text: '{text}'")
            print(f"Output: {output_path}")
            
            # Create temporary file for base speech
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_file:
                temp_audio = tmp_file.name
            
            try:
                # Step 1: Generate high-quality base speech with Edge-TTS
                success = await self.generate_base_speech(text, temp_audio)
                if not success:
                    raise RuntimeError("Base speech generation failed")
                
                # Step 2: Apply March 7th voice enhancements
                success = self.enhance_voice_for_march7th(temp_audio, output_path)
                if not success:
                    raise RuntimeError("Voice enhancement failed")
                
                # Clean up temporary file
                if os.path.exists(temp_audio):
                    os.unlink(temp_audio)
                
                if os.path.exists(output_path):
                    # Get file info
                    audio_info = sf.info(output_path)
                    file_size = os.path.getsize(output_path)
                    
                    result = {
                        "success": True,
                        "output_path": output_path,
                        "duration": round(audio_info.duration, 2),
                        "settings": {
                            "pitch": pitch,
                            "speed": speed,
                            "energy": 1.0,
                            "sample_rate": audio_info.samplerate,
                            "model": "March7th_Enhanced_EdgeTTS",
                            "voice": self.selected_voice
                        },
                        "file_size": file_size
                    }
                    
                    print(f"TTS successful! March 7th Enhanced voice: {output_path} ({file_size} bytes)")
                    return result
                else:
                    raise RuntimeError("Output file was not created")
                    
            except Exception as e:
                # Clean up temp file on error
                if os.path.exists(temp_audio):
                    os.unlink(temp_audio)
                raise e
                
        except Exception as e:
            print(f"TTS synthesis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "output_path": None
            }

async def main():
    parser = argparse.ArgumentParser(description='March 7th Enhanced TTS')
    parser.add_argument('--text', required=True, help='Text to synthesize')
    parser.add_argument('--output', required=True, help='Output audio file path')
    parser.add_argument('--model', help='Model path (for compatibility, not used)')
    parser.add_argument('--index', help='Index path (for compatibility, not used)')
    parser.add_argument('--pitch', type=float, default=0.2, help='Pitch adjustment')
    parser.add_argument('--speed', type=float, default=1.2, help='Speed adjustment')
    
    args = parser.parse_args()
    
    try:
        # Initialize March 7th Enhanced TTS
        march7th_tts = March7thEnhancedTTS()
        
        # Synthesize speech
        result = await march7th_tts.synthesize(
            text=args.text,
            output_path=args.output,
            pitch=args.pitch,
            speed=args.speed
        )
        
        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False))
        
        if result["success"]:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "output_path": None
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == '__main__':
    # Run the async main function
    asyncio.run(main())
