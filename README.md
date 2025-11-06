# Infrared.city Contact Form

A modern, mobile-first contact form for Infrared.city with AI-powered business card scanning capabilities.

## Overview

This contact form allows visitors to quickly share their information with the Infrared.city team by either uploading a business card image (which is automatically parsed by AI) or by manually entering their details. The form is optimized for mobile devices and provides real-time feedback during data processing.

## Features

### Smart Business Card Scanning
- Upload or capture a business card photo
- AI automatically extracts: Name, Phone, Email, Company, and Position
- Processing takes approximately 15 seconds
- Visual feedback with loading indicators

### Intelligent Form Behavior
- **Auto-fill**: When AI processing completes, form fields are automatically populated
- **Manual Override**: Users can review and adjust any auto-filled information
- **Flexible Input**: Users can skip the business card upload and manually enter all details

### Topic Selection
- Pre-defined tags for quick conversation context:
  - Environmental Simulation
  - Sustainable Design
  - AI Analysis
  - Climate Modeling
  - Design Optimization
  - Consulting
  - Platform Integration

### Mobile-First Design
- Responsive layout optimized for smartphones
- Touch-friendly interface elements
- Scales beautifully across all device sizes

## Technical Details

### n8n Webhook Integration
- **Business Card Processing**: `https://run8n.xyz/webhook/businesCard`
- **Form Submission**: `https://run8n.xyz/webhook/storeBusinesCard`

### User Flow
1. **Initial Screen**: Shows Infrared.city logo and upload button
2. **Image Upload** (optional): User uploads business card → AI processing begins
3. **Conversation Notes**: While waiting, user can describe their discussion topics
4. **Auto-Fill**: Parsed data populates form fields with visual feedback
5. **Review & Submit**: User reviews/adjusts information and submits
6. **Confirmation**: Thank you modal appears, redirects to infrared.city

### Branding
- **Primary Color**: #2d7a7a (Teal)
- **Background**: #f0f8f8 (Light Teal)
- **Logo**: infrared_logo.jpg