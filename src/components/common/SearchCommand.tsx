import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileCode, AlertTriangle, Package, GitCommit } from 'lucide-react';
import { mockRepository } from '@/data/mockRepository';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'files' | 'symbols' | 'findings' | 'dependencies' | 'commits';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  path: string;
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Would open search here
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mock search results
  const allResults: SearchResult[] = [
    // Files
    { id: '1', title: 'container.ts', subtitle: 'src/runtime/', category: 'files', path: '/findings/1' },
    { id: '2', title: 'server.ts', subtitle: 'src/preview/', category: 'files', path: '/findings/1' },
    { id: '3', title: 'auth.ts', subtitle: 'src/auth/', category: 'files', path: '/findings/2' },
    // Findings
    ...mockRepository.findings.slice(0, 3).map((f) => ({
      id: f.id,
      title: f.title,
      subtitle: f.category,
      category: 'findings' as SearchCategory,
      path: `/findings/${f.id}`,
    })),
    // Dependencies
    { id: 'd1', title: 'lodash', subtitle: '4.17.19 (vulnerable)', category: 'dependencies' as SearchCategory, path: '/dependencies' },
    { id: 'd2', title: 'axios', subtitle: '0.21.1 (vulnerable)', category: 'dependencies' as SearchCategory, path: '/dependencies' },
    // Commits
    { id: 'c1', title: 'Fix preview runtime', subtitle: 'repo-doctor/fix-preview-runtime', category: 'commits' as SearchCategory, path: '/history' },
  ];

  const filteredResults = query
    ? allResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
    setQuery('');
  };

  const categoryIcons = {
    files: FileCode,
    symbols: FileCode,
    findings: AlertTriangle,
    dependencies: Package,
    commits: GitCommit,
  };

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<SearchCategory, SearchResult[]>);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-32">
      <div className="w-full max-w-2xl bg-background border rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repository..."
            className="flex-1 bg-transparent outline-none text-sm"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedResults).map(([category, results]) => {
            const Icon = categoryIcons[category as SearchCategory];
            return (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase bg-muted/30">
                  {category}
                </div>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}

          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground bg-muted/30">
          <span>Type to search</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background border rounded">↑↓</kbd>
            <span>to navigate</span>
            <kbd className="px-2 py-1 bg-background border rounded">↵</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
