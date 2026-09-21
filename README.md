# 🌍 Payana — AI-Based Travel Itinerary Generator

> An AI-assisted travel planning platform for discovering Karnataka, generating personalized itineraries, optimizing routes, managing travel budgets, and supporting travelers throughout their entire journey.

---

## 📌 Overview

**Payana** is a full-lifecycle AI-assisted travel planning platform developed specifically for exploring Karnataka. It integrates itinerary generation, route optimization, budget management, weather awareness, cultural discovery, packing assistance, and conversational travel guidance into a single platform.

The system is backed by a curated dataset of **775+ tourist destinations covering all 31 districts of Karnataka**.

---

## ✨ Key Features

* **🧭 Personalized Itinerary Generation:** Day-wise travel plans based on user preferences, budget, duration, interests, mood, and travel group.
* **🤖 Intelligent Preference Processing:** Utilizes custom project algorithms:
  * **QSA** (Question Selection Algorithm)
  * **ARA** (Adaptive Response Algorithm)
  * **CCA** (Category Classification Algorithm)
  * **RBTGA** (Role-Based Travel Group Algorithm)
* **🗺️ Route Optimization:** Multi-stop itinerary routing based on the **Traveling Salesperson Problem (TSP)** with OpenStreetMap integration.
* **💰 Budget Planner & Expense Tracker:** Comprehensive trip budgeting, expense tracking, and spending analytics.
* **🌦️ Live Weather:** District-level real-time weather forecasting via Open-Meteo.
* **🎉 Festival & Cultural Events:** Discover regional events like Dasara, Kambala, and Hampi Utsav.
* **💎 Hidden Gems Explorer:** Offbeat destination discovery beyond conventional tourist attractions.
* **🎒 Packing Assistant:** Weather and destination-aware packing checklists.
* **💬 AI Travel Guide:** Conversational assistant for Karnataka tourism, culture, food, and transport.
* **👨‍💼 Administrative Dashboard:** Complete platform, user, and content management tools.

---

## 🏗️ System Architecture

                    ┌─────────────────────────┐
                    │       User / Admin      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     React.js Frontend   │
                    └────────────┬────────────┘
                                 │
                              REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Spring Boot API     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌─────────────────┐       ┌──────────────────┐
          │      MySQL      │       │ External APIs    │
          │  (Tourism Data) │       │ (OSM, Open-Meteo)│
          └─────────────────┘       └──────────────────┘

---

## 🛠️ Technology Stack

### Frontend
* React.js v19
* React Router v7
* JavaScript / HTML5 / CSS3
* Framer Motion
* Recharts
* OpenStreetMap

### Backend
* Java
* Spring Boot v3.2.5
* Spring Security & JWT Authentication
* REST APIs
* Spring Data JPA / Hibernate

### Database & External Services
* **Database:** MySQL
* **External APIs:** OpenStreetMap / Nominatim (Geocoding), Open-Meteo (Weather forecasting)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
    git clone https://github.com/suhitha/AI-Based-Travel-Itinerary-generator.git
    cd AI-Based-Travel-Itinerary-generator

### 2. Frontend Setup
    cd itinerary_ui
    npm install
    npm install recharts
    npx react-scripts start
*(Frontend runs at http://localhost:3000)*

### 3. Database Setup
Create a MySQL database named `payana`:
    CREATE DATABASE payana;

Configure your credentials in `payana/src/main/resources/application.properties`:
    spring.datasource.url=jdbc:mysql://localhost:3306/payana
    spring.datasource.username=root
    spring.datasource.password=YOUR_PASSWORD
    spring.jpa.hibernate.ddl-auto=update

### 4. Backend Setup
    cd payana
    ./mvnw.cmd spring-boot:run
*(Backend runs at http://localhost:8080)*

---

## 📁 Project Structure

    AI-Based-Travel-Itinerary-generator/
    │
    ├── itinerary_ui/          # React frontend
    ├── payana/                # Spring Boot backend
    ├── PlanApi/               # Supporting API module
    └── README.md

---

## 🎓 Academic Project

Developed as a Final Year Major Project for the Department of Artificial Intelligence & Machine Learning at **Mysore University School of Engineering (MUSE), University of Mysore**.
## CONTRIBUTORS
This project was collaboratively developed by:

_ **Suhitha R**

_ **Kushik S K** 

_ **Rachana V M** 

* **License:** Educational & Academic Use
