import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Play, Square, Moon, Sun, Trash2, Settings, Download, Upload } from 'lucide-react';
// Toast imports removed - no popup messages

const DrumRudimentsApp = () => {
  const [sequence, setSequence] = useState([]);
  const [bpm, setBpm] = useState([70]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [currentSubdivision, setCurrentSubdivision] = useState(-1);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'pt'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [clickEnabled, setClickEnabled] = useState(true);
  const [clickOnWholeNote, setClickOnWholeNote] = useState(false);
  const [includeRest, setIncludeRest] = useState(false);
  const [drumKickEnabled, setDrumKickEnabled] = useState(false);
  const [bpmIncreaseTen, setBpmIncreaseTen] = useState(false); // BPM increase by 10 or 5
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  
  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Auto BPM increase states
  const [autoBpmEnabled, setAutoBpmEnabled] = useState(false);
  const [autoBpmCycles, setAutoBpmCycles] = useState(2); // 2, 4, 8, or 16
  const [autoBpmMinMax, setAutoBpmMinMax] = useState([70, 200]); // [min, max] BPM range
  const [currentCycleCount, setCurrentCycleCount] = useState(0);
  const [sequenceCompletions, setSequenceCompletions] = useState(0);
  
  // Accent mode state
  const [accentModeEnabled, setAccentModeEnabled] = useState(false);
  
  const [handPatterns, setHandPatterns] = useState({
    quarter: 'R',
    eighth: 'R-R',
    triplet: 'R-R-R',
    sixteenth: 'R-R-R-R',
    thirtysecond: 'R-R-R-R-R-R-R-R',
    rest: ''
  });

  // Translations
  const translations = {
    en: {
      title: 'Drum Rudiments Practice',
      saveSequence: 'Save Sequence',
      loadSequence: 'Load Sequence',
      clickOnPartNote: 'Enable Click on Part Note',
      clickOnWholeNote: 'Enable Click on Whole Note',
      enableSound: 'Enable Sound',
      kickDrum: 'Enable Kick Drum in Pattern',
      randomRest: 'Enable Rests in Random Sequence',
      bpmIncreaseTen: 'Enable Auto-increase BPM by 10',
      numberOfSequences: 'Sequences in Auto-BPM',
      addNotes: 'Add Notes to Sequence',
      quarterNote: 'Quarter Note',
      eighthNote: 'Eighth Note',
      tripletNote: 'Triplet Note',
      sixteenthNote: 'Sixteenth Note',
      thirtySecondNote: 'Thirty-second Note',
      quarterRest: 'Quarter Rest',
      handPattern: 'Hand Pattern',
      perBeat: 'per beat',
      random: 'Random',
      generateSequence: 'Generate Sequence',
      tempoControl: 'Tempo Control',
      autoBpm: 'Auto BPM',
      accentMode: 'Accent',
      sequence: 'Sequence',
      cycle: 'Cycle',
      slow: 'Slow',
      moderate: 'Moderate',
      fast: 'Fast',
      veryFast: 'Very Fast',
      noteSequence: 'Note Sequence',
      activityTime: 'Activity Time',
      currentBpm: 'Current BPM',
      currentSequence: 'Current Sequence',
      clearAll: 'Clear All',
      noSequence: 'No sequence yet',
      addNotesStart: 'Add notes to start practicing!',
      howToUse: 'How to use:',
      instructions: {
        quarter: '♩ Quarter Note: 1 hit per beat',
        eighth: '♫ Eighth Note: 2 hits per beat',
        triplet: '♪³ Triplet Note: 3 hits per beat',
        sixteenth: '♬ Sixteenth Note: 4 hits per beat',
        thirtySecond: '♬ Thirty-second Note: 8 hits per beat',
        rest: '𝄽 Quarter Rest: 1 beat of silence (click sound only)',
        clickNote: 'Click note buttons to add them to sequence',
        handPatternCycle: 'Click hand pattern buttons to cycle R/L patterns',
        adjustBpm: 'Adjust BPM (40-200) for your comfort level',
        soundToggle: 'Use sound toggle to mute/unmute audio',
        clickToggle: 'Use click toggle to enable/disable metronome click'
      },
      madeWith: 'Made with Emergent',
      noSequenceToSave: 'No sequence to save! Please add notes first.',
      sequenceLoadedSuccess: 'Sequence loaded successfully!',
      notesRestored: 'notes restored.',
      invalidSequenceFile: 'Invalid sequence file format!',
      errorLoadingSequence: 'Error loading sequence file. Please check the file format.'
    },
    pt: {
      title: 'Prática de Rudimentos de Bateria',
      saveSequence: 'Salvar Sequência',
      loadSequence: 'Carregar Sequência',
      clickOnPartNote: 'Ativar Click em Parte da Nota',
      clickOnWholeNote: 'Ativar Click em Nota Completa',
      enableSound: 'Ativar Som',
      kickDrum: 'Ativar Bumbo no Padrão',
      randomRest: 'Ativar Pausas em Sequência Aleatória',
      bpmIncreaseTen: 'Ativar Auto-incremento BPM em 10',
      numberOfSequences: 'Sequências no Auto-BPM',
      addNotes: 'Adicionar Notas à Sequência',
      quarterNote: 'Semínima',
      eighthNote: 'Colcheia',
      tripletNote: 'Tercina',
      sixteenthNote: 'Semicolcheia',
      thirtySecondNote: 'Fusa',
      quarterRest: 'Pausa',
      handPattern: 'Padrão de Mãos',
      perBeat: 'por tempo',
      random: 'Aleatório',
      generateSequence: 'Gerar Sequência',
      tempoControl: 'Controle de Tempo',
      autoBpm: 'BPM Automático',
      accentMode: 'Acento',
      sequence: 'Sequência',
      cycle: 'Ciclo',
      slow: 'Lento',
      moderate: 'Moderado',
      fast: 'Rápido',
      veryFast: 'Muito Rápido',
      noteSequence: 'Sequência de Notas',
      activityTime: 'Tempo de Atividade',
      currentBpm: 'BPM Atual',
      currentSequence: 'Sequência Atual',
      clearAll: 'Limpar Tudo',
      noSequence: 'Ainda não há sequência',
      addNotesStart: 'Adicione notas para começar a praticar!',
      howToUse: 'Como usar:',
      instructions: {
        quarter: '♩ Semínima: 1 batida por tempo',
        eighth: '♫ Colcheia: 2 batidas por tempo',
        triplet: '♪³ Tercina: 3 batidas por tempo',
        sixteenth: '♬ Semicolcheia: 4 batidas por tempo',
        thirtySecond: '♬ Fusa: 8 batidas por tempo',
        rest: '𝄽 Pausa de Semínima: 1 tempo de silêncio (apenas som de click)',
        clickNote: 'Clique nos botões de nota para adicioná-las à sequência',
        handPatternCycle: 'Clique nos botões de padrão de mãos para alternar padrões D/E',
        adjustBpm: 'Ajuste o BPM (40-200) para seu nível de conforto',
        soundToggle: 'Use o botão de som para ativar/desativar áudio',
        clickToggle: 'Use o botão de click para ativar/desativar metrônomo'
      },
      madeWith: 'Feito com Emergent',
      noSequenceToSave: 'Nenhuma sequência para salvar! Por favor, adicione notas primeiro.',
      sequenceLoadedSuccess: 'Sequência carregada com sucesso!',
      notesRestored: 'notas restauradas.',
      invalidSequenceFile: 'Formato de arquivo de sequência inválido!',
      errorLoadingSequence: 'Erro ao carregar arquivo de sequência. Por favor, verifique o formato do arquivo.'
    }
  };

  // Get current translations
  const t = translations[language];

  // Translate hand pattern letters based on language
  const translateHandPattern = (pattern) => {
    if (language === 'pt') {
      return pattern
        .replace(/R/g, 'D')  // Right -> Direita
        .replace(/L/g, 'E')  // Left -> Esquerda
        .replace(/K/g, 'B'); // Kick -> Bumbo
    }
    return pattern;
  };

  // Toast functionality removed

  // Auto BPM increase function
  const handleSequenceComplete = useCallback(() => {
    if (autoBpmEnabled) {
      const newCycleCount = currentCycleCount + 1;
      setCurrentCycleCount(newCycleCount);
      
      console.log(`Sequence completed: ${newCycleCount}/${autoBpmCycles}`);
      
      if (newCycleCount >= autoBpmCycles) {
        // Calculate new BPM
        const currentBpm = bpm[0];
        const bpmIncrement = bpmIncreaseTen ? 10 : 5;
        const maxBpm = autoBpmMinMax[1];
        let newBpm = currentBpm + bpmIncrement;
        
        // If exceeded max, restart from min
        if (newBpm > maxBpm) {
          newBpm = autoBpmMinMax[0];
          console.log(`BPM exceeded max (${maxBpm}), restarting from ${newBpm}`);
        }
        
        // Increase BPM and reset cycle count
        setBpm([newBpm]);
        setCurrentCycleCount(0);
        
        console.log(`BPM changed from ${currentBpm} to ${newBpm}`);
        
        // BPM increased - no toast notification needed
      }
    }
  }, [autoBpmEnabled, currentCycleCount, autoBpmCycles, bpm, setBpm, setCurrentCycleCount, bpmIncreaseTen, autoBpmMinMax]);

  // Auto BPM effect - monitors sequence completions
  useEffect(() => {
    if (autoBpmEnabled && sequenceCompletions > 0 && isPlaying) {
      const newCycleCount = sequenceCompletions;
      setCurrentCycleCount(newCycleCount);
      
      console.log(`Cycle updated: ${newCycleCount}/${autoBpmCycles}`);
      
      if (newCycleCount >= autoBpmCycles) {
        // Calculate new BPM
        const currentBpm = bpm[0];
        const bpmIncrement = bpmIncreaseTen ? 10 : 5;
        const maxBpm = autoBpmMinMax[1];
        let newBpm = currentBpm + bpmIncrement;
        
        // If exceeded max, restart from min
        if (newBpm > maxBpm) {
          newBpm = autoBpmMinMax[0];
          console.log(`BPM exceeded max (${maxBpm}), restarting from ${newBpm}`);
        }
        
        // Update BPM and reset counters
        setBpm([newBpm]);
        setCurrentCycleCount(0);
        setSequenceCompletions(0);
        
        console.log(`BPM changed from ${currentBpm} to ${newBpm}`);
        
        // BPM increased - no toast notification needed
      }
    }
  }, [sequenceCompletions, autoBpmEnabled, autoBpmCycles, bpm, isPlaying, bpmIncreaseTen, autoBpmMinMax]);

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
      name: t.quarterNote,
      subdivisions: 1,
      icon: '♩',
      width: 'w-16',
      height: 'h-16',
      circles: [{ id: 0 }]
    },
    eighth: {
      symbol: '♫',
      name: t.eighthNote,
      subdivisions: 2,
      icon: '♫',
      width: 'w-32',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }]
    },
    triplet: {
      symbol: '♪³',
      name: t.tripletNote,
      subdivisions: 3,
      icon: '♪³',
      width: 'w-48',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }]
    },
    sixteenth: {
      symbol: '♬',
      name: t.sixteenthNote,
      subdivisions: 4,
      icon: '♬',
      width: 'w-64',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
    },
    thirtysecond: {
      symbol: '♬',
      name: t.thirtySecondNote,
      subdivisions: 8,
      icon: '♬',
      width: 'w-full',
      height: 'h-16',
      circles: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }]
    },
    rest: {
      symbol: '𝄽',
      name: t.quarterRest,
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

  // Handle click type changes (mutually exclusive)
  const handleClickOnPartNote = (enabled) => {
    setClickEnabled(enabled);
    if (enabled) {
      setClickOnWholeNote(false);
    }
  };

  const handleClickOnWholeNote = (enabled) => {
    setClickOnWholeNote(enabled);
    if (enabled) {
      setClickEnabled(false);
    }
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuOpen && !event.target.closest('.relative')) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsMenuOpen]);

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

  // Remove note from sequence or toggle accents
  const removeNote = (noteId) => {
    if (accentModeEnabled) {
      // In accent mode, toggle accents instead of removing
      toggleNoteAccent(noteId);
    } else {
      // Normal mode: remove the note
      setSequence(prev => prev.filter(note => note.id !== noteId));
    }
  };
  
  // Toggle accent on a note
  const toggleNoteAccent = (noteId) => {
    setSequence(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      
      const subdivisions = note.subdivisions || 1;
      const currentAccents = note.accents || [];
      
      if (subdivisions === 1) {
        // Quarter note: toggle single accent
        return {
          ...note,
          accents: currentAccents.length === 0 ? [0] : []
        };
      } else {
        // Multiple subdivisions: cycle through accent positions
        // Find next accent state
        let nextAccents = [...currentAccents];
        
        if (currentAccents.length === 0) {
          // No accents -> accent on first subdivision
          nextAccents = [0];
        } else if (currentAccents.length === 1 && currentAccents[0] < subdivisions - 1) {
          // Single accent not on last -> move to next
          nextAccents = [currentAccents[0] + 1];
        } else if (currentAccents.length === 1 && currentAccents[0] === subdivisions - 1) {
          // Single accent on last -> accent on all
          nextAccents = Array.from({ length: subdivisions }, (_, i) => i);
        } else {
          // All accented -> remove all accents
          nextAccents = [];
        }
        
        return {
          ...note,
          accents: nextAccents
        };
      }
    }));
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
  }, [includeRest]);

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
    // Reset BPM to start value if Auto BPM is enabled
    if (autoBpmEnabled) {
      setBpm([autoBpmMinMax[0]]);
    }
  };

  // Save sequence to file
  const saveSequence = () => {
    if (sequence.length === 0) {
      alert(t.noSequenceToSave);
      return;
    }

    // Prepare data to save
    const sequenceData = {
      sequence: sequence.map(note => ({
        type: note.type,
        handPattern: note.handPattern
      })),
      handPatterns: handPatterns,
      bpm: bpm[0],
      savedAt: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(sequenceData, null, 2);
    
    // Format date for filename: dd-mm-yy_hh-mm-ss
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateStr = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drum_sequence_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load sequence from file
  const loadSequence = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate data structure
          if (!data.sequence || !Array.isArray(data.sequence)) {
            alert(t.invalidSequenceFile);
            return;
          }

          // Restore hand patterns if available
          if (data.handPatterns) {
            setHandPatterns(data.handPatterns);
          }

          // Restore BPM if available
          if (data.bpm) {
            setBpm([data.bpm]);
          }

          // Reconstruct sequence with full note data
          const restoredSequence = data.sequence.map(savedNote => ({
            id: Date.now() + Math.random(),
            type: savedNote.type,
            handPattern: savedNote.handPattern,
            ...noteTypes[savedNote.type]
          }));

          setSequence(restoredSequence);
          setCurrentNoteIndex(-1);
          setCurrentSubdivision(-1);
          
          alert(`${t.sequenceLoadedSuccess} ${restoredSequence.length} ${t.notesRestored}`);
        } catch (error) {
          alert(t.errorLoadingSequence);
          console.error('Load error:', error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
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
  const playMetronomeClick = useCallback((subdivisionIndex = 0) => {
    // If click on whole note is enabled, only play on first subdivision
    if (clickOnWholeNote && subdivisionIndex !== 0) {
      return;
    }
    
    // If neither click mode is enabled, don't play
    if (!clickEnabled && !clickOnWholeNote) return;

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
  }, [clickEnabled, clickOnWholeNote, getAudioContext]);

  // Play audio for note - improved version with rest handling and kick drum
  const playNoteSound = useCallback((hand = 'R', isRest = false, subdivisionIndex = 0) => {
    // Always play click regardless of rest or not
    playMetronomeClick(subdivisionIndex);

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
    playNoteSound(firstHand, isFirstRest, 0);

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

        playNoteSound(currentHand, isRest, subdivisionIndex);

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

        playNoteSound(nextHand, isNextRest, 0);

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
  }, [sequence, bpm, playNoteSound, getAudioContext, timerActive, autoBpmEnabled]);

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
            {t.title}
          </h1>
          <div className="flex items-center space-x-4 relative">
            {/* Language Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">EN</span>
              <Switch
                checked={language === 'pt'}
                onCheckedChange={(checked) => setLanguage(checked ? 'pt' : 'en')}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-blue-600"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">PT</span>
            </div>
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-red-600"
              />
              <Moon className="h-4 w-4" />
            </div>
            
            {/* Settings Button */}
            <Button
              onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
              variant="outline"
              size="sm"
              className="border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* Settings Menu Popup */}
            {settingsMenuOpen && (
              <div className="absolute top-12 right-0 z-50 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-2xl border-2 border-gray-300 dark:border-gray-600 w-80 overflow-hidden">
                {/* Save Sequence */}
                <div className="px-4 pt-3 pb-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <button
                    onClick={saveSequence}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.saveSequence}</span>
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Load Sequence */}
                <div className="px-4 pt-2 pb-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-b-2 border-gray-300 dark:border-gray-600">
                  <button
                    onClick={loadSequence}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.loadSequence}</span>
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Click on Part Note */}
                <div className="px-4 pt-3 pb-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.clickOnPartNote}</span>
                    <Switch
                      checked={clickEnabled}
                      onCheckedChange={handleClickOnPartNote}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
                
                {/* Click on Whole Note */}
                <div className="px-4 pt-2 pb-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-b-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.clickOnWholeNote}</span>
                    <Switch
                      checked={clickOnWholeNote}
                      onCheckedChange={handleClickOnWholeNote}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
                
                {/* Sound */}
                <div className="px-4 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-b-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.enableSound}</span>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
                
                {/* Kick Drum */}
                <div className="px-4 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-b-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.kickDrum}</span>
                    <Switch
                      checked={drumKickEnabled}
                      onCheckedChange={setDrumKickEnabled}
                      className="data-[state=checked]:bg-orange-600"
                    />
                  </div>
                </div>
                
                {/* Random Rest */}
                <div className="px-4 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-b-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.randomRest}</span>
                    <Switch
                      checked={includeRest}
                      onCheckedChange={setIncludeRest}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>
                
                {/* BPM Increase by 10 */}
                <div className="px-4 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.bpmIncreaseTen}</span>
                    <Switch
                      checked={bpmIncreaseTen}
                      onCheckedChange={setBpmIncreaseTen}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>
                
                {/* Number of Sequences */}
                <div className="px-4 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.numberOfSequences}</span>
                    <select
                      value={autoBpmCycles}
                      onChange={(e) => setAutoBpmCycles(Number(e.target.value))}
                      className="px-3 py-1 text-sm font-semibold rounded-md border-2 border-gray-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Note Selection Buttons */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">{t.addNotes}</CardTitle>
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
                          {note.subdivisions} {t.perBeat}
                        </span>
                      </div>
                    </Button>

                    {/* Hand Pattern Button */}
                    <Button
                      onClick={() => cycleHandPattern(key)}
                      variant="outline"
                      className="w-full h-16 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-md hover:shadow-lg active:shadow-sm active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-red-600 dark:text-red-400">{translateHandPattern(handPatterns[key])}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t.handPattern}</span>
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
                  className="w-[200px] px-8 py-4 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-2xl">𝄽</span>
                    <span className="text-red-600 dark:text-red-400">{t.quarterRest}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 {t.perBeat}</span>
                  </div>
                </Button>

                <Button
                  onClick={generateRandomSequence}
                  variant="outline"
                  className="w-[200px] px-8 py-4 text-lg font-bold border-2 border-red-400 bg-gradient-to-b from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 transform hover:scale-105 active:scale-100"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-2xl">🎲</span>
                    <span className="text-red-600 dark:text-red-400">{t.random}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t.generateSequence}</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BPM Control */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">{t.tempoControl}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bpm" className="text-lg font-medium">BPM: {bpm[0]}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-center leading-tight font-bold">
                      <div>{t.accentMode}</div>
                    </div>
                    <Switch
                      checked={accentModeEnabled}
                      onCheckedChange={setAccentModeEnabled}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-center leading-tight font-bold">
                      <div>{t.autoBpm.split(' ')[0]}</div>
                      <div>{t.autoBpm.split(' ')[1]}</div>
                    </div>
                    <Switch
                      checked={autoBpmEnabled}
                      onCheckedChange={setAutoBpmEnabled}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                </div>
              </div>
              
              {/* BPM Slider - shows range when Auto BPM is enabled */}
              {autoBpmEnabled ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-black dark:text-white font-semibold">
                      <span>Start: {autoBpmMinMax[0]} BPM</span>
                      <span>End: {autoBpmMinMax[1]} BPM</span>
                    </div>
                    <Slider
                      id="bpm-range"
                      min={40}
                      max={200}
                      step={bpmIncreaseTen ? 10 : 5}
                      value={autoBpmMinMax}
                      onValueChange={(value) => {
                        setAutoBpmMinMax(value);
                        // Set current BPM to start value
                        if (bpm[0] < value[0] || bpm[0] > value[1]) {
                          setBpm([value[0]]);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </>
              ) : (
                <Slider
                  id="bpm"
                  min={40}
                  max={200}
                  step={5}
                  value={bpm}
                  onValueChange={setBpm}
                  className="w-full"
                />
              )}
              
              {/* Speed indicator centered */}
              <div className="flex justify-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bpm[0] <= 80 ? t.slow : bpm[0] <= 120 ? t.moderate : bpm[0] <= 160 ? t.fast : t.veryFast}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sequence Display */}
        <Card className="border-red-200 dark:border-gray-700">
          <CardHeader className="grid grid-cols-5 items-center py-6 gap-4">
            {/* Left Column: Title */}
            <div className="flex justify-start">
              <CardTitle className="text-red-700 dark:text-red-300">{t.noteSequence}</CardTitle>
            </div>
            
            {/* Center-Left Column: Timer */}
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.activityTime}
                </div>
              </div>
            </div>
            
            {/* Center Column: Current BPM */}
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300">
                  {bpm[0]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.currentBpm}
                </div>
              </div>
            </div>
            
            {/* Center-Right Column: Current Sequence (only if autoBpmEnabled) */}
            <div className="flex justify-center">
              {autoBpmEnabled && isPlaying && (
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300">
                    {currentCycleCount + 1}/{autoBpmCycles}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t.currentSequence}
                  </div>
                </div>
              )}
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
                  {t.clearAll}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {sequence.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🥁</div>
                <p className="text-lg">{t.noSequence}</p>
                <p className="text-sm">{t.addNotesStart}</p>
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
                          {note.accents && note.accents.includes(0) && (
                            <span className="text-lg font-bold text-red-700 dark:text-red-300 mb-[-4px]">&gt;</span>
                          )}
                          <span className={`text-xs font-bold mb-1 ${
                            note.handPattern === 'K' 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {translateHandPattern(note.handPattern)}
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
                              {note.accents && note.accents.includes(circleIndex) && (
                                <span className="text-lg font-bold text-red-700 dark:text-red-300 mb-[-4px]">&gt;</span>
                              )}
                              <span className={`text-xs font-bold mb-1 ${
                                note.handPattern.split('-')[circleIndex] === 'K' 
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {translateHandPattern(note.handPattern.split('-')[circleIndex])}
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
                                {note.accents && note.accents.includes(circleIndex) && (
                                  <span className="text-lg font-bold text-red-700 dark:text-red-300 mb-[-4px]">&gt;</span>
                                )}
                                <span className={`text-xs font-bold mb-1 ${
                                  note.handPattern.split('-')[circleIndex] === 'K' 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {translateHandPattern(note.handPattern.split('-')[circleIndex])}
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
                                  {translateHandPattern(note.handPattern.split('-')[circleIndex])}
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
                                  {translateHandPattern(note.handPattern.split('-')[circleIndex])}
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
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4">{t.howToUse}</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {t.instructions.quarter}</li>
              <li>• {t.instructions.eighth}</li>
              <li>• {t.instructions.triplet}</li>
              <li>• {t.instructions.sixteenth}</li>
              <li>• {t.instructions.thirtySecond}</li>
              <li>• {t.instructions.rest}</li>
              <li>• {t.instructions.clickNote}</li>
              <li>• {t.instructions.handPatternCycle}</li>
              <li>• {t.instructions.adjustBpm}</li>
              <li>• {t.instructions.soundToggle}</li>
              <li>• {t.instructions.clickToggle}</li>
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
            <span>{t.madeWith}</span>
          </a>
        </div>
      </div>
      {/* Toaster removed - no popup messages */}
    </div>
  );
};

export default DrumRudimentsApp;