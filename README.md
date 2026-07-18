# MyStocks

MyStocks is a minimalist, simple, and elegant stock logging web application built specifically for users to track their investments and calculate their profit or loss on the fly. Designed with a sleek dark-mode glassmorphism interface.

## Features

- **Portfolio Tracking**: Easily record your stock name, purchase date, quantity, buy price, sell price, and additional notes.
- **Real-Time Profit/Loss**: Instantly calculate the total profit and loss based on your selling price, beautifully formatted for Indian Rupee (₹ / INR).
- **In-Place Editing**: Quickly adjust your stock selling price directly inside the data table without needing to reopen the edit form.
- **Search & Sort**: Find your investments quickly by searching through names or dates, and sort your portfolio by name, date, or highest/lowest profit.
- **Data Portability (Import/Export)**:
  - **Excel (`.xlsx`)**: Import from and export to fully formatted Excel spreadsheets.
  - **CSV**: Lightweight comma-separated exports and imports.
  - **JSON**: Native data structure backup.
- **Local Storage**: Completely privacy-focused. All data is saved strictly to your browser's LocalStorage and is never sent to any external server.

## Tech Stack

- **HTML5 & CSS3**: Native markup and modern CSS variables, Flexbox/Grid, and glassmorphism styling.
- **Vanilla JavaScript**: Pure JS with no framework overhead for blazingly fast state management.
- **SheetJS (xlsx)**: Utilized via CDN for parsing and generating Excel files natively in the browser.
- **Phosphor Icons & Inter Font**: Delivered via CDN for a modern and crisp aesthetic.

## How to Run

Since MyStocks is completely built with frontend technologies and relies on `localStorage`, there is no complex backend setup or build process required.

1. Clone or download this project folder.
2. Double-click on the `index.html` file to open it in your preferred web browser.
3. Start logging your stocks!

## Project Structure

- `index.html`: The main markup and application layout.
- `style.css`: All application styling, responsive design rules, and dark theme variables.
- `script.js`: Core logic for CRUD operations, sorting/filtering, formatting, and file I/O operations.
