#!/usr/bin/env python3
"""
March 7th Voice Synthesis Script
Uses Windows SAPI with voice adjustments to simulate March 7th voice characteristics
"""

import sys
import os
import json
import argparse
import subprocess
from pathlib import Path

class March7thTTS:
    def __init__(self, model_path, index_path):
        """
        Initialize March 7th TTS with the trained model
        
        Args:
            model_path: Path to March7thEN.pth file
            index_path: Path to the index file
        """
        self.model_path = model_path
        self.index_path = index_path
        self.is_loaded = True  # Using system TTS for now
        
        print(f"Initializing March 7th TTS (fallback mode)")
        print(f"Model path: {model_path}")
        print(f"Index path: {index_path}")
        
    def synthesize(self, text, output_path, settings=None):
        """
        Convert text to March 7th voice using system TTS with adjustments
        
        Args:
            text: Text to synthesize
            output_path: Where to save the audio file
            settings: Voice settings (pitch, speed, etc.)
        """
        if not self.is_loaded:
            raise Exception("Model not loaded")
            
        # Default settings optimized for March 7th characteristics
        default_settings = {
            'pitch': 0.2,      # Higher pitch for March 7th
            'speed': 1.2,      # Slightly faster for energetic personality
            'energy': 1.0,
            'sample_rate': 22050
        }
        
        if settings:
            default_settings.update(settings)
            
        try:
            # Create PowerShell script for TTS with March 7th-like characteristics
            ps_script = f'''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Try to find the best female voice available
$voices = $synth.GetInstalledVoices()
$selectedVoice = $null

# Priority order: young female voices first
$preferredVoices = @("Microsoft Zira Desktop", "Microsoft Hazel Desktop", "Microsoft Eva Desktop")

foreach ($preferred in $preferredVoices) {{
    foreach ($voice in $voices) {{
        if ($voice.VoiceInfo.Name -eq $preferred) {{
            $selectedVoice = $voice.VoiceInfo.Name
            break
        }}
    }}
    if ($selectedVoice) {{ break }}
}}

# If no preferred voice found, use any female voice
if (-not $selectedVoice) {{
    foreach ($voice in $voices) {{
        if ($voice.VoiceInfo.Gender -eq "Female") {{
            $selectedVoice = $voice.VoiceInfo.Name
            break
        }}
    }}
}}

# Fallback to default voice
if ($selectedVoice) {{
    $synth.SelectVoice($selectedVoice)
    Write-Host "Using voice: $selectedVoice"
}} else {{
    Write-Host "Using default system voice"
}}

# March 7th voice characteristics:
# - Energetic and cheerful (faster rate)
# - Young and bright (higher pitch via voice selection)
$rate = [Math]::Max(-10, [Math]::Min(10, {int(default_settings['speed'] * 3 - 2)}))
$synth.Rate = $rate
$synth.Volume = 100

Write-Host "Synthesizing: '{text}'"
Write-Host "Rate: $rate"

# Create output directory if it doesn't exist
$outputDir = Split-Path "{output_path}" -Parent
if (-not (Test-Path $outputDir)) {{
    New-Item -ItemType Directory -Path $outputDir -Force
}}

# Save to WAV file
$synth.SetOutputToWaveFile("{output_path}")
$synth.Speak("{text}")
$synth.Dispose()

Write-Host "Audio saved to: {output_path}"
'''
            
            # Write PowerShell script to temporary file
            script_path = Path(output_path).parent / "temp_march7th_tts.ps1"
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(ps_script)
            
            print(f"Running TTS for March 7th: '{text}'")
            
            # Execute PowerShell script
            result = subprocess.run([
                "powershell.exe", 
                "-ExecutionPolicy", "Bypass", 
                "-File", str(script_path)
            ], capture_output=True, text=True, cwd=str(Path(output_path).parent))
            
            # Clean up
            script_path.unlink(missing_ok=True)
            
            if result.returncode == 0 and os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"TTS successful! Audio file created: {output_path} ({file_size} bytes)")
                
                return {
                    'success': True,
                    'output_path': output_path,
                    'duration': len(text) * 0.15,  # Estimate based on speech rate
                    'settings': default_settings,
                    'file_size': file_size
                }
            else:
                error_msg = f"PowerShell execution failed. Return code: {result.returncode}"
                if result.stderr:
                    error_msg += f" Error: {result.stderr}"
                if result.stdout:
                    print(f"PowerShell output: {result.stdout}")
                
                return {
                    'success': False,
                    'error': error_msg
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during synthesis: {str(e)}"
            }

def main():
    parser = argparse.ArgumentParser(description='March 7th Voice Synthesis')
    parser.add_argument('--text', required=True, help='Text to synthesize')
    parser.add_argument('--output', required=True, help='Output audio file path')
    parser.add_argument('--model', required=True, help='Path to March7thEN.pth')
    parser.add_argument('--index', required=True, help='Path to index file')
    parser.add_argument('--pitch', type=float, default=0.2, help='Pitch adjustment')
    parser.add_argument('--speed', type=float, default=1.2, help='Speed adjustment')
    
    args = parser.parse_args()
    
    # Initialize TTS
    tts = March7thTTS(args.model, args.index)
    
    # Synthesize
    settings = {
        'pitch': args.pitch,
        'speed': args.speed
    }
    
    result = tts.synthesize(args.text, args.output, settings)
    
    # Return JSON result
    print(json.dumps(result))
    
    return 0 if result['success'] else 1

if __name__ == '__main__':
    sys.exit(main())
