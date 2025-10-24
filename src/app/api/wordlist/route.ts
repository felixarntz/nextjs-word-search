import { readFileSync } from 'node:fs';
import { NextResponse } from 'next/server';

const wordFileContent = readFileSync(
  'src/app/api/input-match/wordlist.txt',
  'utf-8',
);
const wordList = wordFileContent
  .split('\n')
  .map((word) => word.trim())
  .filter((word) => word.length > 0);

export async function GET() {
  return NextResponse.json({ wordList });
}
