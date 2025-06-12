import { ListChecks } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <ListChecks className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-headline font-bold text-primary">TaskZen</h1>
      </div>
    </header>
  );
}
