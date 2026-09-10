import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRepository, Severity, Status, Category } from '@/data/mockRepository';
import { SeverityBadge, StatusBadge } from '@/components/common/StatusBadge';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

type SortField = 'severity' | 'confidence' | 'title';
type SortDirection = 'asc' | 'desc';

const severityOrder: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

export function FindingsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities] = useState<Set<Severity>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(new Set());
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<'all' | Severity>('all');

  const filteredFindings = useMemo(() => {
    let results = mockRepository.findings;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.file.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by severity
    if (selectedSeverities.size > 0) {
      results = results.filter((f) => selectedSeverities.has(f.severity));
    }

    // Filter by category
    if (selectedCategories.size > 0) {
      results = results.filter((f) => selectedCategories.has(f.category));
    }

    // Filter by status
    if (selectedStatuses.size > 0) {
      results = results.filter((f) => selectedStatuses.has(f.status));
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      results = results.filter((f) => f.severity === activeTab);
    }

    // Sort
    results = [...results].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'severity') {
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortField === 'confidence') {
        comparison = a.confidence - b.confidence;
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [searchQuery, selectedSeverities, selectedCategories, selectedStatuses, activeTab, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFilter = <T,>(set: Set<T>, value: T, setter: (set: Set<T>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
  };

  const criticalCount = mockRepository.findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = mockRepository.findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = mockRepository.findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = mockRepository.findings.filter((f) => f.severity === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Findings</h1>
        <p className="text-muted-foreground">
          {mockRepository.findings.length} issues detected
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({mockRepository.findings.length})
        </button>
        <button
          onClick={() => setActiveTab('CRITICAL')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'CRITICAL'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setActiveTab('HIGH')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'HIGH'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          High ({highCount})
        </button>
        <button
          onClick={() => setActiveTab('MEDIUM')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'MEDIUM'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Medium ({mediumCount})
        </button>
        <button
          onClick={() => setActiveTab('LOW')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'LOW'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Low ({lowCount})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border rounded-md text-sm focus:outline-none focus:border-primary focus:bg-background transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <FilterDropdown
            icon={<Filter className="w-4 h-4" />}
            label="Category"
            items={['Security', 'Architecture', 'Build', 'Tests', 'Dependencies', 'Runtime']}
            selected={selectedCategories}
            onToggle={(item) =>
              toggleFilter(selectedCategories, item as Category, setSelectedCategories)
            }
          />
          <FilterDropdown
            icon={<Filter className="w-4 h-4" />}
            label="Status"
            items={['OPEN', 'INVESTIGATING', 'FIXED', 'VERIFIED', 'IGNORED']}
            selected={selectedStatuses}
            onToggle={(item) => toggleFilter(selectedStatuses, item as Status, setSelectedStatuses)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('severity')}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    Severity
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    Finding
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">File</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('confidence')}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    Confidence
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFindings.map((finding) => (
                <tr
                  key={finding.id}
                  onClick={() => navigate(`/findings/${finding.id}`)}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{finding.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{finding.category}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs">{finding.file}</code>
                  </td>
                  <td className="px-4 py-3 text-sm">{finding.confidence}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={finding.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFindings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No findings match your filters
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  icon: React.ReactNode;
  label: string;
  items: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
}

function FilterDropdown({ icon, label, items, selected, onToggle }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-muted/50 border rounded-md text-sm hover:bg-muted transition-colors"
      >
        {icon}
        {label}
        {selected.size > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-xs">
            {selected.size}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 z-20 w-48 bg-background border rounded-lg shadow-lg py-2">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => onToggle(item)}
                className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
              >
                <span>{item}</span>
                {selected.has(item) && <span className="text-primary">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
