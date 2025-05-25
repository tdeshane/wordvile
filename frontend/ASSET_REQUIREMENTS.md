# Wordvile Asset Requirements Document

## Art Style Guide

### Visual Direction
- **Primary Style**: Hand-drawn 2D with literary flourishes
- **Color Palette**: Vibrant vs Grayscale (corruption mechanic)
- **Resolution**: 1920x1080 native, scalable to 4K
- **Aspect Ratios**: 16:9 primary, 21:9 supported
- **Animation Style**: Smooth 2D with particle effects

### Artistic Themes
- Books and manuscripts as environmental elements
- Words floating like physical objects
- Ink and paper textures throughout
- Calligraphy-inspired UI elements
- Contrast between order and creative chaos

## Character Assets

### Main Characters (4 Playable Heroes)

#### Marco Delgado - The Technician
- **Sprites Needed**:
  - Idle (8 frames)
  - Walk cycle (12 frames x 4 directions)
  - Run cycle (8 frames x 4 directions)
  - Attack animations (16 frames x 3 types)
  - Ability animations (20 frames x 4 abilities)
  - Damage/Death (12 frames)
  - Dialogue portraits (10 expressions)
  - Cutscene art (5 key scenes)

#### Lily Chen - The Strategist
- **Same sprite requirements as Marco**
- **Unique Elements**:
  - Strategy Shield effects (particle system)
  - Tactical overlay visualizations
  - Leadership aura effects

#### Zack Taylor - The Warrior
- **Same sprite requirements as Marco**
- **Unique Elements**:
  - Verb Blade slash effects
  - Rhythm Gauntlet visualizations
  - Action trail effects

#### Ava Patel - The Artist
- **Same sprite requirements as Marco**
- **Unique Elements**:
  - Perception Staff glow effects
  - Creative burst visualizations
  - Silver crystal animations

### NPCs

#### Major NPCs (20+ unique characters)
- **Per Character**:
  - Idle animation (6 frames)
  - Talk animation (8 frames)
  - Unique action (varies)
  - Portrait set (5 expressions)

#### Minor NPCs (50+ background characters)
- **Per Type**:
  - Static sprite
  - 2-frame idle
  - Generic portrait

### Creatures & Enemies

#### Standard Enemies (30 types)
- Word Wolves
- Grammar Goblins
- Meaning Leeches
- Vocabulary Vines
- Etymology Ents
- Paragraph Panthers
- Redaction Cultists
- Editorial Constructs
- Dictionary Mimics
- Bookmark Snakes

**Per Enemy Type**:
- Idle (6 frames)
- Move (8 frames)
- Attack (12 frames)
- Special ability (16 frames)
- Damage/Death (8 frames)

#### Bosses (8 major)
- Exposition Troll
- Meaning Leech Queens (3 variants)
- Menchuba (3 forms)
- GREAT LEXICON (special sequences)

**Per Boss**:
- Large sprite sheet (2048x2048)
- Multiple attack patterns (20+ animations)
- Phase transitions
- Environmental interactions
- Death sequence (30+ frames)

## Environmental Assets

### Tilesets

#### Inkwell Village
- Building tiles (50 unique)
- Ground textures (20 variants)
- Decorative elements (100+)
- Interactive objects (30)
- Parallax backgrounds (5 layers)

#### The Whispering Woods
- Tree variations (15 types)
- Forest floor tiles (25 variants)
- Canopy layers (3 parallax)
- Ancient text carvings
- Mystical light effects

#### Grammar Gorge
- Rock formations (30 types)
- Bridge components (modular)
- Punctuation geysers (animated)
- Liquid grammar (shader effect)
- Dangerous terrain markers

#### Other Regions
- Concept Mine (industrial/magical hybrid)
- Allegory Archipelago (42 island themes)
- Silver's Castle (ethereal architecture)
- Subtext Caverns (layered meanings)

### Environmental Effects
- Weather systems (rain, idea storms)
- Day/night cycle lighting
- Seasonal variations
- Corruption spread visuals
- Restoration effects

## UI/UX Assets

### Main Interface
- **HUD Elements**:
  - Health/Energy bars
  - Minimap frame
  - Quest tracker
  - Inventory quick slots
  - Character portraits
  - Word collection indicator
  - Narrative significance meter

### Menus
- **Main Menu**: Animated book opening
- **Pause Menu**: Parchment overlay
- **Inventory**: Grid system with categories
- **Character Screen**: Stats and equipment
- **Quest Journal**: Book format
- **Options**: Tabbed interface
- **Save/Load**: Gallery style

### Combat UI
- Turn order indicator
- Action menu (verb/adjective selection)
- Damage numbers (styled fonts)
- Status effect icons (50+ types)
- Combo indicators
- Victory/Defeat screens

### Dialogue System
- Text boxes (multiple styles)
- Character name plates
- Choice buttons
- Emotion indicators
- Skip/Auto indicators
- History log design

## Visual Effects

### Particle Systems
- Magic casting (20 types)
- Environmental particles
- Combat impacts
- Weather effects
- Ability auras
- Item pickups
- Level up effects
- Achievement notifications

### Shaders
- Water/liquid grammar
- Corruption spread
- Silver's essence glow
- Portal effects
- Time manipulation
- Ghost/transparency
- Outline highlights
- Screen transitions

