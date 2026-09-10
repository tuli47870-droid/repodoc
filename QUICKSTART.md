# Repo Doctor - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5173/**

### 3. Build for Production
```bash
npm run build
npm run preview
```

## 📱 Demo Flow

### Step 1: Landing Page
- Open http://localhost:5173/
- You'll see the landing page with repository input
- Click **"Try an example repository"** or enter any GitHub URL
- Click **"Start Diagnosis"**

### Step 2: Scan Progress
- Watch the live scan progress with animated stages
- Activity log shows real-time updates
- Automatically redirects to dashboard when complete

### Step 3: Dashboard
- View overall repository health score (64/100)
- Explore health by category cards
- Review top 5 critical problems
- Click any problem to see details

### Step 4: Findings
- Click "Findings" in sidebar
- Filter by severity (Critical, High, Medium, Low)
- Search findings
- Click any finding row for details

### Step 5: Finding Detail
- View root cause analysis with dependency diagram
- Examine code evidence with syntax highlighting
- See reproduction steps
- Click **"Generate Fix"**

### Step 6: Fix Workspace
- Compare original vs proposed code side-by-side
- Click **"Run Verification"** to see tests pass
- Click **"Create Pull Request"**
- Review PR details and confirm

### Step 7: Explore Other Pages
- **Security**: Vulnerable dependencies
- **Architecture**: System diagram
- **Dependencies**: Package analysis
- **Build**: Build logs and errors
- **Tests**: Test results with 47% coverage
- **Runtime**: Service monitoring
- **History**: Past scan results
- **Settings**: Configuration options

### Step 8: Try Doctor Chat
- Click the chat icon in top-right header
- Ask questions about the repository
- Try quick questions or type your own

## 🎨 Key Features to Explore

### Responsive Design
- Resize browser to see mobile layout
- Sidebar becomes a drawer on mobile
- Tables become scrollable
- Chat panel adjusts to screen size

### Interactive Elements
- Click health category cards to navigate
- Hover over table rows for highlights
- Try different severity tabs in Findings
- Toggle settings switches

### Visual Feedback
- Circular health score animation
- Progress bars with smooth transitions
- Color-coded severity badges
- Trend indicators with icons

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/       # Reusable components
│   ├── dashboard/    # Dashboard widgets
│   ├── layout/       # App shell
│   └── chat/         # AI assistant
├── pages/            # All route pages
├── data/             # Mock data
└── lib/              # Utilities
```

## 🎯 Mock Data

All data is currently mocked. To integrate with a real backend:

1. Replace `mockRepository` in `src/data/mockRepository.ts`
2. Add API service layer
3. Update components to fetch from API
4. Add authentication
5. Connect to GitHub API
6. Integrate LLM services

## 🔧 Development Tips

### TypeScript
The project uses strict TypeScript. All types are defined in `src/data/mockRepository.ts`.

### Styling
Uses Tailwind CSS with a custom dark theme. Colors are defined as CSS variables in `src/index.css`.

### Icons
Uses Lucide React for all icons. Import from `lucide-react`.

### Charts
Uses Recharts for data visualization (health trends, runtime metrics).

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Kill the process or use a different port
npm run dev -- --port 3000
```

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Run type check
npm run build
```

## 📚 Next Steps

1. **Backend Integration**: Replace mock data with real API calls
2. **Authentication**: Implement GitHub OAuth
3. **Real-time Updates**: Add WebSocket for live scan updates
4. **LLM Integration**: Connect to GPT/Claude for AI analysis
5. **Repository Cloning**: Implement actual git clone functionality
6. **Test Suite**: Add unit and integration tests
7. **CI/CD**: Set up automated deployment

## 💡 Key Design Decisions

- **Dark Theme**: Developer-focused aesthetic
- **No Chatbot UI**: Primary experience is diagnostic workflow, not chat
- **Mock First**: Complete UI without backend dependencies
- **Type Safety**: Full TypeScript coverage
- **Component Reuse**: Modular, reusable components
- **Accessibility**: Keyboard navigation and semantic HTML

## 🎉 You're Ready!

The application is fully functional with realistic mock data. Explore all pages, try the demo flow, and see how a production AI-powered repository diagnostics platform would work!

For questions or issues, refer to README.md or the source code comments.
