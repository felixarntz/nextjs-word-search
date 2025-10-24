import { readFileSync } from 'node:fs';
import { NextResponse } from 'next/server';

const wordFileContent = readFileSync('src/app/api/input-match/wordlist.txt', 'utf-8');
const wordList = wordFileContent.split('\n').map(word => word.trim()).filter(word => word.length > 0);

const wordsMap: Record<string, string[]> = {};
wordList.forEach(word => {
  const firstChar = word.charAt(0);
  const secondChar = word.charAt(1);
  if (!wordsMap[firstChar]) {
    wordsMap[firstChar] = [];
  }
  wordsMap[firstChar].push(word);
  if (!wordsMap[firstChar + secondChar]) {
    wordsMap[firstChar + secondChar] = [];
  }
  wordsMap[firstChar + secondChar].push(word);
});

export async function POST(request: Request) {
  const body = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'Request body is required.' }, { status: 400 });
  }

  if (typeof body.input !== 'string' || body.input.trim() === '') {
    return NextResponse.json({ error: 'Invalid input provided.' }, { status: 400 });
  }

  const input = body.input.trim();
  let matchingWords: string[] = [];

  const firstChar = input.charAt(0);
  const secondChar = input.charAt(1);
  if (secondChar && wordsMap[firstChar + secondChar]) {
    matchingWords = wordsMap[firstChar + secondChar].filter(word => word.startsWith(input));
  } else if (wordsMap[firstChar]) {
    matchingWords = wordsMap[firstChar].filter(word => word.startsWith(input));
  }

  return NextResponse.json({ matches: matchingWords } );
}
