import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Play, Square, Moon, Sun, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from './ui/toaster';

const DrumRudimentsApp = () => {
  const [sequence, setSequence] = useState([]);
  const [bpm, setBpm] = useState([70]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [currentSubdivision, setCurrentSubdivision] = useState(-1);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [clickEnabled, setClickEnabled] = useState(true);
  const [includeRest, setIncludeRest] = useState(false);
  const [drumKickEnabled, setDrumKickEnabled] = useState(false);
  
  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Auto BPM increase states
  const [autoBpmEnabled, setAutoBpmEnabled] = useState(false);
  const [autoBpmCycles, setAutoBpmCycles] = useState(4); // 4, 8, 16, or 32
  const [currentCycleCount, setCurrentCycleCount] = useState(0);
  const [sequenceCompletions, setSequenceCompletions] = useState(0);
  
  const [handPatterns, setHandPatterns] = useState({
    quarter: 'R',
    eighth: 'R-R',
    triplet: 'R-R-R',
    sixteenth: 'R-R-R-R',
    thirtysecond: 'R-R-R-R-R-R-R-R',
    rest: ''
  });

  const { toast } = useToast();

  // Auto BPM increase function
  const handleSequenceComplete = useCallback(() => {
    if (autoBpmEnabled) {
      const newCycleCount = currentCycleCount + 1;
      setCurrentCycleCount(newCycleCount);
      
      console.log(`Sequence completed: ${newCycleCount}/${autoBpmCycles}`);
      
      if (newCycleCount >= autoBpmCycles) {
        // Calculate new BPM
        const currentBpm = bpm[0];
        const newBpm = Math.min(currentBpm + 5, 200);
        
        // Increase BPM by 5 and reset cycle count
        setBpm([newBpm]);
        setCurrentCycleCount(0);
        
        console.log(`BPM increased from ${currentBpm} to ${newBpm}`);
        
        // BPM increased - no toast notification needed
      }
    }
  }, [autoBpmEnabled, currentCycleCount, autoBpmCycles, bpm, setBpm, setCurrentCycleCount, toast]);

  // Auto BPM effect - monitors sequence completions
  useEffect(() => {
    if (autoBpmEnabled && sequenceCompletions > 0 && isPlaying) {
      const newCycleCount = sequenceCompletions;
      setCurrentCycleCount(newCycleCount);
      
      console.log(`Cycle updated: ${newCycleCount}/${autoBpmCycles}`);
      
      if (newCycleCount >= autoBpmCycles) {
        // Calculate new BPM
        const currentBpm = bpm[0];
        const newBpm = Math.min(currentBpm + 5, 200);
        
        // Update BPM and reset counters
        setBpm([newBpm]);
        setCurrentCycleCount(0);
        setSequenceCompletions(0);
        
        console.log(`BPM increased from ${currentBpm} to ${newBpm}`);
        
        // BPM increased - no toast notification needed
      }
    }
  }, [sequenceCompletions, autoBpmEnabled, autoBpmCycles, bpm, isPlaying, toast]);

  // BPM change effect - applies new BPM to current playback immediately
  useEffect(() => {
    if (isPlaying && window.isPlaybackActive && currentPlaybackBpm.current !== bpm[0]) {
      console.log(`BPM changed from ${currentPlaybackBpm.current} to ${bpm[0]} - updating playback timing`);
      currentPlaybackBpm.current = bpm[0];
      
      // Force recalculation of timing by updating the global BPM reference
      window.currentBPM = bpm[0];
    }
  }, [bpm, isPlaying]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && isPlaying) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isPlaying && timerSeconds !== 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, isPlaying, timerSeconds]);

  // Format timer display
  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Note types with their symbols and subdivisions per beat
  const noteTypes = {
    quarter: {
      symbol: '♩',
      name: 'Quarter Note',
      subdivisions: 1,
      icon: '♩',
      width: 'w-16',
      height: 'h-16',
      circles: [{ id: 0 }]
    },
    eighth: {
      symbol: '♫',
      name: 'Eighth Note',
      subdivisions: 2,
      icon: '♫',
      width: 'w-32',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }]
    },
    triplet: {
      symbol: '♪³',
      name: 'Triplet Note',
      subdivisions: 3,
      icon: '♪³',
      width: 'w-48',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }]
    },
    sixteenth: {
      symbol: '♬',
      name: 'Sixteenth Note',
      subdivisions: 4,
      icon: '♬',
      width: 'w-64',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
    },
    thirtysecond: {
      symbol: '♬',
      name: 'Thirty-second Note',
      subdivisions: 8,
      icon: '♬',
      width: 'w-full',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }]
    },
    rest: {
      symbol: '𝄽',
      name: 'Quarter Rest',
      subdivisions: 1,
      icon: '𝄽',
      width: 'w-16',
      height: 'h-16',
      circles: [{ id: 0 }]
    }
  };

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add note to sequence with audio initialization
  const addNote = (noteType) => {
    const newNote = {
      id: Date.now() + Math.random(),
      type: noteType,
      handPattern: handPatterns[noteType],
      ...noteTypes[noteType]
    };
    setSequence(prev => [...prev, newNote]);
  };

  // Remove note from sequence
  const removeNote = (noteId) => {
    setSequence(prev => prev.filter(note => note.id !== noteId));
  };

  // Hand pattern cycling functions
  const getNextHandPattern = (noteType, currentPattern) => {
    const basePatterns = {
      quarter: ['R', 'L'],
      eighth: ['R-R', 'R-L', 'L-L', 'L-R'],
      triplet: ['R-R-R', 'R-R-L', 'R-L-R', 'R-L-L', 'L-R-R', 'L-R-L', 'L-L-R', 'L-L-L'],
      sixteenth: ['R-R-R-R', 'R-R-R-L', 'R-R-L-R', 'R-R-L-L', 'R-L-R-R', 'R-L-R-L', 'R-L-L-R', 'R-L-L-L',
                  'L-R-R-R', 'L-R-R-L', 'L-R-L-R', 'L-R-L-L', 'L-L-R-R', 'L-L-R-L', 'L-L-L-R', 'L-L-L-L'],
      thirtysecond: [],
      rest: [''] // Rest doesn't have hand patterns
    };

    // Generate patterns with K if drum kick is enabled (except for thirty-second)
    const patterns = { ...basePatterns };
    
    if (drumKickEnabled && noteType !== 'thirtysecond' && noteType !== 'rest') {
      const subdivisions = noteTypes[noteType].subdivisions;
      const kickPatterns = [];
      
      // Generate all combinations including K
      const generateCombinations = (length) => {
        const combinations = [];
        const letters = ['R', 'L', 'K'];
        
        function generate(current, remaining) {
          if (remaining === 0) {
            combinations.push(current.join('-'));
            return;
          }
          
          for (let letter of letters) {
            current.push(letter);
            generate(current, remaining - 1);
            current.pop();
          }
        }
        
        generate([], length);
        return combinations;
      };
      
      const allCombinations = generateCombinations(subdivisions);
      
      // First add patterns with only R and L, then patterns with K
      const rlOnlyPatterns = allCombinations.filter(pattern => !pattern.includes('K'));
      const patternsWithK = allCombinations.filter(pattern => pattern.includes('K'));
      
      patterns[noteType] = [...rlOnlyPatterns, ...patternsWithK];
    }

    // Generate all 256 combinations for thirty-second note (2^8 = 256)
    if (patterns.thirtysecond.length === 0) {
      for (let i = 0; i < 256; i++) {
        let pattern = '';
        for (let j = 7; j >= 0; j--) {
          pattern += ((i >> j) & 1) ? 'L' : 'R';
          if (j > 0) pattern += '-';
        }
        patterns.thirtysecond.push(pattern);
      }
    }

    const currentIndex = patterns[noteType].indexOf(currentPattern);
    const nextIndex = (currentIndex + 1) % patterns[noteType].length;
    return patterns[noteType][nextIndex];
  };

  // Generate random sequence with exactly 32 stems
  const generateRandomSequence = useCallback(() => {
    const noteTypeArray = ['quarter', 'eighth', 'triplet', 'sixteenth', 'thirtysecond'];
    // Add rest to the array if includeRest is enabled
    if (includeRest) {
      noteTypeArray.push('rest');
    }
    const newSequence = [];
    let totalStems = 0;
    const targetStems = 32;

    // Generate random R/L pattern for each position
    const generateRandomHandPattern = (subdivisions) => {
      const pattern = [];
      for (let i = 0; i < subdivisions; i++) {
        pattern.push(Math.random() < 0.5 ? 'R' : 'L');
      }
      return pattern.join('-');
    };

    // Keep generating notes until we have exactly 32 stems
    while (totalStems < targetStems) {
      const remainingStems = targetStems - totalStems;

      // Choose note type that fits in remaining space
      let availableNotes = noteTypeArray.filter(noteType =>
        noteTypes[noteType].subdivisions <= remainingStems
      );

      // If no notes fit, we need to use the largest available
      if (availableNotes.length === 0) {
        if (remainingStems >= 1) availableNotes = ['quarter'];
        else break;
      }

      // Pick random note from available options
      const randomNoteType = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      const noteStems = noteTypes[randomNoteType].subdivisions;

      // Create note with random hand pattern
      const newNote = {
        id: Date.now() + Math.random(),
        type: randomNoteType,
        handPattern: generateRandomHandPattern(noteStems),
        ...noteTypes[randomNoteType]
      };

      newSequence.push(newNote);
      totalStems += noteStems;

      // Safety check
      if (newSequence.length > 50) break;
    }

    // Add new sequence to existing sequence (don't replace)
    setSequence(prev => [...prev, ...newSequence]);

    toast({
      title: "Random sequence added",
      description: `Added ${newSequence.length} notes with ${totalStems} stems to sequence`,
    });
  }, [includeRest, toast]);

  const cycleHandPattern = (noteType) => {
    if (noteType === 'rest') return; // Don't cycle hand patterns for rests
    setHandPatterns(prev => ({
      ...prev,
      [noteType]: getNextHandPattern(noteType, prev[noteType])
    }));
  };

  // Clear entire sequence
  const clearSequence = () => {
    setSequence([]);
    setCurrentNoteIndex(-1);
    setCurrentSubdivision(-1);
    setIsPlaying(false);
    // Reset timer and auto BPM counters
    setTimerSeconds(0);
    setTimerActive(false);
    setCurrentCycleCount(0);
    setSequenceCompletions(0);
    toast({
      title: "Sequence cleared",
      description: "All notes have been removed from the sequence",
    });
  };

  // Shared audio context
  const audioContextRef = useRef(null);
  
  // Current BPM reference for playback
  const currentPlaybackBpm = useRef(70);

  // Initialize audio context once
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  // Play metronome click sound
  const playMetronomeClick = useCallback(() => {
    if (!clickEnabled) return;

    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      // High-pitched click
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.type = 'square';

      // Sharp click envelope
      const now = audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      oscillator.start(now);
      oscillator.stop(now + 0.03);

    } catch (error) {
      console.warn('Click sound failed:', error);
    }
  }, [clickEnabled, getAudioContext]);

  // Play audio for note - improved version with rest handling and kick drum
  const playNoteSound = useCallback((hand = 'R', isRest = false) => {
    // Always play click regardless of rest or not
    playMetronomeClick();

    // Don't play drum sound for rests, but still play click
    if (!soundEnabled || isRest) return;

    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      if (hand === 'K') {
        // Kick drum sound - deeper bass frequency
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Deep kick drum frequency
        oscillator.frequency.setValueAtTime(80, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        oscillator.type = 'sine';

        // Kick drum envelope - punchy attack, quick decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
      } else {
        // Original R/L snare sounds
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Create noise for snare effect
        const bufferSize = audioContext.sampleRate * 0.1;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        const noiseGain = audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        noiseSource.connect(noiseGain);
        gainNode.connect(audioContext.destination);
        noiseGain.connect(audioContext.destination);

        // Configure different sounds for R/L
        const baseFreq = hand === 'R' ? 200 : 160;
        const endFreq = hand === 'R' ? 80 : 60;

        oscillator.frequency.setValueAtTime(baseFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        // Set up envelopes
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.005);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        // Start sounds
        oscillator.start(now);
        noiseSource.start(now);

        // Stop sounds
        oscillator.stop(now + 0.12);
        noiseSource.stop(now + 0.08);
      }

    } catch (error) {
      console.warn('Drum sound failed:', error);
    }
  }, [soundEnabled, getAudioContext, playMetronomeClick]);

  // Start playback with improved timing and rest handling
  const startPlayback = useCallback(() => {
    if (sequence.length === 0) {
      toast({
        title: "Empty sequence",
        description: "Please add some notes to the sequence first",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);
    setCurrentNoteIndex(0);
    setCurrentSubdivision(0);
    
    // Start timer
    if (!timerActive) {
      setTimerActive(true);
    }

    // Initialize audio context first
    try {
      getAudioContext();
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }

    // Set playing flag
    window.isPlaybackActive = true;
    
    // Initialize current BPM reference
    currentPlaybackBpm.current = bpm[0];
    window.currentBPM = bpm[0];

    let noteIndex = 0;
    let subdivisionIndex = 0;

    // Play first note
    const firstNote = sequence[0];
    const firstHand = firstNote.handPattern.split('-')[0] || 'R';
    const isFirstRest = firstNote.type === 'rest';
    playNoteSound(firstHand, isFirstRest);

    const playNextSubdivision = () => {
      // Check if playback should continue
      if (!window.isPlaybackActive) {
        return;
      }

      // Always use current BPM for timing calculations
      const currentBeatDuration = (60 / (window.currentBPM || bpm[0])) * 1000;

      const currentNote = sequence[noteIndex];
      subdivisionIndex++;

      if (subdivisionIndex < currentNote.subdivisions) {
        // Play next subdivision of current note
        setCurrentSubdivision(subdivisionIndex);
        const handPattern = currentNote.handPattern.split('-');
        const currentHand = handPattern[subdivisionIndex] || 'R';
        const isRest = currentNote.type === 'rest';

        playNoteSound(currentHand, isRest);

        // Schedule next subdivision only if still playing
        if (window.isPlaybackActive) {
          const subdivisionDuration = currentBeatDuration / currentNote.subdivisions;
          window.playbackTimeout = setTimeout(playNextSubdivision, subdivisionDuration);
        }
      } else {
        // Move to next note
        noteIndex++;
        subdivisionIndex = 0;

        if (noteIndex >= sequence.length) {
          // Loop back to beginning - sequence completed
          noteIndex = 0;
          
          // Increment sequence completion counter for auto BPM
          if (autoBpmEnabled) {
            setSequenceCompletions(prev => prev + 1);
          }
        }

        setCurrentNoteIndex(noteIndex);
        setCurrentSubdivision(0);

        // Play first subdivision of next note
        const nextNote = sequence[noteIndex];
        const nextHand = nextNote.handPattern.split('-')[0] || 'R';
        const isNextRest = nextNote.type === 'rest';

        playNoteSound(nextHand, isNextRest);

        // Schedule next subdivision only if still playing
        if (window.isPlaybackActive) {
          const nextSubdivisionDuration = currentBeatDuration / nextNote.subdivisions;
          window.playbackTimeout = setTimeout(playNextSubdivision, nextSubdivisionDuration);
        }
      }
    };

    // Start the subdivision timing with current BPM
    const initialBeatDuration = (60 / bpm[0]) * 1000;
    const firstSubdivisionDuration = initialBeatDuration / sequence[0].subdivisions;
    window.playbackTimeout = setTimeout(playNextSubdivision, firstSubdivisionDuration);
  }, [sequence, bpm, playNoteSound, getAudioContext, toast, timerActive, autoBpmEnabled]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    // Stop the playback flag first
    window.isPlaybackActive = false;

    // Clear any pending timeout
    if (window.playbackTimeout) {
      clearTimeout(window.playbackTimeout);
      window.playbackTimeout = null;
    }
    if (window.playbackInterval) {
      clearInterval(window.playbackInterval);
      window.playbackInterval = null;
    }

    // Update UI state
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
    setCurrentSubdivision(-1);
    // Reset auto BPM counters when stopping
    setCurrentCycleCount(0);
    setSequenceCompletions(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop playback
      window.isPlaybackActive = false;

      if (window.playbackTimeout) {
        clearTimeout(window.playbackTimeout);
      }
      if (window.playbackInterval) {
        clearInterval(window.playbackInterval);
      }
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn('Audio context cleanup error:', e));
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-all duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-red-800 dark:text-red-300">
            Drum Rudiments Practice
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-center leading-tight font-bold">
                <div>Random</div>
                <div>Rest</div>
              </div>
              <Switch
                checked={includeRest}
                onCheckedChange={setIncludeRest}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-center leading-tight font-bold">
                <div>Drum</div>
                <div>Kick</div>
              </div>
              <Switch
                checked={drumKickEnabled}
                onCheckedChange={setDrumKickEnabled}
                className="data-[state=checked]:bg-orange-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">Sound</span>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">Click</span>
              <Switch
                checked={clickEnabled}
                onCheckedChange={setClickEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-red-600"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Note Selection Buttons */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Add Notes to Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(noteTypes).filter(([key]) => key !== 'rest').map(([key, note]) => (
                  <div key={key} className="space-y-2">
                    <Button
                      onClick={() => addNote(key)}
                      variant="outline"
                      className="w-full h-32 text-2xl font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`${note.width} ${note.height} flex items-center justify-center overflow-hidden`}>
                          {key === 'quarter' && (
                            <span className="text-3xl">♩</span>
                          )}
                          {key === 'eighth' && (
                            <div className="flex space-x-3">
                              <span className="text-3xl">♪</span>
                              <span className="text-3xl">♪</span>
                            </div>
                          )}
                          {key === 'triplet' && (
                            <div className="relative">
                              <div className="flex space-x-2">
                                <span className="text-3xl">♪</span>
                                <span className="text-3xl">♪</span>
                                <span className="text-3xl">♪</span>
                              </div>
                              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                            </div>
                          )}
                          {key === 'sixteenth' && (
                            <div className="relative">
                              <div className="flex space-x-2">
                                <span className="text-3xl">♪</span>
                                <span className="text-3xl">♪</span>
                                <span className="text-3xl">♪</span>
                                <span className="text-3xl">♪</span>
                              </div>
                              <div className="absolute top-1 left-2 right-2 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                            </div>
                          )}
                          {key === 'thirtysecond' && (
                            <div className="relative">
                              <div className="flex space-x-1">
                                {[...Array(8)].map((_, i) => (
                                  <span key={i} className="text-xl">♪</span>
                                ))}
                              </div>
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                              <div className="absolute top-1 left-0 right-0 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold">{note.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {note.subdivisions} per beat
                        </span>
                      </div>
                    </Button>

                    {/* Hand Pattern Button */}
                    <Button
                      onClick={() => cycleHandPattern(key)}
                      variant="outline"
                      className="w-full h-16 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-md hover:shadow-lg active:shadow-sm active:translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-red-600 dark:text-red-400">{handPatterns[key]}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hand Pattern</span>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Quarter Rest and Random Buttons */}
              <div className="flex justify-center items-center space-x-4 pt-4">
                <Button
                  onClick={() => addNote('rest')}
                  variant="outline"
                  className="px-8 py-4 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-2xl">𝄽</span>
                    <span className="text-red-600 dark:text-red-400">Quarter Rest</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 per beat</span>
                  </div>
                </Button>

                <Button
                  onClick={generateRandomSequence}
                  variant="outline"
                  className="px-8 py-4 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-2xl">🎲</span>
                    <span className="text-red-600 dark:text-red-400">RANDOM</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Generate Sequence</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BPM Control */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Tempo Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bpm" className="text-lg font-medium">BPM: {bpm[0]}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-center leading-tight font-bold">
                      <div>Auto</div>
                      <div>BPM</div>
                    </div>
                    <Switch
                      checked={autoBpmEnabled}
                      onCheckedChange={setAutoBpmEnabled}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                  {autoBpmEnabled && (
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {[4, 8, 16, 32].map((cycles) => (
                          <Button
                            key={cycles}
                            onClick={() => setAutoBpmCycles(cycles)}
                            variant={autoBpmCycles === cycles ? "default" : "outline"}
                            size="sm"
                            className={`w-10 h-8 text-xs ${
                              autoBpmCycles === cycles 
                                ? 'bg-red-600 text-white' 
                                : 'border-red-400 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {cycles}
                          </Button>
                        ))}
                      </div>
                      {isPlaying && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Cycle: {currentCycleCount + 1}/{autoBpmCycles}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {bpm[0] <= 80 ? 'Slow' : bpm[0] <= 120 ? 'Moderate' : bpm[0] <= 160 ? 'Fast' : 'Very Fast'}
                  </div>
                </div>
              </div>
              <Slider
                id="bpm"
                min={40}
                max={200}
                step={5}
                value={bpm}
                onValueChange={setBpm}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sequence Display */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader className="grid grid-cols-3 items-center py-6">
            {/* Left Column: Title */}
            <div className="flex justify-start">
              <CardTitle className="text-red-700 dark:text-red-300">Note Sequence</CardTitle>
            </div>
            
            {/* Center Column: Timer */}
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Activity Time
                </div>
              </div>
            </div>
            
            {/* Right Column: Clear All Button */}
            <div className="flex justify-end">
              {sequence.length > 0 && (
                <Button
                  onClick={clearSequence}
                  variant="outline"
                  size="sm"
                  className="border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:text-red-400 shadow-md hover:shadow-lg active:shadow-sm active:translate-y-0.5 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {sequence.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🥁</div>
                <p className="text-lg">No notes in sequence</p>
                <p className="text-sm">Add notes using the buttons above</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 p-4 bg-red-50 dark:bg-gray-800 rounded-lg min-h-20 items-center">
                  {sequence.map((note, index) => (
                    <div
                      key={note.id}
                      className="relative cursor-pointer transition-all duration-200 transform hover:scale-110"
                      onClick={() => removeNote(note.id)}
                      title={`Click to remove ${note.name}`}
                    >
                      {note.type === 'quarter' && (
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-bold mb-1 ${
                            note.handPattern === 'K' 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {note.handPattern}
                          </span>
                          <span className={`text-4xl transition-all duration-150 ${
                            currentNoteIndex === index && currentSubdivision === 0
                              ? 'text-red-600 scale-125 drop-shadow-lg'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>♩</span>
                        </div>
                      )}
                      {note.type === 'eighth' && (
                        <div className="flex space-x-4">
                          {note.circles.map((circle, circleIndex) => (
                            <div key={circle.id} className="flex flex-col items-center">
                              <span className={`text-xs font-bold mb-1 ${
                                note.handPattern.split('-')[circleIndex] === 'K' 
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {note.handPattern.split('-')[circleIndex]}
                              </span>
                              <span
                                className={`text-4xl transition-all duration-150 ${
                                  currentNoteIndex === index && currentSubdivision === circleIndex
                                    ? 'text-red-600 scale-125 drop-shadow-lg'
                                    : currentNoteIndex === index && currentSubdivision > circleIndex
                                    ? 'text-red-500'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >♪</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {note.type === 'triplet' && (
                        <div className="relative">
                          <div className="flex space-x-4">
                            {note.circles.map((circle, circleIndex) => (
                              <div key={circle.id} className="flex flex-col items-center">
                                <span className={`text-xs font-bold mb-1 ${
                                  note.handPattern.split('-')[circleIndex] === 'K' 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {note.handPattern.split('-')[circleIndex]}
                                </span>
                                <span
                                  className={`text-4xl transition-all duration-150 ${
                                    currentNoteIndex === index && currentSubdivision === circleIndex
                                      ? 'text-red-600 scale-125 drop-shadow-lg'
                                      : currentNoteIndex === index && currentSubdivision > circleIndex
                                      ? 'text-red-500'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >♪</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute -bottom-1 left-1 right-1 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                        </div>
                      )}
                      {note.type === 'sixteenth' && (
                        <div className="relative">
                          <div className="flex space-x-4">
                            {note.circles.map((circle, circleIndex) => (
                              <div key={circle.id} className="flex flex-col items-center">
                                <span className={`text-xs font-bold mb-1 ${
                                  note.handPattern.split('-')[circleIndex] === 'K' 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {note.handPattern.split('-')[circleIndex]}
                                </span>
                                <span
                                  className={`text-4xl transition-all duration-150 ${
                                    currentNoteIndex === index && currentSubdivision === circleIndex
                                      ? 'text-red-600 scale-125 drop-shadow-lg'
                                      : currentNoteIndex === index && currentSubdivision > circleIndex
                                      ? 'text-red-500'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >♪</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute top-6 left-3 right-3 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                        </div>
                      )}
                      {note.type === 'thirtysecond' && (
                        <div className="relative">
                          <div className="flex space-x-4">
                            {note.circles.map((circle, circleIndex) => (
                              <div key={circle.id} className="flex flex-col items-center">
                                <span className={`text-xs font-bold mb-1 ${
                                  note.handPattern.split('-')[circleIndex] === 'K' 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {note.handPattern.split('-')[circleIndex]}
                                </span>
                                <span
                                  className={`text-3xl transition-all duration-150 ${
                                    currentNoteIndex === index && currentSubdivision === circleIndex
                                      ? 'text-red-600 scale-125 drop-shadow-lg'
                                      : currentNoteIndex === index && currentSubdivision > circleIndex
                                      ? 'text-red-500'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >♪</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute top-6 left-1 right-1 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                          <div className="absolute top-6.5 left-1 right-1 h-0.5 bg-gray-800 dark:bg-gray-200"></div>
                        </div>
                      )}
                      {note.type === 'rest' && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 opacity-50">
                            {/* No hand pattern for rest */}
                          </span>
                          <span className={`text-4xl transition-all duration-150 ${
                            currentNoteIndex === index && currentSubdivision === 0
                              ? 'text-red-600 scale-125 drop-shadow-lg'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>𝄽</span>
                        </div>
                      )}
                      {currentNoteIndex === index && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Sequence length: {sequence.length} notes • Click any note to remove it
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Playback Controls */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={isPlaying ? stopPlayback : startPlayback}
                size="lg"
                className={`px-8 py-4 text-lg font-semibold border-2 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                  isPlaying
                    ? 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-600'
                    : 'bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-red-500'
                }`}
              >
                {isPlaying ? (
                  <Square className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4">How to use:</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>♩ Quarter Note:</strong> 1 hit per beat</li>
              <li>• <strong>♫ Eighth Note:</strong> 2 hits per beat</li>
              <li>• <strong>♪³ Triplet Note:</strong> 3 hits per beat</li>
              <li>• <strong>♬ Sixteenth Note:</strong> 4 hits per beat</li>
              <li>• <strong>♬ Thirty-second Note:</strong> 8 hits per beat</li>
              <li>• <strong>𝄽 Quarter Rest:</strong> 1 beat of silence (click sound only)</li>
              <li>• Click note buttons to add them to sequence</li>
              <li>• Click hand pattern buttons to cycle R/L patterns</li>
              <li>• Adjust BPM (40-200) for your comfort level</li>
              <li>• Use sound toggle to mute/unmute audio</li>
              <li>• Use click toggle to enable/disable metronome click</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <a
            href="https://app.emergent.sh/?utm_source=emergent-badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <img
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
              alt="Emergent Logo"
              className="w-6 h-6 rounded"
            />
            <span>Made with Emergent</span>
          </a>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default DrumRudimentsApp;