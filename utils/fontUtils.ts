import fs from 'fs'
import path from 'path'

/**
 * Font Management Documentation
 * ===========================
 * 
 * Current Available Fonts:
 * 1. Helvetiker Regular (helvetiker_regular.typeface.json)
 * 2. Jacquard 12 Regular (Jacquard 12_Regular.json)
 * 3. Kabisat Demo Tall Italic (Kabisat Demo Tall_Italic.json)
 * 4. Blackletter Extra Bold (Blackletter_ExtraBold.json)
 * 5. Old London Regular (Old London_Regular.json)
 * 
 * How to Add New Fonts:
 * --------------------
 * 1. File Preparation:
 *    - Ensure your font file is in Three.js typeface JSON format
 *    - Place the .json file in the public/fonts directory
 *    - Example: public/fonts/MyNewFont.json
 * 
 * 2. Configuration Update:
 *    Add a new entry to the AVAILABLE_FONTS array below with these fields:
 *    - value: The base name of the font file (without .json)
 *      Example: 'MyNewFont' for 'MyNewFont.json'
 *    - label: The display name you want to show in the dropdown
 *      Example: 'My New Font'
 *    - file: The exact filename including extension
 *      Example: 'MyNewFont.json'
 * 
 * 3. Example Entry:
 *    {
 *      value: 'MyNewFont',
 *      label: 'My New Font',
 *      file: 'MyNewFont.json'
 *    }
 * 
 * 4. Real Example from Current Fonts:
 *    {
 *      value: 'Blackletter_ExtraBold',
 *      label: 'Blackletter Extra Bold',
 *      file: 'Blackletter_ExtraBold.json'
 *    }
 * 
 * Notes:
 * - The font file must be a valid Three.js typeface JSON file
 * - File names are case-sensitive
 * - Spaces and special characters in filenames should be preserved exactly
 * - The value field should match the filename (without .json)
 * - The label field can be formatted for better readability
 */

export interface FontInfo {
  value: string
  label: string
  file: string
}

// List of available fonts in the public/fonts directory
const AVAILABLE_FONTS: FontInfo[] = [
  {
    value: 'helvetiker_regular',
    label: 'Helvetiker Regular',
    file: 'helvetiker_regular.typeface.json'
  },
  {
    value: 'Jacquard 12_Regular',
    label: 'Jacquard 12 Regular',
    file: 'Jacquard 12_Regular.json'
  },
  {
    value: 'Kabisat Demo Tall_Italic',
    label: 'Kabisat Demo Tall Italic',
    file: 'Kabisat Demo Tall_Italic.json'
  },
  {
    value: 'Blackletter_ExtraBold',
    label: 'Blackletter Extra Bold',
    file: 'Blackletter_ExtraBold.json'
  },
  {
    value: 'Old London_Regular',
    label: 'Old London Regular',
    file: 'Old London_Regular.json'
  }
]

export const getAvailableFonts = (): FontInfo[] => {
  return AVAILABLE_FONTS
} 