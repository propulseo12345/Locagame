import { useState, useRef, useCallback, useEffect } from 'react';
import { searchAddresses, type AddressSuggestion } from '../../services/distance.service';

export type { AddressSuggestion };

export function useAddressAutocomplete(
  onAddressSelected: (address: AddressSuggestion) => void
) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedAddress(null);

    abortRef.current?.abort();
    clearTimeout(debounceRef.current);

    if (value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      setIsLoading(true);
      try {
        const results = await searchAddresses(value, abortRef.current.signal);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, []);

  const handleSelect = useCallback((suggestion: AddressSuggestion) => {
    setQuery(suggestion.street || suggestion.label);
    setSelectedAddress(suggestion);
    setSuggestions([]);
    setIsOpen(false);
    onAddressSelected(suggestion);
  }, [onAddressSelected]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) setIsOpen(true);
  }, [suggestions]);

  useEffect(() => () => {
    abortRef.current?.abort();
    clearTimeout(debounceRef.current);
  }, []);

  return {
    query, suggestions, isLoading, isOpen, selectedAddress,
    handleInputChange, handleSelect, handleBlur, handleFocus, inputRef,
  };
}
