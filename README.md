# Retail Goods Manager

A sleek and intuitive mobile app crafted with **React Native** and **Expo** to empower users in tracking, managing, and analyzing retail purchases effortlessly. Store data locally, visualize spending trends, and export records—all in one place!

---

## ✨ Features

- **Add Purchases**: Input details with a date picker, dynamic items, real-time calculations, and past rate suggestions.
- **Edit & Delete**: Update or remove items within purchases, or delete entire entries from the home screen.
- **Spending Trends**: See monthly spending with a stylish line chart via `react-native-chart-kit`.
- **CSV Export**: Download purchase data as CSV files (single or bulk), Excel-ready.
- **User-Friendly**: Cancel item additions, exit without saving, and get clear error messages.
- **Offline Ready**: Powered by `AsyncStorage` for seamless offline use.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go**: App for iOS/Android testing

### Installation

1. **Clone the Repo**  
   ```bash
   git clone https://github.com/tanmayraut45/retail-goods-manager.git
   cd retail-goods-manager
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```
   _or_
   ```bash
   yarn install
   ```

3. **Launch the App**  
   ```bash
   npx expo start
   ```
   - Scan the QR code with **Expo Go**.
   - Or use `i` (iOS simulator) / `a` (Android emulator).

---

## 📱 How to Use

### Home Screen
- Browse saved purchases.
- Search by date or item.
- Tap "Edit Purchases" to delete or dive into details.
- Export all data with the header download button.

### Add Purchase
- Pick a date, add items (name, quantity, rate).
- Use "Add Another Item" and cancel extras with "X".
- Save or back out anytime.

### Purchase Details
- View item breakdowns.
- Hit "Edit" to tweak, add, or remove items, then save.

### Spending Trends
- Check out a line chart of your monthly spending.

---

## 🛠️ Tech Stack

- **React Native**: Mobile app foundation
- **Expo**: Streamlined dev workflow
- **TypeScript**: Type-safe code
- **AsyncStorage**: Local data storage
- **React Navigation**: Smooth screen transitions
- **expo-linear-gradient**: Gradient UI flair
- **expo-file-system & expo-sharing**: CSV export magic
- **react-native-chart-kit**: Trend visualization
- **@react-native-community/datetimepicker**: Date picker
- **@expo/vector-icons**: Icon goodness

---

## 📂 Project Structure

```
retail-goods-manager/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx         # List and edit purchases
│   │   ├── AddPurchaseScreen.tsx  # Add new purchases
│   │   ├── PurchaseDetailsScreen.tsx # Edit purchase details
│   │   └── SpendingScreen.tsx     # Spending trends chart
│   ├── store/
│   │   └── storage.tsx            # AsyncStorage logic
│   └── utils/
│       └── csvUtils.tsx           # CSV export utils
├── App.tsx                        # App entry & navigation
├── package.json                   # Dependencies & scripts
└── README.md                      # You’re here!
```

---

## 🤝 Contributing

Love to see your input! Here’s how:
1. Fork this repo.
2. Branch out: `git checkout -b feature/your-cool-idea`.
3. Commit changes: `git commit -m "Added cool idea"`.
4. Push it: `git push origin feature/your-cool-idea`.
5. Open a pull request with details.

*Keep code style consistent and comments clear!*

---

## 🙏 Acknowledgments

- Inspired by React Native best practices.
- Big thanks to the open-source community for stellar libraries!

---