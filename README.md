# apt-dashboard

<img width="2346" alt="image" src="https://github.com/user-attachments/assets/1fb33926-d75a-46e6-9e87-3258cd49ce0a" />

## Overview
apt-dashboard is a real-time transit arrival board that displays upcoming train and bus arrivals for NYC subway stations near you. It also supports:
- **BART (San Francisco Bay Area)**
- **Muni (San Francisco)**
- **AC Transit (Alameda County, CA)**
- **MTA Bus (NYC)**

## Data Source
apt-dashboard utilizes **GTFS real-time feeds** provided by transit agencies, including the **MTA, BART, and Muni**, to ensure up-to-the-minute arrival times.

## Features
- Customizable station selection
- Real-time train and bus arrivals
- Supports multiple transit agencies (NYC Subway, SF BART, Muni, and MTA Bus)
- Simple, easy-to-read transit board interface
- Correct display for varying train terminals and express/local bullets in NYC
- Support for MTA service alerts

## Setup
### Installation
Clone the repository and install dependencies:
```sh
git clone <repo-url>
cd apt-dashboard
npm install
```

### Running the App
Start the development server:
```sh
npm run dev
```

### Configuration
Ensure you have access to the required GTFS real-time feeds. API keys or specific configurations may be needed depending on the transit agency.