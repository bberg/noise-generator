# Feature Roadmap: Noise Generator

## Vision
Become the definitive, free, science-backed noise generator on the internet - the go-to resource for anyone seeking to understand and use colored noise for sleep, focus, relaxation, and therapeutic purposes.

---

## Priority 1: Essential Improvements (Immediate)

### 1.1 Add Blue, Violet, and Gray Noise
**Impact**: High | **Effort**: Medium

**Rationale**: We only offer 3 noise colors while competitors like MyNoise offer the full spectrum. Blue and violet noise have specific use cases (tinnitus masking, focus) that we're missing.

**Implementation**:
- Blue noise: +3 dB/octave (opposite of pink)
- Violet noise: +6 dB/octave (opposite of brown)
- Gray noise: Perceptually flat (psychoacoustic equal loudness curve)

**Algorithm sketches**:
```javascript
// Blue noise: differentiated pink noise
blue[i] = pink[i] - pink[i-1];

// Violet noise: differentiated white noise
violet[i] = white[i] - white[i-1];

// Gray noise: white noise with equal-loudness compensation
// Apply inverse A-weighting curve
```

### 1.2 Save/Load Custom Presets
**Impact**: High | **Effort**: Low

**Rationale**: Users lose their settings when they close the browser. This is a major retention killer.

**Implementation**:
- Save current mix to localStorage
- Allow naming presets (e.g., "My Sleep Mix")
- Load preset with one click
- Max 10 presets to prevent clutter
- Export/import as JSON for sharing

### 1.3 URL-Based Preset Sharing
**Impact**: High | **Effort**: Low

**Rationale**: Users want to share their discoveries. URLs are the universal sharing mechanism.

**Implementation**:
- Encode settings in URL hash: `#white=0&pink=50&brown=50&vol=60`
- Auto-apply settings from URL on load
- "Copy Link" button to share current state
- Enables viral sharing on Reddit, forums, social media

### 1.4 Improve Mobile UX
**Impact**: High | **Effort**: Medium

**Rationale**: 40%+ of traffic is mobile but our UI is desktop-optimized.

**Implementation**:
- Larger touch targets for sliders
- Simplified mobile layout (accordion sections)
- Lock screen controls where possible
- Test background audio on iOS Safari

---

## Priority 2: Competitive Parity (Next Sprint)

### 2.1 Enhanced Scientific Citations
**Impact**: High | **Effort**: Low

**Rationale**: Our claims about sleep and focus benefits lack academic backing. Competitors are vague; we can be authoritative.

**Implementation**:
- Add peer-reviewed references to each health claim
- Create citations section with full references
- Link to PubMed/DOI where available
- Distinguish between proven and anecdotal benefits

**Key studies to cite**:
- Pink noise and slow-wave sleep (Ngo et al., 2013)
- White/pink noise and ADHD (Söderlund et al., 2024)
- Tinnitus masking mechanisms (various)
- Coffee shop noise and creativity (Mehta et al., 2012)

### 2.2 Tinnitus-Specific Content
**Impact**: Medium | **Effort**: Low

**Rationale**: Tinnitus sufferers are dedicated, long-term users who will evangelize if we help them.

**Implementation**:
- Add "Tinnitus Relief" section to educational content
- Explain masking vs. habituation
- Provide frequency-matching guidance
- Add tinnitus-specific presets

### 2.3 Pomodoro Timer Integration
**Impact**: Medium | **Effort**: Low

**Rationale**: Focus workers expect timer integration. Noisli and others have this.

**Implementation**:
- Add Pomodoro mode (25 min work / 5 min break)
- Customizable intervals
- Audio notification at end of session
- Track completed sessions (optional)

### 2.4 Keyboard Shortcuts
**Impact**: Medium | **Effort**: Low

**Rationale**: Power users expect keyboard control. We only have spacebar.

**Implementation**:
- Space: Play/pause
- M: Mute
- Arrow keys: Volume up/down
- 1-6: Quick switch to noise presets
- S: Open save dialog
- ?: Show shortcuts modal

---

## Priority 3: Differentiation Features (Month 2)

### 3.1 Real-Time Spectral Analyzer
**Impact**: High | **Effort**: Medium

**Rationale**: No competitor shows users the actual frequency content of their noise. This reinforces our "transparent" positioning.

**Implementation**:
- FFT-based frequency visualization
- Show power distribution across frequency bands
- Toggle between waveform and spectrum views
- Color-code to show noise type dominance

### 3.2 ADHD/Focus Research Section
**Impact**: Medium | **Effort**: Low

**Rationale**: ADHD is an underserved audience. The 2024 meta-analysis showing noise benefits for ADHD is compelling content.

**Implementation**:
- Dedicated section on focus and attention
- Cite the Söderlund meta-analysis
- Explain optimal arousal theory
- Provide ADHD-optimized presets

