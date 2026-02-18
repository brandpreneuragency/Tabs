import { ModelCategory } from '../types';

export const DEFAULT_MODEL_ID = 'meta-llama/llama-4-maverick:free';

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    id: 'heavyweights',
    label: 'The Heavyweights (Highest Quality)',
    models: [
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', vibe: 'Highly natural, human-sounding tone' },
      { id: 'openai/gpt-5', name: 'GPT-5', vibe: 'Industry standard, precise formatting' },
      { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', vibe: 'Massive context, great for research' },
    ],
  },
  {
    id: 'speedsters',
    label: 'The Speedsters (Fast & Cheap)',
    models: [
      { id: 'google/gemini-3-flash', name: 'Gemini 3 Flash', vibe: 'Ultra-fast, excellent instruction following' },
      { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', vibe: 'Lightweight, instant grammar fixes' },
      { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', vibe: 'Lightning-fast open-source' },
    ],
  },
  {
    id: 'free_openrouter',
    label: 'Completely Free (via OpenRouter)',
    models: [
      { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (Free)', vibe: 'Fastest free model for quick edits' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', vibe: 'Best free logic and reasoning' },
      { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro Exp (Free)', vibe: 'Massive 1M token context window' },
    ],
  },
];
