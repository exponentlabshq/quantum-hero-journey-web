# Quantum Hero's Journey - Interactive E-Learning Web Solution

A fully interactive, landscape-oriented e-learning application based on the Quantum Hero's Journey animation. This web solution provides an engaging educational experience with complete navigation controls and visualizations.

## Features

- **Interactive Phase Selection**: Navigate between Pre-Classical, Classical, and Quantum phases
- **Stage Navigation**: Browse through all 36 stages with Previous/Next buttons
- **Visual Sine Wave**: Animated sine curve visualization showing the Hero's Journey progression
- **Detailed Cards**: Comprehensive information cards for each stage
- **Timeline Navigation**: Clickable timeline at the bottom showing all 36 stages
- **Keyboard Controls**: Arrow keys for navigation
- **Responsive Design**: Optimized for landscape viewing
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## File Structure

```
quantum-hero-journey-web/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout (landscape optimized)
├── app.js          # Interactive functionality
├── data.json       # All content data (phases, stages, details)
└── README.md       # This file
```

## How to Use

### Local Development

1. **Open the files**: Simply open `index.html` in a modern web browser
   - For best results, use a local web server to avoid CORS issues

2. **Using a local server** (recommended):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server)
   npx http-server
   ```

3. **Access**: Open `http://localhost:8000` in your browser

### Navigation

- **Phase Selection**: Click on any phase in the left panel
- **Stage Selection**: Click on any stage in the right panel
- **Previous/Next**: Use the navigation buttons or arrow keys
- **Timeline**: Click any marker on the timeline to jump to that stage
- **Keyboard**: Use ← and → arrow keys to navigate stages

## Features Breakdown

### Left Panel - Phase Selection
- Shows all three phases (Pre-Classical, Classical, Quantum)
- Color-coded by phase
- Click to switch between phases
- Active phase is highlighted

### Center Panel - Main Content
- **Phase Header**: Shows current phase name and era
- **Sine Wave Visualization**: Interactive canvas showing the Hero's Journey curve
- **Stage Navigation**: Previous/Next buttons with stage counter
- **Detail Card**: Comprehensive information about the current stage

### Right Panel - Stage List
- Lists all 12 stages for the current phase
- Shows stage numbers and descriptions
- Click any stage to jump to it
- Active stage is highlighted in gold

### Timeline - Bottom
- Shows all 36 stages across all phases
- Color-coded by phase
- Clickable markers for quick navigation
- Active stage highlighted in gold

## Customization

### Colors
Edit `data.json` to change phase colors:
```json
{
  "color": "#FFD700"  // Gold for Pre-Classical
  "color": "#4169E1"   // Blue for Classical
  "color": "#9370DB"   // Purple for Quantum
}
```

### Content
All content is in `data.json`. Edit the `phases` array to:
- Add/remove phases
- Modify stage titles
- Update stage details
- Change eras and descriptions

### Styling
Modify `styles.css` to:
- Change colors and themes
- Adjust layout dimensions
- Modify fonts and sizes
- Customize animations

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with:
- Canvas API support
- ES6 JavaScript support
- CSS Grid/Flexbox support

## Deployment

### Static Hosting
This is a static site - deploy to any static hosting service:

- **GitHub Pages**: Push to repository, enable Pages
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect repository or upload folder
- **AWS S3**: Upload files to S3 bucket with static hosting
- **Any web server**: Upload files to web root

### Requirements
- All files must be in the same directory
- `data.json` must be accessible (CORS may require a server)
- No backend required - fully client-side

## Educational Use

Perfect for:
- **E-Learning Platforms**: Embed in LMS systems
- **Classroom Presentations**: Display on interactive whiteboards
- **Self-Study**: Students can navigate at their own pace
- **Remote Learning**: Share via video conferencing or LMS

## Technical Details

- **Pure JavaScript**: No frameworks required
- **Canvas API**: For sine wave visualization
- **CSS Grid/Flexbox**: Responsive landscape layout
- **JSON Data**: Easy to update content
- **Event-Driven**: Smooth interactions and animations

## Future Enhancements

Potential additions:
- Progress tracking (localStorage)
- Quiz/questions per stage
- Audio narration
- Video integration
- Print/export functionality
- Mobile portrait mode support
- Accessibility improvements (ARIA labels)

## License

Use freely for educational purposes.

## Credits

Based on the Manim animation: `quantum-hero-journey-detailed.py`
Created for Blockface.btc educational content.

