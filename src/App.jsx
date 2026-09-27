import { useEffect, useState } from "react";
import SpotlightCard from "./components/SpotlightCard";
import "./App.css";

// My API endpoints
const API = {
  recipes: "https://kitchenbase-backend-production.up.railway.app/recipes",
  recipeById: "https://kitchenbase-backend-production.up.railway.app/recipes/1",
  createRecipe: "https://kitchenbase-backend-production.up.railway.app/recipes",
  users: "https://kitchenbase-backend-production.up.railway.app/users",
  createUser: "https://kitchenbase-backend-production.up.railway.app/users",
  categories: "https://kitchenbase-backend-production.up.railway.app/categories",
};

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(API.recipes)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load recipes.");
        return response.json();
      })
      .then((data) => setRecipes(data))
      .catch((error) => alert(error.message));
  }, []);

  useEffect(() => {
    fetch(API.users)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load authors.");
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => alert(error.message));

    fetch(API.categories)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load categories.");
        return response.json();
      })
      .then((data) => setCategories(data))
      .catch((error) => alert(error.message));
  }, []);

  return (
    <section className="recipes-section">
      <h2>Fresh from the kitchjoen</h2>

      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <SpotlightCard
            key={recipe.id}
            className="recipe-card"
            spotlightColor="rgba(110, 180, 120, 0.18)"
          >
            <article>
              <span className="recipe-label">
                THE RECIPE COLLECTION
              </span>

              <h3>{recipe.name}</h3>

              <h4>Ingredients</h4>
              <p>{recipe.ingredients}</p>

              <h4>Instructions</h4>
              <p>{recipe.instructions}</p>

              <small>
                Author:{" "}
                {users.find((user) => user.id === recipe.author)?.username || "—"}
                {" | "}
                Category:{" "}
                <span className="category-name">
                  {categories.find((category) => category.id === recipe.category)?.name || "—"}
                </span>
              </small>
            </article>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

function AddRecipe() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(API.users)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load authors.");
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => alert(error.message));

    fetch(API.categories)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load categories.");
        return response.json();
      })
      .then((data) => setCategories(data))
      .catch((error) => alert(error.message));
  }, []);


  // Defines the function called when the form is submitted.
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(API.createRecipe, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          ingredients,
          instructions,
          author: Number(author),
          category: Number(category),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not add recipe.");
        return;
      }

      setName("");
      setIngredients("");
      setInstructions("");
      setAuthor("");
      setCategory("");

      alert("Recipe added!");
      window.location.reload();
    } catch {
      alert("Cannot connect to the server. Please try again.");
    }
  }

  return (
    <section>
      <h2>Add Recipe</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Recipe name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <textarea
          placeholder="Ingredients"
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
        />

        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
        />

        <select
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        >
          <option value="">Select author</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button type="submit">Add Recipe</button>
      </form>
    </section>
  );
}


function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(API.users)
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <section>
      <h2>Users</h2>

      {users.map((user) => (
        <p key={user.id}>
          {user.username} - {user.email}
        </p>
      ))}
    </section>
  );
}

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(API.createUser, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not add user.");
        return;
      }

      alert("User added!");
      window.location.reload();
    } catch {
      alert("Cannot connect to the server. Please try again.");
    }
  }

  return (
    <section>
      <h2>Add User</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit">Add User</button>
      </form>
    </section>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(API.categories)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load categories.");
        return response.json();
      })
      .then((data) => setCategories(data))
      .catch((error) => alert(error.message));
  }, []);

  return (
    <section>
      <h2>Categories</h2>

      {categories.map((category) => (
        <p key={category.id}>{category.name}</p>
      ))}
    </section>
  );
}

function App() {
  return (
    <main className="kitchen-app">
      <nav className="topbar">
        <a href="#" className="brand">
          JOE-M<span>MASAK</span>
        </a>

        <a href="#add-recipe" className="nav-link">
          + Add recipe
        </a>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <span className="eyebrow">Let's Cook Together</span>

          <h1>
            JOE-M MASAK.
            <br />
            <span>Joe-ngan merajoe-k, makan joer!</span>
          </h1>

          <p>
            Recipes that make Joe-mama cry
          </p>

          <a href="#recipes" className="hero-button">
            Explore recipes ↗
          </a>
        </div>

        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-core">
            <img src="/favicon.png" alt="Joe-m Masak logo" />
          </div>
          <span className="orbit-caption">A JOENIVERSE OF FLAVOUR</span>
        </div>
      </header>

      <div id="recipes">
        <Recipes />
      </div>

      <div id="add-recipe">
        <AddRecipe />
      </div>

      <div className="community-grid">
        <Users />
        <AddUser />
      </div>

      <Categories />

      <footer>
        <span>Joe-m Masak</span>
        <span>Made with curiosity. Served by Joe.</span>
      </footer>
    </main>
  );
}

export default App;
