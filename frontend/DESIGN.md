---
name: Cinematic Editorial
colors:
  surface: '#1d100b'
  surface-dim: '#1d100b'
  surface-bright: '#46362f'
  surface-container-lowest: '#170b06'
  surface-container-low: '#261813'
  surface-container: '#2a1c16'
  surface-container-high: '#362720'
  surface-container-highest: '#41312b'
  on-surface: '#f7ddd3'
  on-surface-variant: '#e2bfb2'
  inverse-surface: '#f7ddd3'
  inverse-on-surface: '#3d2d26'
  outline: '#a98a7e'
  outline-variant: '#5a4137'
  surface-tint: '#ffb596'
  primary: '#ffb596'
  on-primary: '#581e00'
  primary-container: '#ff6b1a'
  on-primary-container: '#591e00'
  inverse-primary: '#a43e00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#8dcdff'
  on-tertiary: '#00344f'
  tertiary-container: '#00a2eb'
  on-tertiary-container: '#003550'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#cae6ff'
  tertiary-fixed-dim: '#8dcdff'
  on-tertiary-fixed: '#001e30'
  on-tertiary-fixed-variant: '#004b70'
  background: '#0B0B0B'
  on-background: '#f7ddd3'
  surface-variant: '#41312b'
  border: '#252525'
  text-primary: '#F4F1EA'
  text-secondary: '#A3A3A3'
  matcha: '#98C379'
  berry: '#E9407A'
  espresso: '#7A4B2A'
typography:
  display-hero:
    fontFamily: Bebas Neue
    fontSize: 180px
    fontWeight: '700'
    lineHeight: '0.9'
    letterSpacing: -0.06em
  display-hero-mobile:
    fontFamily: Bebas Neue
    fontSize: 96px
    fontWeight: '700'
    lineHeight: '0.9'
    letterSpacing: -0.06em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body-xl:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  section: 128px
---

OFFLINE CLUB — Design System v1.0
Brand Vision
OFFLINE CLUB is a premium Gen Z café brand built around intentional experiences, meaningful conversations, and digital disconnection.
The visual identity combines cinematic minimalism, editorial typography, dark luxury aesthetics, and modern café culture.
Brand Personality
Keywords
Intentional
Cinematic
Warm
Social
Premium
Underground
Modern
Editorial
Avoid
Corporate aesthetics
Heavy glassmorphism
Generic coffee-shop visuals
Bright pastel palettes
Excessive gradients
Color System
Primary Colors
TokenValueBackground#0B0B0BSurface#141414Border#252525Text Primary#F4F1EAText Secondary#A3A3A3Accent#FF6B1A
CSS Variables
:root {
  --bg: #0B0B0B;
  --surface: #141414;
  --border: #252525;

  --text-primary: #F4F1EA;
  --text-secondary: #A3A3A3;

  --accent: #FF6B1A;
}

Secondary Accent Themes
Matcha
--accent: #98C379;
--accent-light: #D6EBC7;

Berry
--accent: #E9407A;
--accent-light: #FFD7E6;

Espresso
--accent: #7A4B2A;
--accent-light: #D9B89B;

Only one accent theme should be active at a time.
Typography
Hero Typeface
Recommended:
Anton
Bebas Neue
Hero Sizes
font-size: clamp(6rem, 12vw, 14rem);
letter-spacing: -0.06em;
line-height: 0.9;
font-weight: 700;

Body Typeface
Recommended:
Inter
General Sans
Body Sizes
14px
16px
18px
24px
32px

Layout Principles
Structure
The design follows a magazine-inspired editorial layout.
Core Rules
Large negative space
Oversized typography
Product-focused imagery
Minimal UI chrome
Strong visual hierarchy
Spacing Scale
Based on an 8pt system.
4px
8px
16px
24px
32px
48px
64px
96px
128px

Border Radius
12px
20px
32px
999px

Avoid sharp corners.
Hero Section
Layout
MENU     ABOUT     EVENTS

        OFFLINE
         CLUB

 Coffee worth putting
 your phone down for.

 [ MENU ]   [ BOOK ]

Hero Image
Centerpiece:
Floating ceramic coffee cup
Coffee beans
Soft steam animation
Warm spotlight
Image should overlap typography.
Background System
Main Background
background: #0B0B0B;

Add:
Film grain
Noise texture
Subtle vignetting
Opacity:
0.02 - 0.05

Spotlight Effect
radial-gradient(
 circle at center,
 rgba(255,107,26,.15),
 transparent 70%
);

Used behind hero products.
Components
Buttons
Primary
background: #FF6B1A;
color: #0B0B0B;
padding: 14px 24px;
border-radius: 999px;

Hover:
translateY(-2px);

Secondary
background: transparent;
border: 1px solid #252525;
color: #F4F1EA;

Circular Actions
Inspired by editorial restaurant websites.
Examples:
EXPLORE MENU
BOOK TABLE
VIEW EVENTS

Displayed inside outlined circles.
Menu Cards
Style
Cards should feel like editorial blocks instead of traditional UI cards.
01

NO SIGNAL LATTE

Double espresso
Honey
Oat milk

Card Styling
background: #141414;
border: 1px solid #252525;
border-radius: 20px;
padding: 24px;

Photography Direction
Preferred
Top-down coffee shots
Matte ceramics
Deep shadows
Dark surfaces
Natural ingredients
Dramatic lighting
Avoid
White backgrounds
Generic stock imagery
Bright cafés
Overly saturated colors
Motion System
Page Entrance
opacity: 0 → 1
translateY: 24px → 0
duration: 600ms

Hover States
Opacity transitions
Blur dissolve
Slight elevation
Avoid:
Large scaling effects
Excessive parallax
Mobile Experience
Bottom Navigation
HOME
MENU
BOOK
EVENTS
PROFILE

Styling
background: #141414;
border: 1px solid #252525;
border-radius: 999px;

Floating above content.
Signature Drinks
Examples:
No Signal Latte
Airplane Mode Mocha
Low Battery Cold Brew
Main Character Matcha
Offline Affogato
Visual Inspiration
Aesthetic References:
A24 movie posters
Editorial magazines
Luxury fashion campaigns
Modern specialty coffee brands
Dark cinematic photography
Design Principles
Typography leads.
Products are the hero.
Darkness creates focus.
Motion is subtle.
Every screen should feel intentional.
White space is a feature, not empty space.
Experiences over decoration.