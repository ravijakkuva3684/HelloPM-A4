'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { listenToSpeech, interpretVoiceCommand, VoiceActionResult } from '@/lib/speech';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { tasks, categories, createTask, toggleTaskStatus, deleteTask } = useTasks();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [actionResult, setActionResult] = useState<VoiceActionResult | null>(null);
  const [executionMessage, setExecutionMessage] = useState('');

  // Start listening as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      startListeningSession();
    } else {
      setIsListening(false);
      setTranscript('');
      setActionResult(null);
      setExecutionMessage('');
    }
  }, [isOpen]);

  const startListeningSession = () => {
    setTranscript('');
    setActionResult(null);
    setExecutionMessage('');
    setIsListening(true);

    listenToSpeech({
      onResult: (spokenText, isFinal) => {
        setTranscript(spokenText);
        if (isFinal && spokenText.trim().length > 2) {
          const result = interpretVoiceCommand(spokenText, tasks, categories);
          setActionResult(result);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  if (!isOpen) return null;

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!actionResult) return;

    if (actionResult.type === 'create_task' && actionResult.parsedTask) {
      await createTask({
        title: actionResult.parsedTask.title,
        category_id: actionResult.parsedTask.category_id,
        due_date: actionResult.parsedTask.due_date,
        due_time: actionResult.parsedTask.due_time,
        priority: actionResult.parsedTask.priority,
        reminder_lead_minutes: actionResult.parsedTask.reminder_lead_minutes,
      });
      setExecutionMessage(`Created task: "${actionResult.parsedTask.title}"!`);
      try {
        soundManager.playComplete();
        confetti({ particleCount: 40, spread: 60 });
      } catch {}
    } else if (actionResult.type === 'complete_task' && actionResult.task) {
      await toggleTaskStatus(actionResult.task.id);
      setExecutionMessage(`Marked "${actionResult.task.title}" as completed!`);
      try {
        soundManager.playComplete();
        confetti({ particleCount: 40, spread: 60 });
      } catch {}
    } else if (actionResult.type === 'delete_task' && actionResult.task) {
      await deleteTask(actionResult.task.id);
      setExecutionMessage(`Deleted task: "${actionResult.task.title}"!`);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-pop-in relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title & Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-1">
            <Volume2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Remindly Voice Assistant
          </h3>
          <p className="text-xs text-slate-400">
            Speak naturally to add tasks, complete items, or check updates.
          </p>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          <button
            type="button"
            onClick={startListeningSession}
            className={`h-20 w-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30 scale-110 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
            }`}
            title="Click to speak"
          >
            {isListening ? <Mic className="h-9 w-9 animate-bounce" /> : <Mic className="h-9 w-9" />}
          </button>
          
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isListening ? 'Listening... Speak now' : 'Tap microphone to speak'}
          </span>
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">HEARD:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-100 italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* CONFIRMATION POPUP FOR ANY SPEECH ACTION */}
        {actionResult && !executionMessage && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-pop-in">
            <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span>Action Confirmation</span>
              </span>
              <span className="text-[10px] uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-xs">
                {actionResult.type.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              {actionResult.message}
            </p>

            {/* Action Buttons: Confirm, Cancel, Do Again */}
            <div className="flex items-center gap-2 pt-1">
              {actionResult.type !== 'query_updates' && (
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirm Action</span>
                </button>
              )}

              <button
                type="button"
                onClick={startListeningSession}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Speak Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Execution Message */}
        {executionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{executionMessage}</span>
          </div>
        )}

        {/* Hints */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <div>💡 Try saying:</div>
          <div className="font-medium text-slate-500">
            • "Add task submit report tomorrow at 3 PM"<br/>
            • "Mark electricity bill complete"<br/>
            • "What tasks do I have today?"
          </div>
        </div>
      </div>
    </div>
  );
};
