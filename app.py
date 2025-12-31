import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Database setup
engine = create_engine("sqlite:///tasks.db", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(100))
    due_date = Column(DateTime, nullable=False)
    priority = Column(String(20))
    notes = Column(String(500))
    completed = Column(Boolean, default=False)

Base.metadata.create_all(engine)

def task_to_dict(t):
    return {
        "id": t.id,
        "title": t.title,
        "subject": t.subject,
        "due_date": t.due_date.isoformat(),
        "priority": t.priority,
        "notes": t.notes,
        "completed": t.completed
    }

# -----------------------------
# Routes
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    with SessionLocal() as db:
        tasks = db.query(Task).order_by(Task.due_date.asc()).all()
        return jsonify([task_to_dict(t) for t in tasks])

@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.json
    t = Task(
        title=data["title"],
        subject=data.get("subject"),
        due_date=datetime.fromisoformat(data["due_date"]),
        priority=data.get("priority", "medium"),
        notes=data.get("notes")
    )
    with SessionLocal() as db:
        db.add(t)
        db.commit()
        db.refresh(t)
        return jsonify(task_to_dict(t)), 201

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json
    with SessionLocal() as db:
        t = db.query(Task).get(task_id)
        if not t:
            return jsonify({"error": "Not found"}), 404
        if "completed" in data:
            t.completed = data["completed"]
        db.commit()
        db.refresh(t)
        return jsonify(task_to_dict(t))

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    with SessionLocal() as db:
        t = db.query(Task).get(task_id)
        if not t:
            return jsonify({"error": "Not found"}), 404
        db.delete(t)
        db.commit()
        return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)