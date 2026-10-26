import { addDays, format, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday, parseISO, setHours, setMinutes } from 'date-fns';
import { Category, PriorityLevel, Task } from '@/types';

// Declare types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface ParsedTaskResult {
  title: string;
  category_id: string | null;
  category_name?: string;
  due_date: string | null;
  due_time: string | null;
  reminder_lead_minutes: number;
  priority: PriorityLevel;
  rawText: string;
}

export type VoiceActionType = 
  | 'create_task' 
  | 'complete_task' 
  | 'delete_task' 
  | 'query_updates';

export interface VoiceActionResult {
  type: VoiceActionType;
  transcript: string;
  task?: Task;
  parsedTask?: ParsedTaskResult;
  message?: string;
}

/**
 * Checks if browser supports Speech Recognition
 */
export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Creates and starts speech recognition instance
 */
export function listenToSpeech(options: {
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}): () => void {
  if (!isSpeechSupported()) {
    if (options.onError) options.onError('Speech recognition is not supported in this browser.');
    return () => {};
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const text = finalTranscript || interimTranscript;
    options.onResult(text, Boolean(finalTranscript));
  };

  recognition.onerror = (event: any) => {
    if (options.onError) {
      options.onError(event.error || 'Speech recognition error');
    }
  };

  recognition.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  try {
    recognition.start();
  } catch (err) {
    if (options.onError) options.onError('Could not start microphone');
  }

  // Return cancel/stop function
  return () => {
    try {
      recognition.stop();
    } catch {}
  };
}

/**
 * Natural Language Parser for Voice and Text Task Creation
 * Extracts Title, Category, Due Date, Time, Reminder Lead, and Priority.
 */
