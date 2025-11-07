import {Link} from "react-router-dom";
import "./Home.css"

function Home(){
    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Welcome to GardenWise 🌱</h1>
                <p className="home-slogan">Plan, plant and track your garden with ease.</p>
                <div className="home-getting-started">
                    <Link to="/login" className="btn btn-primary">Get Started</Link>
                    <Link to="/plant-info" className="btn btn-outline">Browse Plants</Link>
                </div>
            </div>

            <section className="home-features"> 
                <h2 id="features-title" className="home-features-title">What you can do</h2>
                
                <div className="home-features-grid">
                    <article className="feature-card">
                        <h3 className="feature-card-title">Design your garden</h3>
                        <p className="feature-card-text">
                            Build rows and beds, palce plants on a flexible grid and visualize spacing.
                        </p>
                    </article>

                    <article className="feature-card">
                        <h3 className="feature-card-title">Track planting & watering</h3>
                        <p className="feature-card-text">
                            Log when you plant and water. See what's thriving and what needs attention.
                        </p>
                    </article>
                    
                    <article className="feature-card">
                        <h3 className="feature-card-title">Explore plant information</h3>
                        <p className="feature-card-text">
                            Browse a growing library of plants with quick facts and care tips.
                        </p>
                    </article>
                </div>
            </section>
        </div>
    );
}
export default Home;