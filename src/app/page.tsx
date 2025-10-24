import Image from 'next/image';
import { AutocompleteInput } from '@/components/autocomplete-input';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <AutocompleteInput />
      </main>
    </div>
  );
}