### 3.3 Progressive Web App (PWA)
**Impact**: High | **Effort**: Medium

**Rationale**: Users want offline access without installing an app. PWA bridges this gap.

**Implementation**:
- Service worker for offline caching
- Web manifest for "Add to Home Screen"
- Cache audio buffers for offline playback
- Background audio support

### 3.4 Export Audio Files
**Impact**: Medium | **Effort**: Medium

**Rationale**: Researchers, content creators, and developers need downloadable noise files.

**Implementation**:
- "Download" button for current mix
- WAV or MP3 export (30 sec, 1 min, 5 min options)
- Include settings metadata
- Add proper attribution/license

### 3.5 Nature Sound Layers (Optional)
**Impact**: Medium | **Effort**: High

**Rationale**: Every competitor has rain, ocean, etc. However, this moves us away from our "pure noise" positioning.

**Considerations**:
- Procedural generation vs. samples
- File size/loading implications
- May dilute our scientific focus
- Recommend: Low priority, evaluate later

---

## Priority 4: Viral/Wow Features (Quarter 2)

### 4.1 "Noise DNA" Shareable Cards
**Impact**: High | **Effort**: Medium

**Rationale**: Create shareable, visually appealing cards showing user's noise preference.

**Implementation**:
- Generate image showing noise mix visualization
- Include user's preset name
- Social sharing buttons
- Branded but not obnoxious
- "What's your noise profile?" viral hook

### 4.2 Binaural Beat Generator
**Impact**: Medium | **Effort**: High

**Rationale**: Binaural beats have a dedicated following despite mixed research. MyNoise offers this.

**Implementation**:
- Add carrier frequency control
- Add beat frequency control
- Require headphones notification
- Include research context (benefits unproven but popular)

**Caution**: Don't overclaim benefits. Present objectively.

### 4.3 Community Preset Gallery
**Impact**: High | **Effort**: High

**Rationale**: User-generated content drives engagement and provides social proof.

**Implementation**:
- Submit preset to public gallery
- Browse/search community presets
- Upvote system
- Copy to personal presets
- Moderation considerations

**Risk**: Requires backend, moderation, potential for spam.

### 4.4 Sleep Tracking Integration
**Impact**: Medium | **Effort**: Very High

**Rationale**: Connect noise use to sleep outcomes via device sensors or integrations.

**Implementation options**:
- Partner with sleep tracking apps
- Use device motion sensors (phone on bed)
- Simple sleep diary logging

**Note**: Complex, save for much later.

### 4.5 AI-Personalized Noise
**Impact**: High | **Effort**: Very High

**Rationale**: Brain.fm's AI angle is compelling. Could we do something similar?

**Considerations**:
- What would "personalization" mean for noise?
- Adaptation based on time of day?
- Feedback-based optimization?
- May be over-engineering

**Note**: Speculative, needs research.

---

## Implementation Timeline

### Week 1 (Current Sprint)
- [x] Complete research documentation
- [ ] Add blue, violet, gray noise
- [ ] Implement preset save/load
- [ ] Add URL sharing
- [ ] Improve mobile responsiveness

### Week 2
- [ ] Add comprehensive scientific citations
- [ ] Expand tinnitus content
- [ ] Add Pomodoro timer
- [ ] Implement full keyboard shortcuts

### Week 3-4
- [ ] Build spectral analyzer visualization
- [ ] Add ADHD/focus content section
- [ ] Implement PWA for offline use
- [ ] Add audio export feature

### Month 2+
- [ ] Shareable noise cards
- [ ] Evaluate nature sounds
- [ ] Consider community features
- [ ] Binaural beats (if validated by research)

---

## Success Metrics

### Traffic & Engagement
- Unique visitors per month
- Average session duration (target: >10 min)
- Return visitor rate (target: >30%)
- Pages per session

### Feature Adoption
- Preset save usage rate
- URL shares generated
- PWA installs
- Export downloads

### User Satisfaction
- Feedback/contact form sentiment
- Social media mentions
- Reddit/forum discussions

### SEO Performance
- Organic search traffic
- Keyword rankings for target terms
- Backlinks from authoritative sources

---

## Technical Debt & Maintenance

### Current Issues to Address
- Stereo width control is visual-only (not implemented in audio)
- No error handling for audio context failures
- Canvas not retina-optimized on all devices
- Need favicon for various sizes

### Future Technical Considerations
- Consider AudioWorklet for better performance
- Evaluate WebAssembly for complex algorithms
- Test on older browsers/devices
- Accessibility audit needed (screen reader support)

---

## Competitive Monitoring

### Track Quarterly
- MyNoise new features
- Noisli pricing changes
- New entrants to market
- Research publications on noise and sleep/focus
- Reddit/HN discussions about noise generators

### Respond To
- Major competitor feature launches
- New scientific findings
- User feedback themes
- SEO ranking changes
