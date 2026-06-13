// ---------- State ----------
let todos = [];
let currentFilter = "all";

// ---------- Elements ----------
const todoList = document.getElementById("todoList");
const addForm = document.getElementById("addForm");
const todoInput = document.getElementById("todoInput");
const filterButtons = document.querySelectorAll(".filter");
const counter = document.getElementById("counter");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");

// ---------- Storage ----------
function loadTodos() {
  const stored = localStorage.getItem("todos");
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch {
      todos = [];
    }
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// ---------- CRUD ----------
function addTodo(text) {
  const todo = {
    id: Date.now(),
    text,
    completed: false
  };
  todos.unshift(todo);
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos();
  render();
}

function startEdit(id) {
  todos.forEach(t => t.editing = (t.id === id));
  render();
}

function commitEdit(id, newText) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  const trimmed = newText.trim();
  todo.editing = false;
  if (trimmed && trimmed !== todo.text) {
    todo.text = trimmed;
    saveTodos();
  }
  render();
}

function cancelEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.editing = false;
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
}

// ---------- Filtering ----------
function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter(t => !t.completed);
  if (currentFilter === "completed") return todos.filter(t => t.completed);
  return todos;
}

// ---------- Rendering ----------
function render() {
  const filtered = getFilteredTodos();

  todoList.innerHTML = "";

  filtered.forEach(todo => {
    const li = document.createElement("li");
    li.className = "task" + (todo.completed ? " task--done" : "");
    li.dataset.id = todo.id;

    if (todo.editing) {
      li.innerHTML = `
        <input type="checkbox" class="task__checkbox" ${todo.completed ? "checked" : ""} aria-label="Mark task complete" disabled>
        <input type="text" class="task__edit-input" value="${escapeHtml(todo.text)}" aria-label="Edit task text">
        <div class="task__actions">
          <button class="task__btn task__btn--save" aria-label="Save task">Save</button>
          <button class="task__btn task__btn--cancel" aria-label="Cancel edit">Cancel</button>
        </div>
      `;
    } else {
      li.innerHTML = `
        <input type="checkbox" class="task__checkbox" ${todo.completed ? "checked" : ""} aria-label="Mark task complete">
        <span class="task__text">${escapeHtml(todo.text)}</span>
        <div class="task__actions">
          <button class="task__btn task__btn--edit" aria-label="Edit task">Edit</button>
          <button class="task__btn task__btn--delete" aria-label="Delete task">Delete</button>
        </div>
      `;
    }

    todoList.appendChild(li);
  });

  emptyState.hidden = filtered.length > 0;

  const remaining = todos.filter(t => !t.completed).length;
  counter.textContent = `${remaining} left`;

  const editInput = todoList.querySelector(".task__edit-input");
  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Events ----------
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  addTodo(text);
  todoInput.value = "";
  todoInput.focus();
});

todoList.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains("task__btn--delete")) {
    deleteTodo(id);
  } else if (e.target.classList.contains("task__btn--edit")) {
    startEdit(id);
  } else if (e.target.classList.contains("task__btn--save")) {
    const input = li.querySelector(".task__edit-input");
    commitEdit(id, input.value);
  } else if (e.target.classList.contains("task__btn--cancel")) {
    cancelEdit(id);
  }
});

todoList.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("task__edit-input")) return;
  const li = e.target.closest(".task");
  const id = Number(li.dataset.id);

  if (e.key === "Enter") {
    commitEdit(id, e.target.value);
  } else if (e.key === "Escape") {
    cancelEdit(id);
  }
});

todoList.addEventListener("change", (e) => {
  if (e.target.classList.contains("task__checkbox")) {
    const id = Number(e.target.closest(".task").dataset.id);
    toggleTodo(id);
  }
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(b => b.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");

    render();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// ---------- Init ----------
function init() {
  loadTodos();
  render();
}

init();