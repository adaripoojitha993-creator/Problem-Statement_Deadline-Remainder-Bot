function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function countdownTo(iso) {
  const due = new Date(iso).getTime();
  const now = Date.now();
  const diff = due - now;
  if (diff <= 0) return "Due now";
  const mins = Math.floor(diff / (1000 * 60));
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  const remMins = mins % 60;
  if (days > 0) return `${days}d ${remHrs}h`;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${remMins}m`;
}

function updateProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").textContent =
    `Completed ${completed} of ${total} tasks (${percent}%)`;
}

function renderTasks() {
  const tasks = getTasks();
  const container = document.getElementById("tasks");
  container.innerHTML = "";
  if (!tasks.length) {
    container.innerHTML = "<p>No tasks yet.</p>";
    updateProgress(tasks);
    return;
  }
  tasks.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "task";
    el.innerHTML = `
      <div class="${t.completed ? "completed" : ""}">
        <strong>${t.title}</strong> 
        <span class="priority-${t.priority}">(${t.priority})</span><br>
        Subject: ${t.subject || "-"}<br>
        Due: ${new Date(t.due_date).toLocaleString()}<br>
        <small>Countdown: ${countdownTo(t.due_date)}</small><br>
        ${t.notes ? `<em>${t.notes}</em>` : ""}
      </div>
      <div>
        <button onclick="toggleComplete(${i})">
          ${t.completed ? "Mark Incomplete" : "Mark Complete"}
        </button>
        <button onclick="deleteTask(${i})">🗑 Delete</button>
      </div>
    `;
    container.appendChild(el);
  });
  updateProgress(tasks);
}

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const due_date = new Date(document.getElementById("due_date").value).toISOString();
  const priority = document.getElementById("priority").value;
  const notes = document.getElementById("notes").value;
  const tasks = getTasks();
  tasks.push({ title, subject, due_date, priority, notes, completed: false });
  saveTasks(tasks);
  e.target.reset();
  renderTasks();
});

function toggleComplete(index) {
  const tasks = getTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

renderTasks();
setInterval(renderTasks, 60000);