import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import SpotlightCard from "./components/SpotlightCard";
import "./App.css";

// Load data directly from Supabase.
async function getRecipes() {
  const { data, error } = await supabase
    .from("recipe")
    .select("id, name, ingredients, instructions, author, category");

  if (error) throw error;
  return data;
}

async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email");

  if (error) throw error;
  return data;
}

async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name");

  if (error) throw error;
  return data;
}

function Recipes({ refreshKey }) {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [recipeData, userData, categoryData] = await Promise.all([
          getRecipes(),
          getUsers(),
          getCategories(),
        ]);

        if (!active) return;

        setRecipes(recipeData);
        setUsers(userData);
        setCategories(categoryData);
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section className="recipes-section">
      <h2>Fresh from the kitchjoen</h2>

      {loading && <p>Loading recipes...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && recipes.length === 0 && (
        <p>No recipes yet. Add the first one!</p>
      )}

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
                {users.find((user) => user.id === recipe.author)?.username ||
                  "—"}
                {" | "}
                Category:{" "}
                <span className="category-name">
                  {categories.find(
                    (category) => category.id === recipe.category
                  )?.name || "—"}
                </span>
              </small>
            </article>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

function AddRecipe({ refreshKey, onRecipeAdded }) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setError("");

      try {
        const [userData, categoryData] = await Promise.all([
          getUsers(),
          getCategories(),
        ]);

        if (!active) return;

        setUsers(userData);
        setCategories(categoryData);
      } catch (error) {
        if (active) setError(error.message);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    if (
      !name.trim() ||
      !ingredients.trim() ||
      !instructions.trim() ||
      !author ||
      !category
    ) {
      setError("Please complete all fields.");
      return;
    }

    // Preserve the original ID type from the database.
    const selectedAuthor = users.find(
      (user) => String(user.id) === author
    );

    const selectedCategory = categories.find(
      (item) => String(item.id) === category
    );

    if (!selectedAuthor || !selectedCategory) {
      setError("Please select a valid author and category.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase.from("recipe").insert({
        name: name.trim(),
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        author: selectedAuthor.id,
        category: selectedCategory.id,
      });

      if (error) throw error;

      setName("");
      setIngredients("");
      setInstructions("");
      setAuthor("");
      setCategory("");

      onRecipeAdded();
      alert("Recipe added!");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Add Recipe</h2>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          aria-label="Recipe name"
          placeholder="Recipe name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <textarea
          aria-label="Ingredients"
          placeholder="Ingredients"
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          required
        />

        <textarea
          aria-label="Instructions"
          placeholder="Instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          required
        />

        <select
          aria-label="Author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          required
        >
          <option value="">Select author</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Recipe"}
        </button>
      </form>
    </section>
  );
}

function Users({ refreshKey }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setError("");

      try {
        const data = await getUsers();

        if (active) setUsers(data);
      } catch (error) {
        if (active) setError(error.message);
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section>
      <h2>Users</h2>

      {error && <p role="alert">{error}</p>}

      {users.map((user) => (
        <p key={user.id}>
          {user.username} - {user.email}
        </p>
      ))}
    </section>
  );
}

function AddUser({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    if (!name.trim() || !email.trim()) {
      setError("Please enter a name and email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase.from("users").insert({
        username: name.trim(),
        email: email.trim(),
      });

      if (error) throw error;

      setName("");
      setEmail("");

      onUserAdded();
      alert("User added!");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Add User</h2>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          aria-label="Name"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <input
          type="email"
          aria-label="Email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add User"}
        </button>
      </form>
    </section>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        if (active) setCategories(data);
      } catch (error) {
        if (active) setError(error.message);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <h2>Categories</h2>

      {error && <p role="alert">{error}</p>}

      {categories.map((category) => (
        <p key={category.id}>{category.name}</p>
      ))}
    </section>
  );
}

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshData() {
    setRefreshKey((current) => current + 1);
  }

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

          <p>Recipes that make Joe-mama cry</p>

          <a href="#recipes" className="hero-button">
            Explore recipes ↗
          </a>
        </div>

        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-core">
            <img src="/favicon.png" alt="Joe-m Masak logo" />
          </div>
          <span className="orbit-caption">
            A JOENIVERSE OF FLAVOUR
          </span>
        </div>
      </header>

      <div id="recipes">
        <Recipes refreshKey={refreshKey} />
      </div>

      <div id="add-recipe">
        <AddRecipe
          refreshKey={refreshKey}
          onRecipeAdded={refreshData}
        />
      </div>

      <div className="community-grid">
        <Users refreshKey={refreshKey} />
        <AddUser onUserAdded={refreshData} />
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
