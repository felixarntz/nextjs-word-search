'use client';

import { useState } from 'react';
import debounce from 'debounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type AutocompleteInputProps = {
  onChange?: (value: string) => void;
};

const getSuggestions = async (input: string) => {
  const response = await fetch('/api/input-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.matches;
  } else {
    console.error('Error fetching suggestions:', response.statusText);
    return [];
  }
};

let wordList: string[] | null = null;

const wordsMap: Record<string, string[]> = {};

const alternativeGetSuggestions = async (input: string) => {
  if (!wordList) {
    const response = await fetch('/api/wordlist');
    if (response.ok) {
      const data: { wordList: string[] } = await response.json();
      wordList = data.wordList;
      wordList.forEach((word) => {
        const firstChar = word.charAt(0);
        if (!wordsMap[firstChar]) {
          wordsMap[firstChar] = [];
        }
        wordsMap[firstChar].push(word);
      });
    } else {
      console.error('Error fetching word list:', response.statusText);
      return [];
    }
  }

  const firstChar = input.charAt(0);
  if (wordsMap[firstChar]) {
    return wordsMap[firstChar].filter((word) => word.startsWith(input));
  }

  return [];
};

const MAX_RESULTS_PER_PAGE = 10;

const updateSuggestions = async (
  value: string,
  setSuggestions: (suggestions: string[]) => void,
  setPageIndex: (index: number) => void,
) => {
  if (value.trim() === '') {
    setSuggestions([]);
    setPageIndex(0);
    return;
  }
  const matches = await getSuggestions(value);
  setSuggestions(matches);
  setPageIndex(0);
};

const debouncedUpdateSuggestions = debounce(updateSuggestions, 300);

export function AutocompleteInput({ onChange }: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const maxPages = Math.ceil(suggestions.length / MAX_RESULTS_PER_PAGE);
  const paginatedSuggestions = suggestions.slice(
    pageIndex * MAX_RESULTS_PER_PAGE,
    (pageIndex + 1) * MAX_RESULTS_PER_PAGE,
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedUpdateSuggestions(value, setSuggestions, setPageIndex);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div>
      <Label
        htmlFor="autocomplete-input"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        Search Words:
      </Label>
      <Input
        id="autocomplete-input"
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type to search..."
        aria-autocomplete="list"
        aria-controls="autocomplete-suggestions"
      />
      <div role="region" id="autocomplete-suggestions" aria-live="polite">
        {suggestions.length > 0 && (
          <>
            <div className="mt-2 border border-gray-300 rounded-md max-h-60 overflow-y-auto">
              {paginatedSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-200 cursor-pointer${suggestion === selectedItem ? ' bg-accent' : ''}`}
                  onClick={() => {
                    setSelectedItem(suggestion);
                    console.log(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
            {(suggestions.length > MAX_RESULTS_PER_PAGE || pageIndex > 0) && (
              <Pagination>
                <PaginationContent>
                  {pageIndex > 0 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPageIndex(pageIndex - 1)}
                      />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink isActive>
                      {`${pageIndex + 1}`}
                    </PaginationLink>
                  </PaginationItem>
                  {maxPages > pageIndex + 1 && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPageIndex(pageIndex + 1)}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}
