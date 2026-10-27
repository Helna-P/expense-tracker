import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  CalendarDays,
  X,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import "./App.css";

const API_URL = "http://localhost:5000/api/expenses";

const categories = ["Food", "Travel", "Bills", "Shopping", "Other"];

const colors = {
  Food: "#E8A5B8",
  Travel: "#A9B5E8",
  Bills: "#A7D8C1",
  Shopping: "#F2C98B",
  Other: "#C7A9E8",
};

const icons = {
  Food: Utensils,
  Travel: Car,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Other: Wallet,
};

const emptyForm = () => ({
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
});

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshExpenses() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load expenses.");
      }

      const data = await response.json();

      setExpenses(
        data.map((expense) => ({
          ...expense,
          id: expense._id,
          date: String(expense.date).slice(0, 10),
        }))
      );
    } catch (error) {
      setMessage(
        "Unable to load expenses. Please check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshExpenses();
  }, []);

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const chartData = categories
    .map((category) => ({
      name: category,
      value: expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    }))
    .filter((item) => item.value > 0);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.date ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setMessage("Please enter a title, date and a valid positive amount.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const expenseData = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
      };

      const url =
        editingId !== null
          ? `${API_URL}/${editingId}`
          : API_URL;

      const response = await fetch(url, {
        method: editingId !== null ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save expense.");
      }

      const wasEditing = editingId !== null;

      setForm(emptyForm());
      setEditingId(null);

      await refreshExpenses();

      setMessage(
        wasEditing
          ? "Expense updated successfully!"
          : "Expense added successfully!"
      );
    } catch (error) {
      setMessage(error.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(expense) {
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
    });

    setEditingId(expense.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete expense.");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm());
      }

      await refreshExpenses();
      setMessage("Expense deleted successfully!");
    } catch (error) {
      setMessage(error.message || "Unable to delete expense.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setMessage("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <Wallet size={22} />
          </span>
          <span>
            penny<span className="brand-light">wise</span>
          </span>
        </a>

        <span className="date-pill">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </header>

      <section className="welcome" id="home">
        <div>
          <p className="eyebrow">YOUR PERSONAL FINANCE SPACE</p>
          <h1>
            Money, mindfully<span>.</span>
          </h1>
          <p className="subtitle">
            Small steps today, better habits tomorrow.
          </p>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <span>✳</span>
          <span>♡</span>
          <span>✿</span>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card total-card">
          <div className="card-top">
            <span className="card-icon pink-icon">
              <Wallet size={20} />
            </span>
            <span className="card-label">TOTAL AMOUNT SPENT</span>
          </div>

          <h2>
            ₹
            {total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <p className="card-note">Your recorded expenses</p>
          <span className="decorative-circle"></span>
        </article>

        <article className="summary-card count-card">
          <div className="card-top">
            <span className="card-icon lavender-icon">
              <Receipt size={20} />
            </span>
            <span className="card-label">TOTAL TRANSACTIONS</span>
          </div>

          <h2>{expenses.length.toString().padStart(2, "0")}</h2>
          <p className="card-note">Expenses tracked so far</p>
        </article>

        <article className="summary-card insight-card">
          <div className="card-top">
            <span className="card-icon green-icon">
              <TrendingUp size={20} />
            </span>
            <span className="card-label">TOP CATEGORY</span>
          </div>

          <h2>
            {chartData.length
              ? chartData.reduce((a, b) =>
                  a.value > b.value ? a : b
                ).name
              : "Not yet"}
          </h2>

          <p className="card-note">Your biggest spending category</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel form-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LET'S KEEP TRACK</p>
              <h2>
                {editingId !== null ? "Edit expense" : "Add an expense"}
              </h2>
            </div>

            <span className="heading-icon">
              <Plus size={21} />
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Expense title</label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Morning coffee"
              value={form.title}
              onChange={handleChange}
              maxLength={80}
              required
            />

            <label htmlFor="amount">Amount (₹)</label>
            <div className="amount-input">
              <span>₹</span>
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {editingId !== null ? (
                <Pencil size={17} />
              ) : (
                <Plus size={18} />
              )}

              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "Add expense"}
            </button>

            {editingId !== null && (
              <button
                className="cancel-button"
                type="button"
                onClick={cancelEdit}
              >
                <X size={16} /> Cancel editing
              </button>
            )}
          </form>

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE PERSPECTIVE</p>
              <h2>Spending snapshot</h2>
            </div>

            <span className="heading-icon chart-heading-icon">
              <TrendingUp size={20} />
            </span>
          </div>

          {chartData.length ? (
            <>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={colors[entry.name]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        "Spent",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="chart-center">
                  <span>TOTAL</span>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="legend">
                {chartData.map((item) => (
                  <div className="legend-item" key={item.name}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: colors[item.name],
                      }}
                    ></span>

                    <span>{item.name}</span>

                    <strong>
                      ₹{item.value.toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-chart">
              <div className="empty-chart-icon">♡</div>
              <h3>Your story starts here</h3>
              <p>
                Add your first expense to see your spending breakdown.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="panel expenses-panel">
        <div className="section-heading expenses-heading">
          <div>
            <p className="eyebrow">YOUR MONEY JOURNAL</p>
            <h2>
              Recent expenses{" "}
              <span className="record-count">{expenses.length}</span>
            </h2>
          </div>

          <span className="subtle-label">Latest first</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading expenses...</h3>
          </div>
        ) : expenses.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>EXPENSE</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => {
                  const CategoryIcon =
                    icons[expense.category] || Wallet;

                  return (
                    <tr key={expense.id}>
                      <td>
                        <div className="expense-name">
                          <span
                            className="category-icon"
                            style={{
                              backgroundColor: `${
                                colors[expense.category] || "#C7A9E8"
                              }55`,
                            }}
                          >
                            <CategoryIcon size={18} />
                          </span>

                          <strong>{expense.title}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${
                              colors[expense.category] || "#C7A9E8"
                            }45`,
                          }}
                        >
                          {expense.category}
                        </span>
                      </td>

                      <td className="date-cell">
                        {new Date(
                          `${expense.date}T00:00:00`
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="amount-cell">
                        ₹
                        {Number(expense.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-button edit-button"
                            aria-label={`Edit ${expense.title}`}
                            title="Edit"
                            type="button"
                            onClick={() => handleEdit(expense)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete-button"
                            aria-label={`Delete ${expense.title}`}
                            title="Delete"
                            type="button"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Receipt size={27} />
            </span>
            <h3>No expenses just yet</h3>
            <p>
              Your expenses will appear here once you add the first one.
            </p>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>pennywise ♡</span>
        <span>A little more mindful, every day.</span>
      </footer>
    </main>
  );
}

export default App;