export function parseNaturalLanguageTask(
  rawInput: string,
  categories: Category[]
): ParsedTaskResult {
  const text = rawInput.trim();
  let remainingText = text;

  // 1. Extract Reminder Lead Minutes (e.g., "remind me two hours before", "remind me 30 mins before")
  let reminderMinutes = 15; // default 15 mins
  const reminderMatch = remainingText.match(/remind\s+(?:me\s+)?(\d+|one|two|three|four|five|six|half|ten|fifteen|thirty)?\s*(hour|hr|minute|min|mins|hours)?\s*(?:before|prior)/i);
  if (reminderMatch) {
    const qtyStr = reminderMatch[1]?.toLowerCase() || '1';
    const unit = reminderMatch[2]?.toLowerCase() || 'minute';

    let qty = 1;
    if (qtyStr === 'half') qty = 0.5;
    else if (qtyStr === 'one') qty = 1;
    else if (qtyStr === 'two') qty = 2;
    else if (qtyStr === 'three') qty = 3;
    else if (qtyStr === 'four') qty = 4;
    else if (qtyStr === 'ten') qty = 10;
    else if (qtyStr === 'fifteen') qty = 15;
    else if (qtyStr === 'thirty') qty = 30;
    else if (!isNaN(Number(qtyStr))) qty = Number(qtyStr);

    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      reminderMinutes = Math.round(qty * 60);
    } else {
      reminderMinutes = Math.round(qty);
    }

    remainingText = remainingText.replace(reminderMatch[0], ' ');
  }

  // 2. Extract Time (e.g., "at 6 PM", "6:30 PM", "at 14:00", "at noon")
  let dueTime: string | null = null;
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i;
  const timeMatch = remainingText.match(timeRegex);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase().replace(/\./g, '');

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    remainingText = remainingText.replace(timeMatch[0], ' ');
  } else if (/at\s+noon/i.test(remainingText)) {
    dueTime = '12:00';
    remainingText = remainingText.replace(/at\s+noon/i, ' ');
  } else if (/in\s+the\s+morning/i.test(remainingText)) {
    dueTime = '09:00';
    remainingText = remainingText.replace(/in\s+the\s+morning/i, ' ');
  } else if (/in\s+the\s+evening/i.test(remainingText)) {
    dueTime = '18:00';
    remainingText = remainingText.replace(/in\s+the\s+evening/i, ' ');
  }

  // 3. Extract Date (e.g., "today", "tomorrow", "this Friday", "next Monday", "Oct 30")
  let dueDate: string | null = format(new Date(), 'yyyy-MM-dd'); // default to today
  const today = new Date();

  if (/\b(?:today|tonight)\b/i.test(remainingText)) {
    dueDate = format(today, 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:today|tonight)\b/i, ' ');
  } else if (/\btomorrow\b/i.test(remainingText)) {
    dueDate = format(addDays(today, 1), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\btomorrow\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?friday\b/i.test(remainingText)) {
    dueDate = format(nextFriday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?friday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?monday\b/i.test(remainingText)) {
    dueDate = format(nextMonday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?monday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?tuesday\b/i.test(remainingText)) {
    dueDate = format(nextTuesday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?tuesday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?wednesday\b/i.test(remainingText)) {
    dueDate = format(nextWednesday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?wednesday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?thursday\b/i.test(remainingText)) {
    dueDate = format(nextThursday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?thursday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?saturday\b/i.test(remainingText)) {
    dueDate = format(nextSaturday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?saturday\b/i, ' ');
  } else if (/\b(?:this\s+|next\s+)?sunday\b/i.test(remainingText)) {
    dueDate = format(nextSunday(today), 'yyyy-MM-dd');
    remainingText = remainingText.replace(/\b(?:this\s+|next\s+)?sunday\b/i, ' ');
  }

  // 4. Extract Priority
  let priority: PriorityLevel = 'medium';
  if (/\b(?:urgent|asap|critically|critical)\b/i.test(remainingText)) {
    priority = 'urgent';
    remainingText = remainingText.replace(/\b(?:urgent|asap|critically|critical)\b/i, ' ');
  } else if (/\b(?:high\s+priority|important|top\s+priority)\b/i.test(remainingText)) {
    priority = 'high';
    remainingText = remainingText.replace(/\b(?:high\s+priority|important|top\s+priority)\b/i, ' ');
  } else if (/\b(?:low\s+priority|whenever|minor)\b/i.test(remainingText)) {
    priority = 'low';
    remainingText = remainingText.replace(/\b(?:low\s+priority|whenever|minor)\b/i, ' ');
  }

  // 5. Match or Auto-assign Category
  let matchedCategoryId: string | null = null;
  let matchedCategoryName = '';

  // Check explicit category mention in speech
  for (const cat of categories) {
    const catRegex = new RegExp(`\\b(?:in|under|category)?\\s*${cat.name}\\b`, 'i');
    if (catRegex.test(remainingText)) {
      matchedCategoryId = cat.id;
      matchedCategoryName = cat.name;
      remainingText = remainingText.replace(catRegex, ' ');
      break;
    }
  }

  // If no explicit category, use keyword heuristics
  if (!matchedCategoryId) {
    const lower = text.toLowerCase();
    if (/bill|electricity|tax|pay|salary|bank|finance|rent|invoice/i.test(lower)) {
      const financeCat = categories.find((c) => /finance|money|bill/i.test(c.name));
      if (financeCat) {
        matchedCategoryId = financeCat.id;
        matchedCategoryName = financeCat.name;
      }
    } else if (/doctor|health|gym|workout|medicine|walk|water|exercise/i.test(lower)) {
      const healthCat = categories.find((c) => /health|fitness|wellness/i.test(c.name));
      if (healthCat) {
        matchedCategoryId = healthCat.id;
        matchedCategoryName = healthCat.name;
      }
    } else if (/meeting|presentation|client|project|review|team|deliverable|code/i.test(lower)) {
      const workCat = categories.find((c) => /work|office|job/i.test(c.name));
      if (workCat) {
        matchedCategoryId = workCat.id;
        matchedCategoryName = workCat.name;
      }
    } else if (/book|read|study|course|lesson/i.test(lower)) {
      const readCat = categories.find((c) => /read|learn|study/i.test(c.name));
      if (readCat) {
        matchedCategoryId = readCat.id;
        matchedCategoryName = readCat.name;
      }
    }
  }

  // 6. Clean up remaining text to form the Clean Title
  let title = remainingText
    .replace(/^(?:please\s+)?(?:remind\s+me\s+to|add\s+task|create\s+task|add\s+new\s+task|add|schedule|set\s+a\s+reminder\s+to)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = 'New Task';
  }

  return {
    title,
    category_id: matchedCategoryId,
    category_name: matchedCategoryName,
    due_date: dueDate,
    due_time: dueTime,
    reminder_lead_minutes: reminderMinutes,
    priority,
    rawText: text,
  };
}

/**
 * Classify a free-speech command into an action
 */
export function interpretVoiceCommand(
  speechText: string,
  tasks: Task[],
  categories: Category[]
): VoiceActionResult {
  const text = speechText.trim();
  const lower = text.toLowerCase();

  // 1. Check for Query / Update requests
  if (
    /what.*(?:task|update|agenda|schedule|plan)/i.test(lower) ||
    /check.*update/i.test(lower) ||
    /any.*update/i.test(lower) ||
    /daily.*summary/i.test(lower) ||
    /tell.*day/i.test(lower)
  ) {
    return {
      type: 'query_updates',
      transcript: text,
      message: 'Checking your tasks and schedule for today...',
    };
  }

  // 2. Check for "Complete / Mark Done"
  if (/^(?:mark|complete|finish|check off|done with)\s+/i.test(lower)) {
    const searchPart = lower
      .replace(/^(?:mark|complete|finish|check off|done with)\s+/i, '')
      .replace(/\s+(?:as\s+completed|as\s+done|task)?/i, '')
      .trim();

    // Find best task match
    const matchedTask = tasks.find((t) => 
      t.title.toLowerCase().includes(searchPart) || 
      searchPart.includes(t.title.toLowerCase())
    );

    return {
      type: 'complete_task',
      transcript: text,
      task: matchedTask,
      message: matchedTask
        ? `Mark "${matchedTask.title}" as completed?`
        : `Could not find an active task matching "${searchPart}".`,
    };
  }

  // 3. Check for "Delete / Remove"
  if (/^(?:delete|remove|cancel|discard)\s+/i.test(lower)) {
    const searchPart = lower
      .replace(/^(?:delete|remove|cancel|discard)\s+(?:task\s+)?/i, '')
      .trim();

    const matchedTask = tasks.find((t) => 
      t.title.toLowerCase().includes(searchPart) || 
      searchPart.includes(t.title.toLowerCase())
    );

    return {
      type: 'delete_task',
      transcript: text,
      task: matchedTask,
      message: matchedTask
        ? `Permanently delete task "${matchedTask.title}"?`
        : `Could not find a task matching "${searchPart}".`,
    };
  }

  // 4. Default: Parse as "Create New Task"
  const parsed = parseNaturalLanguageTask(text, categories);
  return {
    type: 'create_task',
    transcript: text,
    parsedTask: parsed,
    message: `Create new task: "${parsed.title}"?`,
  };
}
