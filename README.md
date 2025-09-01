# Store Simulators

A multi-store order simulation platform featuring automatic order status progression, comprehensive REST API, and a modern admin panel for real-time order management.

## 🏪 Supported Stores
- Glowmark
- Kapuruka
- Lassana Flora
- OnlineKade

## 🚀 Features
- Multi-store architecture with store isolation
- Automatic order status progression (pending → in_transit → store_pickup → completed)
- Store-specific endpoints and order ID prefixes
- User-centric order management
- Real-time statistics and analytics
- Order cancellation and status history
- Rate limiting and security
- Health monitoring endpoints
- Modern admin panel (HTML/CSS/JS)

## 📁 Project Structure
```
Store_simulators/
├── Glowmark_Simulation/
│   ├── frontend/           # Admin panel (index.html, styles.css, script.js)
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── config/             # Configuration
│   ├── middleware/         # Express middleware
│   ├── tests/              # Test suite
│   ├── server.js           # Main server entry point
│   ├── README.md           # Glowmark API documentation
│   └── README_ADMIN_PANEL.md # Admin panel documentation
└── README.md               # Main project documentation
```

## 🛠️ Quick Start
1. **Install dependencies**
   ```bash
   cd Glowmark_Simulation
   npm install
   ```
2. **Configure environment**
   - Copy `.env.example` to `.env` and update settings
3. **Start MongoDB**
   - Ensure MongoDB is running locally or update URI for cloud
4. **Run the server**
   ```bash
   node server.js
   ```
5. **Open the admin panel**
   - Visit `http://localhost:3000/index.html` in your browser

## 📚 Documentation
- [Glowmark API & Backend](Glowmark_Simulation/README.md)
- [Admin Panel Features](Glowmark_Simulation/README_ADMIN_PANEL.md)

## 🧪 Testing
- Run all tests:
  ```bash
  npm test
  ```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License
MIT License

## 🆘 Support
- For help, see the API documentation and admin panel guides in the `Glowmark_Simulation` folder.
- Use `/api/health` endpoint to check server status.

---

**Store Simulators** provides a robust platform for simulating and managing orders across multiple stores with a beautiful, real-time admin interface.
