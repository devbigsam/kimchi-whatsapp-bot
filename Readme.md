# Kimchi WhatsApp Bot

A WhatsApp business automation bot for Kimchi Restaurant, built using the WhatsApp Cloud API. This bot allows customers to interact with the restaurant via WhatsApp for ordering food, tracking orders, and contacting support. It features location-based service areas and an interactive menu system.

**⚠️ Note: This project is currently in development and not fully finished. It is in testing mode and may have incomplete features or bugs. Contributions and feedback are welcome!**

## Features

- **Interactive Menu**: Browse and order from various categories including meals, desserts, proteins, pastries, beverages, and traditional swallow & soups.
- **Location-Based Services**: Automatically detects user's location and suggests nearby restaurant branches in supported areas (Lagos, Abuja, Port Harcourt, Umuahia).
- **Order Tracking**: (Feature in development) Track the status of your orders.
- **Customer Support**: (Feature in development) Contact support directly through the bot.
- **Webhook Integration**: Secure webhook verification and message handling via WhatsApp Cloud API.

## Supported Service Areas

- **Lagos**: Lekki, Ajah, Victoria Island, Yaba
- **Abuja**: Wuse, Gwarinpa
- **Port Harcourt**: GRA, Rumuola
- **Umuahia**: Ahiaeke, Okpara Square

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devbigsam/kimchi-whatsapp-bot.git
   cd kimchi-whatsapp-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   WHATSAPP_TOKEN=your_whatsapp_cloud_api_token
   VERIFY_TOKEN=your_webhook_verify_token
   PHONE_NUMBER_ID=your_phone_number_id
   PORT=3000  # Optional, defaults to 3000
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. Set up ngrok or similar tunneling service to expose the local server to the internet for webhook configuration in WhatsApp Cloud API.

## Usage

1. Start a conversation with the bot by sending "hi".
2. Choose from options: Order Food, Track Order, or Contact Support.
3. For ordering: Share your location to find nearby branches, then select a restaurant and browse the menu.
4. The bot will guide you through the ordering process.

## Technologies Used

- Node.js
- Express.js
- Axios
- WhatsApp Cloud API
- Ngrok (for development tunneling)

## Contributing

This project is open-source and contributions are welcome! Since it's still in development, feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests for improvements

Please ensure your contributions align with the project's goals and follow best practices.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

Samuel (Big Sam)

## Disclaimer

This bot is currently in testing mode. Some features may not be fully implemented or may contain bugs. Use at your own discretion.
