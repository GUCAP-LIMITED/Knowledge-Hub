import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { formatDuration, normalizeDuration, parseDuration } from '@shared/utils';

export type DurationValue = string | number;

/** Formats an incoming value into initial text display */
export const toInitialDurationText = (
  value: DurationValue | undefined,
  mode: 'seconds' | 'string',
): string => {
  if (value === undefined || value === '') {
    return '';
  }
  if (mode === 'seconds' && typeof value === 'number') {
    return value > 0 ? formatDuration(value, { emptyFallback: '' }) : '';
  }
  return String(value);
};

export interface UseDurationDraftParams {
  readonly value: DurationValue | undefined;
  readonly resolvedMode: 'seconds' | 'string';
  readonly onChange?: ((value: DurationValue, totalSeconds: number) => void) | undefined;
}

export interface UseDurationDraftResult {
  readonly textValue: string;
  readonly totalSeconds: number;
  readonly canonicalText: string;
  readonly hasLiveDifference: boolean;
  readonly handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleBlur: () => void;
  readonly handleClear: () => void;
  readonly handlePresetSelect: (preset: string) => void;
  readonly handleFocus: () => void;
}

export const useDurationDraft = ({
  value,
  resolvedMode,
  onChange,
}: UseDurationDraftParams): UseDurationDraftResult => {
  const [textValue, setTextValue] = useState<string>(() =>
    toInitialDurationText(value, resolvedMode),
  );
  // Tracks the last value seen OR emitted, so a parent echoing our own emission back
  // (controlled usage) never overwrites what the user is mid-way through typing.
  const prevValueRef = useRef<DurationValue | undefined>(value);

  const emit = (nextValue: DurationValue, nextSeconds: number): void => {
    prevValueRef.current = nextValue;
    onChange?.(nextValue, nextSeconds);
  };

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setTextValue(toInitialDurationText(value, resolvedMode));
    }
  }, [value, resolvedMode]);

  const totalSeconds = parseDuration(textValue);
  const canonicalText = totalSeconds > 0 ? normalizeDuration(textValue) : '';
  const hasLiveDifference =
    totalSeconds > 0 &&
    canonicalText !== '' &&
    canonicalText.toLowerCase() !== textValue.trim().toLowerCase();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const nextText = e.target.value;
    setTextValue(nextText);
    const parsedSecs = parseDuration(nextText);
    emit(resolvedMode === 'seconds' ? parsedSecs : nextText, parsedSecs);
  };

  const handleBlur = (): void => {
    if (textValue.trim() !== '') {
      const normalized = normalizeDuration(textValue);
      if (normalized !== '' && normalized !== textValue) {
        setTextValue(normalized);
        const parsedSecs = parseDuration(normalized);
        emit(resolvedMode === 'seconds' ? parsedSecs : normalized, parsedSecs);
      }
    }
  };

  const handleClear = (): void => {
    setTextValue('');
    emit(resolvedMode === 'seconds' ? 0 : '', 0);
  };

  const handlePresetSelect = (preset: string): void => {
    const normalized = normalizeDuration(preset);
    const parsedSecs = parseDuration(normalized);
    setTextValue(normalized);
    emit(resolvedMode === 'seconds' ? parsedSecs : normalized, parsedSecs);
  };

  return {
    textValue,
    totalSeconds,
    canonicalText,
    hasLiveDifference,
    handleChange,
    handleBlur,
    handleClear,
    handlePresetSelect,
    handleFocus: () => {
      // focus handler hook slot
    },
  };
};
