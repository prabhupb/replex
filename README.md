# Replex - AI-Powered Twitter Reply Generator

A Chrome extension that helps you generate contextually relevant replies to tweets using OpenAI's GPT models with customizable tone options.

## Features

- **AI-Powered Replies**: Generate contextual responses using OpenAI's GPT-4o-mini
- **Tone Customization**: Choose from friendly, professional, witty, sarcastic, supportive, or casual tones
- **Seamless Integration**: Works directly within Twitter/X interface
- **One-Click Generation**: Quick and easy reply generation
- **Edit Before Posting**: Review and modify generated replies before posting

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the replex folder
5. The extension should now appear in your extensions list

## Setup

1. Click the Replex extension icon in your Chrome toolbar
2. Enter your OpenAI API key (you can get one from https://platform.openai.com/api-keys)
3. Choose your default tone preference
4. Click "Save"

## Usage

1. Navigate to Twitter/X
2. Find a tweet you want to reply to
3. Click the "AI Reply" button next to the regular reply button
4. The reply dialog will open automatically
5. Choose your desired tone from the dropdown
6. Click "Generate Reply"
7. Review the generated reply and edit if needed
8. Click "Insert Reply" to add it to the Twitter reply box
9. Post your reply as normal

## Privacy & Security

- Your API key is stored locally in Chrome's sync storage
- No data is sent to external servers except OpenAI for reply generation
- Tweet context is only used temporarily for generating replies

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `popup.html/js/css` - Settings interface
- `content.js` - Main logic for Twitter integration
- `styles.css` - UI styling for injected elements
- `background.js` - Service worker for extension lifecycle

## Requirements

- Chrome browser
- OpenAI API key
- Internet connection for API calls

## License

MIT License