### Post-Processing
- Bloom for magical effects
- Motion blur for speed
- Depth of field for focus
- Color grading per area
- Vignetting for atmosphere
- Screen shake variants
- Distortion effects

## Animation Requirements

### Character Animation Standards
- **Frame Rate**: 24 FPS base
- **Sprite Sizes**: 128x128 to 256x256
- **Pivot Points**: Consistent centering
- **Naming Convention**: character_action_frame##

### Environmental Animation
- Water flow cycles
- Tree sway patterns
- Grass movement
- Floating words
- Background creatures
- Mechanical elements
- Magic effects

### Cutscene Requirements
- **Story Scenes**: 20 major, 40 minor
- **Format**: In-engine preferred
- **Style**: Motion comic hybrid
- **Length**: 30s to 3min each

## Audio Asset Requirements

### Music (3+ hours total)

#### Area Themes
- Inkwell Village (peaceful, 3 variants)
- Whispering Woods (mysterious, day/night)
- Grammar Gorge (adventurous)
- Concept Mine (industrial/magical)
- Allegory Archipelago (nautical/poetic)
- Silver's Castle (ethereal/corrupted)

#### Situational Music
- Combat (normal, boss, critical)
- Victory fanfares (small, major)
- Defeat/Game Over
- Puzzle solving
- Emotional scenes
- Credits sequence

#### Dynamic Layers
- Base melody
- Combat intensity
- Exploration additions
- Emotional overlays
- Environmental effects

### Sound Effects

#### UI Sounds
- Menu navigation
- Button clicks
- Confirmation/Cancel
- Error/Invalid
- Achievement unlock
- Level up
- Item pickup
- Save/Load

#### Combat SFX
- Weapon swings (per type)
- Impact sounds (material based)
- Magic casting
- Status effects
- Critical hits
- Blocks/Parries
- Victory/Defeat stings

#### Environmental Audio
- Footsteps (10 surface types)
- Ambient loops per area
- Weather effects
- Water/liquid sounds
- Wind variations
- Wildlife sounds
- Mechanical sounds
- Magic ambience

#### Character Voices
- Effort sounds (attack/damage)
- Emotes (laugh/cry/surprise)
- Combat callouts
- Spell incantations
- NPC greetings
- Merchant phrases

### Voice Acting

#### Main Characters
- **Lines per character**: 500-1000
- **Emotional range**: 10 states
- **Combat barks**: 50 per character
- **Story dialogue**: 2+ hours

#### Major NPCs
- **Lines per NPC**: 100-300
- **Key scenes**: Full VO
- **Ambient dialogue**: Partial VO

#### GREAT LEXICON
- **Special requirement**: Omnipotent voice
- **Black screen narration**: 50+ lines
- **Meta commentary**: 100+ lines
- **Warning messages**: 20 variants

## Technical Specifications

### Image Formats
- **Sprites**: PNG with alpha
- **Backgrounds**: JPEG for size
- **UI Elements**: SVG where possible
- **Textures**: Power of 2 dimensions

### Optimization Requirements
- **Texture Atlasing**: Maximum 2048x2048
- **Compression**: Lossy for backgrounds
- **Mipmapping**: For all textures
- **LOD**: For complex scenes

### File Organization
```
/assets
  /characters
    /marco
      /sprites
      /portraits
      /animations
  /enemies
    /standard
    /bosses
  /environments
    /inkwell_village
    /whispering_woods
    [etc]
  /ui
    /hud
    /menus
    /combat
  /vfx
    /particles
    /shaders
  /audio
    /music
    /sfx
    /voice
```

## Asset Pipeline

### 2D Art Workflow
1. Concept sketch approval
2. Line art creation
3. Color/shading pass
4. Animation frames
5. Export and optimize
6. Integration testing

### Audio Workflow
1. Composition/recording
2. Editing and mastering
3. Format conversion
4. Dynamic implementation
5. Balance testing

### Version Control
- Use Git LFS for large files
- Binary file locking
- Regular backups
- Cloud storage redundancy

## Outsourcing Guidelines

### Art Outsourcing
- Style guide adherence
- Weekly check-ins
- Iterative approval process
- Technical requirements doc
- Asset delivery standards

### Audio Outsourcing
- Reference tracks provided
- Milestone-based delivery
- Rights and licensing clear
- Format specifications
- Implementation support

## Localization Preparation

### Text Space
- UI elements: +30% space
- Dialogue boxes: Expandable
- Button text: Scalable
- Menu items: Flexible layout

### Cultural Considerations
- Avoid text in images
- Symbol alternatives ready
- Color meaning variations
- Gesture appropriateness

## Asset Budget Estimates

### Art Assets
- Character sprites: 400 hours
- Environments: 600 hours  
- UI/UX: 200 hours
- VFX: 300 hours
- Total: ~1500 hours

### Audio Assets
- Music composition: 200 hours
- SFX creation: 150 hours
- Voice recording: 100 hours
- Implementation: 50 hours
- Total: ~500 hours

This comprehensive asset list ensures all visual and audio elements are accounted for in the development of Wordvile, maintaining consistent quality and style throughout the game.