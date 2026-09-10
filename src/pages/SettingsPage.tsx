import { Settings, Github, Shield, Bell, Zap, Users, CreditCard } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your repository and scan preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {[
            { icon: Settings, label: 'Repository', active: true },
            { icon: Zap, label: 'Analysis', active: false },
            { icon: Shield, label: 'Security', active: false },
            { icon: Zap, label: 'AI Models', active: false },
            { icon: Bell, label: 'Notifications', active: false },
            { icon: Github, label: 'GitHub', active: false },
            { icon: Users, label: 'Team', active: false },
            { icon: CreditCard, label: 'Billing', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Repository Settings */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Repository Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Repository Name</label>
                <input
                  type="text"
                  value="we0"
                  readOnly
                  className="w-full px-3 py-2 bg-muted border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Branch</label>
                <select className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm">
                  <option>main</option>
                  <option>develop</option>
                  <option>staging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Auto-scan Frequency</label>
                <select className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm">
                  <option>On every push</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Manual only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Analysis Settings */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Analysis Settings</h2>
            <div className="space-y-3">
              <SettingToggle label="Security scan" description="Scan for vulnerabilities and security issues" enabled />
              <SettingToggle label="Architecture analysis" description="Analyze code structure and dependencies" enabled />
              <SettingToggle label="Build verification" description="Run build and check for errors" enabled />
              <SettingToggle label="Test execution" description="Run test suite and measure coverage" enabled />
              <SettingToggle label="Performance analysis" description="Check for performance issues" enabled={false} />
            </div>
          </div>

          {/* AI Models */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">AI Models</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Model</label>
                <select className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm">
                  <option>GPT-4 Turbo</option>
                  <option>GPT-4</option>
                  <option>Claude 3 Opus</option>
                  <option>Claude 3 Sonnet</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for code analysis and diagnosis
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reasoning Model</label>
                <select className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm">
                  <option>Gemini 2.0 Flash</option>
                  <option>GPT-4o</option>
                  <option>Claude 3.5 Sonnet</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for root cause analysis
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chief Doctor</label>
                <select className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm">
                  <option>Claude 3.5 Sonnet</option>
                  <option>GPT-4 Turbo</option>
                  <option>Claude 3 Opus</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Final verification and recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              <SettingToggle label="Scan completed" description="Notify when scan finishes" enabled />
              <SettingToggle label="Critical findings" description="Immediate notification for critical issues" enabled />
              <SettingToggle label="Build failures" description="Notify on build errors" enabled />
              <SettingToggle label="Weekly reports" description="Summary of repository health" enabled={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  enabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
