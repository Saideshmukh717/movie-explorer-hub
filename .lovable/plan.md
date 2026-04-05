
# 🎬 Movie Explorer & Analytics Website

A dark cinema-themed React web app that combines a movie browsing experience with data analytics, powered by your TMDB dataset (~4800 movies).

## Data Loading
- Fetch `cleaned_movies_data.csv` and `themed_movies_data.csv` from your GitHub repo at runtime
- Parse CSV data client-side and store in React state for fast filtering/searching

## Pages

### 1. Home Page
- Hero banner with a featured high-rated movie (rotating or random)
- "Trending Now" row — top movies by popularity score
- "Top Rated" row — highest weighted_rating movies
- "Box Office Hits" row — highest revenue movies
- Each movie shown as a poster-style card with title, year, rating badge, and genre tags

### 2. Movie Search & Browse Page
- Search bar for movie titles
- Filter sidebar: Genre, Year range, Rating range, Popularity category, Language
- Sort by: Rating, Popularity, Revenue, Release date
- Grid of movie cards with pagination or infinite scroll

### 3. Movie Detail Page
- Movie title, tagline, overview, release date, runtime
- Budget & revenue with profit calculation
- Genre badges, rating stars, popularity score
- Cast list (character → actor)
- Crew highlights (Director, Writer, Composer)
- Deep theme tag from themed dataset
- Success score and engagement score visualizations

### 4. Analytics Dashboard Page
- **Genre Distribution** — pie/bar chart of movie count by genre
- **Revenue vs Budget** — scatter plot showing profitability
- **Ratings Distribution** — histogram of vote averages
- **Yearly Trends** — line chart of movie count and avg rating over years
- **Top 10 Lists** — highest revenue, highest rated, most popular
- **Popularity Categories** — breakdown of Very High / High / Medium / Low
- Interactive filters to slice the data

## Design
- Dark cinema theme (dark backgrounds, subtle gradients)
- Accent colors: gold/amber for ratings, blue for interactive elements
- Movie cards with hover effects and smooth transitions
- Responsive layout for desktop and mobile
- Navigation bar with links to all pages

## Tech
- React + TypeScript + Tailwind CSS
- Recharts for analytics charts
- PapaParse for CSV parsing
- React Router for multi-page navigation
