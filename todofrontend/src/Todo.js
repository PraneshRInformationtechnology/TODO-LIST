import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash, faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./Todo.css";

export default function Todo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null); // ✨ track editing state
  const apiUrl = process.env.REACT_APP_SERVER_API_URL || "http://localhost:8000";

  // Calculate progress
  const totalTasks = todos.length;
  const completedTasks = todos.filter(item => item.completed).length;

  // ...existing code...
useEffect(() => {
  const getItem = async () => {
    const res = await fetch(apiUrl + "/todos");
    const data = await res.json();
    setTodos(data);
  };
  getItem();
}, [apiUrl]);
// ...existing code...

  const getItem = async () => {
    const res = await fetch(apiUrl + "/todos");
    const data = await res.json();
    setTodos(data);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    if (editId) {
      // ✨ Update existing task
      const res = await fetch(apiUrl + "/todos/" + editId, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos(todos.map((t) => (t._id === editId ? updated : t)));
        setEditId(null); // reset edit mode
      }
    } else {
      // Add new task
      const res = await fetch(apiUrl + "/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const newTodo = await res.json();
        setTodos([newTodo, ...todos]);
      }
    }

    setTitle("");
    setDescription("");
  };

  const handleDelete = async (id) => {
    await fetch(apiUrl + "/todos/" + id, { method: "DELETE" });
    setTodos(todos.filter((t) => t._id !== id));
  };

  const toggleComplete = async (id, completed) => {
    const res = await fetch(apiUrl + "/todos/" + id, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    }
  };

  // ✨ When Edit button is clicked
  const handleEdit = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setDescription(item.description);
  };

  return (
    <div className="todo-container">
      <h1>✨ Task Management ✨</h1>

      {/* Form */}
      <div className="todo-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button onClick={handleSubmit}>
          <FontAwesomeIcon icon={editId ? faEdit : faPlus} />{" "}
          {editId ? "Update" : "Add"}
        </button>
        {editId && (
          <button
            onClick={() => {
              setEditId(null);
              setTitle("");
              setDescription("");
            }}
            className="cancel"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="progress-tracker">
        <p>
          Progress: {completedTasks} / {totalTasks} tasks completed
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : "0%",
            }}
          ></div>
        </div>
      </div>

      {/* Todo List */}
      <ul className="todo-list">
        {todos.map((item) => (
          <li
            key={item._id}
            className={`todo-item ${item.completed ? "completed" : ""}`}
          >
            <div className="todo-text">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className="todo-actions">
              <button
                className="complete"
                onClick={() => toggleComplete(item._id, item.completed)}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button className="edit" onClick={() => handleEdit(item)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="delete" onClick={() => handleDelete(item._id)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
